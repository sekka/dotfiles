#!/usr/bin/env bash
# --------------------------------------
# git-diff-archive
# --------------------------------------
# 指定したコミット間の差分ファイルをzipアーカイブとして出力する
#
# Usage:
#   git-diff-archive              # 最新コミットの変更をアーカイブ
#   git-diff-archive 3            # 直近3コミットの変更をアーカイブ
#   git-diff-archive abc123       # abc123からHEADまでの変更をアーカイブ
#   git-diff-archive HEAD abc123  # abc123からHEADまでの変更をアーカイブ

set -euo pipefail

main() {
    local head_ref="HEAD"
    local files=()

    if [[ $# -eq 1 ]]; then
        # 数値の場合はHEAD~Nとして扱う
        if [[ "$1" =~ ^[0-9]+$ ]]; then
            mapfile -t files < <(git diff --diff-filter=d --name-only "HEAD~${1}" HEAD)
        else
            mapfile -t files < <(git diff --diff-filter=d --name-only "$1" HEAD)
        fi
    elif [[ $# -eq 2 ]]; then
        head_ref="$1"
        mapfile -t files < <(git diff --diff-filter=d --name-only "$2" "$1")
    else
        # 引数なしの場合は直近1コミット
        mapfile -t files < <(git diff --diff-filter=d --name-only HEAD~1 HEAD)
    fi

    if [[ ${#files[@]} -gt 0 ]]; then
        git archive --format=zip --prefix=root/ "$head_ref" "${files[@]}" -o archive.zip
        echo "Created archive.zip with ${#files[@]} files"
    else
        echo "No files to archive"
        return 1
    fi
}

main "$@"
