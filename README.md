# Shyara Dashboard

A comprehensive dashboard for managing financials, clients, and users for Shyara Pvt. Ltd.

## 🚀 Quick Start

For detailed setup instructions, see [SETUP.md](./SETUP.md).

### Prerequisites

- Node.js 18+ (You have v22.20.0 ✓)
- PostgreSQL 14+
- npm

### Installation

1. **Install dependencies**:
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   cd ..
   ```

2. **Set up environment variables**:
   - Frontend: Copy `.env.example` to `.env.local` and configure `NEXT_PUBLIC_API_URL`
   - Backend: Copy `backend/.env.example` to `backend/.env` and configure `DATABASE_URL`, `JWT_SECRET`, etc.

3. **Set up database**:
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   cd ..
   ```

4. **Run the application**:
   ```bash
   # Terminal 1: Start backend
   cd backend
   npm run start:dev
   
   # Terminal 2: Start frontend
   npm run dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - API Docs: http://localhost:3001/api/docs

### Default Login Credentials

- **Email/User ID**: `admin@shyara.co.in` or `admin.shyara`
- **Password**: `admin`

⚠️ **Change the default password in production!**

## 📁 Project Structure

```
├── app/              # Next.js app directory
├── backend/          # NestJS backend API
├── components/       # React components
├── features/         # Feature modules
├── lib/              # Utilities and API clients
├── store/            # State management (Zustand)
└── types/            # TypeScript type definitions
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Zustand** - State management
- **Axios** - HTTP client
- **Recharts** - Data visualization

### Backend
- **NestJS** - Node.js framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **JWT** - Authentication
- **Swagger** - API documentation

## 📚 Documentation

- [SETUP.md](./SETUP.md) - Detailed setup and configuration guide
- [backend/README.md](./backend/README.md) - Backend API documentation
- [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) - Migration history

## 🔧 Development Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Backend
- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed the database

## 🔐 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend (backend/.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/shyara_dashboard
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

## 📝 Features

- **Authentication**: JWT-based authentication with role-based access control
- **User Management**: Create, update, and manage users with different roles
- **Financial Management**: Track income and expenses with categorization
- **Financial Analytics**: Revenue charts, balance sheets, and financial summaries
- **Invoice Management**: Manage invoices and track payments
- **Role Management**: Custom roles with granular permissions

## 🤝 Contributing

This is a private project for Shyara Pvt. Ltd.

## 📄 License

Private - Shyara Pvt. Ltd.
