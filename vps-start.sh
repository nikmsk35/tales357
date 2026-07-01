#!/bin/bash
set -e
cd /home/user1/tales-api
mkdir -p logs

# ecosystem.json
cat > ecosystem.json << 'EOF'
{"apps":[{"name":"tales-api","script":"/home/user1/tales-api/server.js","instances":1,"exec_mode":"fork","env":{"NODE_ENV":"production","PORT":3000,"DB_PATH":"/home/user1/tales-api/data.db"},"log_file":"/home/user1/tales-api/logs/combined.log","merge_logs":true,"max_memory_restart":"512M"}]}
EOF

# nginx config
sudo tee /etc/nginx/sites-available/tales-api > /dev/null << 'EOF'
server {
    listen 80;
    server_name 176.123.162.249;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Access-Control-Allow-Origin "https://nikmsk35.github.io" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
    location /api/health { access_log off; proxy_pass http://127.0.0.1:3000/api/health; }
}
EOF

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/tales-api /etc/nginx/sites-enabled/tales-api

# Install deps
npm install

# Start with PM2
pm2 start ecosystem.json
pm2 save

# Restart nginx
sudo nginx -t && sudo systemctl restart nginx

echo "=== SERVER STARTED ==="
curl -s http://127.0.0.1:3000/api/health
