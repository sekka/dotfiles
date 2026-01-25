-- Editor plugin configurations
-- Extends LazyVim's editor features

return {
  -- ========================================
  -- File Explorer (neo-tree)
  -- ========================================

  -- neo-tree configuration (already included in LazyVim)
  {
    "nvim-neo-tree/neo-tree.nvim",
    opts = {
      filesystem = {
        filtered_items = {
          hide_dotfiles = false,
          hide_gitignored = false,
          hide_hidden = false, -- only works on Windows for hidden files/directories
          hide_by_name = {
            "node_modules",
            ".git",
            ".DS_Store",
          },
        },
        follow_current_file = {
          enabled = true, -- This will find and focus the file in the active buffer
        },
      },
      window = {
        width = 30,
      },
    },
  },

  -- ========================================
  -- Telescope (fuzzy finder)
  -- ========================================

  -- Telescope configuration (already included in LazyVim)
  {
    "nvim-telescope/telescope.nvim",
    opts = {
      defaults = {
        -- カスタム設定があればここに追加
        layout_strategy = "horizontal",
        layout_config = {
          horizontal = {
            preview_width = 0.55,
          },
        },
      },
    },
  },

  -- ========================================
  -- Git Integration
  -- ========================================

  -- lazygit integration (already included in LazyVim)
  -- <Leader>gg でlazygitが開く

  -- ========================================
  -- Terminal Integration
  -- ========================================

  -- ToggleTerm (LazyVimではfloating terminalが標準)
  -- 必要に応じて追加設定
}
