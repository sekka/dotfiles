brew update
brew upgrade

anyenv install nodenv
#exec $SHELL -l
nodenv install -l

nodenv install 14.15.3
nodenv global 14.15.3
nodenv rehash
nodenv versions
node -v
which node
