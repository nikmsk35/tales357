#!/bin/bash
set -e

LOG_FILE="/home/user1/setup.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== $(date) VPS SETUP STARTED ==="

# STEP 1: CLEANUP
echo "--- Cleaning up old project ---"
rm -rf /home/user1/.cloudflared /home/user1/.cache/*
rm -rf /home/user1/vostokzdrav* /home/user1/oldproject* /home/user1/app*

echo "--- Updating system ---"
sudo apt-get update -qq

# STEP 2: NODE.JS 20
echo "--- Installing Node.js 20 ---"
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" != "20" ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > /dev/null 2>&1
    sudo apt-get install -y -qq nodejs > /dev/null 2>&1
fi
echo "Node: $(node --version)"
echo "NPM: $(npm --version)"

# STEP 3: NGINX, CERTBOT, SQLITE
echo "--- Installing Nginx, Certbot, SQLite ---"
sudo apt-get install -y -qq nginx certbot python3-certbot-nginx sqlite3 > /dev/null 2>&1
echo "Nginx: $(nginx -v 2>&1)"
echo "Certbot: $(certbot --version 2>&1)"

# STEP 4: PM2
echo "--- Installing PM2 ---"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2 > /dev/null 2>&1
fi
echo "PM2: $(pm2 --version)"

# STEP 5: FIREWALL
echo "--- Configuring firewall ---"
sudo ufw allow 22/tcp > /dev/null 2>&1
sudo ufw allow 80/tcp > /dev/null 2>&1
sudo ufw allow 443/tcp > /dev/null 2>&1
sudo ufw --force enable > /dev/null 2>&1
sudo ufw status

# STEP 6: PROJECT DIRECTORY
echo "--- Creating project directory ---"
mkdir -p /home/user1/tales-api
cd /home/user1/tales-api

# STEP 7: INIT NODE PROJECT
cat > package.json << 'PKGEOF'
{
  "name": "tales-api",
  "version": "1.0.0",
  "description": "API for Tales from the Дед",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.21.0",
    "cors": "^2.8.5",
    "better-sqlite3": "^11.5.0",
    "uuid": "^9.0.0"
  }
}
PKGEOF

# Install dependencies
npm install > /dev/null 2>&1
echo "Dependencies installed"

echo "=== $(date) SETUP COMPLETE ==="
