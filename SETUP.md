# Shyara Dashboard - Local Development Setup Guide

This guide will help you set up the Shyara Dashboard project for local development.

## Prerequisites

- **Node.js** 18+ (You have v22.20.0 ✓)
- **PostgreSQL** 14+ installed and running
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

## Project Structure

This project consists of two main parts:
- **Frontend**: Next.js application (runs on port 3000)
- **Backend**: NestJS API server (runs on port 3001)

## Step 1: Install Frontend Dependencies

```bash
npm install
```

This will install all frontend dependencies defined in `package.json`.

## Step 2: Set Up Backend

### 2.1 Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 2.2 Set Up PostgreSQL Database

1. **Create a PostgreSQL database**:
   ```sql
   CREATE DATABASE shyara_dashboard;
   ```

2. **Set up environment variables**:
   ```bash
   cd backend
   cp .env.example .env
   ```

3. **Edit `backend/.env`** and update the following:
   ```env
   DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/shyara_dashboard
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

   **Important**: 
   - Replace `YOUR_USER` and `YOUR_PASSWORD` with your PostgreSQL credentials
   - Generate a strong JWT_SECRET with: `openssl rand -base64 32`

### 2.3 Set Up Database Schema

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database (creates master admin user)
npm run prisma:seed
cd ..
```

**Default Admin Credentials** (created by seed):
- Email/User ID: `admin@shyara.co.in` or `admin.shyara`
- Password: `admin`

⚠️ **IMPORTANT**: Change the default password in production!

## Step 3: Set Up Frontend Environment

1. **Create frontend environment file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** (already configured for local development):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

   This tells the frontend to connect to your local backend.

## Step 4: Run the Application

### Start Backend Server

In one terminal window:
```bash
cd backend
npm run start:dev
```

The backend API will be available at:
- API: `http://localhost:3001/api`
- API Documentation (Swagger): `http://localhost:3001/api/docs`

### Start Frontend Development Server

In another terminal window (from project root):
```bash
npm run dev
```

The frontend will be available at:
- Application: `http://localhost:3000`

## Step 5: Access the Application

1. Open your browser and navigate to `http://localhost:3000`
2. You should see the login page
3. Log in with the default admin credentials:
   - Email/User ID: `admin@shyara.co.in` or `admin.shyara`
   - Password: `admin`

## Development Scripts

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Backend Scripts
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed the database

## API Endpoints

All API endpoints are prefixed with `/api`. Full documentation is available at `http://localhost:3001/api/docs` when the backend is running.

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)

### Users
- `GET /api/users` - List users (requires auth)
- `POST /api/users` - Create user (ADMIN only)
- `PATCH /api/users/:id` - Update user (ADMIN only)
- `DELETE /api/users/:id` - Delete user (ADMIN only)

### Financial Data
- `GET /api/incomes` - List income entries
- `POST /api/incomes` - Create income entry
- `GET /api/expenses` - List expense entries
- `POST /api/expenses` - Create expense entry
- `GET /api/financial/summary` - Get financial summary
- `GET /api/financial/analytics` - Get revenue analytics

## Troubleshooting

### Database Connection Issues

If you get database connection errors:
1. Make sure PostgreSQL is running
2. Verify your `DATABASE_URL` in `backend/.env` is correct
3. Check that the database exists: `psql -l | grep shyara_dashboard`

### Port Already in Use

If port 3000 or 3001 is already in use:
- Change the frontend port: `npm run dev -- -p 3002`
- Change the backend port: Update `PORT` in `backend/.env`

### CORS Issues

If you see CORS errors:
1. Make sure `CORS_ORIGIN` in `backend/.env` includes `http://localhost:3000`
2. Restart the backend server after changing `.env`

### Authentication Issues

If login doesn't work:
1. Make sure the database is seeded: `cd backend && npm run prisma:seed`
2. Verify you're using the correct credentials
3. Check backend logs for errors

### Prisma Client Issues

If you get "PrismaClient is not defined" errors:
```bash
cd backend
npm run prisma:generate
```

## Additional Resources

- [Backend README](backend/README.md) - Detailed backend documentation
- [Migration Summary](MIGRATION_SUMMARY.md) - Information about the migration from localStorage to API
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)

## Production Deployment

For production deployment:
1. Set `NODE_ENV=production` in backend `.env`
2. Use a strong `JWT_SECRET` (generate with `openssl rand -base64 32`)
3. Configure proper `CORS_ORIGIN` (not `*`)
4. Use a production PostgreSQL database
5. Update `NEXT_PUBLIC_API_URL` in frontend to point to production backend
6. Build both frontend and backend
7. Change default admin password

## Support

For issues or questions, please refer to the project repository or contact the development team.
