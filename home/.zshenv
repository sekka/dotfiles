# ===========================================
# .zshenv - すべての zsh 起動時に読み込まれる環境設定
# ===========================================
# このファイルは ALL zsh セッション（対話/非対話/スクリプト）で必ず読み込まれる
# 必須の環境変数のみをここに配置すること

# PATH 管理用のヘルパー関数を読み込み（軽量）
source "$HOME/dotfiles/home/config/zsh/00_environment.zsh"

# PATH 管理は config/zsh/00_environment.zsh に集約

# ===========================================
# macOS の path_helper による PATH 順序変更を防止
# ===========================================
# macOS では /etc/zprofile で /usr/libexec/path_helper が実行され、
# 独自に設定した PATH の順序が変更されてしまう問題がある。
# GLOBAL_RCS を無効にすることで、/etc/zprofile などのグローバル設定ファイルの
# 読み込みをスキップし、PATH 順序を保持する。
# refs. https://github.com/Homebrew/homebrew-core/pull/32074#issuecomment-421381869
# refs. https://this.aereal.org/entry/zsh-path-helper
unsetopt GLOBAL_RCS

# ===========================================
# Homebrew 環境変数設定（複数ファイルで使用）
# ===========================================
if [[ -x "/opt/homebrew/bin/brew" ]]; then
    # Apple Silicon Mac
    export HOMEBREW_PREFIX="/opt/homebrew"
    export HOMEBREW_CELLAR="/opt/homebrew/Cellar"
    export HOMEBREW_REPOSITORY="/opt/homebrew"
elif [[ -x "/usr/local/bin/brew" ]]; then
    # Intel Mac
    export HOMEBREW_PREFIX="/usr/local"
    export HOMEBREW_CELLAR="/usr/local/Cellar"
    export HOMEBREW_REPOSITORY="/usr/local/Homebrew"
fi

# Homebrew で誤ってインストールしてはいけないパッケージを指定
# これらは mise などのバージョン管理ツールで管理
export HOMEBREW_FORBIDDEN_FORMULAE="node python python3 pip npm pnpm yarn"

# 言語固有のパス設定は config/zsh/00_environment.zsh で管理

# 注意: 重い処理（direnv、cargo）は .zprofile に移動済み
# ログインシェルでのみ実行され、スクリプト実行のたびには実行されない
