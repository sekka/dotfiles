# Neovim (LazyVim) 設定

VSCodeからNeovimへの段階的な移行を目的としたLazyVim設定です。

## 目次

- [概要](#概要)
- [セットアップ](#セットアップ)
- [キーバインド対応表](#キーバインド対応表)
- [学習パス](#学習パス)
- [主な機能](#主な機能)
- [トラブルシューティング](#トラブルシューティング)
- [参考資料](#参考資料)

---

## 概要

### LazyVimとは

[LazyVim](https://www.lazyvim.org/)は、Neovim用の完成度の高いディストリビューションです。以下の特徴があります：

- **LSP統合**: TypeScript、React等の言語サーバー
- **モダンなUI**: Telescope、neo-tree、lualine
- **Git統合**: lazygit、gitsigns
- **プラグイン管理**: lazy.nvim（高速起動）
- **Extras システム**: 言語別・機能別の拡張を簡単に有効化

### この設定の特徴

- **Web開発特化**: TypeScript/React/Tailwind CSS対応
- **.vimrc互換**: 既存のVim設定を移行
- **初心者フレンドリー**: VSCode風のキーバインド対応表、which-keyヘルプ
- **段階的な移行**: 4週間の学習パスを用意

---

## セットアップ

### 前提条件

- Neovim 0.9.0 以上
- Git
- Node.js（LSP用）
- mise（ツール管理、既にインストール済み）

### インストール手順

#### 1. dotfiles のシンボリックリンクを作成

```bash
cd ~/dotfiles
./setup/02_home.sh
```

これにより、`~/.config/nvim` に設定ファイルのシンボリックリンクが作成されます。

#### 2. Neovimを起動

```bash
nvim
```

初回起動時、LazyVimが自動的にプラグインをインストールします（1-2分かかります）。

#### 3. LSPとツールのインストール

LazyVimが起動したら、以下のコマンドでLSPやツールをインストール：

```vim
:LazyExtras
```

インタラクティブなUIで、以下のExtrasが既に有効化されていることを確認：

- ✅ `lang.typescript` - TypeScript/JavaScript LSP
- ✅ `lang.json` - JSON
- ✅ `lang.tailwind` - Tailwind CSS
- ✅ `formatting.prettier` - Prettier統合
- ✅ `linting.eslint` - ESLint統合

#### 4. 動作確認

TypeScriptファイルを開いて、以下を確認：

1. **補完が動作する**: `Ctrl+Space` または自動補完
2. **定義にジャンプできる**: `gd`
3. **LSPが接続されている**: `:LspInfo`

---

## キーバインド対応表

### 基本操作（VSCode → Neovim）

| VSCode         | Neovim (LazyVim)       | 機能                     |
| -------------- | ---------------------- | ------------------------ |
| `Ctrl+P`       | `<leader>ff`           | ファイル検索 (Telescope) |
| `Ctrl+Shift+P` | `<leader>:` または `:` | コマンドパレット         |
| `Ctrl+Shift+F` | `<leader>sg`           | 全文検索 (grep)          |
| `Ctrl+B`       | `<leader>e`            | サイドバー (neo-tree)    |
| `F12`          | `gd`                   | 定義へジャンプ           |
| `Shift+F12`    | `gr`                   | 参照を検索               |
| `Ctrl+.`       | `<leader>ca`           | コードアクション         |
| `F2`           | `<leader>cr`           | リネーム                 |
| `Ctrl+/`       | `gc` (visual)          | コメントトグル           |
| `Ctrl+` ``     | `<leader>ft`           | ターミナル (floating)    |
| `Ctrl+S`       | `<leader>w`            | ファイル保存             |

**Note**: `<leader>` はスペースキー

### ファイル操作

| Neovim        | 機能                 |
| ------------- | -------------------- |
| `<leader>w`   | ファイル保存         |
| `<leader>wq`  | 保存して終了         |
| `<leader>qqq` | 保存せず終了         |
| `<leader>eee` | ファイルをリロード   |
| `<leader>nn`  | 検索ハイライトを消す |

### ウィンドウ操作

| Neovim        | 機能             |
| ------------- | ---------------- |
| `<leader>s`   | 水平分割         |
| `<leader>v`   | 垂直分割         |
| `<C-h/j/k/l>` | ウィンドウ間移動 |

### Git操作

| Neovim       | 機能                  |
| ------------ | --------------------- |
| `<leader>gg` | lazygit起動           |
| `<leader>gs` | Git status            |
| `<leader>gc` | Git commit            |
| `]h` / `[h`  | 次/前の変更箇所へ移動 |

### 検索・置換

| Neovim       | 機能            |
| ------------ | --------------- |
| `/`          | 検索            |
| `n` / `N`    | 次/前の検索結果 |
| `<leader>sr` | 置換            |

---

## 学習パス

### Week 1: 基本移動

**目標**: Vimの基本移動に慣れる

- `h/j/k/l` で移動
- `w/b` で単語移動
- `gg/G` でファイル先頭/末尾
- `f/F/t/T` で行内検索
- `0/$` で行頭/行末

**練習方法**:

1. `vimtutor` を実行（Vimの公式チュートリアル）
2. 矢印キーを使わない縛りでコーディング

### Week 2: 編集操作

**目標**: Vimの編集コマンドをマスター

- `i/a/o` でインサートモード
- `d/c/y` + モーション（`dw`、`ciw`、`yy`など）
- `.` で繰り返し
- `u/Ctrl+R` でundo/redo
- ビジュアルモード（`v`、`V`、`Ctrl+v`）

**練習方法**:

1. 既存のコードをVimコマンドでリファクタリング
2. マクロ記録（`q`）を試す

### Week 3: LazyVim機能

**目標**: LazyVimの機能を活用

- `<leader>` を起点とした操作
- Telescopeでの検索（`<leader>ff`、`<leader>sg`）
- LSPナビゲーション（`gd`、`gr`、`K`）
- neo-tree（`<leader>e`）
- lazygit（`<leader>gg`）

**練習方法**:

1. which-key（`<leader>`を押すとヒント表示）を活用
2. `:Telescope keymaps` でキーバインド一覧を確認

### Week 4: 効率化

**目標**: Vimの真価を発揮

- マクロ記録（`q`）
- バッファ/ウィンドウ操作
- tmux連携
- カスタムキーマップの追加

**練習方法**:

1. 日常的なタスクをマクロ化
2. よく使うコマンドをカスタムキーマップに登録

---

## 主な機能

### LSP（Language Server Protocol）

TypeScript/JavaScript、JSON、Tailwind CSSのLSPが有効化されています。

**主な機能**:

- 補完（自動またはCtrl+Space）
- 定義へジャンプ（`gd`）
- 参照を検索（`gr`）
- ホバー情報（`K`）
- コードアクション（`<leader>ca`）
- リネーム（`<leader>cr`）
- Inlay Hints（型ヒント表示）

### Telescope（ファジーファインダー）

高速なファイル・テキスト検索ツール。

**主なコマンド**:

- `<leader>ff` - ファイル検索
- `<leader>sg` - 全文検索（grep）
- `<leader>sb` - バッファ検索
- `<leader>sh` - ヘルプ検索
- `<leader>sk` - キーマップ検索

### neo-tree（ファイルエクスプローラー）

VSCodeのエクスプローラーに相当。

**操作**:

- `<leader>e` - トグル
- `a` - 新規ファイル/フォルダ作成
- `d` - 削除
- `r` - リネーム
- `y` - コピー
- `x` - 切り取り
- `p` - 貼り付け

### lazygit統合

ターミナルベースのGitクライアント。

**操作**:

- `<leader>gg` - lazygitを起動
- tmux popupで表示（既存のtmux設定と統合）

### 自動タグ閉じ（nvim-ts-autotag）

React/JSXで、タグを自動的に閉じる。

```jsx
<div>|  →  <div>|</div>
```

### フォーマット・Linting

- **Prettier**: `<leader>cf` でフォーマット
- **ESLint**: 保存時に自動Lint

---

## トラブルシューティング

### LSPが動かない

**症状**: 補完が効かない、定義へジャンプできない

**対処法**:

1. LSPの状態を確認
   ```vim
   :LspInfo
   ```

2. LSPを再起動
   ```vim
   :LspRestart
   ```

3. Mason（LSPマネージャー）を開く
   ```vim
   :Mason
   ```
   `vtsls`、`jsonls`、`tailwindcss`がインストールされているか確認

### プラグインが読み込まれない

**症状**: LazyVimの機能が使えない

**対処法**:

1. lazy.nvimのUIを開く
   ```vim
   :Lazy
   ```

2. プラグインを更新
   ```vim
   :Lazy sync
   ```

### キーバインドが効かない

**症状**: `<leader>ff` などが動かない

**対処法**:

1. which-keyで確認
   ```vim
   :WhichKey
   ```

2. キーマップ一覧を確認
   ```vim
   :Telescope keymaps
   ```

3. `lua/config/keymaps.lua` を確認し、競合がないかチェック

### 設定変更が反映されない

**対処法**:

1. Neovimを再起動

2. 設定をリロード
   ```vim
   :source ~/.config/nvim/init.lua
   ```

3. プラグインキャッシュをクリア
   ```vim
   :Lazy clear
   :Lazy sync
   ```

### ターミナルモードから抜けられない

**対処法**:

- `Ctrl+\` → `Ctrl+n` でノーマルモードに戻る
- または `jk` （カスタムキーマップ）

---

## 参考資料

### 公式ドキュメント

- [LazyVim公式](https://www.lazyvim.org/)
- [Neovim公式](https://neovim.io/)
- [lazy.nvim（プラグインマネージャー）](https://github.com/folke/lazy.nvim)

### 学習リソース

- [vimtutor](https://github.com/vim/vim/blob/master/runtime/tutor/tutor) - Vim公式チュートリアル（`vimtutor`コマンド）
- [Vim Adventures](https://vim-adventures.com/) - ゲーム形式でVimを学習
- [Learn Vim (the Smart Way)](https://github.com/iggredible/Learn-Vim) - 無料のVim入門書

### コミュニティ

- [r/neovim](https://www.reddit.com/r/neovim/) - Neovim subreddit
- [LazyVim Discord](https://discord.gg/lazyvim)

---

## ファイル構成

```
home/config/nvim/
├── init.lua              # エントリーポイント
├── lazyvim.json          # LazyVim設定（Extras有効化）
├── stylua.toml           # Luaフォーマッター設定
├── lua/
│   ├── config/
│   │   ├── lazy.lua      # プラグインマネージャー設定
│   │   ├── options.lua   # Vimオプション（.vimrcから移行）
│   │   ├── keymaps.lua   # キーマップ
│   │   └── autocmds.lua  # 自動コマンド
│   └── plugins/
│       ├── lang.lua      # 言語固有の設定（TypeScript/React）
│       ├── editor.lua    # エディタ拡張
│       └── ui.lua        # UI カスタマイズ
└── README.md             # このファイル
```

---

## よくある質問

### Q: VSCodeと併用できる？

**A**: はい。Neovimは独立したエディタなので、VSCodeと併用可能です。段階的な移行を推奨します。

### Q: プラグインを追加したい

**A**: `lua/plugins/` ディレクトリに新しい`.lua`ファイルを作成し、プラグイン設定を記述してください。

例:

```lua
-- lua/plugins/my-plugin.lua
return {
  "author/plugin-name",
  config = function()
    -- 設定
  end,
}
```

### Q: テーマを変更したい

**A**: `lua/plugins/ui.lua` の `tokyonight.nvim` 設定を編集するか、別のカラースキームプラグインを追加してください。

### Q: .vimrcの設定を完全に移行したい

**A**: `lua/config/options.lua` と `lua/config/keymaps.lua` に既に主要な設定を移行済みです。追加設定があれば、同じファイルに追記してください。

---

Happy Vimming! 🎉
