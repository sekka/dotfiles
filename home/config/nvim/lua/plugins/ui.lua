-- UI plugin configurations
-- Customizes LazyVim's appearance

return {
  -- ========================================
  -- Colorscheme
  -- ========================================

  -- Tokyo Night (デフォルトテーマ)
  {
    "folke/tokyonight.nvim",
    opts = {
      style = "night", -- storm, moon, night, day
      transparent = false,
      terminal_colors = true,
      styles = {
        comments = { italic = true },
        keywords = { italic = true },
        functions = {},
        variables = {},
      },
    },
  },

  -- ========================================
  -- その他のUIプラグイン
  -- ========================================

  -- LazyVimのデフォルト設定で十分なため、以下はカスタマイズ不要:
  -- - lualine.nvim (ステータスライン)
  -- - alpha-nvim (ダッシュボード)
  -- - indent-blankline.nvim (インデントガイド)
  -- - noice.nvim (通知・コマンドラインUI)
  --
  -- カスタマイズが必要な場合は、ここに設定を追加してください
}
