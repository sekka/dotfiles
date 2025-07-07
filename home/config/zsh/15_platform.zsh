# --------------------------------------
# Platform-specific Settings
# --------------------------------------

# OS別設定
case ${OSTYPE} in
    darwin*)
        # macOS用設定
        export CLICOLOR=1
        # Note: ls alias moved to main aliases.zsh with eza
        ;;
    linux*)
        # Linux用設定
        # 必要に応じて設定を追加
        ;;
    *)
        # その他のOS用設定
        ;;
esac
