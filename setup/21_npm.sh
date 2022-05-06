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
npm install -g commitizen

echo "# ======================================================================================="
echo "# npm update"
npm update

echo "# ======================================================================================="
echo "# npm upgrade"

npm upgrade

echo "# ======================================================================================="
echo "# npm list -g --depth=0"

npm list -g --depth=0
