set -e
cd /home/user1/tales-api
rm -rf node_modules package-lock.json

# Write package.json
cat > package.json << 'JSONEOF'
{"name":"tales-api","version":"1.0.0","description":"API for Tales from the Дед","main":"server.js","scripts":{"start":"node server.js","dev":"node server.js"},"dependencies":{"express":"^4.21.0","cors":"^2.8.5"}}
JSONEOF

# Write server.js (base64 encoded to avoid heredoc issues)
node -e '
const fs = require("fs");
const src = fs.readFileSync("/home/user1/tales-api/server.js.new", "utf8");
fs.writeFileSync("/home/user1/tales-api/server.js", src);
'

# Install deps
npm install --production

# Create ecosystem.json
cat > ecosystem.json << 'PM2EOF'
{"apps":[{"name":"tales-api","script":"/home/user1/tales-api/server.js","instances":1,"exec_mode":"fork","env":{"NODE_ENV":"production","PORT":3000,"DATA_DIR":"/home/user1/tales-api/data"},"log_file":"/home/user1/tales-api/logs/combined.log","merge_logs":true,"max_memory_restart":"512M"}]}
PM2EOF

# Nginx config
sudo tee /etc/nginx/sites-available/tales-api > /dev/null << 'NGINXEOF'
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
NGINXEOF

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/tales-api /etc/nginx/sites-enabled/tales-api

mkdir -p /home/user1/tales-api/logs /home/user1/tales-api/data

# Stop any old process
pm2 delete tales-api 2>/dev/null || true
pm2 start ecosystem.json
pm2 save

sudo nginx -t && sudo systemctl restart nginx

echo "=== SERVER STARTED ==="
sleep 2
curl -s http://127.0.0.1:3000/api/health
