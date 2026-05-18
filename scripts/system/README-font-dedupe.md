# フォント重複排除ツール

`scripts/system/` 配下のフォント重複排除・検証 CLI 群の使い方。

## ツール構成

| ツール                | 役割                                                                 |
| --------------------- | -------------------------------------------------------------------- |
| `dedupe-by-master.ts` | master と比較して target の重複ファイルを隔離ディレクトリに移動      |
| `verify-by-hash.ts`   | 隔離ファイルが本当に master に存在するか独立検証（削除前の第二意見） |
| `_font-hash.ts`       | 共通モジュール（SHA256 streaming, hashlist I/O 等）。直接実行不可    |

## 設計思想

- **デフォルト dry-run**: `--apply` を付けるまでファイルは動かない
- **削除ではなく移動**: 隔離ディレクトリへ。元の相対パスを保ったまま手で戻せる
- **ハッシュリスト再利用**: 大規模 master を毎回スキャンしない仕組み（`--save-master-hashlist` / `--master-hashlist`）
- **データフォーク + リソースフォーク**: macOS の resource fork も含めて SHA256 を取り、長さプレフィックスで衝突を防ぐ
- **独立検証**: `verify-by-hash` は `dedupe-by-master` のレポートを一切参照せず、ファイルを再ハッシュして判定
- **空フォルダ自動クリーンアップ**: `--apply` 後、ファイル移動で空になったサブディレクトリと `.DS_Store` のみのサブディレクトリを自動削除（target root 自体は残す。opt-out は `--keep-empty-dirs`）

## 推奨フロー（複数 target に同じ master を使い回す場合）

### ステップ 0: 前提準備（1 回だけ）

```bash
# 隔離・レポート用ディレクトリと、hashlist 生成用ダミー target を作っておく
mkdir -p "$HOME/Dropbox/002_Applications/011_Font/.quarantine"
mkdir -p "$HOME/Dropbox/002_Applications/011_Font/.reports"
mkdir -p /tmp/dummy-target-empty
```

> dedupe-by-master は `--target` 必須なので、master だけスキャンしたいときは空のダミー target を渡す。

### ステップ 1: master の hashlist を 1 回だけ生成

```bash
MASTER="$HOME/Dropbox/002_Applications/011_Font/FontExplorer/20190606/FontExplorer X Pro Fonts"
HASHLIST="$HOME/Dropbox/002_Applications/011_Font/.master.hashlist"

bun scripts/system/dedupe-by-master.ts \
  --master "$MASTER" \
  --target "/tmp/dummy-target-empty" \
  --backup "/tmp/dummy-backup" \
  --save-master-hashlist "$HASHLIST"
```

→ 数 MB のテキストファイルが生成される。以降このファイルを参照すれば master 再スキャン不要。

### ステップ 2: dry-run（target ごと）

```bash
TARGET_NAME="<対象ディレクトリ名>"
T="$HOME/Dropbox/002_Applications/011_Font/FontExplorer/$TARGET_NAME"
BK="$HOME/Dropbox/002_Applications/011_Font/.quarantine/$TARGET_NAME"
REPORT_DRY="$HOME/Dropbox/002_Applications/011_Font/.reports/dryrun-$TARGET_NAME.tsv"

bun scripts/system/dedupe-by-master.ts \
  --master-hashlist "$HASHLIST" \
  --target "$T" \
  --backup "$BK" \
  --report "$REPORT_DRY"
```

→ コンソールに件数サマリ + TSV レポート。`DUPLICATE` / `UNIQUE` / `SUSPECT` の分類を確認。

### ステップ 3: レポート確認

```bash
# DUPLICATE 件数
awk -F'\t' '$2=="DUPLICATE"' "$REPORT_DRY" | wc -l

# SUSPECT があれば中身を見る（サイズ不整合・空フォーク等）
awk -F'\t' '$2=="SUSPECT"' "$REPORT_DRY"
```

### ステップ 4: `--apply` で実際に移動

```bash
REPORT_APPLY="$HOME/Dropbox/002_Applications/011_Font/.reports/apply-$TARGET_NAME.tsv"

bun scripts/system/dedupe-by-master.ts \
  --master-hashlist "$HASHLIST" \
  --target "$T" \
  --backup "$BK" \
  --report "$REPORT_APPLY" \
  --apply
```

→ target から重複ファイルが `$BK/` 配下へ移動（相対パス保持）。

### ステップ 5: verify（削除前の独立検証）

**目的:** dedupe レポートを一切信用せず、隔離フォルダの全ファイルを master から再ハッシュして「本当に master に同一内容がある」ことを独立に確認する。

```bash
REPORT_VERIFY="$HOME/Dropbox/002_Applications/011_Font/.reports/verify-$TARGET_NAME.tsv"

bun scripts/system/verify-by-hash.ts \
  --master-hashlist "$HASHLIST" \
  --backup "$BK" \
  --report "$REPORT_VERIFY"
echo "exit=$?"
```

| exit code | 意味                             | 次のアクション                                 |
| --------- | -------------------------------- | ---------------------------------------------- |
| 0         | 全ファイルが master と一致       | 削除して OK                                    |
| 1         | UNVERIFIED あり（master に無い） | **絶対に削除しない**。レポート確認             |
| 2         | SUSPECT あり                     | 中身確認 → 安全なら `--allow-suspect` で再実行 |

### ステップ 6: 隔離フォルダを削除（手動）

```bash
# verify が exit 0 だった場合のみ
rm -rf "$BK"
```

#### 元に戻したい場合（apply 直後など）

隔離フォルダ内のファイルは元の相対パスを保っているので、rsync で元に戻せる:

```bash
rsync -av "$BK/" "$T/"
```

## 軽量テストコマンド

「いきなり 16 GB は怖い」場合、`--limit 50` で全工程を 1 サイクル流す:

```bash
bun scripts/system/dedupe-by-master.ts \
  --master "$MASTER" \
  --target "$T" \
  --backup "/tmp/font-quarantine-test" \
  --report "/tmp/dryrun-test.tsv" \
  --limit 50
```

→ master・target ともに先頭 50 件だけ処理。レポート形式・動作確認用。

## CLI フラグリファレンス

### `dedupe-by-master.ts`

| フラグ                          | 説明                                                                   |
| ------------------------------- | ---------------------------------------------------------------------- |
| `--master <dir>`                | Master ディレクトリ。`--master-hashlist` と排他                        |
| `--master-hashlist <file>`      | 保存済み hashlist を使う（master 再スキャン回避）。`--master` と排他   |
| `--target <dir>`                | 対象ディレクトリ。複数指定可（リピート）                               |
| `--backup <dir>`                | 隔離ディレクトリ                                                       |
| `--apply`                       | 実際に移動（未指定なら dry-run）                                       |
| `--strict`                      | SUSPECT が 1 件でもあったら中止                                        |
| `--report <path>`               | TSV レポートパス（デフォルト: `./dedupe-report-<ts>.tsv`）             |
| `--save-master-hashlist <file>` | 索引化後に hashlist を保存（`--master` と併用）                        |
| `--limit <N>`                   | 各ディレクトリで最大 N 件だけ処理（テスト用）                          |
| `--keep-empty-dirs`             | `--apply` 後の空サブディレクトリ自動削除をスキップ（デフォルトは削除） |

### `verify-by-hash.ts`

| フラグ                          | 説明                                                       |
| ------------------------------- | ---------------------------------------------------------- |
| `--master <dir>`                | Master ディレクトリ。`--master-hashlist` と排他            |
| `--master-hashlist <file>`      | 保存済み hashlist を使う。`--master` と排他                |
| `--backup <dir>`                | 検証する隔離ディレクトリ                                   |
| `--report <path>`               | TSV レポートパス（デフォルト: `./verify-report-<ts>.tsv`） |
| `--limit <N>`                   | 最大 N 件だけ処理（テスト用）                              |
| `--allow-suspect`               | SUSPECT を警告扱いにする（手動確認済みのとき）             |
| `--save-master-hashlist <file>` | 索引化後に hashlist を保存（`--master` と併用）            |

## レポート TSV のカラム

### dedupe-report

| カラム | 内容                                     |
| ------ | ---------------------------------------- |
| 1      | target 内の相対パス                      |
| 2      | `DUPLICATE` / `UNIQUE` / `SUSPECT`       |
| 3      | SHA256                                   |
| 4      | data fork サイズ                         |
| 5      | resource fork サイズ                     |
| 6      | 一致した master のパス（DUPLICATE のみ） |

### verify-report

| カラム | 内容                                    |
| ------ | --------------------------------------- |
| 1      | backup 内の相対パス                     |
| 2      | `VERIFIED` / `UNVERIFIED` / `SUSPECT`   |
| 3      | SHA256                                  |
| 4      | data fork サイズ                        |
| 5      | resource fork サイズ                    |
| 6      | 一致した master のパス（VERIFIED のみ） |

## チートシート（コピペ用）

```bash
# 共通変数
MASTER="$HOME/Dropbox/002_Applications/011_Font/FontExplorer/20190606/FontExplorer X Pro Fonts"
HASHLIST="$HOME/Dropbox/002_Applications/011_Font/.master.hashlist"
T="$HOME/Dropbox/002_Applications/011_Font/FontExplorer/<TARGET>"
BK="$HOME/Dropbox/002_Applications/011_Font/.quarantine/<TARGET>"

# A. 初回: master hashlist 生成
bun scripts/system/dedupe-by-master.ts --master "$MASTER" --target "/tmp/dummy" --backup "/tmp/dummy-bk" --save-master-hashlist "$HASHLIST"

# B. dry-run
bun scripts/system/dedupe-by-master.ts --master-hashlist "$HASHLIST" --target "$T" --backup "$BK" --report "./dryrun.tsv"

# C. apply
bun scripts/system/dedupe-by-master.ts --master-hashlist "$HASHLIST" --target "$T" --backup "$BK" --report "./apply.tsv" --apply

# D. verify
bun scripts/system/verify-by-hash.ts --master-hashlist "$HASHLIST" --backup "$BK" --report "./verify.tsv"

# E. exit 0 を確認したら手動削除
rm -rf "$BK"
```

## 具体例: この dotfiles ユーザーの実環境（3 ディレクトリ）

```
~/Dropbox/002_Applications/011_Font/FontExplorer/
├── 20190606/FontExplorer X Pro Fonts/    ← Master (16 GB, 7,463 files)
├── 20150510/FontExplorer X Pro Fonts/    ← Target 1 (同じ構造の旧スナップショット)
└── fonts/A, B, C, ...                    ← Target 2 (アルファベット別の別構造)
```

### 前提準備（1 回だけ）

```bash
mkdir -p "$HOME/Dropbox/002_Applications/011_Font/.quarantine"
mkdir -p "$HOME/Dropbox/002_Applications/011_Font/.reports"
mkdir -p /tmp/dummy-target-empty
```

### master の hashlist 生成（1 回だけ、20-30 分）

```bash
bun scripts/system/dedupe-by-master.ts \
  --master "$HOME/Dropbox/002_Applications/011_Font/FontExplorer/20190606/FontExplorer X Pro Fonts" \
  --target "/tmp/dummy-target-empty" \
  --backup "/tmp/dummy-backup" \
  --save-master-hashlist "$HOME/Dropbox/002_Applications/011_Font/.master.hashlist"
```

### Target 1: `20150510/FontExplorer X Pro Fonts`

```bash
# 1A. dry-run
bun scripts/system/dedupe-by-master.ts \
  --master-hashlist "$HOME/Dropbox/002_Applications/011_Font/.master.hashlist" \
  --target "$HOME/Dropbox/002_Applications/011_Font/FontExplorer/20150510/FontExplorer X Pro Fonts" \
  --backup "$HOME/Dropbox/002_Applications/011_Font/.quarantine/20150510" \
  --report "$HOME/Dropbox/002_Applications/011_Font/.reports/dryrun-20150510.tsv"

# 1B. 内容確認
awk -F'\t' '$2=="DUPLICATE"' "$HOME/Dropbox/002_Applications/011_Font/.reports/dryrun-20150510.tsv" | wc -l
awk -F'\t' '$2=="UNIQUE"'    "$HOME/Dropbox/002_Applications/011_Font/.reports/dryrun-20150510.tsv" | wc -l
awk -F'\t' '$2=="SUSPECT"'   "$HOME/Dropbox/002_Applications/011_Font/.reports/dryrun-20150510.tsv"

# 1C. --apply
bun scripts/system/dedupe-by-master.ts \
  --master-hashlist "$HOME/Dropbox/002_Applications/011_Font/.master.hashlist" \
  --target "$HOME/Dropbox/002_Applications/011_Font/FontExplorer/20150510/FontExplorer X Pro Fonts" \
  --backup "$HOME/Dropbox/002_Applications/011_Font/.quarantine/20150510" \
  --report "$HOME/Dropbox/002_Applications/011_Font/.reports/apply-20150510.tsv" \
  --apply

# 1D. verify
bun scripts/system/verify-by-hash.ts \
  --master-hashlist "$HOME/Dropbox/002_Applications/011_Font/.master.hashlist" \
  --backup "$HOME/Dropbox/002_Applications/011_Font/.quarantine/20150510" \
  --report "$HOME/Dropbox/002_Applications/011_Font/.reports/verify-20150510.tsv"
echo "exit=$?"

# 1E. exit 0 を確認したら手動削除
rm -rf "$HOME/Dropbox/002_Applications/011_Font/.quarantine/20150510"
```

### Target 2: `fonts/`（A/B/C/... アルファベット別構造）

```bash
# 2A. dry-run
bun scripts/system/dedupe-by-master.ts \
  --master-hashlist "$HOME/Dropbox/002_Applications/011_Font/.master.hashlist" \
  --target "$HOME/Dropbox/002_Applications/011_Font/FontExplorer/fonts" \
  --backup "$HOME/Dropbox/002_Applications/011_Font/.quarantine/fonts" \
  --report "$HOME/Dropbox/002_Applications/011_Font/.reports/dryrun-fonts.tsv"

# 2B. 内容確認
awk -F'\t' '$2=="DUPLICATE"' "$HOME/Dropbox/002_Applications/011_Font/.reports/dryrun-fonts.tsv" | wc -l
awk -F'\t' '$2=="UNIQUE"'    "$HOME/Dropbox/002_Applications/011_Font/.reports/dryrun-fonts.tsv" | wc -l
awk -F'\t' '$2=="SUSPECT"'   "$HOME/Dropbox/002_Applications/011_Font/.reports/dryrun-fonts.tsv"

# 2C. --apply
bun scripts/system/dedupe-by-master.ts \
  --master-hashlist "$HOME/Dropbox/002_Applications/011_Font/.master.hashlist" \
  --target "$HOME/Dropbox/002_Applications/011_Font/FontExplorer/fonts" \
  --backup "$HOME/Dropbox/002_Applications/011_Font/.quarantine/fonts" \
  --report "$HOME/Dropbox/002_Applications/011_Font/.reports/apply-fonts.tsv" \
  --apply

# 2D. verify
bun scripts/system/verify-by-hash.ts \
  --master-hashlist "$HOME/Dropbox/002_Applications/011_Font/.master.hashlist" \
  --backup "$HOME/Dropbox/002_Applications/011_Font/.quarantine/fonts" \
  --report "$HOME/Dropbox/002_Applications/011_Font/.reports/verify-fonts.tsv"
echo "exit=$?"

# 2E. exit 0 を確認したら手動削除
rm -rf "$HOME/Dropbox/002_Applications/011_Font/.quarantine/fonts"
```

### 注意点

1. **`20150510/...` は master と同名・別世代**。中身が古いだけで構造は同一。dedupe で大半が DUPLICATE 判定になる想定
2. **`fonts/A,B,C,...` は構造が違う**。同じファイル名でも別パスにあるが、SHA256 ベースなのでパスに関係なくマッチする
3. **Dropbox 同期中の競合**: 大量移動は Dropbox 側の同期負荷になる。可能なら一時的に Dropbox 同期を停止して実行 → 完了後再開、を推奨
4. **既存 `dedupe-report-full.tsv` (4.2 MB)**: 過去 run の残骸らしい。新規 run の前に確認・退避を

## トラブルシューティング

| 症状                                   | 対処                                                                    |
| -------------------------------------- | ----------------------------------------------------------------------- |
| `Target directory does not exist: ...` | `--target` が存在しない。`mkdir -p` で作成（hashlist 生成用ダミー含む） |
| `Invalid --limit value`                | 正の整数のみ。`--limit 100` のように指定                                |
| `Targets overlap: A vs B`              | `--target` で渡したディレクトリが包含関係。重ならないよう分ける         |
| `Duplicate target: ...`                | 同じ target を 2 回渡している                                           |
| verify が exit 1                       | `UNVERIFIED` が存在。レポート確認し master 不足を調査するまで削除禁止   |
| verify が exit 2                       | `SUSPECT` あり。中身確認後 `--allow-suspect` で再実行                   |
| `readdir failed: ...`                  | ディレクトリ権限不足。chmod で読み取り権限を付与                        |

## 開発・テスト

```bash
# 単体テスト（31 cases）
bun test scripts/system/_font-hash.test.ts

# Lint/Format
bun scripts/development/lint-format.ts -f scripts/system/_font-hash.ts
bun scripts/development/lint-format.ts -f scripts/system/dedupe-by-master.ts
bun scripts/development/lint-format.ts -f scripts/system/verify-by-hash.ts
```
