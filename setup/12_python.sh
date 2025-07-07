#!/bin/bash
# Python and pyenv setup script

brew update
brew upgrade

anyenv install pyenv
#exec $SHELL -l
pyenv install -l

#pyenv install 3.7.4
pyenv install 2.7.18
#pyenv global 3.7.4
pyenv global 2.7.18

pyenv rehash
pyenv versions
python -V
which python
