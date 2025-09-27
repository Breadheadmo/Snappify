# cPanel Node.js Deployment Guide

## Overview
This guide will help you deploy Snappy E-commerce to cPanel hosting with Node.js support.

## Prerequisites
- cPanel hosting with Node.js support (version 18+ recommended)
- Access to cPanel File Manager or FTP
- Domain configured for your hosting

## Deployment Steps

### 1. Upload Files
1. Compress the `snappy-cpanel-deployment.zip` file
2. Upload to your cPanel File Manager (public_html folder)
3. Extract the files

### 2. Setup Node.js Application in cPanel
1. Go to "Setup Node.js App" in cPanel
2. Create new application:
   - **Node.js Version**: 18.x or higher
   - **Application Mode**: Production
   - **Application Root**: `/server`
   - **Application URL**: your-domain.com/api
   - **Startup File**: server.js

### 3. Install Dependencies
In cPanel Terminal or SSH:
```bash
cd server
npm install --production
```

### 4. Environment Variables
In cPanel Node.js App settings, add these environment variables:
```
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://snappy-prod-npcsgf:352a585ee69c16664ac3eb22288544f2Wy7I9UXc5s8@cluster0.rks24ra.mongodb.net/snappy-ecommerce?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=7K9mN2pQ8rT5vW6xY1zA3bC4dE7fG9hJ0kL2mN5oP8qR1sT4uV7wX0yZ3aB6cD9eF2gH0iJ3kL6nO9pQ2rS
JWT_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password-here
SUPPORT_EMAIL=support@snappy.co.za
ADMIN_EMAIL=admin@snappy.co.za
FRONTEND_URL=https://your-domain.com
DEFAULT_CURRENCY=ZAR
PAYSTACK_SECRET_KEY=sk_test_c7848ed7a215312a990bc3e0603bacfa089d4d2d
PAYSTACK_PUBLIC_KEY=pk_test_1fc92955e4d136ce8ff05c595d22f9c4535f2efd
PAYSTACK_BASE_URL=https://api.paystack.co
```

### 5. Configure Frontend
1. Copy contents of `client/build/` to `public_html/`
2. Update API URLs in the frontend if needed

### 6. Start Application
- Start the Node.js application from cPanel
- Your API will be available at: https://your-domain.com/api
- Your frontend will be available at: https://your-domain.com

## File Structure After Deployment
```
public_html/
├── index.html (from client/build)
├── static/ (from client/build)
├── manifest.json
└── server/
    ├── server.js
    ├── package.json
    ├── controllers/
    ├── models/
    ├── routes/
    └── node_modules/
```

## Troubleshooting
- Ensure Node.js version is 18+
- Check file permissions (755 for directories, 644 for files)
- Verify MongoDB connection string
- Check cPanel error logs for debugging
