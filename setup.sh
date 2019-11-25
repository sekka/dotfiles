echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# CUIツールをインストール\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

curl -L https://github.com/takaaki-kasai/git-foresta/raw/master/git-foresta -o /usr/local/bin/git-foresta && chmod 755 /usr/local/bin/git-foresta


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# HomebrewでCUIツールをインストール\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

echo "\033[0;34m==Homebrewをアップデート＆アップグレード==\033[0;39m"
brew update
brew upgrade

echo "\033[0;34m==anyenv==\033[0;39m"
brew install anyenv
#anyenv init
anyenv install --init
anyenv install nodenv
anyenv install pyenv
anyenv version

mkdir -p $(anyenv root)/plugins
git clone https://github.com/znz/anyenv-update.git $(anyenv root)/plugins/anyenv-update
git clone https://github.com/aereal/anyenv-exec.git $(anyenv root)/plugins/anyenv-exec
git clone https://github.com/znz/anyenv-git.git $(anyenv root)/plugins/anyenv-git
anyenv update

nodenv install 12.10.0
nodenv global 12.10.0
nodenv rehash
node -v
which node

pyenv install 3.7.4
pyenv global 3.7.4
python -V
which python

echo "\033[0;34m==OS==\033[0;39m"
brew install m-cli              # https://formulae.brew.sh/formula/m-cli    # Mac便利ツール
brew install mas                # https://formulae.brew.sh/formula/mas      # Mac App Store操作用ツール

echo "\033[0;34m==ターミナル==\033[0;39m"
brew install zsh                # https://formulae.brew.sh/formula/zsh      #
brew install tmux               # https://formulae.brew.sh/formula/tmux     #
brew install reattach-to-user-namespace # https://formulae.brew.sh/formula/reattach-to-user-namespace # tmux便利ツール
brew install zplug              # https://formulae.brew.sh/formula/zplug    # ターミナル用プラグイン管理
brew install peco               # https://formulae.brew.sh/formula/peco     # インクリメンタルサーチ
brew install fzf                # https://formulae.brew.sh/formula/fzf      # ファジー検索
brew install fpp                # https://formulae.brew.sh/formula/fpp      # パスピッカー
brew install ag                 # https://formulae.brew.sh/formula/the_silver_searcher      # 超すごいgrep
brew install pt                 # https://formulae.brew.sh/formula/the_platinum_searcher    # 超すごいgrep
brew install htop               # https://formulae.brew.sh/formula/htop     # プロセスビューワ
brew install vim                # https://formulae.brew.sh/formula/vim      #
brew install tree               # https://formulae.brew.sh/formula/tree     # ディレクトリツリー表示
brew install pstree             # https://formulae.brew.sh/formula/pstree   # psをツリーで表示
brew install emojify            # https://formulae.brew.sh/formula/emojify  # 絵文字
brew install youtube-dl         # https://formulae.brew.sh/formula/youtube-dl   # YouTube動画DLツール
brew install Code-Hex/pget/pget # https://github.com/Code-Hex/pget          # 高速DLツール
brew install knqyf263/pet/pet   # https://github.com/knqyf263/pet           # スニペットマネージャ
brew install homebrew/cask-fonts/font-meslo-for-powerline

echo "\033[0;34m==ウェブ開発==\033[0;39m"
brew install direnv             # https://formulae.brew.sh/formula/direnv   #
brew install devd               # https://formulae.brew.sh/formula/devd     # ローカルサーバ
brew install git                # https://formulae.brew.sh/formula/git      # git
brew install hub                # https://formulae.brew.sh/formula/hub      # GitHubサポートツール
brew install ghq                # https://formulae.brew.sh/formula/ghq      # git clone便利ツール
brew install tig                # https://formulae.brew.sh/formula/tig      # gitクライアント
brew install gibo               # https://formulae.brew.sh/formula/gibo     # gitignoreボイラープレート
brew install ctop               # https://formulae.brew.sh/formula/ctop     # dockerコンテナメトリクスビューワ
brew tap moncho/dry             # https://moncho.github.io/dry/             # dockerマネージャ
brew install dry
brew install jq                 # https://formulae.brew.sh/formula/jq       # json便利ツール
brew install mycli              # https://formulae.brew.sh/formula/mycli    # MySQL便利ツール
brew install wget               # https://formulae.brew.sh/formula/wget     # DLツール
brew install httpie             # https://formulae.brew.sh/formula/httpie   # 高機能cURL
brew install httpstat           # https://formulae.brew.sh/formula/httpstat # cURLの統計情報表示
brew install speedtest_cli      # https://github.com/sivel/speedtest-cli    # スピードテストツール

echo "\033[0;34m==Python==\033[0;39m"
brew install pipenv             # https://formulae.brew.sh/formula/pipenv   # Pythonマネージャ

echo "\033[0;34m==画像処理==\033[0;39m"
brew install ImageMagick        # https://formulae.brew.sh/formula/ImageMagick #
brew install webp               # https://formulae.brew.sh/formula/webp     #
# brew install --use-clang --HEAD ffmpeg --with-faac --with-fdk-aac --with-ffplay --with-fontconfig --with-freetype --with-frei0r --with-libass --with-libbluray --with-libcaca --with-libquvi --with-libsoxr --with-libvidstab --with-libvorbis --with-libvpx --with-opencore-amr --with-openjpeg --with-openssl --with-opus --with-rtmpdump --with-speex --with-theora --with-tools --with-x265 --enable-libx264 --enable-gpl --enable-libxvid --enable-shared

echo "\033[0;34m==aws==\033[0;39m"
# brew tap aws/tap
# brew install awscli
# brew install aws-sam-cli


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# npmで色々インストール\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

echo "\033[0;34m==インストール==\033[0;39m"
npm install -g npm
npm install -g caniuse-cmd
npm install -g npm-check
npm install -g npm-check-updates
npm install -g fixpack
npm install -g gtop
npm install -g @vue/cli
npm install -g lighthouse

echo "\033[0;34m==メンテナンス==\033[0;39m"
npm update
npm upgrade
npm list -g --depth=0


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# Dockerを導入する\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

# docker version
# docker-machine version
# docker-compose version
# docker images
# docker ps -a


echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# Homebrewをメンテナンス\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

brew cleanup
brew doctor
gibo -u
tmux source-file ~/.tmux.conf

