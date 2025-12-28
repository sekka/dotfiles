# Claude Code 複数マシン統計統合ツール

複数のマシンで使用している Claude Code の統計情報を、iCloud Drive を通じて自動的に同期・マージし、統合レポートを生成するツール群です。

## 概要

- **データソース**: `~/.claude/stats-cache.json`（Claude Code の公式統計ファイル）
- **同期先**: `~/Library/Mobile Documents/com~apple~CloudDocs/ClaudeCodeStats/`（iCloud Drive）
- **出力形式**: Markdown、JSON、HTML

### 使用シーン

- 複数のマシン（MacBook、iMac、Mac mini など）でClaude Codeを使用している場合
- 全マシンの合計セッション数、メッセージ数、トークン使用量を把握したい
- 定期的に統計を iCloud で同期し、いつでも最新レポートを確認したい

## クイックスタート

### 1. 手動同期（1回限り）

```bash
# 現在のマシンの統計を iCloud に同期
mise run llm-claude-sync-stats
# または
mise run ccss
```

### 2. iCloud Drive 内の全マシン統計をマージ

```bash
# 全マシンの統計を自動検出してマージ
mise run llm-claude-merge-stats-icloud
# または
mise run ccmi

# 結果を確認
open ~/Library/Mobile\ Documents/com~apple~CloudDocs/ClaudeCodeStats/merged-report.md
```

### 3. 自動同期を有効化（オプション）

```bash
# launchd で 1 時間ごとに自動同期
bash ~/dotfiles/scripts/setup/setup-claude-stats-sync.sh install
```

## ツール詳細

### 1. 同期スクリプト（`sync-claude-stats-to-icloud.ts`）

ローカルの `stats-cache.json` を iCloud Drive に自動同期します。

**使用方法:**

```bash
# 基本的な同期
bun ~/dotfiles/scripts/development/sync-claude-stats-to-icloud.ts

# iCloud 環境を確認
bun ~/dotfiles/scripts/development/sync-claude-stats-to-icloud.ts --check-icloud

# ヘルプ表示
bun ~/dotfiles/scripts/development/sync-claude-stats-to-icloud.ts --help
```

**機能:**

- ホスト名を正規化して機械識別（`mba14-2022-m2-16` など）
- iCloud Drive に自動ディレクトリ作成
- ファイル形式: `stats-{マシン名}.json`

**出力例:**

```
✅ Successfully synced to iCloud Drive
   File: stats-mba14-2022-m2-16.json
   Location: ClaudeCodeStats/
   Size: 2.7 KB

📊 Current Statistics:
   Sessions: 448
   Messages: 11,687
   Last updated: 2025-12-28
```

### 2. マージスクリプト（`merge-claude-stats.ts`）

複数マシンの統計を集約して統合レポートを生成します。

**使用方法:**

```bash
# iCloud Drive 内のファイルを自動検出してマージ（推奨）
bun ~/dotfiles/scripts/development/merge-claude-stats.ts \
  --auto-discover-icloud \
  --format markdown \
  --output ~/claude-stats-merged.md

# 複数ファイルを手動指定
bun ~/dotfiles/scripts/development/merge-claude-stats.ts \
  --input ~/stats1.json \
  --input ~/stats2.json \
  --machine-name "MacBook Pro" \
  --machine-name "iMac" \
  --format markdown \
  --output merged-report.md

# ヘルプ表示
bun ~/dotfiles/scripts/development/merge-claude-stats.ts --help
```

**CLI オプション:**

- `--auto-discover-icloud`: iCloud Drive 内のファイルを自動検出
- `--input <path>`: 入力ファイル（複数指定可能）
- `--machine-name <name>`: マシン名（`--input` と同順序）
- `--format <format>`: 出力形式: json, markdown, html
- `--output <path>`: 出力ファイルパス
- `--help`: ヘルプ表示

**マージロジック:**

- **日次アクティビティ**: 同じ日付のデータを合算（メッセージ数、セッション数、ツール呼び出し数）
- **モデルトークン**: モデルごとに集計
- **最長セッション**: 全マシンで最もメッセージ数が多いセッション
- **時間帯分析**: 全マシンの時間別アクティビティを集約

**出力例（Markdown）:**

```markdown
# Claude Code 使用統計サマリー

生成日時: 2025-12-28 21:27:27

## 全体統計（1マシン合計）

- **総セッション数**: 448
- **総メッセージ数**: 11,687
- **総ツール呼び出し数**: 2,535

## マシン別内訳

- **mba14-2022-m2-16**: セッション: 448, メッセージ: 11,687, 最終更新日: 2025-12-27

## モデル別トークン使用量

### Claude Sonnet 4

- **Input Tokens**: 446,030
- **Output Tokens**: 743,072
- **Cache Read**: 454,450,031
- **Cache Creation**: 45,721,286
```

### 3. 自動同期セットアップ（`setup-claude-stats-sync.sh`）

launchd サービスを設定して、1 時間ごとに自動同期を実行します。

**使用方法:**

```bash
# インストール
bash ~/dotfiles/scripts/setup/setup-claude-stats-sync.sh install

# ステータス確認
bash ~/dotfiles/scripts/setup/setup-claude-stats-sync.sh status

# テスト実行
bash ~/dotfiles/scripts/setup/setup-claude-stats-sync.sh test

# アンインストール
bash ~/dotfiles/scripts/setup/setup-claude-stats-sync.sh uninstall

# ログ表示
bash ~/dotfiles/scripts/setup/setup-claude-stats-sync.sh logs

# ヘルプ
bash ~/dotfiles/scripts/setup/setup-claude-stats-sync.sh help
```

**セットアップされる内容:**

- **plist ファイル**: `~/Library/LaunchAgents/com.user.claude-stats-sync.plist`
- **実行間隔**: 1 時間ごと
- **ログファイル**: `/var/log/claude-stats-sync.log`
- **実行ユーザー**: 現在のユーザー

## mise タスク統合

mise から簡単にコマンド実行できます：

```bash
# 統計を iCloud に同期
mise run llm-claude-sync-stats
mise run ccss

# iCloud から全マシン統計をマージ（自動検出）
mise run llm-claude-merge-stats-icloud
mise run ccmi
```

## ファイル構成

```
scripts/
├── development/
│   ├── merge-claude-stats.ts              # マージスクリプト
│   ├── merge-claude-stats.test.ts         # テストファイル
│   ├── sync-claude-stats-to-icloud.ts     # 同期スクリプト
│   └── types/
│       └── claude-stats.ts                # 型定義とZodスキーマ
└── setup/
    ├── com.user.claude-stats-sync.plist   # launchd 設定
    └── setup-claude-stats-sync.sh         # セットアップスクリプト
```

## データフロー

```
Machine 1                    Machine 2                   Machine 3
   ↓                           ↓                            ↓
~/.claude/stats-cache.json  ~/.claude/stats-cache.json  ~/.claude/stats-cache.json
   ↓                           ↓                            ↓
sync-claude-stats-to-icloud.ts (each machine, hourly)
   ↓                           ↓                            ↓
iCloud Drive: ClaudeCodeStats/
├── stats-machine1.json
├── stats-machine2.json
└── stats-machine3.json
   ↓
merge-claude-stats.ts (auto-discover)
   ↓
Output: merged-report.md / merged-report.json / merged-report.html
```

## トラブルシューティング

### iCloud Drive が見つからない

```bash
# iCloud Drive の確認
bun ~/dotfiles/scripts/development/sync-claude-stats-to-icloud.ts --check-icloud

# iCloud にログインしていることを確認
# 設定 → [ユーザー名] → iCloud で、「iCloud Drive」がオンになっていることを確認
```

### stats-cache.json が見つからない

Claude Code がまだ使用されていない場合です。

```bash
# Claude Code を一度実行してください
# 自動的に ~/.claude/stats-cache.json が生成されます
```

### launchd サービスが実行されない

```bash
# ステータス確認
bash ~/dotfiles/scripts/setup/setup-claude-stats-sync.sh status

# ログ確認
bash ~/dotfiles/scripts/setup/setup-claude-stats-sync.sh logs

# 再インストール
bash ~/dotfiles/scripts/setup/setup-claude-stats-sync.sh uninstall
bash ~/dotfiles/scripts/setup/setup-claude-stats-sync.sh install
```

### 自動同期を手動で実行したい

```bash
# 同期実行
launchctl start com.user.claude-stats-sync

# または
mise run ccss
```

## 高度な使用方法

### カスタム出力ファイルパス

```bash
bun ~/dotfiles/scripts/development/merge-claude-stats.ts \
  --auto-discover-icloud \
  --format markdown \
  --output ~/Documents/claude-stats/report-$(date +%Y%m%d).md
```

### JSON 出力で自動化

```bash
# JSON 形式で出力し、別ツールで処理
bun ~/dotfiles/scripts/development/merge-claude-stats.ts \
  --auto-discover-icloud \
  --format json \
  --output ~/claude-stats.json

# jq で統計を取得
jq '.aggregated.totalSessions' ~/claude-stats.json
```

### HTML レポートをブラウザで表示

```bash
bun ~/dotfiles/scripts/development/merge-claude-stats.ts \
  --auto-discover-icloud \
  --format html \
  --output ~/claude-stats.html

# ブラウザで開く
open ~/claude-stats.html
```

### 複数マシンの部分的なマージ

```bash
# MacBook と iMac のみをマージ
bun ~/dotfiles/scripts/development/merge-claude-stats.ts \
  --input ~/Downloads/macbook-stats.json \
  --input ~/Downloads/imac-stats.json \
  --machine-name "MacBook Pro" \
  --machine-name "iMac" \
  --format markdown
```

## テスト

```bash
# 全テストを実行（35 テスト）
bun test scripts/development/merge-claude-stats.test.ts

# テストカバレッジ
bun test --coverage scripts/development/merge-claude-stats.test.ts
```

テストで検証される内容：

- 日次アクティビティマージ
- モデル別トークン集計
- 最長セッション検出
- 時間帯分析
- ファイル永続化
- エラーハンドリング
- エッジケース（大きな数値、特殊文字など）

## パフォーマンス

- **同期スクリプト**: < 1 秒（ローカル同期）
- **マージスクリプト**: < 5 秒（3 マシン分、自動検出含む）
- **ファイルサイズ**: stats-cache.json 約 2-3 KB/マシン

## セキュリティに関する注意

- **iCloud Drive**: Apple の暗号化で保護されています
- **ローカルファイル**: `~/.claude/` は個人用ディレクトリなので安全です
- **ログファイル**: `/var/log/claude-stats-sync.log` に記録されます

## よくある質問

**Q: 複数マシンで同じ iCloud アカウント以外で同期できますか？**

A: はい。手動でファイルをコピーして、`--input` オプションで指定できます：

```bash
# USB ドライブ経由でコピー
cp /Volumes/USB/stats-machine2.json ~/Downloads/
bun ~/dotfiles/scripts/development/merge-claude-stats.ts \
  --input ~/.claude/stats-cache.json \
  --input ~/Downloads/stats-machine2.json \
  --machine-name "MacBook Pro" \
  --machine-name "iMac"
```

**Q: Windows/Linux でも動作しますか？**

A: 同期スクリプトは macOS のみ（iCloud Drive、launchd に依存）ですが、マージスクリプトは Windows/Linux でも動作します。

```bash
# どの OS でも実行可能
bun ~/dotfiles/scripts/development/merge-claude-stats.ts \
  --input ~/stats1.json \
  --input ~/stats2.json \
  --format markdown
```

**Q: 古いデータを削除したい場合は？**

A: iCloud Drive から該当ファイルを削除してください：

```bash
rm ~/Library/Mobile\ Documents/com~apple~CloudDocs/ClaudeCodeStats/stats-oldmachine.json
```

**Q: 統計情報はいつ更新されますか？**

A: Claude Code の実行終了時に自動更新されます。自動同期有効時は、1 時間ごとに iCloud にアップロードされます。

## 関連リンク

- [Claude Code 公式ドキュメント](https://claude.com/claude-code)
- [Bun 公式ドキュメント](https://bun.sh/)
- [mise タスクランナー](https://mise.jdx.dev/)

## ライセンス

MIT

## 更新履歴

### v1.0.0 (2025-12-28)

- 初回リリース
- iCloud 自動同期機能
- Markdown/JSON/HTML 出力
- launchd による自動実行
- 35 個の包括的なテスト
