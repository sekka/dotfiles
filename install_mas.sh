echo "\033[0;31m# ==========================================================\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# masでGUIツールをインストール\033[0;39m"
echo "\033[0;31m#\033[0;39m"
echo "\033[0;31m# ==========================================================\033[0;39m"

brew install mas

mas install 405580712 ## StuffIt Expander
mas install 409183694 ## Keynote
mas install 409201541 ## Pages
mas install 409203825 ## Numbers
mas install 414855915 ## WinArchiver Lite
mas install 434290957 ## Motion
mas install 443987910 ## 1Password
mas install 497799835 ## Xcode
mas install 498944723 ## JPEGmini
mas install 539883307 ## LINE
mas install 557168941 ## Tweetbot
mas install 587512244 ## Kaleidoscope
mas install 775737590 ## iA Writer
mas install 824171161 ## Affinity Designer
mas install 880001334 ## Reeder
mas install 1024640650 ## CotEditor
mas install 1263070803 ## Lungo

ln -s /Applications/CotEditor.app/Contents/SharedSupport/bin/cot /usr/local/bin/cot
