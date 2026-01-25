-- Options are automatically loaded before lazy.nvim startup
-- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua
-- Add any additional options here

local opt = vim.opt

-- ========================================
-- General Settings (.vimrcから移行)
-- ========================================

-- 文字コード
opt.encoding = "utf-8"
opt.fileencoding = "utf-8"

-- バックアップ・スワップファイル
opt.backup = false
opt.writebackup = false
opt.swapfile = false

-- ファイル変更の自動読み込み
opt.autoread = true

-- バッファ管理
opt.hidden = true

-- スクロール設定
opt.scrolloff = 8
opt.sidescrolloff = 16
opt.sidescroll = 1

-- コマンドライン
opt.history = 10000
opt.cmdheight = 2

-- 不可視文字
opt.list = true
opt.listchars = {
  tab = "▸ ",
  eol = "↲",
  extends = "❯",
  precedes = "❮",
  trail = "·",
}

-- ========================================
-- UI Settings
-- ========================================

-- 行番号
opt.number = true
opt.relativenumber = true

-- カーソル行
opt.cursorline = true

-- ステータスライン（LazyVimで管理されるが念のため）
opt.laststatus = 3 -- グローバルステータスライン

-- メッセージ表示
opt.confirm = true

-- 補完UI
opt.pumheight = 15 -- ポップアップメニューの高さ

-- ========================================
-- Edit Settings
-- ========================================

-- インデント
opt.autoindent = true
opt.smartindent = true
opt.expandtab = true
opt.tabstop = 2
opt.softtabstop = 2
opt.shiftwidth = 2

-- 補完
opt.wildmenu = true
opt.wildmode = "list:longest,full"

-- バックスペース
opt.backspace = { "indent", "eol", "start" }

-- ========================================
-- Search Settings
-- ========================================

-- 検索ハイライト
opt.hlsearch = true
opt.incsearch = true

-- 大文字小文字
opt.ignorecase = true
opt.smartcase = true

-- 括弧のハイライト
opt.showmatch = true

-- 検索のラップ
opt.wrapscan = true

-- 置換時のgオプション
opt.gdefault = true

-- ========================================
-- Clipboard
-- ========================================

-- OSクリップボード連携（LazyVimでも設定されているが明示）
opt.clipboard = "unnamedplus"

-- ========================================
-- Mouse
-- ========================================

-- 全モードでマウス有効化
opt.mouse = "a"

-- ========================================
-- Window/Split
-- ========================================

-- 新しいウィンドウの位置
opt.splitright = true
opt.splitbelow = true

-- ========================================
-- Performance
-- ========================================

-- 高速ターミナル接続
opt.ttyfast = true

-- ========================================
-- Additional Settings
-- ========================================

-- タイトル表示
opt.title = true

-- ビープ無効化
opt.errorbells = false
opt.visualbell = true

-- 移動コマンドで行頭に移動しない
opt.startofline = false

-- 行をまたぐ移動
opt.whichwrap:append("<,>,[,],h,l,b,s")
