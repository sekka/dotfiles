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
        local tmp="$(mktemp -t "yazi-cwd.XXXXXX")"
        yazi "$@" --cwd-file="$tmp"
        local yazi_cwd="$(cat -- "$tmp" 2>/dev/null)"
        if [[ -n "$yazi_cwd" ]] && [[ "$yazi_cwd" != "$PWD" ]]; then
            builtin cd -- "$yazi_cwd"
        fi
        rm -f -- "$tmp"
    }
fi
