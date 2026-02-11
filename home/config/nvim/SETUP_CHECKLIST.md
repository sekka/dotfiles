# Neovim (LazyVim) セットアップ検証チェックリスト

このチェックリストは、LazyVim設定が正しくセットアップされているかを確認するためのものです。

## Phase 1: シンボリックリンクの作成

### 1.1 セットアップスクリプトの実行

```bash
cd ~/dotfiles
./setup/02_home.sh
```

**期待される結果**:

- ✅ `~/.config/nvim` にシンボリックリンクが作成される
- ✅ "✅ 作成: nvim" というメッセージが表示される

### 1.2 シンボリックリンクの確認

```bash
ls -la ~/.config/nvim
```

**期待される結果**:

```
lrwxr-xr-x  nvim -> ~/dotfiles/home/config/nvim
```

---

## Phase 2: Neovimの初回起動

### 2.1 Neovimを起動

```bash
nvim
```

**期待される結果**:

- LazyVimのダッシュボード（alpha-nvim）が表示される
- 自動的にプラグインのインストールが開始される（1-2分）
- エラーメッセージが表示されない

### 2.2 プラグインの確認

Neovim内で以下のコマンドを実行：

```vim
:Lazy
```

**期待される結果**:

- プラグイン一覧が表示される
- 全てのプラグインが ✅ (インストール済み) 状態
- エラーがない

---

## Phase 3: LSPの確認

### 3.1 TypeScriptファイルを開く

```bash
# テスト用ファイルを作成
echo "const foo: string = 'test';" > /tmp/test.ts
nvim /tmp/test.ts
```

### 3.2 LSPの動作確認

**1. LSP情報を確認**:

```vim
:LspInfo
```

**期待される結果**:

- `vtsls` (TypeScript LSP) が接続されている
- "Client: vtsls (id: X, bufnr: X) ~" と表示される

**2. 補完を確認**:

- インサートモードで `Ctrl+Space` を押す
- または、自動補完が表示される

**期待される結果**:

- 補完候補が表示される

**3. 定義へジャンプ**:

- `foo` にカーソルを合わせて `gd` を押す

**期待される結果**:

- 定義にジャンプする（同じ行なのでその場にとどまる）

**4. ホバー情報**:

- `foo` にカーソルを合わせて `K` を押す

**期待される結果**:

- 型情報（`const foo: string`）がポップアップで表示される

---

## Phase 4: 基本機能の確認

### 4.1 ファイル検索（Telescope）

```vim
<leader>ff
```

**期待される結果**:

- Telescopeのファイル検索UIが表示される
- ファジー検索が動作する

### 4.2 サイドバー（neo-tree）

```vim
<leader>e
```

**期待される結果**:

- 左側にファイルツリーが表示される
- ファイル操作（`a`で新規作成、`d`で削除など）ができる

### 4.3 ターミナル

```vim
<leader>ft
```

**期待される結果**:

- フローティングターミナルが表示される
- シェルコマンドが実行できる

### 4.4 lazygit

```vim
<leader>gg
```

**期待される結果**:

- lazygitが起動する
- Git操作ができる

---

## Phase 5: Web開発機能の確認

### 5.1 LazyVim Extrasの確認

```vim
:LazyExtras
```

**期待される結果**:

- 以下のExtrasが有効化されている（✅表示）:
  - ✅ `lang.typescript`
  - ✅ `lang.json`
  - ✅ `lang.tailwind`
  - ✅ `formatting.prettier`
  - ✅ `linting.eslint`

### 5.2 Reactファイルのテスト

```bash
# テスト用ファイルを作成
cat > /tmp/test.tsx << 'EOF'
import React from 'react';

export const App = () => {
  return (
    <div>
      <h1>Test</h1>
    </div>
  );
};
EOF

nvim /tmp/test.tsx
```

**期待される結果**:

- JSXのシンタックスハイライトが正しく表示される
- `<div>` と入力すると、自動的に `</div>` が閉じられる（nvim-ts-autotag）
- LSPによる補完が動作する

### 5.3 Prettierフォーマット

TypeScriptファイル内で：

```vim
<leader>cf
```

**期待される結果**:

- コードがPrettierでフォーマットされる
- インデント、セミコロン、クォートが統一される

---

## Phase 6: キーバインドの確認

### 6.1 .vimrc互換キーマップ

以下のキーマップが動作することを確認：

| キー                    | 機能               | 確認方法                     |
| ----------------------- | ------------------ | ---------------------------- |
| `<leader>w`             | ファイル保存       | ファイルを編集して保存       |
| `<leader>nn`            | 検索ハイライト解除 | `/foo` で検索後、実行        |
| `<leader>s`             | 水平分割           | ウィンドウが水平に分割される |
| `<leader>v`             | 垂直分割           | ウィンドウが垂直に分割される |
| `jk` (インサートモード) | Esc                | インサートモードから抜ける   |

### 6.2 which-keyヘルプ

```vim
<leader>
```

**期待される結果**:

- which-keyのポップアップが表示される
- 利用可能なキーバインド一覧が表示される

---

## トラブルシューティング

### 問題1: プラグインがインストールされない

**症状**: `:Lazy` でエラーが表示される

**対処法**:

1. インターネット接続を確認
2. `:Lazy sync` を実行
3. Neovimを再起動

### 問題2: LSPが動かない

**症状**: `:LspInfo` で "No clients attached" と表示される

**対処法**:

1. Masonを確認
   ```vim
   :Mason
   ```
2. `vtsls` をインストール
   ```vim
   :MasonInstall vtsls
   ```
3. Neovimを再起動

### 問題3: キーバインドが効かない

**症状**: `<leader>ff` などが動作しない

**対処法**:

1. which-keyを確認
   ```vim
   :WhichKey
   ```
2. キーマップ一覧を確認
   ```vim
   :Telescope keymaps
   ```
3. `lua/config/keymaps.lua` の内容を確認

### 問題4: シンボリックリンクが作成されない

**症状**: `~/.config/nvim` が作成されない

**対処法**:

1. スクリプトの実行権限を確認
   ```bash
   chmod +x ~/dotfiles/setup/02_home.sh
   ```
2. スクリプトを再実行
   ```bash
   cd ~/dotfiles
   ./setup/02_home.sh
   ```

---

## 完了チェックリスト

全ての項目にチェックを入れて、セットアップが完了したことを確認してください。

- [ ] Phase 1: シンボリックリンクの作成
  - [ ] `~/.config/nvim` にシンボリックリンクが作成された
- [ ] Phase 2: Neovimの初回起動
  - [ ] LazyVimダッシュボードが表示された
  - [ ] プラグインが全てインストールされた
- [ ] Phase 3: LSPの確認
  - [ ] TypeScript LSP (vtsls) が動作している
  - [ ] 補完が動作する
  - [ ] 定義へジャンプができる
- [ ] Phase 4: 基本機能の確認
  - [ ] Telescope（ファイル検索）が動作する
  - [ ] neo-tree（サイドバー）が動作する
  - [ ] ターミナルが起動する
  - [ ] lazygitが起動する
- [ ] Phase 5: Web開発機能の確認
  - [ ] LazyVim Extrasが有効化されている
  - [ ] React/TSXファイルで補完・ハイライトが動作する
  - [ ] Prettierフォーマットが動作する
- [ ] Phase 6: キーバインドの確認
  - [ ] .vimrc互換キーマップが動作する
  - [ ] which-keyヘルプが表示される

---

## 次のステップ

セットアップが完了したら、[README.md](./README.md) の「学習パス」に従って、Vimの操作に慣れていきましょう。

**Week 1から開始**:

1. `vimtutor` を実行
2. 基本移動（`h/j/k/l`、`w/b`、`gg/G`）を練習
3. VSCodeと併用しながら、徐々にNeovimの使用頻度を上げる

Happy Vimming! 🎉
