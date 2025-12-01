# Render Backend Deployment Guide

## Prerequisites
- Render account
- PostgreSQL database on Render (or external)
- GitHub repository connected to Render

## Step 1: Create a New Web Service on Render

1. Go to your Render Dashboard: https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `shyaradigital/Shyara-Dashboard`
4. Select the repository

## Step 2: Configure the Service

### Basic Settings:
- **Name**: `shyara-backend` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ **IMPORTANT: Set this to `backend`**
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

### Environment Variables:
Add these in the **Environment** section:

```
NODE_ENV=production
PORT=10000
CORS_ORIGIN=https://dashboard.shyara.co.in,http://localhost:3000
JWT_SECRET=<generate-a-strong-secret-here>
JWT_EXPIRES_IN=7d
DATABASE_URL=<your-postgresql-connection-string>
```

**To generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

**DATABASE_URL format:**
```
postgresql://username:password@hostname:5432/database_name?sslmode=require
```

## Step 3: Create PostgreSQL Database (if not exists)

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Name it: `shyara-db` (or your preferred name)
3. Copy the **Internal Database URL** or **External Database URL**
4. Use this as your `DATABASE_URL` in the backend service

## Step 4: Run Database Migrations

After the backend service is created:

1. Go to the backend service
2. Click on **"Shell"** tab
3. Run:
```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

Or add this as a one-time script in the build command:
```bash
npm install && npm run build && npx prisma migrate deploy && npx prisma db seed
```

## Step 5: Verify Deployment

1. Check the service logs to ensure it started successfully
2. The API should be available at: `https://shyara-backend.onrender.com/api`
3. Test the health endpoint (if you have one) or try: `https://shyara-backend.onrender.com/api/auth/login`

## Step 6: Update Frontend API URL

Make sure your frontend's `NEXT_PUBLIC_API_URL` environment variable points to your backend:
```
NEXT_PUBLIC_API_URL=https://shyara-backend.onrender.com/api
```

## Troubleshooting

### CORS Issues:
- Ensure `CORS_ORIGIN` includes your frontend domain: `https://dashboard.shyara.co.in`
- Check that the backend service has been redeployed after CORS changes
- Verify the backend service is running (check logs)

### Database Connection Issues:
- Verify `DATABASE_URL` is correct
- Check if database is accessible from Render's network
- Ensure migrations have been run

### Build Failures:
- Check that `Root Directory` is set to `backend`
- Verify `package.json` exists in the backend folder
- Check build logs for specific errors

## Important Notes

- The backend and frontend are **separate services** on Render
- Each service needs its own environment variables
- The backend service must have `Root Directory: backend` set
- Always redeploy the backend after making CORS changes

