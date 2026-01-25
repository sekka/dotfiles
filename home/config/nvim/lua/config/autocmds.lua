-- Autocmds are automatically loaded on the VeryLazy event
-- Default autocmds that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/autocmds.lua
-- Add any additional autocmds here

local autocmd = vim.api.nvim_create_autocmd
local augroup = vim.api.nvim_create_augroup

-- ========================================
-- ファイルタイプ別設定
-- ========================================

-- Markdown用の設定
augroup("markdown_settings", { clear = true })
autocmd("FileType", {
  group = "markdown_settings",
  pattern = "markdown",
  callback = function()
    vim.opt_local.wrap = true
    vim.opt_local.spell = true
    vim.opt_local.spelllang = "en,cjk"
  end,
})

-- ========================================
-- 保存時の自動整形（オプション）
-- ========================================

-- Note: LazyVimはconform.nvimで整形を管理している
-- 追加の自動整形が必要な場合はここに記述

-- ========================================
-- カーソル位置の復元
-- ========================================

-- Note: LazyVimで既に設定されているが、念のため記述
augroup("restore_cursor", { clear = true })
autocmd("BufReadPost", {
  group = "restore_cursor",
  pattern = "*",
  callback = function()
    local mark = vim.api.nvim_buf_get_mark(0, '"')
    local lcount = vim.api.nvim_buf_line_count(0)
    if mark[1] > 0 and mark[1] <= lcount then
      pcall(vim.api.nvim_win_set_cursor, 0, mark)
    end
  end,
})

-- ========================================
-- ターミナルモードの設定
-- ========================================

augroup("terminal_settings", { clear = true })

-- ターミナルを開いたら自動的にインサートモードに入る
autocmd("TermOpen", {
  group = "terminal_settings",
  pattern = "*",
  callback = function()
    vim.opt_local.number = false
    vim.opt_local.relativenumber = false
    vim.cmd("startinsert")
  end,
})

-- ========================================
-- ヤンク時のハイライト
-- ========================================

-- Note: LazyVimで既に設定されているが、明示的に記述
augroup("highlight_yank", { clear = true })
autocmd("TextYankPost", {
  group = "highlight_yank",
  pattern = "*",
  callback = function()
    vim.highlight.on_yank({ higroup = "IncSearch", timeout = 200 })
  end,
})
