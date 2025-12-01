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

After the backend service is created and deployed successfully:

1. Go to the backend service (`Shyara-Dashboard-Backend`)
2. Click on **"Shell"** tab
3. Run:
```bash
npx prisma migrate deploy
npx prisma db seed
```

**Note:** Since Root Directory is set to `backend`, you're already in the backend folder in the shell.

## Step 5: Verify Deployment

1. **Check Service Status:**
   - Service should show **"Live"** status (green) in the dashboard
   - If it shows "Failed deploy" (red), see Troubleshooting section below

2. **Check Logs:**
   - Click on the backend service
   - Go to **"Logs"** tab
   - Look for: `🚀 Application is running on port XXXX`
   - No error messages should appear

3. **Test the API:**
   - The API should be available at: `https://shyara-dashboard-backend.onrender.com/api`
   - Test endpoint: `https://shyara-dashboard-backend.onrender.com/api/auth/login`
   - You should get a response (even if it's an error, it means the server is running)

4. **Run Database Migrations:**
   - Go to **"Shell"** tab in the backend service
   - Run: `npx prisma migrate deploy`
   - Run: `npx prisma db seed`
   - Check for success messages

## Step 6: Update Frontend API URL

Make sure your frontend's `NEXT_PUBLIC_API_URL` environment variable points to your backend:
```
NEXT_PUBLIC_API_URL=https://shyara-backend.onrender.com/api
```

## Troubleshooting

### ❌ Backend Service Failed to Deploy

If you see "Failed deploy" status:

1. **Click on the backend service** (`Shyara-Dashboard-Backend`)
2. **Go to "Logs" tab** to see the error
3. **Common issues and fixes:**

   **Issue: "Cannot find module" or "Missing dependencies"**
   - ✅ **Fix:** Ensure `Root Directory` is set to `backend`
   - ✅ **Fix:** Check that `package.json` exists in the backend folder
   - ✅ **Fix:** Verify Build Command is: `npm install && npm run build`

   **Issue: "Prisma Client not generated"**
   - ✅ **Fix:** The `postinstall` script should run automatically
   - ✅ **Fix:** If not, add to Build Command: `npm install && npm run build && npx prisma generate`

   **Issue: "Database connection failed"**
   - ✅ **Fix:** Verify `DATABASE_URL` environment variable is set correctly
   - ✅ **Fix:** Use Internal Database URL (without `.singapore-postgres.render.com`)
   - ✅ **Fix:** Ensure database service is "Available" (green status)

   **Issue: "Port already in use" or "EADDRINUSE"**
   - ✅ **Fix:** Remove `PORT` environment variable (Render auto-assigns)
   - ✅ **Fix:** Or set `PORT` to `10000` or leave empty

   **Issue: "JWT_SECRET not found"**
   - ✅ **Fix:** Add `JWT_SECRET` environment variable
   - ✅ **Fix:** Generate with: `openssl rand -base64 32`

4. **After fixing, click "Manual Deploy" → "Deploy latest commit"**

### CORS Issues:
- Ensure `CORS_ORIGIN` includes your frontend domain: `https://dashboard.shyara.co.in`
- Check that the backend service has been redeployed after CORS changes
- Verify the backend service is running (check logs)
- Backend service must show "Live" status (green)

### Database Connection Issues:
- Verify `DATABASE_URL` is correct (use Internal Database URL)
- Check if database service shows "Available" status
- Ensure migrations have been run (Step 4)
- Database and backend must be in the same region (Singapore)

### Build Failures:
- Check that `Root Directory` is set to `backend` ⚠️ **CRITICAL**
- Verify `package.json` exists in the backend folder
- Check build logs for specific errors
- Ensure all environment variables are set correctly

## Important Notes

- The backend and frontend are **separate services** on Render
- Each service needs its own environment variables
- The backend service must have `Root Directory: backend` set
- Always redeploy the backend after making CORS changes

