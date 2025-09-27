# Railway Deployment Instructions

## Backend Deployment to Railway

1. **Sign up**: Go to https://railway.app and create account
2. **New Project**: Click "New Project" → "Deploy from GitHub repo"
3. **Select Repository**: Choose your Snappy repository
4. **Select Service**: Choose the `server` folder
5. **Environment Variables**: Add these in Railway dashboard:

```
NODE_ENV=production
MONGO_URI=mongodb+srv://snappy-prod-npcsgf:352a585ee69c16664ac3eb22288544f2Wy7I9UXc5s8@cluster0.rks24ra.mongodb.net/snappy-ecommerce?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=7K9mN2pQ8rT5vW6xY1zA3bC4dE7fG9hJ0kL2mN5oP8qR1sT4uV7wX0yZ3aB6cD9eF2gH5iJ8kL1nO4pQ7rS0tU3vW6xY9zA2bC5dE8fG1hJ4kL7mN0oP3qR6sT9uV2wX5yZ8aB1cD4eF7gH0iJ3kL6nO9pQ2rS
JWT_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password-here
SUPPORT_EMAIL=support@snappy.co.za
ADMIN_EMAIL=admin@snappy.co.za
FRONTEND_URL=https://your-vercel-domain.vercel.app
DEFAULT_CURRENCY=ZAR
PAYMENT_TIMEOUT=600000
MAX_PAYMENT_ATTEMPTS=3
PAYSTACK_SECRET_KEY=sk_test_c7848ed7a215312a990bc3e0603bacfa089d4d2d
PAYSTACK_PUBLIC_KEY=pk_test_1fc92955e4d136ce8ff05c595d22f9c4535f2efd
PAYSTACK_BASE_URL=https://api.paystack.co
PAYSTACK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
```

6. **Deploy**: Railway will automatically deploy your backend
7. **Copy URL**: Note the Railway URL (e.g., `https://snappy-backend-production.up.railway.app`)
