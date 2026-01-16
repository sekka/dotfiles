# ===========================================
# Tmux 自動起動
# ===========================================

# ログインシェルで tmuximum を起動し、セッション管理を行う
# tmuximum: セッション選択・作成・アタッチを対話的に実行
if [[ -o login ]]; then
    # tmux未実行 & 対話シェル & 非SSH接続時のみ起動
    if [[ -z "$TMUX" ]] && [[ -n "$PS1" ]] && [[ -z "$SSH_CONNECTION" ]]; then
        command -v tmuximum >/dev/null 2>&1 && tmuximum
    fi
fi
