#!/bin/bash
# dotfiles シンボリックリンクを作成（冪等: 何回でも安全に実行可能）

# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
log_section "03: Symlinks setup"

created=0
skipped=0

# --- ヘルパー関数 ---

# シンボリックリンクを作成（ファイル・ディレクトリ共用）
link_item() {
  local source="$1"
  local target="$2"
  local label="${3:-$(basename "$target")}"

  if [[ ! -e $source ]]; then
    log_warn "$label がソースに見つかりません"
    return 0
  fi

  if [[ -L $target ]]; then
    local current
    current=$(readlink "$target")
    if [[ $current == "$source" ]]; then
      log_skip "$label (既に正しくリンク済み)"
      skipped=$((skipped + 1))
    else
      log_info "$label を更新しています..."
      rm "$target"
      ln -s "$source" "$target"
      created=$((created + 1))
    fi
  elif [[ -e $target ]]; then
    log_warn "$label は実体が存在します。手動確認してください"
  else
    log_info "$label を作成しています..."
    ln -s "$source" "$target"
    created=$((created + 1))
  fi
}

# 親ディレクトリを必要に応じて作成
ensure_dir() {
  local dir="$1"
  if [[ ! -d $dir ]]; then
    mkdir -p "$dir"
    log_info "ディレクトリを作成: $(basename "$dir")"
  fi
}

# --- ホームディレクトリ ---

DOT_FILES=(
  .agignore
  .gitcommit_template
  .gitconfig
  .gitconfig_private
  .gitignore_global
  .mcp.json
  .tigrc
  .tmux.conf
  .vimrc
  .zprofile
  .zshenv
  .zshrc
)

for file in "${DOT_FILES[@]}"; do
  link_item "$HOME/dotfiles/home/$file" "$HOME/$file" "$file"
done

# tmux ヘルパースクリプト
ensure_dir "$HOME/.tmux"
link_item "$HOME/dotfiles/home/.tmux/status-right.sh" "$HOME/.tmux/status-right.sh" "tmux status-right"
link_item "$HOME/dotfiles/home/.tmux/new-session" "$HOME/.tmux/new-session" "tmux new-session"

# --- .config ディレクトリ ---

ensure_dir "$HOME/.config"

CONFIG_DIRS=(
  ghostty
  gwq
  lazygit
  mise
  nvim
  sheldon
  yazi
)

for dir in "${CONFIG_DIRS[@]}"; do
  link_item "$HOME/dotfiles/home/config/$dir" "$HOME/.config/$dir" "$dir"
done

# --- Claude 設定 ---

ensure_dir "$HOME/.claude"

DOTFILES_CLAUDE_DIR="$HOME/dotfiles/home/.claude"
HOME_CLAUDE_DIR="$HOME/.claude"

CLAUDE_FILES=(
  CLAUDE.md
  RTK.md
  settings.json
  settings.local.json
  statusline.ts
  statusline-config.json
  tmux-status.ts
)

for file in "${CLAUDE_FILES[@]}"; do
  link_item "$DOTFILES_CLAUDE_DIR/$file" "$HOME_CLAUDE_DIR/$file" "$file"
done

CLAUDE_FOLDERS=(
  "commands:Commands"
  "agents:Agents"
  "skills:Skills"
  "plans:Plans"
  "hooks:Hooks"
  "rules:Rules"
  "docs:Docs"
  "lib:Lib"
  "statusline:Statusline"
)

for folder_pair in "${CLAUDE_FOLDERS[@]}"; do
  folder="${folder_pair%%:*}"
  label="${folder_pair##*:}"
  link_item "$DOTFILES_CLAUDE_DIR/$folder" "$HOME_CLAUDE_DIR/$folder" "$label"
done

# --- Navi チートシート ---

ensure_dir "$HOME/.local/share/navi/cheats/dotfiles"
link_item "$HOME/dotfiles/home/config/navi/dotfiles.cheat" "$HOME/.local/share/navi/cheats/dotfiles/dotfiles.cheat" "dotfiles.cheat"

# --- codex 設定 ---

ensure_dir "$HOME/.codex"
link_item "$HOME/dotfiles/home/codex/config.toml" "$HOME/.codex/config.toml" "config.toml"

# --- LaunchAgents ---

ensure_dir "$HOME/Library/LaunchAgents"
link_item "$HOME/dotfiles/home/Library/LaunchAgents/com.ollama.serve.plist" "$HOME/Library/LaunchAgents/com.ollama.serve.plist" "Ollama LaunchAgent"

# --- Git hooks ---

DOTFILES_HOOKS_DIR="$HOME/dotfiles/.githooks"
GIT_HOOKS_DIR="$HOME/dotfiles/.git/hooks"

if [[ ! -d "$HOME/dotfiles/.git" ]]; then
  log_warn ".git ディレクトリが見つかりません。Git hooks をスキップします"
elif [[ ! -d $DOTFILES_HOOKS_DIR ]]; then
  log_warn ".githooks ディレクトリが見つかりません。Git hooks をスキップします"
else
  mkdir -p "$GIT_HOOKS_DIR"
  hook_count=0
  for hook_file in "$DOTFILES_HOOKS_DIR"/*; do
    if [[ -f $hook_file ]]; then
      hook_name=$(basename "$hook_file")
      cp "$hook_file" "$GIT_HOOKS_DIR/$hook_name"
      chmod +x "$GIT_HOOKS_DIR/$hook_name"
      log_info "Git hook コピー: $hook_name"
      hook_count=$((hook_count + 1))
    fi
  done
  if [[ $hook_count -eq 0 ]]; then
    log_warn "コピーする hook ファイルが見つかりませんでした"
  fi
fi

# --- サマリー ---

log_section "03: 完了"
log_info "新規作成: $created 件 / スキップ: $skipped 件"
