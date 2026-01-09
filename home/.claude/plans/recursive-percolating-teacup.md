# 計画: claude-mem settings.json の dotfiles 管理

## 概要

`~/.claude-mem/settings.json` を dotfiles プロジェクトで管理し、シンボリックリンクで参照する。

## 現在の状態

- **対象ファイル**: `~/.claude-mem/settings.json`（1,572 bytes）
- **内容**: claude-mem の設定（モデル、ポート、コンテキスト表示設定など）

## 実装手順

### Step 1: 実体ファイルの配置先を作成

```bash
mkdir -p ~/dotfiles/home/.claude-mem
```

### Step 2: 現在のファイルをプロジェクトにコピー

```bash
cp ~/.claude-mem/settings.json ~/dotfiles/home/.claude-mem/settings.json
```

### Step 3: 元のファイルをバックアップして削除

```bash
mv ~/.claude-mem/settings.json ~/.claude-mem/settings.json.backup
```

### Step 4: シンボリックリンクを作成

```bash
ln -s ~/dotfiles/home/.claude-mem/settings.json ~/.claude-mem/settings.json
```

### Step 5: 動作確認

```bash
ls -la ~/.claude-mem/settings.json
cat ~/.claude-mem/settings.json
```

## 配置先

```
~/dotfiles/home/.claude-mem/settings.json  # 実体（Git管理）
~/.claude-mem/settings.json                # シンボリックリンク
```

## 検証方法

1. シンボリックリンクが正しく作成されているか確認
2. claude-mem が正常に動作するか確認（MCP ツールの利用）
3. Git で変更が追跡されているか確認

## 注意事項

- `.claude-mem/` ディレクトリ自体は他のファイル（DB、ログ等）があるためシンボリックリンク化しない
- `settings.json` のみを管理対象とする
