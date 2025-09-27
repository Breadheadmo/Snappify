# Frontend Deployment to Vercel

## Step-by-Step Instructions

1. **Sign up**: Go to https://vercel.com and create account
2. **Import Project**: Click "New Project" → "Import Git Repository"
3. **Select Repository**: Choose your Snappy repository
4. **Framework Preset**: Select "Create React App"
5. **Root Directory**: Set to `client`
6. **Build Settings**: 
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

7. **Environment Variables**: Add in Vercel dashboard:
```
REACT_APP_API_URL=https://your-railway-backend-url.railway.app/api
REACT_APP_CURRENCY=ZAR
REACT_APP_CURRENCY_SYMBOL=R
```

8. **Deploy**: Click "Deploy"
9. **Update Backend**: Update FRONTEND_URL in Railway with your Vercel URL

## After Deployment
- Update the `vercel.json` file with your actual Railway backend URL
- Redeploy if needed
