# ✅ CPANEL DEPLOYMENT CHECKLIST

## 📦 Pre-Upload Verification

- ✅ Backend server folder copied
- ✅ Frontend build files copied  
- ✅ Environment configuration ready
- ✅ Deployment instructions included
- ✅ Package structure verified

## 🚀 Deployment Steps

### Step 1: Compress & Upload
```bash
1. Right-click "snappy-cpanel-deployment" folder
2. Send to → Compressed (zipped) folder
3. Upload ZIP to cPanel File Manager
4. Extract in your domain's root directory
```

### Step 2: Configure Node.js App
```bash
1. cPanel → Setup Node.js App
2. Create new app:
   - Node.js version: 18+
   - App root: /snappy-cpanel-deployment
   - App URL: yourdomain.com/api
   - Startup file: server.js
```

### Step 3: Install Dependencies
```bash
1. Click "Run NPM Install" in cPanel
2. Or via terminal: npm install
```

### Step 4: Configure Environment
```bash
Copy variables from .env.cpanel to your Node.js app environment:
- Update FRONTEND_URL with your domain
- Keep test payment keys for now
```

### Step 5: Setup Frontend
```bash
1. Copy contents of /frontend/ to /public_html/
2. Your React app will serve from your domain root
```

## 🎯 Final Result

- **Backend API**: yourdomain.com/api
- **Frontend**: yourdomain.com
- **Admin**: yourdomain.com/admin

## 📞 Ready to ZIP and UPLOAD! 🚀
