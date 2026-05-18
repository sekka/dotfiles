# フォント重複排除ツール

`scripts/system/` 配下のフォント重複排除・検証 CLI 群の使い方。

## ツール構成

| ツール                    | 役割                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| `dedupe-by-master.ts`     | master と比較して target の重複ファイルを隔離ディレクトリに移動                              |
| `verify-by-hash.ts`       | 隔離ファイルが本当に master に存在するか独立検証（削除前の第二意見）                         |
| `scan-self-duplicates.ts` | 単一ディレクトリ内部の重複・フォーマット違い・異常を SHA256 で検出（分析専用、移動はしない） |
| `_font-hash.ts`           | 共通モジュール（SHA256 streaming, hashlist I/O 等）。直接実行不可                            |

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

## 自己重複スキャン (`scan-self-duplicates.ts`)

master / target という 2 ディレクトリ比較ではなく、**1 つのフォントライブラリ内部に同一内容のファイルが何個あるか**を調べるための分析専用ツール。`--apply` フラグは意図的に持たず、移動・削除は別フェーズで手動実行する設計。

### こういうときに使う

- Dropbox の `Foo/` と `Foo 2/` のような numbered-suffix フォルダで重複が増えた疑い
- RightFont / FontExplorer ライブラリ内部に同一 SHA256 のファイルが複数ある疑い
- `.icloud` プレースホルダや 0 バイトファイルの混入確認
- 同じ basename で `.otf` と `.ttf` が両方ある（FORMAT_PAIR）構成の棚卸し

### 使い方

```bash
# RightFont ライブラリの自己重複スキャン
bun scripts/system/scan-self-duplicates.ts \
  --root "$HOME/Dropbox/application/RightFont/RightFont.rightfontlibrary/fonts" \
  --report "$HOME/Dropbox/002_Applications/011_Font/.reports/self-dups-rightfont.tsv"

# FontExplorer の小ロット試走
bun scripts/system/scan-self-duplicates.ts \
  --root "$HOME/Dropbox/002_Applications/011_Font/FontExplorer/fonts" \
  --limit 500
```

### CLI フラグ

| フラグ            | 説明                                                         |
| ----------------- | ------------------------------------------------------------ |
| `--root <dir>`    | スキャン対象ディレクトリ（必須）                             |
| `--report <path>` | TSV レポートパス（デフォルト: `./font-self-duplicates.tsv`） |
| `--limit N`       | 先頭 N ファイルだけ処理（デバッグ用）                        |

### レポート TSV のカラム

| カラム           | 内容                                                          |
| ---------------- | ------------------------------------------------------------- |
| `relpath`        | `--root` からの相対パス                                       |
| `kind`           | `DUP_GROUP` / `FORMAT_PAIR` / `ANOMALY` / `SOLO`              |
| `group_id`       | 同じグループの判別 ID（DUP_GROUP / FORMAT_PAIR で意味を持つ） |
| `role`           | `keeper` / `candidate`（DUP_GROUP のみ）                      |
| `sha256`         | data fork + resource fork を結合した SHA256                   |
| `data_bytes`     | data fork サイズ                                              |
| `rsrc_bytes`     | resource fork サイズ                                          |
| `anomaly_reason` | ANOMALY 時の理由（複数あればカンマ区切り）                    |

### kind の意味

- **`DUP_GROUP`**: 2 個以上が同じ SHA256。1 つを `keeper`、残りを `candidate` としてマーク
- **`FORMAT_PAIR`**: 同じ basename で拡張子だけ違う（例: `Foo.otf` と `Foo.ttf`）。ハッシュは別物。意図的な多形式共存か重複かを目視で判断する
- **`ANOMALY`**: クラウドプレースホルダ、Dropbox conflicted copy 名、0 バイト、データ／リソースフォーク異常など
- **`SOLO`**: 重複なし。レポートには載らない（出力されるのは上記 3 種のみ）

### keeper 選択ロジック（3 段階タイブレーク）

`DUP_GROUP` の中から残す 1 個を決めるルール。`role=keeper` 以外は `candidate` で、隔離・削除の対象候補になる。

1. **パスが浅い方が勝ち**（`/a/b/Foo.otf` > `/a/b/c/d/Foo.otf`）
2. 同じ深さなら **conflict marker を含まない方が勝ち**:
   - `(N)` / `copy` / `Copy` / `(conflicted copy ...)` を含むセグメント
   - `Foo 2` / `Foo 3` / `Foo 10` のような **末尾が空白 + 数字** のフォルダ名（Dropbox 同期競合の典型）
3. それでも決まらなければ **辞書順最小**

> 末尾 numbered-suffix の判定は「セグメント全体が `\s\d+$` で終わるか」で見るので、`Foo 2 Bold` のような途中に数字を含む正当な名前は誤検知しない。

### ANOMALY の reason 一覧

| reason                     | 意味                                                  |
| -------------------------- | ----------------------------------------------------- |
| `cloud_placeholder`        | `.icloud` 末尾 or `com.apple.fileprovider` xattr 持ち |
| `conflicted_name`          | ファイル名に `(conflicted copy ...)` パターンを含む   |
| `zero_byte_data`           | data fork が 0 バイト                                 |
| `suspect_size_mismatch`    | ハッシュ計算中にサイズが変化（同期中の可能性）        |
| `suspect_both_forks_empty` | data fork も resource fork も空                       |
| `hash_error`               | SHA256 計算が失敗                                     |

### 典型的な分析フロー

```bash
# 1. スキャン
bun scripts/system/scan-self-duplicates.ts --root "$ROOT" --report "$REPORT"

# 2. サマリ
awk -F'\t' 'NR>1 {print $2}' "$REPORT" | sort | uniq -c

# 3. DUP_GROUP の candidate だけ抜き出して回収可能サイズを試算
awk -F'\t' 'NR>1 && $2=="DUP_GROUP" && $4=="candidate" {sum+=$6+$7} END {print sum, "bytes reclaimable"}' "$REPORT"

# 4. ANOMALY を目視
awk -F'\t' 'NR>1 && $2=="ANOMALY"' "$REPORT"

# 5. FORMAT_PAIR の拡張子分布
awk -F'\t' 'NR>1 && $2=="FORMAT_PAIR" {print $1}' "$REPORT" | sed -E 's/.*\.//' | sort | uniq -c | sort -rn
```

### candidate を実際に処分する

scan-self-duplicates 自体は移動しない。candidate のパス一覧を抽出して、`mv` でゴミ箱（`~/.Trash`）に送るのが推奨フロー:

```bash
TS=$(date +%Y%m%dT%H%M%S)
TRASH="$HOME/.Trash/self-dups-$TS"
mkdir -p "$TRASH"

awk -F'\t' -v root="$ROOT" 'NR>1 && $2=="DUP_GROUP" && $4=="candidate" {print root "/" $1}' "$REPORT" \
  | while IFS= read -r f; do
      mkdir -p "$TRASH/$(dirname "${f#$ROOT/}")"
      mv -v "$f" "$TRASH/${f#$ROOT/}"
    done
```

> **`~/.Trash` の TCC 制限**: macOS の Transparency, Consent and Control によりターミナルから `ls ~/.Trash/` は "Operation not permitted" になるが、**`mv` で送る分には可**。中身確認は Finder GUI から「ゴミ箱を開く」で見る。

### 注意点

- **TTC ファイル**: TrueType Collection は 1 ファイルに複数ウェイトを内包するが、RightFont は各「ウェイト」フォルダに **物理コピー** を置く実装になっている。スキャン上は明確な DUP_GROUP として検出される（リンクではなく実体重複）。`/usr/bin/stat -f "%i %l"` で inode と link count を見ると、別 inode・link=1 で本当に複製されていることが確認できる
- **SHA256 値は shasum と一致しない**: 本スキャンは `data fork + 長さプレフィックス + resource fork` の連結に対する SHA256 を計算するため、data fork だけの `shasum file` とは一致しない。スキャン内部の同一性比較にのみ使う ID
- **削減量の見方**: 「`446.6 MB (8 files)` 回収可能」は `(候補数 - 1) × ファイルサイズ` の合計（MiB）であって keeper 自身は残る

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
# 単体テスト
bun test scripts/system/_font-hash.test.ts
bun test scripts/system/scan-self-duplicates.test.ts

# Lint/Format
bun scripts/development/lint-format.ts -f scripts/system/_font-hash.ts
bun scripts/development/lint-format.ts -f scripts/system/dedupe-by-master.ts
bun scripts/development/lint-format.ts -f scripts/system/verify-by-hash.ts
bun scripts/development/lint-format.ts -f scripts/system/scan-self-duplicates.ts
```
