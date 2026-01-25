-- Language-specific plugin configurations
-- Extends LazyVim's lang extras with additional settings

return {
  -- ========================================
  -- TypeScript/React/JSX
  -- ========================================

  -- Auto close and rename HTML/JSX tags
  {
    "windwp/nvim-ts-autotag",
    event = "InsertEnter",
    config = function()
      require("nvim-ts-autotag").setup({
        opts = {
          enable_close = true, -- Auto close tags
          enable_rename = true, -- Auto rename pairs of tags
          enable_close_on_slash = false, -- Auto close on trailing </
        },
      })
    end,
  },

  -- ========================================
  -- LSP Configuration
  -- ========================================

  -- Extend TypeScript LSP settings
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        -- TypeScript/JavaScript LSP (vtsls is used by LazyVim Extras)
        vtsls = {
          settings = {
            typescript = {
              inlayHints = {
                parameterNames = { enabled = "literals" },
                parameterTypes = { enabled = true },
                variableTypes = { enabled = true },
                propertyDeclarationTypes = { enabled = true },
                functionLikeReturnTypes = { enabled = true },
                enumMemberValues = { enabled = true },
              },
            },
            javascript = {
              inlayHints = {
                parameterNames = { enabled = "literals" },
                parameterTypes = { enabled = true },
                variableTypes = { enabled = true },
                propertyDeclarationTypes = { enabled = true },
                functionLikeReturnTypes = { enabled = true },
                enumMemberValues = { enabled = true },
              },
            },
          },
        },
        -- JSON LSP (already configured by LazyVim Extras, but can be extended here)
        jsonls = {},
        -- Tailwind CSS LSP (already configured by LazyVim Extras)
        tailwindcss = {},
      },
    },
  },

  -- ========================================
  -- Treesitter Configuration
  -- ========================================

  -- Ensure additional parsers are installed
  {
    "nvim-treesitter/nvim-treesitter",
    opts = function(_, opts)
      if type(opts.ensure_installed) == "table" then
        vim.list_extend(opts.ensure_installed, {
          "typescript",
          "tsx",
          "javascript",
          "jsdoc",
          "json",
          "jsonc",
          "css",
          "scss",
          "html",
        })
      end

      -- Enable autotag module for Treesitter
      opts.autotag = {
        enable = true,
      }
    end,
  },

  -- ========================================
  -- Formatting & Linting
  -- ========================================

  -- Prettier (configured by LazyVim Extras, but can be extended here)
  {
    "stevearc/conform.nvim",
    optional = true,
    opts = {
      formatters_by_ft = {
        -- Prettier for web files (already set by LazyVim Extras)
        -- javascript = { "prettier" },
        -- typescript = { "prettier" },
        -- json = { "prettier" },
        -- Add custom formatters here if needed
      },
    },
  },

  -- ESLint (configured by LazyVim Extras, but can be extended here)
  {
    "nvim-lspconfig",
    optional = true,
    opts = {
      servers = {
        eslint = {
          settings = {
            -- ESLint settings
            workingDirectory = { mode = "auto" },
          },
        },
      },
    },
  },
}
