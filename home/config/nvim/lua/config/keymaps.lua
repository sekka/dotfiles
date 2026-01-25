-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua
-- Add any additional keymaps here

local map = vim.keymap.set

-- ========================================
-- .vimrcからの移行キーマップ
-- ========================================

-- Note: <Leader>はすでにSpaceに設定されている（lazy.lua）

-- ファイル操作
map("n", "<Leader>w", ":w<CR>", { desc = "Save file", silent = true })
map("n", "<Leader>qqq", ":q!<CR>", { desc = "Quit without saving", silent = true })
map("n", "<Leader>wq", ":wq<CR>", { desc = "Save and quit", silent = true })
map("n", "<Leader>eee", ":e<CR>", { desc = "Reload file", silent = true })

-- 検索ハイライトを消す
map("n", "<Leader>nn", ":noh<CR>", { desc = "Clear search highlight", silent = true })

-- 分割ウィンドウ（LazyVimにも同様の機能があるが、.vimrc互換のため残す）
map("n", "<Leader>s", ":<C-u>split<CR>", { desc = "Horizontal split", silent = true })
map("n", "<Leader>v", ":<C-u>vsplit<CR>", { desc = "Vertical split", silent = true })

-- タブ操作（LazyVimのデフォルトはバッファ操作なので、必要に応じて調整）
-- map("n", "<Tab>", "gt", { desc = "Next tab", silent = true })
-- map("n", "<S-Tab>", "gT", { desc = "Previous tab", silent = true })
-- map("n", "<Leader>t", ":tabnew<CR>", { desc = "New tab", silent = true })

-- 表示行単位での移動（LazyVimでも設定されているが明示）
map("n", "j", "gj", { silent = true })
map("n", "k", "gk", { silent = true })
map("n", "<Down>", "gj", { silent = true })
map("n", "<Up>", "gk", { silent = true })

-- Yで行末までヤンク
map("n", "Y", "y$", { desc = "Yank to end of line" })

-- 数値の増減
map("n", "+", "<C-a>", { desc = "Increment number" })
map("n", "-", "<C-x>", { desc = "Decrement number" })

-- 行頭・行末への移動（Emacsライク）
map("n", "<C-e>", "$", { silent = true })
map("n", "<C-a>", "0", { silent = true })
map("i", "<C-e>", "<C-o>$", { silent = true })
map("i", "<C-a>", "<C-o>0", { silent = true })

-- 単語移動
map("n", "<C-f>", "W", { silent = true })
map("n", "<C-b>", "B", { silent = true })
map("i", "<C-f>", "<C-o>W", { silent = true })
map("i", "<C-b>", "<C-o>B", { silent = true })

-- ========================================
-- VSCode風キーバインド（学習支援）
-- ========================================

-- Note: LazyVimのデフォルトキーマップと競合する可能性がある
-- 必要に応じてコメントアウトを外す

-- ファイル検索: <Leader>ff (LazyVimデフォルト)
-- コマンドパレット: <Leader>: または : (標準)
-- 全文検索: <Leader>sg (LazyVimデフォルト)
-- サイドバー: <Leader>e (LazyVimデフォルト - neo-tree)
-- ターミナル: <Leader>ft (LazyVimデフォルト - floating terminal)

-- ========================================
-- その他の便利なキーマップ
-- ========================================

-- Escキーの代替（jkまたはjj）
map("i", "jk", "<Esc>", { desc = "Exit insert mode", silent = true })

-- ビジュアルモードでインデント調整後も選択を維持
map("v", "<", "<gv", { silent = true })
map("v", ">", ">gv", { silent = true })

-- 検索結果を画面中央に表示
map("n", "n", "nzzzv", { silent = true })
map("n", "N", "Nzzzv", { silent = true })
