#!/bin/bash
# ==============================================================================
# AWS EC2 Automated Deployment Script for AI Based Smart Job Portal
# Supports Ubuntu 20.04 / 22.04 / 24.04 LTS
# ==============================================================================

set -e

echo "🚀 [1/6] Updating system and installing dependencies..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl git nginx build-essential

# Install Node.js 20.x
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo "⚙️ Installing PM2..."
    sudo npm install -g pm2
fi

echo "✅ Node version: $(node -v)"
echo "✅ NPM version: $(npm -v)"
echo "✅ PM2 version: $(pm2 -v)"

PROJECT_DIR=$(pwd)

# Setup Backend Server
echo "🚀 [2/6] Setting up Backend Server..."
cd "$PROJECT_DIR/server"

if [ ! -f .env ]; then
    echo "⚠️ .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "❗ IMPORTANT: Edit server/.env with your MongoDB Atlas URI, JWT Secret, and AWS S3 credentials!"
fi

npm ci --production

# Start / Restart with PM2
echo "🚀 [3/6] Starting Backend with PM2..."
pm2 start ecosystem.config.js --env production || pm2 restart ai-job-portal-api
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME || true

# Setup Frontend Client
echo "🚀 [4/6] Building Frontend React Client..."
cd "$PROJECT_DIR/client"
npm ci
npm run build

# Configure Nginx Reverse Proxy
echo "🚀 [5/6] Configuring Nginx..."
sudo rm -f /etc/nginx/sites-enabled/default

NGINX_CONF="/etc/nginx/sites-available/ai-job-portal"

sudo bash -c "cat > $NGINX_CONF" << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 20M;

    # Serve built frontend
    location / {
        root REPLACE_WITH_CLIENT_DIST;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API endpoints to Node server
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy WebSocket (Socket.io Real-Time Chat & Notifications)
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static file uploads
    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
    }
}
EOF

# Substitute actual client dist path
sudo sed -i "s|REPLACE_WITH_CLIENT_DIST|$PROJECT_DIR/client/dist|g" $NGINX_CONF

# Link site and test configuration
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "=============================================================================="
echo "🎉 [6/6] DEPLOYMENT COMPLETE!"
echo "Your AI Job Portal is live on your EC2 Public IP address on HTTP Port 80."
echo "Check backend status:   pm2 status"
echo "Check backend logs:     pm2 logs"
echo "Check Nginx status:     sudo systemctl status nginx"
echo "=============================================================================="
