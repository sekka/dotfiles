#!/bin/bash
# Global npm packages setup script

#npm install -g npm

echo "# ======================================================================================="
echo "# npm update"
npm update

echo "# ======================================================================================="
echo "# npm upgrade"

npm upgrade

echo "# ======================================================================================="
echo "# npm list -g --depth=0"

npm list -g --depth=0
