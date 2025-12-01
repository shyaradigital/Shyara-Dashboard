# Shyara Dashboard Backend API

NestJS backend API for Shyara Dashboard with PostgreSQL database and JWT authentication.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (use a strong random string in production)
- `JWT_EXPIRES_IN` - Token expiration (default: "7d")
- `PORT` - Server port (default: 3001)
- `CORS_ORIGIN` - Allowed CORS origins (comma-separated or * for all)

3. Set up the database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (creates master admin)
npm run prisma:seed
```

4. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`
API documentation (Swagger) will be available at `http://localhost:3001/api/docs`

## Default Admin Credentials

After seeding:
- Email/User ID: `admin@shyara.co.in` or `admin.shyara`
- Password: `admin`

**Important**: Change the default password in production!

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)

### Users
- `GET /api/users` - List users (requires auth)
- `GET /api/users/:id` - Get user by ID (requires auth)
- `POST /api/users` - Create user (requires ADMIN role)
- `PATCH /api/users/:id` - Update user (requires ADMIN role)
- `DELETE /api/users/:id` - Delete user (requires ADMIN role)

### Roles
- `GET /api/roles` - List roles (requires auth)
- `GET /api/roles/:id` - Get role by ID (requires auth)
- `POST /api/roles` - Create role (requires ADMIN role)
- `PATCH /api/roles/:id` - Update role (requires ADMIN role)
- `DELETE /api/roles/:id` - Delete role (requires ADMIN role)

### Income
- `GET /api/incomes` - List income entries (requires auth)
- `GET /api/incomes/summary` - Get income summary (requires auth)
- `GET /api/incomes/:id` - Get income by ID (requires auth)
- `POST /api/incomes` - Create income entry (requires auth)
- `PATCH /api/incomes/:id` - Update income entry (requires auth)
- `DELETE /api/incomes/:id` - Delete income entry (requires auth)

### Expenses
- `GET /api/expenses` - List expense entries (requires auth)
- `GET /api/expenses/summary` - Get expense summary (requires auth)
- `GET /api/expenses/:id` - Get expense by ID (requires auth)
- `POST /api/expenses` - Create expense entry (requires auth)
- `PATCH /api/expenses/:id` - Update expense entry (requires auth)
- `DELETE /api/expenses/:id` - Delete expense entry (requires auth)

### Financial
- `GET /api/financial/summary` - Get financial summary (requires auth)
- `GET /api/financial/analytics` - Get revenue analytics (requires auth)
- `GET /api/financial/balance-sheet` - Get balance sheet (requires auth)

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Database

The project uses Prisma ORM. To manage the database:

```bash
# View database in Prisma Studio
npm run prisma:studio

# Create a new migration
npm run prisma:migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Use a strong `JWT_SECRET` (generate with: `openssl rand -base64 32`)
3. Configure proper `CORS_ORIGIN` (not `*`)
4. Use a production PostgreSQL database
5. Build the application: `npm run build`
6. Start: `npm run start:prod`

## License

Private - Shyara Pvt. Ltd.

