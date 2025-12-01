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
DATABASE_URL=postgresql://shyara_dashboard_db_user:otPQX0rI3L3kdeJHN7ubNBwcXmnQCC7i@dpg-d4mqk5obdp1s73er482g-a/shyara_dashboard_db
```

**To generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

**Note:** Use the **Internal Database URL** for better performance (services in the same region communicate over private network).

## Step 3: PostgreSQL Database ✅ (Already Created)

**Database Details:**
- **Name**: `shyara-dashboard-db`
- **Hostname**: `dpg-d4mqk5obdp1s73er482g-a`
- **Database**: `shyara_dashboard_db`
- **Username**: `shyara_dashboard_db_user`
- **Port**: `5432`

**Connection URLs:**
- **Internal Database URL** (Recommended for Render services):
  ```
  postgresql://shyara_dashboard_db_user:otPQX0rI3L3kdeJHN7ubNBwcXmnQCC7i@dpg-d4mqk5obdp1s73er482g-a/shyara_dashboard_db
  ```
- **External Database URL** (For external access):
  ```
  postgresql://shyara_dashboard_db_user:otPQX0rI3L3kdeJHN7ubNBwcXmnQCC7i@dpg-d4mqk5obdp1s73er482g-a.singapore-postgres.render.com/shyara_dashboard_db
  ```

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

