#!/usr/bin/env bash
# カレントディレクトリのgit状態を自動検出し、difitでブラウザ表示する
# cmux環境ではブラウザペインで、それ以外はシステムブラウザで開く
# Ref: https://gist.github.com/azu/cef84c98aeef832d43dfb640c7e321f5

CMUX_BIN=$(command -v cmux 2>/dev/null || echo /Applications/cmux.app/Contents/Resources/bin/cmux)
DIFIT_LOG=$(mktemp)
DIFIT_PID=""

cleanup() {
  [[ -n $DIFIT_PID ]] && kill "$DIFIT_PID" 2>/dev/null
  rm -f "$DIFIT_LOG"
}
trap cleanup EXIT INT TERM

# gitリポジトリかチェック
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Error: not a git repository: $(pwd)" >&2
  exit 1
fi

# デフォルトブランチ（main/master）を検出
default_branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||')
if [[ -z $default_branch ]]; then
  default_branch=$(git branch --list main master | head -1 | tr -d ' *')
fi
if [[ -z $default_branch ]]; then
  default_branch="main"
fi

current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

# difitの引数を決定
difitArgs=()
if [[ $current_branch == "$default_branch" ]] || [[ -z $current_branch ]]; then
  difitArgs=("working")
elif git merge-base --is-ancestor "$default_branch" HEAD 2>/dev/null; then
  merge_base=$(git merge-base "$default_branch" HEAD 2>/dev/null)
  difitArgs=("$merge_base" "HEAD")
else
  difitArgs=("working")
fi

echo "difit-here: branch=${current_branch}, args=${difitArgs[*]}"

# difitサーバーを起動（ログから実際のURLを取得）
# working の場合のみ --include-untracked を付与
difitExtraArgs=()
[[ ${difitArgs[0]} == "working" ]] && difitExtraArgs+=("--include-untracked")
difit "${difitArgs[@]}" --no-open "${difitExtraArgs[@]}" >"$DIFIT_LOG" 2>&1 &
DIFIT_PID=$!

# 実際のURLをログから取得（最大6秒）
DIFIT_URL=""
for _ in $(seq 1 20); do
  kill -0 "$DIFIT_PID" 2>/dev/null || break
  DIFIT_URL=$(grep -o 'http://localhost:[0-9]*' "$DIFIT_LOG" | head -1)
  [[ -n $DIFIT_URL ]] && break
  sleep 0.3
done

if [[ -z $DIFIT_URL ]]; then
  echo "Error: difit failed to start" >&2
  cat "$DIFIT_LOG" >&2
  exit 1
fi

echo "difit-here: server at ${DIFIT_URL}"

# cmux が使える場合はブラウザペインで、それ以外はシステムブラウザで開く
if [[ -x $CMUX_BIN ]] && "$CMUX_BIN" ping >/dev/null 2>&1; then
  "$CMUX_BIN" new-pane --type browser --url "${DIFIT_URL}/" 2>/dev/null || open "${DIFIT_URL}/"
else
  open "${DIFIT_URL}/"
fi

# difitプロセスが終了するまで待機
wait "$DIFIT_PID" 2>/dev/null
DIFIT_PID=""
