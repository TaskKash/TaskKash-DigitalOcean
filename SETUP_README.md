# TASKKASH v2 - Setup Guide

## 📋 Project Overview

**TASKKASH** is a task-based earning platform where users can complete tasks and earn money. The platform supports both users and advertisers, with a comprehensive admin panel for management.

**Tech Stack:**
- **Frontend:** React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Backend:** Node.js + tRPC + Express
- **Database:** SQLite (via Drizzle ORM)
- **Authentication:** OAuth (Manus)
- **Internationalization:** i18next (Arabic + English)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x or higher
- pnpm 9.x or higher
- Git

### Installation Steps

1. **Extract the project files:**
   ```bash
   unzip taskkash-v2-backup.zip
   cd taskkash-v2
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

   **Required Environment Variables:**
   - `DATABASE_URL` - Database connection string
   - `JWT_SECRET` - Secret key for JWT tokens
   - `OAUTH_SERVER_URL` - OAuth server URL
   - `VITE_APP_TITLE` - Application title (default: "TASKKASH")
   - `VITE_APP_LOGO` - Logo path (default: "/taskkash-logo.png")

4. **Initialize the database:**
   ```bash
   pnpm db:push
   ```

5. **Start the development server:**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
taskkash-v2/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries (i18n, trpc)
│   │   ├── pages/         # Page components
│   │   │   ├── admin/     # Admin panel pages
│   │   │   ├── advertiser/# Advertiser pages
│   │   │   └── ...        # User pages
│   │   ├── App.tsx        # Main app component with routes
│   │   └── main.tsx       # Entry point
│   └── vite.config.ts     # Vite configuration
├── server/                # Backend Node.js application
│   ├── routers.ts         # tRPC API routes
│   ├── db.ts              # Database connection
│   └── index.ts           # Server entry point
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Database schema definition
├── shared/                # Shared types and constants
│   └── const.ts           # Shared constants
├── package.json           # Dependencies and scripts
├── drizzle.config.ts      # Drizzle ORM configuration
├── tsconfig.json          # TypeScript configuration
└── DATABASE_SCHEMA.md     # Database documentation
```

---

## 🗄️ Database Schema

The project uses SQLite with Drizzle ORM. The database includes 6 main tables:

1. **users** - User accounts and profiles
2. **countries** - Supported countries and currencies
3. **advertisers** - Brands/companies posting tasks
4. **tasks** - Available tasks/campaigns
5. **userTasks** - User task completion tracking
6. **transactions** - Financial transactions

See `DATABASE_SCHEMA.md` for detailed schema documentation.

### Database Commands

```bash
# Generate migrations
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

---

## 🌐 Internationalization (i18n)

The application supports **Arabic** and **English** languages.

- **Default Language:** English
- **Language Detection:** Automatic browser language detection
- **Manual Switching:** Language switcher in header
- **RTL Support:** Automatic text direction switching

Translation files are located in:
- `client/src/lib/i18n.ts`

---

## 👤 User Roles

### 1. **User** (Regular users)
- Browse and complete tasks
- Earn money and withdraw
- View profile and wallet
- Identity verification

### 2. **Advertiser**
- Create and manage tasks
- Review task submissions
- Manage campaigns
- View analytics

### 3. **Admin**
- Full access to admin panel (`/admin`)
- User management (view, edit, delete)
- Task management
- Advertiser management
- Transaction management
- Country management

**Default Admin Access:**
- Check the database for users with `role='admin'`
- Or manually set a user's role to 'admin' in the database

---

## 🔐 Authentication

The project uses **OAuth authentication** (Manus platform).

**Authentication Flow:**
1. User clicks "Create Account" or "Login"
2. OAuth redirect to Manus authentication
3. User authenticates via Google/Email
4. Redirect back to application
5. User profile created/updated in database

**Note:** The `/register` and `/login` pages are UI mockups. Real authentication happens through OAuth.

---

## 🛠️ Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Database
pnpm db:generate      # Generate migrations
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Drizzle Studio

# Type Checking
pnpm typecheck        # Run TypeScript type checking
```

---

## 📦 Deployment

### Option 1: Manus Platform (Recommended)

The project is already configured for Manus platform deployment:

1. Push code to Manus
2. Configure environment variables in Settings → Secrets
3. Click "Publish" button in Management UI

### Option 2: Self-Hosting

1. **Build the project:**
   ```bash
   pnpm build
   ```

2. **Set up environment variables** on your server

3. **Start the server:**
   ```bash
   NODE_ENV=production node server/index.js
   ```

4. **Serve the static files** from `client/dist`

5. **Configure reverse proxy** (nginx/Apache) to route:
   - `/trpc/*` → Backend server
   - `/*` → Static files

---

## 🎨 Customization

### Change Logo

1. Replace `/client/public/taskkash-logo.png` with your logo
2. Update `VITE_APP_LOGO` in environment variables or Settings → General

### Change Colors

Edit `client/src/index.css` to customize the color palette:

```css
:root {
  --primary: ...;
  --secondary: ...;
  /* etc. */
}
```

### Add New Pages

1. Create page component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Add translations in `client/src/lib/i18n.ts`

---

## 🐛 Troubleshooting

### Database Issues

**Problem:** "Database not available"
**Solution:** Run `pnpm db:push` to initialize the database

### Build Errors

**Problem:** TypeScript errors during build
**Solution:** Run `pnpm typecheck` to identify issues

### OAuth Issues

**Problem:** Authentication not working
**Solution:** Check `OAUTH_SERVER_URL` and `JWT_SECRET` in environment variables

### Port Already in Use

**Problem:** Port 3000 is busy
**Solution:** The server will automatically use port 3001

---

## 📞 Support

For issues or questions:
1. Check `DATABASE_SCHEMA.md` for database structure
2. Review `todo.md` for known issues
3. Check console logs for detailed error messages

---

## 📄 License

Proprietary - All rights reserved

---

## 🎯 Key Features

- ✅ Bilingual support (Arabic + English)
- ✅ Automatic browser language detection
- ✅ RTL/LTR text direction switching
- ✅ OAuth authentication
- ✅ Admin panel with user management
- ✅ Task management system
- ✅ Wallet and transaction system
- ✅ Identity verification flow
- ✅ Advertiser portal
- ✅ Responsive design
- ✅ Dark/Light theme support

---

**Version:** 2.0  
**Last Updated:** November 2, 2025  
**Built with ❤️ by Manus AI**
