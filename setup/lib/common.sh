#!/bin/bash
# setup スクリプト共通ヘルパーライブラリ

set -eo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $*"; }
log_skip() { echo -e "${YELLOW}[SKIP]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }
log_section() { echo -e "\n${BLUE}===== $* =====${NC}"; }

is_installed() { command -v "$1" &>/dev/null; }

# Usage: ensure_symlink <source> <target> <label> [sudo]
ensure_symlink() {
  local src="$1" tgt="$2" label="$3" use_sudo="${4:-}"
  if [[ ! -f $src ]]; then
    log_warn "${label} が見つかりません: $src"
  elif [[ -e $tgt || -L $tgt ]]; then
    log_skip "${label} コマンドは既にインストール済み"
  else
    log_info "${label} シンボリックリンクを作成しています..."
    ${use_sudo:+sudo} ln -s "$src" "$tgt"
    log_info "${label} コマンドをインストールしました"
  fi
}

source_nix_daemon() {
  if [[ -f /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh ]]; then
    # shellcheck source=/dev/null
    . /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh
  fi
}
