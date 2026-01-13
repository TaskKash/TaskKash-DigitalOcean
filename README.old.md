# 🎯 TASKKASH v2 - Task Management Platform

A full-stack TypeScript application for task management with real database authentication.

## ✨ Features

- ✅ **Real Authentication** - bcrypt password hashing
- ✅ **Database Integration** - MySQL with Drizzle ORM
- ✅ **Session Management** - Secure cookie-based sessions
- ✅ **tRPC API** - Type-safe API communication
- ✅ **Modern Stack** - React + TypeScript + Vite
- ✅ **Multi-tier System** - Bronze, Silver, Gold user tiers

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- MySQL (or use included Docker setup)

### Installation

```bash
# Install dependencies
pnpm install

# Start database
pnpm db:start

# Apply schema
pnpm db:push

# Seed test data
pnpm db:seed

# Start development server
pnpm dev
```

Open http://localhost:3001

## 🔐 Test Accounts

**Password for all accounts:** `password123`

| Email | Name | Tier | Balance |
|-------|------|------|---------|
| ahmed@example.com | Ahmed Mohamed | Bronze | 150 EGP |
| fatima@example.com | Fatima Ali | Silver | 500 EGP |
| omar@example.com | Omar Hassan | Gold | 2000 EGP |
| admin@taskkash.com | Admin User | Admin | 0 EGP |

## 🧪 Testing

### Test Login Page
Open: http://localhost:3001/test-login.html

### Test API
```bash
curl -X POST 'http://localhost:3001/api/trpc/auth.login' \
  -H "Content-Type: application/json" \
  -d '{"json":{"email":"ahmed@example.com","password":"password123"}}'
```

## 📁 Project Structure

```
taskkash-v2/
├── client/              # Frontend React app
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable components
│   │   ├── contexts/   # React contexts
│   │   └── const.ts    # Constants
│   └── public/
│       └── test-login.html  # Test page
├── server/              # Backend API
│   ├── routers.ts      # tRPC routes
│   ├── index.ts        # Server setup
│   └── seed/           # Database seeds
├── drizzle/            # Database
│   ├── schema.ts       # Table definitions
│   └── migrations/     # SQL migrations
└── package.json
```

## 🔧 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm db:start     # Start MySQL database
pnpm db:stop      # Stop database
pnpm db:push      # Apply schema changes
pnpm db:seed      # Seed test data
pnpm db:studio    # Open Drizzle Studio
```

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- tRPC Client

### Backend
- Node.js
- Express
- tRPC
- bcryptjs
- express-session

### Database
- MySQL 8
- Drizzle ORM

## 📚 Documentation

- [Final Success Report](../FINAL_SUCCESS_REPORT.md)
- [Quick Start Guide](../QUICK_START_GUIDE.md)

## 🎓 Recent Changes

### Authentication System
- ✅ Added password field to users table
- ✅ Implemented bcrypt password hashing
- ✅ Real database authentication
- ✅ Fixed OAuth configuration errors
- ✅ Updated frontend to use tRPC API

### Database
- ✅ Created migration for password field
- ✅ Updated seed data with hashed passwords
- ✅ All 4 test users verified working

## 🐛 Troubleshooting

### Database Connection Error
```bash
pnpm db:start
```

### Port Already in Use
```bash
lsof -ti:3001 | xargs kill -9
```

### Frontend Cache Issues
Clear browser cache or use test page:
```
http://localhost:3001/test-login.html
```

## 📄 License

MIT

## 👥 Contributors

- Development Team

---

**Status:** ✅ Fully Functional  
**Last Updated:** November 3, 2025  
**Version:** 2.0.0
