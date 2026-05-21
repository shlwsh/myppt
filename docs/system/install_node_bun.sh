#!/bin/bash
# Script to install Node.js 22 (LTS), npm, Bun, and NVM on Ubuntu 24.04
set -e

PASSWORD="091122"

echo "=== Node.js, npm, Bun, and NVM Installation Script ==="

# 1. Install prerequisites
echo "--> Installing prerequisites (curl, ca-certificates, gnupg, unzip)..."
echo "$PASSWORD" | sudo -S apt-get update
echo "$PASSWORD" | sudo -S apt-get install -y curl ca-certificates gnupg unzip

# 2. Add NodeSource repository for Node.js 22.x
echo "--> Downloading NodeSource repository setup script..."
curl -fsSL https://deb.nodesource.com/setup_22.x -o /home/smz/docs-zh/nodesource_setup.sh

echo "--> Running NodeSource repository setup script..."
echo "$PASSWORD" | sudo -S bash /home/smz/docs-zh/nodesource_setup.sh
rm -f /home/smz/docs-zh/nodesource_setup.sh

# 3. Install Node.js
echo "--> Installing Node.js and npm..."
echo "$PASSWORD" | sudo -S apt-get install -y nodejs

# 4. Install NVM v0.40.4
echo "--> Installing NVM v0.40.4..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash

# 5. Install Bun
echo "--> Installing Bun..."
curl -fsSL https://bun.sh/install | bash

# 6. Export paths for verification in the current process
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 7. Verify installation
echo "=== Verification ==="
node_ver=$(node -v)
npm_ver=$(npm -v)
nvm_ver=$(nvm --version)
bun_ver=$(bun --version)

echo "Installed Node.js version: $node_ver"
echo "Installed npm version: $npm_ver"
echo "Installed NVM version: $nvm_ver"
echo "Installed Bun version: $bun_ver"

echo "=== Node.js, npm, Bun, and NVM Installation Completed Successfully! ==="
