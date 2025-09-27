# 🌐 Snappy E-commerce Hosting Setup Guide

## 🎯 What You Need to Host Your Application

Since you already have a **domain**, here are your hosting options and requirements:

## 🔧 Option 1: VPS/Cloud Server (Recommended for Full Control)

### A. Server Requirements:
- **RAM**: Minimum 2GB (4GB recommended)
- **CPU**: 2+ cores
- **Storage**: 20GB+ SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **Network**: Reliable internet connection

### B. Recommended Providers:
1. **DigitalOcean** ($10-20/month)
   - Simple droplet setup
   - Good documentation
   - Managed databases available

2. **Linode** ($10-20/month)
   - Great performance
   - Easy scaling

3. **AWS EC2** ($15-30/month)
   - Highly scalable
   - More complex setup

4. **Vultr** ($6-15/month)
   - Budget-friendly
   - Good performance

## 🚀 Option 2: Platform-as-a-Service (Easiest Setup)

### A. Railway (Recommended)
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and deploy
railway login
railway init
railway up
```
**Pros**: Easy setup, automatic scaling, built-in monitoring
**Cost**: $5-20/month

### B. Render
- Connect GitHub repo
- Auto-deploy on push
- Built-in SSL
**Cost**: $7-25/month

### C. Heroku
```bash
# 1. Install Heroku CLI
# 2. Deploy
heroku create snappy-ecommerce
git push heroku main
```
**Cost**: $7-25/month

## 📋 Step-by-Step Server Setup (VPS Option)

### 1. Server Initial Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Domain Configuration
```bash
# Point your domain to your server IP
# In your domain registrar (GoDaddy, Namecheap, etc.):
# A Record: @ → YOUR_SERVER_IP
# A Record: www → YOUR_SERVER_IP
```

### 3. Deploy Your Application
```bash
# Clone your repository
git clone https://github.com/Breadheadmo/Snappy.git
cd Snappy

# Install dependencies
cd server && npm install
cd ../client && npm install && npm run build

# Set up environment variables
cd ../server
cp .env.example .env
# Edit .env with your production values
```

### 4. Configure Nginx
```bash
# Copy your nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/snappy
sudo ln -s /etc/nginx/sites-available/snappy /etc/nginx/sites-enabled/

# Update domain in nginx config
sudo nano /etc/nginx/sites-available/snappy
# Replace "yourdomain.com" with your actual domain

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### 5. SSL Certificate (Free with Let's Encrypt)
```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal setup (already configured)
sudo systemctl status certbot.timer
```

### 6. Start Application with PM2
```bash
cd server

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'snappy-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔒 Security Checklist

### Before Going Live:
- [ ] **MongoDB Atlas User Created** (15 minutes)
  ```
  Username: snappy-prod-npcsgf
  Password: 352a585ee69c16664ac3eb22288544f2Wy7I9UXc5s8
  Database: Snappy-Production
  ```

- [ ] **Firewall Configuration**
  ```bash
  sudo ufw allow ssh
  sudo ufw allow 'Nginx Full'
  sudo ufw enable
  ```

- [ ] **SSL Certificate Installed**
- [ ] **Environment Variables Secured**
- [ ] **Database Backups Enabled**

## 💰 Cost Breakdown

### Monthly Hosting Costs:
- **VPS Server**: $10-30/month
- **Domain**: $10-15/year (you already have this)
- **MongoDB Atlas**: Free tier (sufficient for small-medium apps)
- **Email Service**: $0-20/month (SendGrid has free tier)
- **SSL Certificate**: Free (Let's Encrypt)

**Total Monthly Cost**: $10-50/month

## 🚀 Quick Deploy Options

### Fastest Option (5 minutes): Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway deploy
```

### Most Control (30 minutes): DigitalOcean Droplet
1. Create $10/month droplet
2. Follow server setup steps above
3. Point domain to droplet IP
4. Deploy application

### Budget Option (10 minutes): Render
1. Connect GitHub repo to Render
2. Add environment variables in dashboard
3. Deploy automatically

## 🛠️ Required Updates Before Deploy

### 1. Update nginx.conf with your domain:
```bash
# Replace in nginx.conf:
server_name yourdomain.com www.yourdomain.com;
# With your actual domain
```

### 2. Update environment variables:
```env
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

### 3. Complete MongoDB setup (15 minutes):
- Create MongoDB Atlas user
- Test database connection

## 📞 Next Steps

**Choose your hosting option:**

1. **Quick & Easy**: Railway/Render (recommended for beginners)
2. **Full Control**: VPS with your own server setup
3. **Enterprise**: AWS/Google Cloud with auto-scaling

**What's your preference?** I can help you with the specific setup steps once you choose!

---

*Your application is 95% ready - just choose hosting and complete MongoDB setup!*
