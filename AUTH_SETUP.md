# Email/Password Authentication Setup

## Overview

TASKKASH v2 has been upgraded to support **Email/Password authentication** in addition to OAuth. This document explains the changes and how to use the new system.

---

## Changes Made

### 1. Database Schema
- Added `password` field to `users` table (VARCHAR(255))
- Migration file created: `drizzle/migrations/001_add_password_field.sql`

### 2. Seed Data
- Updated all test users with hashed passwords (bcrypt)
- Default password for all test users: **`password123`**

### 3. Backend API
- Updated `auth.login` endpoint to verify passwords using bcrypt
- Added password validation before creating session

### 4. Frontend
- Login.tsx already configured to use `trpc.auth.login`
- AppContext configured to fetch user data from API

---

## Test Users

All test users use the same password: **`password123`**

| Email | Name | Tier | Password |
|-------|------|------|----------|
| admin@taskkash.com | Admin User | Admin | password123 |
| ahmed@example.com | Ahmed Mohamed | Bronze | password123 |
| fatima@example.com | Fatima Ali | Silver | password123 |
| omar@example.com | Omar Hassan | Gold | password123 |

---

## Setup Instructions

### 1. Apply Database Migration

```bash
# Connect to your MySQL database
mysql -u your_user -p your_database

# Run the migration
source drizzle/migrations/001_add_password_field.sql

# Run the seed data (this will update passwords)
source server/seed/seed-data.sql
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start the Server

```bash
pnpm dev
```

### 4. Test Login

1. Navigate to `/login`
2. Enter email: `ahmed@example.com`
3. Enter password: `password123`
4. Click "تسجيل الدخول"

---

## How It Works

### Authentication Flow

1. **User submits login form** with email and password
2. **Frontend calls** `trpc.auth.login.mutate({ email, password })`
3. **Backend validates**:
   - Finds user by email
   - Verifies password using `bcrypt.compare()`
   - Creates session token using Manus SDK
   - Sets session cookie
4. **Frontend redirects** to `/home`
5. **AppContext fetches** user data from `trpc.auth.me`

### Password Hashing

- All passwords are hashed using **bcrypt** with 10 salt rounds
- Passwords are never stored in plain text
- Password comparison is done securely using `bcrypt.compare()`

---

## Security Notes

⚠️ **Important**: This implementation is for **development/testing only**. For production:

1. Add rate limiting to prevent brute force attacks
2. Implement account lockout after failed attempts
3. Add email verification
4. Implement password reset functionality
5. Use HTTPS only
6. Add CSRF protection
7. Implement 2FA (optional)

---

## Troubleshooting

### "Invalid email or password" error

- Check that the migration has been applied
- Verify that seed data has been loaded
- Ensure password is exactly `password123`

### "Password authentication not configured" error

- The user doesn't have a password in the database
- Run the seed data script again

### Session not persisting

- Check that cookies are enabled
- Verify that `COOKIE_NAME` is set correctly
- Check browser console for cookie errors

---

## Next Steps

To convert this to a production-ready system:

1. **Add user registration** endpoint
2. **Implement password reset** with email verification
3. **Add email verification** for new accounts
4. **Implement rate limiting** on login endpoint
5. **Add account lockout** mechanism
6. **Create admin panel** for user management
7. **Add audit logging** for security events

---

## Files Modified

### Backend
- `drizzle/schema.ts` - Added password field
- `drizzle/migrations/001_add_password_field.sql` - Migration
- `server/seed/seed-data.sql` - Updated with hashed passwords
- `server/routers.ts` - Added bcrypt verification
- `package.json` - Added bcryptjs dependency

### Frontend
- `client/src/pages/Login.tsx` - Already configured
- `client/src/contexts/AppContext.tsx` - Already configured
- `client/src/_core/hooks/useAuth.ts` - Already configured

---

## Support

For questions or issues, please refer to the main project documentation or contact the development team.
