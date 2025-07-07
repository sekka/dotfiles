#!/bin/bash
# anyenv and plugins setup script

brew install anyenv
anyenv install --init

# Create plugins directory with proper quoting
mkdir -p "$(anyenv root)/plugins"
git clone https://github.com/znz/anyenv-update.git "$(anyenv root)/plugins/anyenv-update"
git clone https://github.com/aereal/anyenv-exec.git "$(anyenv root)/plugins/anyenv-exec"
git clone https://github.com/znz/anyenv-git.git "$(anyenv root)/plugins/anyenv-git"
anyenv update
anyenv versions
