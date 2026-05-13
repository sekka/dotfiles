# Claude Code Hooks

このディレクトリには、Claude Code の挙動を構造的に制御する Hook スクリプトを置いている。
Hook は `~/.claude/settings.json` の `hooks` セクションで各イベント・matcher に登録され、
Claude Code のツール実行前後やセッションライフサイクルに自動で発火する。
TypeScript フックは `bun` で実行し、Shell フックは `bash` で実行する。

---

## Hook 発火タイミング一覧

| イベント | matcher | フック | 役割サマリ |
|---|---|---|---|
| PreToolUse | Bash | validate-command.ts | 破壊的コマンドのブロック |
| PreToolUse | Bash | rtk-rewrite.ts | コマンドを rtk 等価形式に書き換え |
| PreToolUse | Edit\|Write\|NotebookEdit | protect-sensitive.sh | 機密ファイルへの書き込みブロック |
| PreToolUse | Edit\|Write\|NotebookEdit | read-before-edit-hook.ts | 未読ファイルへの編集ブロック |
| PreToolUse | Edit\|Write\|NotebookEdit | delegation-guard.ts | Opus 直接編集の過多を警告 |
| PreToolUse | Read | protect-sensitive.sh | 機密ファイルへの読み込みブロック |
| PostToolUse | Edit\|Write\|MultiEdit | post-format.ts (async) | 編集後の自動フォーマット |
| PostToolUse | Edit\|Write\|MultiEdit | edit-counter-hook.ts | 同一ファイルの反復編集を警告 |
| PostToolUse | Edit\|Write\|MultiEdit | mermaid-validate.ts (async) | Mermaid 構文チェック |
| PostToolUse | Edit\|Write\|MultiEdit | md-preview.ts (async) | Markdown の HTML 変換 + ブラウザ表示 |
| PostToolUse | Read | track-read-hook.ts | 読み込みファイルパスをセッション状態に記録 |
| PostToolUse | Read\|Edit\|Write | error-loop-hook.ts | ファイル操作連続失敗を検知 |
| PostToolUse | Bash | circuit-breaker.ts | Bash 連続失敗を検知 |
| Stop | (全て) | claude-notify.ts (async) | 作業完了を macOS 通知で通知 |
| Stop | (全て) | commit-reminder.sh | 未コミット変更があれば警告 |
| Stop | (全て) | language-check.ts | 応答に英語混在があるか確認 |
| StopFailure | (全て) | claude-notify.ts (async) | API エラー停止を macOS 通知で通知 |
| Notification | permission_prompt 等 | claude-notify.ts (async) | 権限要求などを macOS 通知で通知 |
| SessionStart | (全て) | check-marketplace-health.ts (async) | マーケットプレース整合性チェック |
| SessionStart | (全て) | check-memory-health.ts (async) | MEMORY.md リンク切れチェック |
| SessionStart | (全て) | orphan-reaper.sh (async) | 孤立プロセスの掃除 |
| SessionEnd | (全て) | cleanup-agent-browser.sh | agent-browser の終了と孤立プロセス掃除 |
| UserPromptSubmit | (全て) | git-context.ts | git 状態をコンテキストに自動注入 |
| UserPromptSubmit | (全て) | language-reminder.ts | 英語混在 reminder を注入 |
| PreCompact | (全て) | save-progress.sh (async) | 作業チェックポイントを記録 |

---

## フック詳細

### PreToolUse フック

#### validate-command.ts

- **イベント**: PreToolUse:Bash
- **役割**: 破壊的・危険なシェルコマンドを事前にブロックまたは確認要求する。`sed`/`awk`/`git add -A`/`git push --force`/`reset --hard`/`git commit --no-verify` を `deny`、`rm`/`sudo`/`dd`/`shred` への危険なコマンドチェーン (`|` / `;` / `&&` / `||` / バッククォート / `$()` / `xargs`) を `ask` として扱う。
- **入力**: `tool_input.command` (Bash コマンド文字列)
- **出力**: `{ hookSpecificOutput: { hookEventName, permissionDecision, permissionDecisionReason } }` を JSON で stderr に出力（`permissionDecision` は `deny | ask | allow`）
- **由来**: FAILURES.md 由来のエスカレーション。`sed` 使用・`git add -A` 使用などの繰り返し違反を L4 (tool denial) で封じている。

#### rtk-rewrite.ts

- **イベント**: PreToolUse:Bash
- **役割**: `git status` → `rtk git status` のように、Bash コマンドを RTK 等価コマンドへ透過的に書き換え、トークン使用量を削減する。書き換えが不要な場合は無音終了する。
- **入力**: `tool_input.command` (Bash コマンド文字列)
- **出力**: `updatedInput.command` に書き換え後コマンドを含む JSON を stdout に出力（書き換え時のみ）
- **由来**: RTK (Rust Token Killer) の hook ベース統合。

#### protect-sensitive.sh

- **イベント**: PreToolUse:Edit|Write|NotebookEdit / PreToolUse:Read
- **役割**: `settings.json` の `permissions.deny` グロブでは捕捉できない機密パターンを補完する第二防衛線。`.p12`/`.pfx` ブロックとパストラバーサル (`../`) 検出は `tool_name` に関係なく **全ツール (Read 含む)** で実行される。`.git/` 内部への直接書き込みブロックとシンボリックリンク解決先チェックは `Write`/`Edit` 限定（`NotebookEdit` はフックは呼ばれるがこの 2 チェックはスキップされる）。
- **入力**: `tool_input.file_path` / `tool_name`
- **出力**: exit 2 でツール実行をキャンセル（Block）、または exit 0 でスルー
- **由来**: セキュリティ目的。静的グロブの限界を動的チェックで補う。

#### read-before-edit-hook.ts

- **イベント**: PreToolUse:Edit|Write|NotebookEdit
- **役割**: このセッション内で一度も `Read` していないファイルへの `Edit`/`Write` を物理的にブロックする。`track-read-hook.ts` が記録した `read-files.json` を参照して判定する。
- **入力**: `session_id`、`tool_input.file_path`
- **出力**: 未読なら exit 2 でツール実行をキャンセル
- **由来**: CLAUDE.md「Read before modify」ルールを意思に頼らず強制するために実装。

#### delegation-guard.ts

- **イベント**: PreToolUse:Edit|Write|NotebookEdit
- **役割**: セッション内の編集ファイル数 (閾値: 2) または累計編集行数 (閾値: 30) を超えたとき、Opus が直接実装せず implementer へ委譲すべきという警告を `additionalContext` で注入する。警告は各判定ごとに1回のみ。
- **入力**: `session_id`、`tool_input.file_path`、`tool_input.new_string` または `content`
- **出力**: `additionalContext` 警告 JSON を stdout に出力（閾値超過時のみ）
- **由来**: CLAUDE.md §4 の委譲ルールをフックで補強。

---

### PostToolUse フック

#### post-format.ts

- **イベント**: PostToolUse:Edit|Write|MultiEdit (async)
- **役割**: ファイル編集後に `lint-format.ts --mode=fix` を非同期で実行し、コードを常に整形された状態に保つ。対象外の拡張子や `settings.json` 系ファイル、`node_modules` 配下はスキップする。
- **入力**: `tool_input.file_path`
- **出力**: フォーマット失敗は非致命的（無音で終了）
- **由来**: 毎回手動でフォーマットコマンドを叩く手間をなくすための利便性フック。

#### edit-counter-hook.ts

- **イベント**: PostToolUse:Edit|Write|MultiEdit
- **役割**: 同一ファイルへの編集回数をセッション状態に記録し、WARN_THRESHOLD (3) 回に達したら `additionalContext` に警告を注入して要件の再確認を促す。
- **入力**: `session_id`、`tool_input.file_path`
- **出力**: `additionalContext` 警告 JSON を stdout に出力（閾値到達時のみ）
- **由来**: edit-thrashing（小刻みな繰り返し編集）を早期検知するために実装。

#### mermaid-validate.ts

- **イベント**: PostToolUse:Edit|Write|MultiEdit (async)
- **役割**: `.md` ファイル保存後に `mermaid` コードブロックを抽出し、`mmdc` で構文チェックする。エラーがあればブロック番号と mmdc のエラーを stderr に出力する。`mmdc` 未インストール時はスキップ。
- **入力**: `tool_input.file_path`、ファイル内容
- **出力**: 構文エラーを stderr に出力（非致命的）
- **由来**: Markdown に Mermaid ダイアグラムを書く運用に合わせた品質チェック。

#### md-preview.ts

- **イベント**: PostToolUse:Edit|Write|MultiEdit (async)
- **役割**: `$HOME` 配下の `/plans/`、`/docs/`、`/tasks/` セグメントを含む `.md` ファイルや `~/prj/` 配下の `.md` を HTML 化してブラウザで自動表示する。50KB 超はプレーン HTML のみ表示。それ以下なら Haiku で fancy HTML を生成して atomic move 後に `open` する。
- **入力**: `tool_input.file_path`
- **出力**: HTML ファイルを生成して `open` コマンドでブラウザ表示（副作用）
- **由来**: ドキュメント編集中のプレビュー確認を自動化するための利便性フック。

#### track-read-hook.ts

- **イベント**: PostToolUse:Read
- **役割**: `Read` ツール実行後に読み込んだファイルパスをセッション状態 (`read-files.json`) に追記する。`read-before-edit-hook.ts` がこのリストを参照して未読ファイルへの編集をブロックする。
- **入力**: `session_id`、`tool_input.file_path`
- **出力**: セッション状態ファイルへの書き込み（副作用）
- **由来**: `read-before-edit-hook.ts` とペアで「Read before modify」ルールを実装。

#### error-loop-hook.ts

- **イベント**: PostToolUse:Read|Edit|Write
- **役割**: Bash 以外のツール (Read/Edit/Write) の連続失敗回数を記録し、WARN_THRESHOLD (2) 回連続で失敗したら `additionalContext` に警告を注入してアプローチ切り替えを強制する。成功時はカウンターをリセットする。
- **入力**: `session_id`、`tool_response.is_error`
- **出力**: `additionalContext` 警告 JSON を stdout に出力（閾値到達時のみ）
- **由来**: `circuit-breaker.ts`（Bash 用）を補完するファイル操作向け error-loop 検知。

#### circuit-breaker.ts

- **イベント**: PostToolUse:Bash
- **役割**: Bash ツールの連続失敗回数を `/tmp` に記録し、THRESHOLD (3) 回連続で失敗したら `additionalContext` に警告を注入してアプローチ変更を促す。成功時・警告出力後にカウンターをリセットする。
- **入力**: `session_id`、`tool_response.exit_code`
- **出力**: `additionalContext` 警告 JSON を stdout に出力（閾値到達時のみ）
- **由来**: 同一コマンドのリトライループを断ち切り、トークンの無駄遣いを防ぐ。

---

### Stop フック

#### claude-notify.ts

- **イベント**: Stop (async) / StopFailure (async) / Notification (matcher: permission_prompt|idle_prompt|auth_success|elicitation_dialog)
- **役割**: `osascript display notification` を使い、Claude Code の完了・失敗・権限要求などを macOS ネイティブ通知で知らせる。ターミナルを見ていなくても状態に気づけるようにする。
- **入力**: `hook_event_name`、`notification_type`、`message`
- **出力**: macOS 通知の表示（副作用）
- **由来**: バックグラウンド・別画面作業中でも Claude の状態把握を可能にするために実装。

#### commit-reminder.sh

- **イベント**: Stop
- **役割**: `git status --porcelain` を確認し、未コミット変更があれば警告メッセージを stdout に出力する。セッション終了前のコミット忘れを防ぐ。
- **入力**: なし（stdin を読み捨てる）
- **出力**: 変更リストを stdout に出力（未コミット時のみ）
- **由来**: 作業中の変更を失わないための安全ネット。

#### language-check.ts

- **イベント**: Stop
- **役割**: `transcript_path` の JSONL から最後の assistant テキストを取得し、コードブロック・URL 除去後に英語単語がゼロなら `additionalContext` 警告を出力して次ターンでの英語混在を促す。言語レベル L3 以上が対象。
- **入力**: `transcript_path`
- **出力**: `additionalContext` 警告 JSON を stdout に出力（英語なし時のみ）
- **由来**: `language-policy.md` の英語混在ルール (L3) を事後検証するために実装。

---

### SessionStart フック

#### check-marketplace-health.ts

- **イベント**: SessionStart (async)
- **役割**: `known_marketplaces.json` を読み込み、各マーケットプレースの `marketplace.json` が正常に存在するか確認する。キャッシュが有効（1時間以内）であればスキップ。破損検出時は `git fetch --depth=1 && git reset --hard FETCH_HEAD` で修復を試み、失敗時は `installLocation` を削除して次回再クローンに任せる。結果を `additionalContext` に注入する。
- **入力**: なし
- **出力**: `additionalContext` に健全性レポートを注入（副作用: 破損マーケットプレースの修復・削除）
- **由来**: マーケットプレースの破損を自動検知・修復するセルフヒーリング機構。

#### check-memory-health.ts

- **イベント**: SessionStart (async)
- **役割**: 毎回 `MEMORY.md` のリンク切れをチェック（軽量）し、14日おきにコードベースとの整合性確認を促すメッセージを出力する（重量）。リンク先が存在しないファイルがあれば警告を stdout に出力する。
- **入力**: なし
- **出力**: リンク切れ警告を stdout に出力。`~/.claude/.memory-deep-check-last` に最終実行日を記録（副作用）
- **由来**: 記憶ファイルの腐敗を早期発見するための定期ヘルスチェック。

#### orphan-reaper.sh

- **イベント**: SessionStart (async)
- **役割**: Claude Code の異常終了（クラッシュ・`kill -9`・OS スリープ・Wi-Fi 切断）で孤立した agent-browser などのプロセスを起動時に掃除する。PPID=1 のプロセスのみを対象とし、他のセッションのプロセスには触れない。
- **入力**: なし
- **出力**: 孤立プロセスの kill（副作用）
- **由来**: SessionEnd フックが動かない異常終了パスをカバーする補完的クリーンアップ。

---

### SessionEnd フック

#### cleanup-agent-browser.sh

- **イベント**: SessionEnd
- **役割**: `agent-browser close` でブラウザを正常終了させ、その後 PPID=1 の孤立プロセスを掃除する。`orphan-reaper.sh` との違いは正常終了パスのセッションクリーンアップである点。
- **入力**: なし
- **出力**: agent-browser の終了・孤立プロセスの kill（副作用）
- **由来**: agent-browser#1263 (v0.26.0 macOS orphan) のワークアラウンドとして実装。

---

### UserPromptSubmit フック

#### git-context.ts

- **イベント**: UserPromptSubmit
- **役割**: `git status --short` と直近5件のコミットを収集し、`additionalContext` として毎ターン自動注入する。Claude がターン冒頭で git コマンドを実行しなくても常に最新のリポジトリ状態を把握できるようにする。git リポジトリ外では無音終了する。
- **入力**: なし（カレントディレクトリの git 状態を取得）
- **出力**: `additionalContext` に git 状態を注入した JSON を stdout に出力
- **由来**: git コンテキスト取得のための毎ターン Bash コマンドを削減する利便性フック。

#### language-reminder.ts

- **イベント**: UserPromptSubmit
- **役割**: `language-policy.md` から現在の言語レベル (L{N}) を読み取り、L1 以上であれば sentence-level 英語混在の reminder を `additionalContext` として注入する。ファイル取得失敗時は無音終了 (fail-open)。
- **入力**: なし（`~/.claude/rules/language-policy.md` を読み込む）
- **出力**: `additionalContext` に reminder を注入した JSON を stdout に出力
- **由来**: `language-policy.md` の英語混在ルールを毎ターン冒頭で確実に適用するために実装。

---

### PreCompact フック

#### save-progress.sh

- **イベント**: PreCompact (async)
- **役割**: コンテキスト圧縮が発生するたびに、タイムスタンプ・プロジェクト名・ディレクトリを `~/.claude/progress-checkpoint.md` に追記する。圧縮前に何をやっていたかを後から振り返れる監査ログとして機能する。
- **入力**: なし
- **出力**: `~/.claude/progress-checkpoint.md` への追記（副作用）
- **由来**: コンテキスト圧縮前の作業状態を保全するチェックポイント機構。

---

## 共有モジュール

`lib/` 配下には複数フックから参照される共有ライブラリを置いている。
`session-state.ts` はセッション ID をキーとした `/tmp` 以下の JSON 状態管理ユーティリティで、
`edit-counter-hook.ts`・`track-read-hook.ts`・`read-before-edit-hook.ts`・`delegation-guard.ts`・`error-loop-hook.ts` が共通して利用する。
`language-policy.ts` は `language-check.ts` と `language-reminder.ts` が共有する言語レベルパーサーである。
`orphan-patterns.sh` は `cleanup-agent-browser.sh` と `orphan-reaper.sh` が共有する孤立プロセスパターン定義と `reap_all_known_orphans` 関数を提供する。

---

## テスト

`__tests__/` 配下に `bun:test` によるスポット単体テストを配置している。
CI で常時回し続けるためのものではなく、ロジック関数（パス判定・パース・カウンター操作など）の動作確認として手元で `bun test <path>` を叩く運用である。
詳細なテスト方針は `.claude/CLAUDE.md` の「Test Policy」セクションを参照すること。
