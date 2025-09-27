# Snappy E-commerce - cPanel Deployment Package

## What's Included
- ✅ Built React frontend (ready for public_html)
- ✅ Complete Node.js backend
- ✅ Environment configuration
- ✅ Deployment instructions
- ✅ All dependencies listed

## Quick Deploy Checklist
1. Upload snappy-cpanel-deployment.zip to cPanel
2. Extract to public_html
3. Setup Node.js app in cPanel (point to /server folder)
4. Install dependencies: `npm install`
5. Add environment variables in cPanel
6. Start the application

## Package Contents

### Frontend Files (Goes to public_html root)
```
client/build/
├── index.html
├── static/css/
├── static/js/
├── manifest.json
└── asset-manifest.json
```

### Backend Files (Goes to public_html/server)
```
server/
├── server.js
├── package.json
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
├── config/
├── data/
└── scripts/
```

### Configuration Files
```
├── CPANEL_DEPLOYMENT.md (Full deployment guide)
├── .env.cpanel (Environment variables template)
└── package-cpanel.json (cPanel-optimized package.json)
```

## After Upload
Your site structure should look like:
```
public_html/
├── index.html (Frontend)
├── static/ (Frontend assets)
├── manifest.json
├── server/ (Backend API)
│   ├── server.js
│   ├── package.json
│   └── ... (all backend files)
└── CPANEL_DEPLOYMENT.md
```

## API Endpoints
After deployment, your API will be available at:
- https://your-domain.com/api/products
- https://your-domain.com/api/users
- https://your-domain.com/api/categories
- etc.

## Support
Follow the CPANEL_DEPLOYMENT.md guide for detailed setup instructions.
