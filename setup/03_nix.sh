#!/bin/bash
# Nix パッケージ管理のセットアップ（Determinate Nix + nix-darwin）

# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
log_section "03: Nix setup"

NIX_DIR="$(cd "$(dirname "$0")/.." && pwd)/nix"

source_nix_daemon

# --- Nix インストール ---

if is_installed nix; then
  log_skip "Nix はインストール済み（$(nix --version)）"
else
  log_info "Nix をインストールしています（Determinate Systems installer）..."
  curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install --no-confirm
  source_nix_daemon
  log_info "Nix をインストールしました"
fi

# --- nix-darwin 適用 ---

if [[ ! -f "$NIX_DIR/flake.nix" ]]; then
  log_error "flake.nix が見つかりません: $NIX_DIR/flake.nix"
  exit 1
fi

HOSTNAME=$(hostname -s)
log_info "ホスト名: $HOSTNAME"

# このホスト用の .nix ファイルがなければ自動作成
HOST_NIX="$NIX_DIR/hosts/$HOSTNAME.nix"
if [[ -f $HOST_NIX ]]; then
  log_skip "ホスト設定ファイルは既に存在: hosts/$HOSTNAME.nix"
else
  log_info "ホスト設定ファイルを作成しています: hosts/$HOSTNAME.nix"
  cat >"$HOST_NIX" <<EOF
{ ... }: {
  # $HOSTNAME 固有の設定
  # マシン固有のパッケージや設定はここに追加
}
EOF
  # Nix が認識するために git add が必要
  if ! git -C "$(dirname "$NIX_DIR")" add "$HOST_NIX"; then
    log_error "git add に失敗しました: $HOST_NIX"
    exit 1
  fi
  log_info "作成しました: hosts/$HOSTNAME.nix"
fi

# --- nixpkgs 更新（2週間遅延） ---
log_info "nixpkgs を更新しています（2週間遅延）..."
bash "$NIX_DIR/update-nixpkgs.sh"

# 初回ビルド（darwin-rebuild がまだない場合）
if ! is_installed darwin-rebuild; then
  log_info "nix-darwin を初回ビルドしています..."
  nix build "$NIX_DIR#darwinConfigurations.$HOSTNAME.system" --out-link "$NIX_DIR/result"
  log_info "nix-darwin を適用しています（sudo が必要です）..."
  sudo "$NIX_DIR/result/sw/bin/darwin-rebuild" switch --flake "$NIX_DIR#$HOSTNAME"
else
  log_info "nix-darwin を適用しています（sudo が必要です）..."
  sudo darwin-rebuild switch --flake "$NIX_DIR#$HOSTNAME"
fi

# --- Homebrew から Nix 移行済みパッケージの削除 ---
# ※ このリストは nix/hosts/common.nix の environment.systemPackages と対応

INSTALLED_BREWS=$(brew list --formula 2>/dev/null)
NIX_MANAGED_BREWS=(
  # common.nix の environment.systemPackages と対応
  aria2 awscli bandwhich bat btop cabextract cdrtools coreutils
  diff-so-fancy diffnav direnv dprint dstp emojify exiftool
  eza fd ffmpeg fpp fzf gawk gh ghq git gitui glow
  gnupg2 hgrep htop httpstat imagemagick jq lazygit
  libavif libwebp lnav mactop mas media-info mise mycli navi neovim
  nkf ollama ouch pnpm poppler pre-commit procs pstree
  ripgrep sevenzip sheldon shellcheck shfmt silicon snitch starship
  superfile tailspin terminal-notifier the_platinum_searcher the_silver_searcher
  tig tmux tpm tree uv vim walk
  wget wimlib xh yamllint yarn yazi yt-dlp zenith zoxide
)

for pkg in "${NIX_MANAGED_BREWS[@]}"; do
  if grep -q "^${pkg}$" <<<"$INSTALLED_BREWS"; then
    log_info "$pkg を Homebrew からアンインストールしています（Nix で管理）..."
    brew uninstall --ignore-dependencies "$pkg"
  fi
done

# --- サマリー ---

log_section "03: 完了"
log_info "Nix 管理パッケージは nix/hosts/common.nix で定義されています"
log_info "更新: cd nix && ./update-nixpkgs.sh && darwin-rebuild switch --flake ."
