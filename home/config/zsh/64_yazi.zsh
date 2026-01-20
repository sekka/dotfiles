# ===========================================
# yazi - ターミナルファイルマネージャー
# ===========================================
# Rust製の高速ファイルマネージャー
# 画像・動画・PDF・アーカイブのプレビュー対応
#
# 使用方法:
#   y         - yaziを起動（終了時にディレクトリ移動）
#   yazi      - yaziを起動（終了時にディレクトリ移動なし）

if command -v yazi >/dev/null 2>&1; then
    # yazi終了時にカレントディレクトリを変更するラッパー関数
    function y() {
        local tmp
        tmp="$(mktemp -t "yazi-cwd.XXXXXX")"
        yazi "$@" --cwd-file="$tmp"
        if cwd="$(cat -- "$tmp")" && [[ -n "$cwd" ]] && [[ "$cwd" != "$PWD" ]]; then
            builtin cd -- "$cwd"
        fi
        rm -f -- "$tmp"
    }
fi
