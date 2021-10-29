brew update
brew upgrade

anyenv install nodenv
#exec $SHELL -l
nodenv install -l

nodenv install 16.12.0
nodenv global 16.12.0
nodenv rehash
nodenv versions
node -v
which node
