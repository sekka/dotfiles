#!/bin/bash
# setup ランナー: 全セットアップを番号順に実行

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

usage() {
  echo "使用方法:"
  echo "  $0             # 全ステップを番号順に実行"
  echo "  $0 02 05 06    # 指定ステップのみ（番号順で実行）"
  echo "  $0 --list      # 利用可能なステップを一覧表示"
}

# 利用可能なスクリプトを収集（setup.sh 自身を除く）
collect_scripts() {
  find "$SCRIPT_DIR" -maxdepth 1 -name '0[0-9]_*.sh' | sort
}

list_scripts() {
  echo "利用可能なセットアップステップ:"
  while IFS= read -r script; do
    num=$(basename "$script" | grep -o '^[0-9]*')
    name=$(basename "$script" .sh)
    desc=$(head -2 "$script" | tail -1 | sed 's/^# //')
    printf "  %s  %-20s  %s\n" "$num" "$name" "$desc"
  done < <(collect_scripts)
}

# 引数処理
if [[ ${1:-} == "--help" ]] || [[ ${1:-} == "-h" ]]; then
  usage
  exit 0
fi

if [[ ${1:-} == "--list" ]]; then
  list_scripts
  exit 0
fi

# 実行対象スクリプトを決定
if [[ $# -gt 0 ]]; then
  # 指定番号を昇順ソートして実行
  target_scripts=()
  for num in $(printf '%s\n' "$@" | sort -n); do
    # ゼロパディング対応（2 → 02）
    padded=$(printf '%02d' "$num")
    match=$(find "$SCRIPT_DIR" -maxdepth 1 -name "${padded}_*.sh" | head -1)
    if [[ -z $match ]]; then
      echo "[ERROR] ステップが見つかりません: $num" >&2
      exit 1
    fi
    target_scripts+=("$match")
  done
else
  # 全スクリプトを実行
  while IFS= read -r script; do
    target_scripts+=("$script")
  done < <(collect_scripts)
fi

# 実行
for script in "${target_scripts[@]}"; do
  echo ""
  if ! /bin/bash "$script"; then
    echo ""
    echo "[ERROR] ステップが失敗しました: $(basename "$script")" >&2
    exit 1
  fi

  # Nix セットアップ後、Nix 管理バイナリを以降のステップで使えるようにする
  if [[ $(basename "$script") == 03_* ]] && [[ -d /run/current-system/sw/bin ]]; then
    export PATH="/run/current-system/sw/bin:$PATH"
  fi
done

echo ""
echo "===== 全ステップ完了 ====="
