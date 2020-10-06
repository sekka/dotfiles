brew update
brew upgrade

anyenv install nodenv
#exec $SHELL -l
nodenv install -l

nodenv install 12.10.0
nodenv global 12.10.0
nodenv rehash
nodenv versions
node -v
which node
