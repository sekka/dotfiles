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

echo "\033[0;34m==ウェブ開発==\033[0;39m"
curl -L https://github.com/takaaki-kasai/git-foresta/raw/master/git-foresta -o /usr/local/bin/git-foresta && chmod 755 /usr/local/bin/git-foresta
curl https://sh.rustup.rs -sSf | sh                                         # Rust
curl -L firebase.tools | sh                                                 # Firebase

brew bundle

echo "\033[0;34m==Homebrewメンテナンス==\033[0;39m"
brew cleanup
brew doctor
brew cask cleanup
brew cask doctor
gibo -u
tmux source-file ~/.tmux.conf
ln -s /Applications/CotEditor.app/Contents/SharedSupport/bin/cot /usr/local/bin/cot

echo "\033[0;34m==npmインストール==\033[0;39m"
npm install -g npm
npm install -g caniuse-cmd
npm install -g npm-check
npm install -g npm-check-updates
npm install -g now
npm install -g fixpack
npm install -g gtop
npm install -g @vue/cli
npm install -g lighthouse
npm install -g git-diff-archive

echo "\033[0;34m==npmメンテナンス==\033[0;39m"
npm update
npm upgrade
npm list -g --depth=0

echo "\033[0;34m==Docker==\033[0;39m"
docker version
docker-machine version
docker-compose version
docker images
docker ps -a
