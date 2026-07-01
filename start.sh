cd /home/user1/tales-api
npm install
pm2 start ecosystem.json
pm2 save
pm2 startup systemd
sudo nginx -t && sudo systemctl reload nginx
