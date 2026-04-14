# LLM Wiki パターン導入によるフロントエンドナレッジ運用刷新

**作成日**: 2026-04-06
**対象スキル**: `home/.claude/skills/user-doc-fe-kb`
**着想元**: Andrej Karpathy "LLM Knowledge Bases" パターン（2026-04-03）、関連派生投稿（Yuchen Jin, elvis, 大野修平, trkbt10）

---

## 背景

Karpathy が提唱した「LLM を**知識エンジニア**として使う」パターン（raw データ収集 → LLM が wiki にコンパイル → Q&A → 結果を wiki に還元 → linting で健全性維持）は、現在のフロントエンドナレッジ運用と高い親和性がある。

既存スキル `user-doc-fe-kb` を調査した結果：

- **既存資産**: 297個のMDファイル / 約17万語（Karpathy例の半分弱の規模）
- **既存スキル機能**: 収集モード（WebFetch→分類→統合）、整理モード（重複統合・古い情報削除・フォーマット統一）、参照モード
- **未稼働の計画**: `scripts/setup-qmd.sh` による qmd セマンティック検索（時間的制約で未実行）

つまり既存スキルは `raw/` 層と qmd 稼働の2点を除けば**ほぼ Karpathy 式パイプライン**。全面書き換えは不要で、追加と接続だけで実現できる。

## ゴール

1. 既存297MDを即座にセマンティック検索可能にする（qmd実稼働）
2. 「収集」と「コンパイル」を分離し、原文を残す raw 層を新設する
3. ドリフト検出・新記事候補提案により、wikiの健全性を継続的に保つ
4. setup.sh 系から再現可能にし、新マシン・他環境でも動く

## 非ゴール

- 既存297MDの書き換え・カテゴリ再編
- raw 層への自動コンパイル（hook駆動の自動化はしない）
- frontend 以外のナレッジ統合（memory システムや他スキルへの展開は別企画）

---

## 設計概要

### ディレクトリ構造（最終形）

```
home/.claude/skills/user-doc-fe-kb/
├── SKILL.md                        # 改訂（パート1収集モード差し替え＋パート2にqmd優先明記）
├── raw/                            # 【新設】生データ層
│   ├── _inbox/                     # 未処理の原文。コンパイル対象
│   │   └── 2026-04-06-{slug}.md
│   ├── _archived/                  # コンパイル済みの原文。再コンパイル・ドリフト検出用
│   │   └── 2026-04-05-{slug}.md
│   └── README.md                   # raw/の使い方・命名規則
└── knowledge/                      # 【既存・無変更】コンパイル済みwiki（297MD）
    ├── INDEX.md
    ├── css/, html/, javascript/, cross-cutting/, ...
    └── ...
```

`raw/` は **`knowledge/` の外**に配置する。理由: qmd の埋め込み対象を `knowledge/` に限定することで、未整理の生データがインデックスのノイズになるのを防ぐ。

### qmd インデックス

- パス: `~/.local/share/qmd/frontend.sqlite`（環境変数 `QMD_FRONTEND_INDEX` で指定済み）
- 対象: `~/.claude/skills/user-doc-fe-kb/knowledge/` のみ
- 環境変数とエイリアス（既存）:
  - `QMD_FRONTEND_INDEX` → `home/config/zsh/00_environment.zsh`
  - `qmd-fe` → `home/config/zsh/50_aliases.zsh`

---

## 三段階フェーズ実装

### Phase 1: qmd を実稼働させる（最優先・即効性）

**目的**: 既存297MD・17万語をすぐ検索可能にする。Karpathyパターン以前の話。

**作業項目**:

1. **scripts/setup-qmd.sh のバグ修正**
   - 現状: `SKILL_DIR="$HOME/.claude/skills/managing-frontend-knowledge"`
   - 修正後: `SKILL_DIR="$HOME/.claude/skills/user-doc-fe-kb"`

2. **setup.sh 系への統合**
   - `setup/06_claude.sh` の末尾に新セクション「qmd インデックス構築」を追加
   - そこから `~/dotfiles/scripts/setup-qmd.sh` を呼び出す
   - 既存スクリプトはスタンドアロン実行用に残す（手動再構築の利便性のため）
   - qmd CLI 自体のインストール（`bun install -g @tobilu/qmd`）も `06_claude.sh` で is_installed チェック付きで実行

3. **qmd セットアップ実行**
   - `~/dotfiles/scripts/setup-qmd.sh` を手動実行
   - `qmd-fe query "container query"` 等で動作確認

4. **SKILL.md パート2の改訂**
   - 「参照モード」冒頭に「**まず qmd-fe query を使え、Read 直読みは最終手段**」と優先順位を明記
   - line 514〜の qmd セクションは削除せず参照モードの本流に統合

**完了基準**:

- `setup/06_claude.sh` 実行後、`~/.local/share/qmd/frontend.sqlite` が生成されている
- `qmd-fe query "container query"` が結果を返す
- SKILL.md の参照モードを読んで「qmdを優先する」とわかる

**想定所要時間**: 30分以内（埋め込み生成の待ち時間含む）

---

### Phase 2: raw/ 層の新設と _inbox/ ワークフロー（Karpathyパターンの核）

**目的**: 「収集」と「コンパイル」を分離する。

**作業項目**:

1. **raw/ ディレクトリ初期化**
   - `home/.claude/skills/user-doc-fe-kb/raw/_inbox/` 作成
   - `home/.claude/skills/user-doc-fe-kb/raw/_archived/` 作成
   - `raw/README.md` を執筆: 命名規則（`YYYY-MM-DD-{slug}.md`）、保存フォーマット（出典URL・取得日・原文 or 抜粋）、`_inbox` と `_archived` の役割

2. **SKILL.md パート1「収集モード」の改訂**
   - **旧フロー**: WebFetch → 即 knowledge/ に書き込み（原文消失）
   - **新フロー**: WebFetch → `raw/_inbox/YYYY-MM-DD-{slug}.md` として原文保存
   - 旧フローは完全に削除（並行運用しない）
   - 「保存して」「ナレッジに追加して」の依頼は raw/_inbox/ への保存を意味するように再定義

3. **新セクション「コンパイルモード」追加**
   - SKILL.md パート1の末尾に追加
   - トリガー: 「inbox処理して」「コンパイルして」「ナレッジ整理して」等
   - フロー:
     1. `_inbox/` 内の全ファイルを順次読む
     2. 各ファイルに対して既存の Step 2-5（要約・カテゴリ判定・重複チェック・統合）を実行
     3. 完了したファイルを `_archived/` に移動
     4. 件数と移動先を報告
   - 既存の Step 2-5 ロジックは流用するため再記述不要

4. **手動テスト**
   - 適当なURLを1つ raw/_inbox/ に手動保存
   - 「inbox処理して」と依頼して動作確認
   - knowledge/ への統合と _archived/ への移動が正しく行われることを検証

**完了基準**:

- `raw/_inbox/`、`raw/_archived/`、`raw/README.md` が存在
- SKILL.md の収集モードが新フローに置き換わっている
- コンパイルモードが追加されている
- テストフローで「raw 保存 → コンパイル → archived 移動」が動く

**想定所要時間**: まとまった作業1セッション

---

### Phase 3: 整理モードの強化（health check）

**目的**: Karpathy の "Linting" を実装。既存の整理モードを拡張。

**作業項目**:

1. **既存整理モードへの追加機能**
   - **ドリフト検出**: `raw/_archived/` の原文と `knowledge/` の対応エントリを比較し、原文には書いてあるが wiki に反映されていない情報を発見・提案
   - **欠損補完候補**: knowledge/ 内の TBD・「不明」表記を抽出して補完候補を提案
   - **新記事候補の発見**: `_archived/` のうち wiki化されなかったトピックを再評価し、追加候補を提案
   - 全て**ユーザー承認制で提案を出すだけ**。自動で wiki を書き換えない

2. **SKILL.md 整理モードの改訂**
   - 既存ロジックは削除しない、追加のみ
   - 新サブセクション「ドリフトチェック」「欠損補完候補」「新記事候補」を追加

3. **`_inbox/` 件数の可視化（オプション）**
   - `_inbox/` の未処理件数が増えすぎたとき気づける仕組み
   - `user-dev-preflight` スキルへの組み込み or 日次レポート出力（具体方法は実装時に判断）

**完了基準**:

- 「ナレッジの健全性チェック」と依頼するとドリフト・欠損・新記事候補が提案される
- 提案は承認なしに wiki を改変しない

**想定所要時間**: Phase 1/2 が安定してから別セッション

---

## SKILL.md 改訂方針まとめ

| セクション                       | Phase | 変更内容                                                             |
| -------------------------------- | ----- | -------------------------------------------------------------------- |
| パート1 Step 1（コンテンツ取得） | 2     | WebFetch → raw/_inbox/ への保存に変更                                |
| パート1 末尾                     | 2     | 新セクション「コンパイルモード」追加                                 |
| パート2 冒頭                     | 1     | 「qmd-fe query 優先」を明記                                          |
| パート2 line 514〜 qmdセクション | 1     | 削除せず参照モードの本流に統合                                       |
| 整理モード                       | 3     | サブセクション「ドリフトチェック」「欠損補完候補」「新記事候補」追加 |

**やらないこと**:

- カテゴリ体系（17カテゴリ）の再編成
- 既存297MDの書き換え
- 整理モード既存ロジックの削除

---

## setup.sh 統合の詳細

### 06_claude.sh への追加内容

ファイル末尾、サードパーティスキルセクションの後に追加:

```bash
# --- qmd インデックス（フロントエンドナレッジのセマンティック検索） ---

QMD_INDEX_PATH="${QMD_FRONTEND_INDEX:-$HOME/.local/share/qmd/frontend.sqlite}"

# qmd CLI のインストール確認
if ! is_installed qmd; then
  log_info "qmd をインストールしています..."
  bun install -g @tobilu/qmd || npm install -g @tobilu/qmd
fi

# インデックス構築（冪等。setup-qmd.sh が既存なら何もしない）
if [[ -f "$QMD_INDEX_PATH" ]]; then
  log_skip "qmd インデックスは既に存在します: $QMD_INDEX_PATH"
else
  log_info "qmd インデックスを構築しています..."
  "$HOME/dotfiles/scripts/setup-qmd.sh" || log_warn "qmd インデックス構築に失敗しました（続行します）"
fi
```

### scripts/setup-qmd.sh の修正

- バグ修正: `SKILL_DIR` のパスを `user-doc-fe-kb` に変更
- スタンドアロン実行は引き続き可能（手動再構築用）

---

## リスクと対策

| リスク                                                             | 対策                                                                                                                  |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| qmd 初回埋め込みが遅い・失敗する                                   | Phase 1 を独立タスクにし、Phase 2 と切り離す。失敗してもSKILL.md改訂に進める。06_claude.sh では失敗を warn として続行 |
| `_inbox/` が肥大化して停滞（既存 qmd 計画と同じ失敗パターン）      | Phase 3 で件数可視化。_inbox/ が一定数を超えたら preflight で警告                                                     |
| `raw/` が `qmd-fe embed` の対象に入って index がノイズだらけになる | `raw/` を `knowledge/` の外に置く。qmd の対象パスを knowledge/ に限定                                                 |
| 既存収集モードに慣れているので新フローを忘れる                     | SKILL.md 冒頭にフロー図を追加。旧フローは完全に置き換え（並行運用しない）                                             |
| 297MDの埋め込み生成中の中断で不完全DB                              | 既存スクリプトに削除リカバリ実装済み（line 33-37）                                                                    |

---

## 想定される最終的な使い方

**毎日の運用**:

- 「この記事保存して https://...」→ raw/_inbox/ に保管（高速・思考停止OK）
- 実装中：「Container Query どうやるんだっけ」→ Claude が裏で `qmd-fe query` → 結果ベースで実装

**週末・隙間時間**:

- 「inbox 処理して」→ Claude が `_inbox/` を全部 knowledge/ に統合、`_archived/` へ移動、件数報告
- 「ナレッジの健全性チェック」→ ドリフト・欠損・新記事候補を提案

**新マシン・他環境**:

- `~/dotfiles/setup/setup.sh` を実行 → 06_claude.sh が qmd セットアップまで自動実行

---

## 参考リンク

- Andrej Karpathy "LLM Knowledge Bases": https://x.com/karpathy/status/2039805659525644595
- Karpathy "Idea File": https://x.com/karpathy/status/2040470801506541998
- Yuchen Jin "Knowledge engineers": https://x.com/Yuchenj_UW/status/2040482771576197377
- elvis "LLM KB diagram": https://x.com/omarsar0/status/2040099881008652634
- 大野修平 解説: https://x.com/Shuhei_Ohno/status/2040614101760782790
- trkbt10 実装紹介: https://x.com/trkbt10/status/2040606487970721918
