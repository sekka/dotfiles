#!/bin/bash
# nixpkgs を指定日数前のリビジョンに更新する
# 使い方: ./update-nixpkgs.sh [--days N]

set -euo pipefail

export PATH="/nix/var/nix/profiles/default/bin:/run/current-system/sw/bin:$PATH"

DAYS=7

while [[ $# -gt 0 ]]; do
  case "$1" in
  --days)
    DAYS="$2"
    shift 2
    ;;
  *)
    echo "Usage: $0 [--days N]" >&2
    exit 1
    ;;
  esac
done

for cmd in gh jq nix; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: ${cmd} command not found" >&2
    exit 1
  fi
done

cd "$(dirname "$0")"

UNTIL=$(/bin/date -v-"${DAYS}"d +%Y-%m-%dT%H:%M:%SZ)
# nixos-unstable: Hydra ビルド通過済み = バイナリキャッシュ確実
echo "Fetching nixos-unstable commit older than ${DAYS} days (before ${UNTIL})..."

RESPONSE=$(gh api "repos/NixOS/nixpkgs/commits?sha=nixos-unstable&until=${UNTIL}&per_page=1" --jq '.[0] | {sha, date: .commit.committer.date}')
REV=$(echo "$RESPONSE" | jq -r '.sha')
COMMIT_DATE=$(echo "$RESPONSE" | jq -r '.date')

if [[ -z $REV || $REV == "null" ]]; then
  echo "Error: Could not fetch commit SHA from GitHub API" >&2
  exit 1
fi

CURRENT_REV=$(jq -r '.nodes.nixpkgs.locked.rev' flake.lock)

echo "Current rev: ${CURRENT_REV}"
echo "New rev:     ${REV} (committed ${COMMIT_DATE})"

if [[ $CURRENT_REV == "$REV" ]]; then
  echo "Already up to date."
  exit 0
fi

nix flake lock --override-input nixpkgs "github:NixOS/nixpkgs/${REV}"

echo "Done. flake.lock updated."
