# 🗄️ MongoDB Production Setup Guide for Snappy E-commerce
# ==========================================================

## 📋 Overview

This guide will help you set up MongoDB for production use with Snappy E-commerce. You have two main options:

1. **MongoDB Atlas (Recommended)** - Fully managed cloud database
2. **Self-hosted MongoDB** - On your own server

---

## 🌐 Option 1: MongoDB Atlas (Recommended)

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Verify your email address

### Step 2: Create a Cluster

1. **Click "Create a Cluster"**
2. **Choose Cloud Provider & Region:**
   - Provider: AWS, Google Cloud, or Azure
   - Region: Choose closest to your server (for South Africa: Europe West or Middle East)
   - Tier: M10 or higher for production (M0 free tier not recommended for production)

3. **Cluster Name:** `snappy-production`

4. **Click "Create Cluster"** (takes 7-15 minutes)

### Step 3: Configure Security

#### Database User
1. Go to **Database Access** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `snappy-prod-user`
5. Password: Generate a strong password (save it securely!)
6. **Database User Privileges:** Select "Read and write to any database"
7. Click **"Add User"**

#### Network Access
1. Go to **Network Access** in the left sidebar
2. Click **"Add IP Address"**
3. Choose **"Add Current IP Address"** for development
4. For production, add your server's IP address
5. **IMPORTANT:** Never use `0.0.0.0/0` (all IPs) in production!

### Step 4: Get Connection String

1. Go to **Clusters** and click **"Connect"**
2. Choose **"Connect your application"**
3. Select **"Node.js"** and version **"4.0 or later"**
4. Copy the connection string:
   ```
   mongodb+srv://snappy-prod-user:<password>@snappy-production.xxxxx.mongodb.net/snappy-ecommerce?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Replace `myFirstDatabase` with `snappy-ecommerce`

### Step 5: Configure Production Environment

Update your `.env.production` file:

```bash
# MongoDB Atlas Production
MONGO_URI=mongodb+srv://snappy-prod-user:YOUR_PASSWORD@snappy-production.xxxxx.mongodb.net/snappy-ecommerce?retryWrites=true&w=majority
```

### Step 6: Atlas Best Practices

#### Enable Backup
1. Go to **Clusters** → **Backup** tab
2. Enable **"Continuous Cloud Backup"**
3. Configure backup policy (recommended: daily backups, 7-day retention)

#### Set Up Monitoring
1. Go to **Monitoring** tab
2. Enable **"Real Time Performance Panel"**
3. Set up alerts for:
   - High CPU usage (>80%)
   - High memory usage (>85%)
   - Connection count approaching limit

#### Database Optimization
```javascript
// Recommended indexes for Snappy E-commerce
// Run these in MongoDB Compass or mongo shell

// Users collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })

// Products collection
db.products.createIndex({ name: "text", description: "text" })
db.products.createIndex({ category: 1, inStock: 1 })
db.products.createIndex({ price: 1 })
db.products.createIndex({ createdAt: -1 })

// Orders collection
db.orders.createIndex({ user: 1, createdAt: -1 })
db.orders.createIndex({ orderStatus: 1 })
db.orders.createIndex({ trackingNumber: 1 })

// Carts collection
db.carts.createIndex({ user: 1, isActive: 1 })
```

---

## 🖥️ Option 2: Self-hosted MongoDB

### Step 1: Install MongoDB on Ubuntu 22.04

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 2: Configure MongoDB for Production

#### MongoDB Configuration File
Create/edit `/etc/mongod.conf`:

```yaml
# /etc/mongod.conf

# Network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1,YOUR_SERVER_IP  # Replace with your server IP

# Security
security:
  authorization: enabled

# Storage
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2  # Adjust based on available RAM

# Logging
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
  logRotate: rename

# Process management
processManagement:
  timeZoneInfo: /usr/share/zoneinfo

# Replication (recommended for production)
replication:
  replSetName: "snappy-rs"
```

#### Create Database and User

```bash
# Connect to MongoDB
mongo

# Switch to admin database
use admin

# Create admin user
db.createUser({
  user: "admin",
  pwd: "your-super-secure-admin-password",
  roles: ["root"]
})

# Switch to your application database
use snappy-ecommerce

# Create application user
db.createUser({
  user: "snappy-user",
  pwd: "your-secure-app-password",
  roles: [
    { role: "readWrite", db: "snappy-ecommerce" }
  ]
})

# Exit mongo shell
exit
```

#### Restart MongoDB with Authentication
```bash
sudo systemctl restart mongod
```

### Step 3: Configure Firewall

```bash
# Allow MongoDB port for your application server only
sudo ufw allow from YOUR_APP_SERVER_IP to any port 27017

# Or if MongoDB is on the same server as your app
sudo ufw allow 27017
```

### Step 4: Set Up Backup Script

Create `/opt/mongodb-backup.sh`:

```bash
#!/bin/bash

# MongoDB backup script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/mongodb"
DB_NAME="snappy-ecommerce"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
mongodump --host localhost --port 27017 \
  --username snappy-user \
  --password your-secure-app-password \
  --db $DB_NAME \
  --out $BACKUP_DIR/backup_$DATE

# Compress backup
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $BACKUP_DIR backup_$DATE
rm -rf $BACKUP_DIR/backup_$DATE

# Keep only last 7 backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

Make it executable and add to cron:
```bash
chmod +x /opt/mongodb-backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /opt/mongodb-backup.sh" | crontab -
```

### Step 5: Configure Connection String

Update your `.env.production` file:

```bash
# Self-hosted MongoDB
MONGO_URI=mongodb://snappy-user:your-secure-app-password@localhost:27017/snappy-ecommerce?authSource=snappy-ecommerce
```

---

## 🔒 Production Security Checklist

### For MongoDB Atlas:
- ✅ Use strong passwords (minimum 16 characters)
- ✅ Enable IP whitelist (never use 0.0.0.0/0)
- ✅ Enable database encryption at rest
- ✅ Enable continuous backup
- ✅ Set up monitoring alerts
- ✅ Regularly rotate passwords
- ✅ Use connection string with proper auth source

### For Self-hosted MongoDB:
- ✅ Enable authentication
- ✅ Use strong passwords
- ✅ Configure firewall rules
- ✅ Enable SSL/TLS encryption
- ✅ Regular backups
- ✅ Monitor logs for suspicious activity
- ✅ Keep MongoDB updated
- ✅ Use replica sets for high availability

---

## 📊 Performance Optimization

### Connection Pool Settings
In your Node.js application:

```javascript
// server/config/database.js
const mongooseOptions = {
  maxPoolSize: 10,      // Maximum number of connections
  minPoolSize: 5,       // Minimum number of connections
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferMaxEntries: 0,  // Disable mongoose buffering
  bufferCommands: false // Disable mongoose buffering
};
```

### Database Indexes
Run these commands in MongoDB shell to create performance indexes:

```javascript
// Connect to your database
use snappy-ecommerce

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
db.products.createIndex({ name: "text", description: "text" })
db.products.createIndex({ category: 1, inStock: 1 })
db.products.createIndex({ price: 1 })
db.orders.createIndex({ user: 1, createdAt: -1 })
db.orders.createIndex({ orderStatus: 1 })
db.carts.createIndex({ user: 1, isActive: 1 })
```

---

## 🚨 Troubleshooting

### Common Issues:

#### Connection Timeout
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

#### Authentication Failed
- Verify username/password in connection string
- Ensure user has correct permissions
- Check if authSource is specified correctly

#### High Memory Usage
- Adjust WiredTiger cache size in mongod.conf
- Add more RAM to your server
- Consider upgrading to a larger Atlas tier

#### Slow Queries
- Use MongoDB Compass to analyze query performance
- Add appropriate indexes
- Enable profiling to identify slow operations

---

## 📞 Support Resources

- **MongoDB Atlas Documentation:** https://docs.atlas.mongodb.com/
- **MongoDB Manual:** https://docs.mongodb.com/manual/
- **MongoDB University:** https://university.mongodb.com/
- **Community Forums:** https://developer.mongodb.com/community/forums/

---

## ✅ Quick Setup Summary

1. **Choose your option:** Atlas (recommended) or self-hosted
2. **Create database and user** with proper permissions
3. **Configure network security** (IP whitelist/firewall)
4. **Update .env.production** with connection string
5. **Test connection** before deploying
6. **Set up monitoring and backups**
7. **Create performance indexes**

Your MongoDB is now ready for production! 🎉
