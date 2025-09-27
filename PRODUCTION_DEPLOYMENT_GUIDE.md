# 🚀 Snappy E-commerce Production Deployment Guide
# =================================================

## 📋 Overview

This comprehensive guide will walk you through deploying Snappy E-commerce to production with proper security, monitoring, and scalability.

---

## 🎯 Prerequisites

Before starting, ensure you have:

- [ ] **Domain name** purchased and DNS configured
- [ ] **VPS/Cloud server** (minimum 4GB RAM, 2 CPU cores)
- [ ] **MongoDB Atlas account** or self-hosted MongoDB
- [ ] **Paystack business account** verified for live payments
- [ ] **Email service** configured (Gmail, SendGrid, etc.)
- [ ] **Basic Linux knowledge**

---

## 🛠️ Environment Variables Configuration

### 🔧 Server Environment Variables (`.env.production`)

Create and configure your server environment file:

```bash
# Copy the template
cp server/.env.example server/.env.production

# Edit with your production values
nano server/.env.production
```

**Required Variables:**

```bash
# 🌐 Application Configuration
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://yourdomain.com
API_BASE_URL=https://yourdomain.com/api

# 🗄️ MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/snappy-ecommerce?retryWrites=true&w=majority

# 🔐 Security
JWT_SECRET=your-super-secure-jwt-secret-minimum-64-characters-long
JWT_EXPIRE=30d
BCRYPT_SALT_ROUNDS=12

# 💳 Paystack (LIVE KEYS - Only after business verification!)
PAYSTACK_SECRET_KEY=sk_live_your_actual_live_key
PAYSTACK_PUBLIC_KEY=pk_live_your_actual_live_key  
PAYSTACK_WEBHOOK_SECRET=whsec_your_webhook_secret

# 📧 Email Configuration
EMAIL_FROM=noreply@yourdomain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# 🏪 Business Information
BUSINESS_NAME=Your Business Name
BUSINESS_EMAIL=support@yourdomain.com
BUSINESS_PHONE=+27-xxx-xxx-xxxx
```

### 🖥️ Client Environment Variables (`.env.production`)

```bash
# 🌐 API Configuration
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_BASE_URL=https://yourdomain.com

# 💳 Paystack Public Key (Safe for client)
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key

# 🏪 Business Configuration
REACT_APP_BUSINESS_NAME=Your Business Name
REACT_APP_CURRENCY_SYMBOL=R
REACT_APP_CURRENCY_CODE=ZAR
```

---

## 🖥️ Server Setup

### Step 1: Initial Server Setup

```bash
# Run the server setup script
chmod +x scripts/server-setup.sh
./scripts/server-setup.sh
```

### Step 2: Clone Repository

```bash
# Switch to the application user
sudo su - snappy

# Clone your repository
git clone https://github.com/yourusername/snappy-ecommerce.git
cd snappy-ecommerce

# Set proper permissions
chmod +x scripts/*.sh
```

### Step 3: Configure Environment

```bash
# Copy and edit environment files
cp server/.env.production.template server/.env.production
cp client/.env.production.template client/.env.production

# Edit with your actual values
nano server/.env.production
nano client/.env.production

# Create additional environment file for Docker Compose
nano .env.production
```

**Docker Compose Environment (`.env.production`):**

```bash
# Domain Configuration
DOMAIN_NAME=yourdomain.com
SSL_EMAIL=admin@yourdomain.com

# Database Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-root-password
MONGO_USER_PASSWORD=your-secure-user-password

# Redis Configuration
REDIS_PASSWORD=your-secure-redis-password

# Security
JWT_SECRET=your-super-secure-jwt-secret

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_live_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key
PAYSTACK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Monitoring
GRAFANA_ADMIN_PASSWORD=your-grafana-password

# Backup Configuration (Optional)
BACKUP_S3_BUCKET=your-backup-bucket
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
```

---

## 🗄️ Database Setup

Choose one option:

### Option A: MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Cluster:**
   - Follow the [MongoDB Production Setup Guide](./MONGODB_PRODUCTION_SETUP.md)
   - Use M10+ tier for production
   - Configure security and backups

2. **Update Connection String:**
   ```bash
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/snappy-ecommerce
   ```

### Option B: Self-Hosted MongoDB

1. **Install MongoDB:**
   ```bash
   # Already included in server-setup.sh
   # Or follow manual installation in MONGODB_PRODUCTION_SETUP.md
   ```

2. **Configure MongoDB:**
   ```bash
   # Edit MongoDB configuration
   sudo nano /etc/mongod.conf
   sudo systemctl restart mongod
   ```

---

## 💳 Payment Setup

### Step 1: Paystack Business Verification

1. **Complete Business Verification:**
   - Upload business documents
   - Verify bank account
   - Wait for approval (1-3 business days)

2. **Get Live API Keys:**
   - Switch to Live mode in Paystack dashboard
   - Copy Live Secret Key (`sk_live_...`)
   - Copy Live Public Key (`pk_live_...`)

3. **Configure Webhooks:**
   - URL: `https://yourdomain.com/api/payments/webhook`
   - Events: `charge.success`, `charge.failed`
   - Copy webhook secret

### Step 2: Update Environment Variables

```bash
# Update with live keys
PAYSTACK_SECRET_KEY=sk_live_your_actual_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_actual_public_key
PAYSTACK_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
```

**⚠️ IMPORTANT:** Never use test keys in production!

---

## 🚀 Deployment Process

### Step 1: Initial Deployment

```bash
# Make sure you're in the project directory
cd /home/snappy/snappy-ecommerce

# Run the deployment script
./scripts/deploy.sh
```

The deployment script will:
- ✅ Check prerequisites
- ✅ Create necessary directories  
- ✅ Build Docker images
- ✅ Set up SSL certificates
- ✅ Start all services
- ✅ Run health checks

### Step 2: DNS Configuration

**Update your domain's DNS records:**

```
Type    Name    Value               TTL
A       @       YOUR_SERVER_IP      300
A       www     YOUR_SERVER_IP      300
```

### Step 3: Verify Deployment

```bash
# Check if all services are running
docker-compose -f docker-compose.production.yml ps

# Check application health
curl -f https://yourdomain.com/health
curl -f https://yourdomain.com/api/health
```

---

## 🔒 SSL Certificate Setup

### Automatic Setup (Included in deploy.sh)

The deployment script automatically:
1. Requests SSL certificate from Let's Encrypt
2. Configures nginx with SSL
3. Sets up automatic renewal

### Manual SSL Setup (if needed)

```bash
# Request certificate manually
docker-compose -f docker-compose.production.yml run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  --email admin@yourdomain.com --agree-tos --no-eff-email \
  -d yourdomain.com -d www.yourdomain.com

# Restart nginx
docker-compose -f docker-compose.production.yml restart nginx
```

### SSL Renewal

Automatic renewal is set up via cron job:
```bash
# Check renewal status
./scripts/renew-ssl.sh --test

# Force renewal
./scripts/renew-ssl.sh --force
```

---

## 📊 Monitoring Setup

### Access Monitoring Dashboards

- **Grafana:** `http://yourdomain.com:3000`
  - Username: `admin`
  - Password: `your-grafana-password`

- **Prometheus:** `http://yourdomain.com:9090`

### Set Up Alerts

1. **Configure Grafana Alerts:**
   - CPU usage > 80%
   - Memory usage > 85%
   - Disk space < 20%
   - API response time > 2s

2. **Set Up Notification Channels:**
   - Email notifications
   - Slack/Discord webhooks

---

## 🔄 Backup Configuration

### Automatic Database Backups

```bash
# Backup script is included in Docker Compose
# Runs daily at 2 AM

# Manual backup
docker-compose -f docker-compose.production.yml exec mongodb mongodump --archive > backup.archive

# Restore from backup
docker-compose -f docker-compose.production.yml exec -T mongodb mongorestore --archive < backup.archive
```

### File Backups

```bash
# Backup uploaded files
tar -czf uploads-backup.tar.gz server/uploads/

# Backup environment files (store securely!)
tar -czf config-backup.tar.gz server/.env.production client/.env.production
```

---

## 🚨 Security Checklist

### Server Security
- [ ] Firewall configured (UFW)
- [ ] SSH key authentication enabled
- [ ] Root login disabled
- [ ] Regular security updates enabled
- [ ] Fail2ban installed (optional)

### Application Security
- [ ] Strong JWT secret (64+ characters)
- [ ] Secure database passwords
- [ ] HTTPS enforced (SSL certificates)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers configured

### Database Security
- [ ] Authentication enabled
- [ ] Strong database passwords
- [ ] Network access restricted
- [ ] Regular backups configured
- [ ] Encryption at rest enabled

### Payment Security
- [ ] Live Paystack keys only
- [ ] Webhook signature verification
- [ ] PCI compliance guidelines followed
- [ ] Transaction logging enabled

---

## 📈 Performance Optimization

### Server Optimization

```bash
# Optimize Docker containers
docker system prune -a

# Monitor resource usage
htop
docker stats

# Optimize nginx
# Already included in nginx configuration
```

### Database Optimization

```javascript
// Create indexes for better performance
// Run in MongoDB shell or Compass

use snappy-ecommerce

// User indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })

// Product indexes
db.products.createIndex({ name: "text", description: "text" })
db.products.createIndex({ category: 1, inStock: 1 })
db.products.createIndex({ price: 1 })

// Order indexes
db.orders.createIndex({ user: 1, createdAt: -1 })
db.orders.createIndex({ orderStatus: 1 })
```

---

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Use the update script
./scripts/update.sh

# Or manual update
git pull origin main
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

### Regular Maintenance Tasks

```bash
# Weekly tasks
- Check server resources
- Review application logs
- Update system packages
- Verify backup integrity

# Monthly tasks  
- Review security logs
- Update dependencies
- Performance optimization
- Cost analysis
```

---

## 🆘 Troubleshooting

### Common Issues

#### Services Not Starting
```bash
# Check Docker logs
docker-compose -f docker-compose.production.yml logs

# Check specific service
docker-compose -f docker-compose.production.yml logs backend
```

#### SSL Certificate Issues
```bash
# Check certificate status
./scripts/renew-ssl.sh --test

# Manual certificate request
docker-compose -f docker-compose.production.yml run --rm certbot
```

#### Database Connection Issues
```bash
# Check MongoDB connection
docker-compose -f docker-compose.production.yml exec backend node -e "require('./config/database')().then(() => console.log('Connected')).catch(console.error)"

# Check MongoDB logs
docker-compose -f docker-compose.production.yml logs mongodb
```

#### Payment Integration Issues
```bash
# Check Paystack webhook
curl -X POST https://yourdomain.com/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{"event": "charge.success"}'

# Check environment variables
docker-compose -f docker-compose.production.yml exec backend env | grep PAYSTACK
```

---

## 📞 Support and Resources

### Documentation
- [MongoDB Production Setup](./MONGODB_PRODUCTION_SETUP.md)
- [Paystack Production Setup](./PAYSTACK_PRODUCTION_SETUP.md)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)

### Support Channels
- **Paystack Support:** support@paystack.com
- **MongoDB Atlas Support:** Via Atlas dashboard
- **DigitalOcean Support:** Via control panel
- **Let's Encrypt Community:** https://community.letsencrypt.org/

---

## ✅ Final Checklist

Before going live, verify:

### Technical Checklist
- [ ] All services running and healthy
- [ ] SSL certificate installed and working
- [ ] Database connected and secured
- [ ] Payment integration tested with small amount
- [ ] Email notifications working
- [ ] Backup system configured and tested
- [ ] Monitoring dashboards accessible
- [ ] Performance optimization applied

### Business Checklist
- [ ] Domain name configured
- [ ] Business information updated
- [ ] Payment methods tested
- [ ] Customer support contact details updated
- [ ] Privacy policy and terms of service updated
- [ ] Analytics tracking configured
- [ ] Social media links updated

### Security Checklist
- [ ] All default passwords changed
- [ ] Environment variables secured
- [ ] Server hardening completed
- [ ] SSL enforced on all endpoints
- [ ] Rate limiting configured
- [ ] Security headers enabled

---

## 🎉 Congratulations!

Your Snappy E-commerce application is now deployed to production! 

**Your application is available at:**
- Frontend: `https://yourdomain.com`
- API: `https://yourdomain.com/api`
- Admin: `https://yourdomain.com/admin`

**Next steps:**
1. Test all functionality thoroughly
2. Set up monitoring alerts
3. Configure backup notifications
4. Plan for scaling as your business grows

Good luck with your e-commerce business! 🚀
