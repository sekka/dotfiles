#!/bin/bash
# Homebrewパッケージ管理スクリプト
# Brewfileを使用してパッケージのインストール・更新・クリーンアップを実行します

brew --version                                # Homebrewのバージョンを表示
brew bundle --file="$(dirname "$0")/Brewfile" # brew bundle --file=setup/Brewfile
brew outdated                                 # 古くなったパッケージを表示
brew update                                   # Homebrewとパッケージ情報を最新に更新
brew upgrade                                  # インストールされているパッケージを最新にアップグレード
brew upgrade --cask --greedy                  # インストールされているCaskパッケージを最新にアップグレード
brew cleanup                                  # 不要なファイルを削除してディスクスペースを解放
brew doctor                                   # Homebrewの診断を実行して問題を検出
brew autoremove                               # 依存関係がなくなったパッケージを自動的に削除
