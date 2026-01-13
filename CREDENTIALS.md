# TASKKASH v2 - Login Credentials

**All Test Accounts for TASKKASH v2**

---

## 🔐 Admin Account

**Purpose:** Full platform administration and management

- **Email:** `admin@taskkash.com`
- **Password:** `admin123`
- **Role:** Administrator
- **Login URL:** `/admin/login`
- **Dashboard:** `/admin/dashboard`

**Access to:**
- Users management
- Advertisers management
- Tasks management
- Reported tasks
- Platform settings
- System configuration

---

## 👤 User Account

**Purpose:** Regular user testing and task completion

- **Email:** `ahmed@example.com`
- **Password:** `password123`
- **Role:** User
- **Login URL:** `/login`
- **Dashboard:** `/home`

**User Details:**
- Name: Ahmed Mohamed
- Phone: +201111111111
- Balance: 150 EGP
- Completed Tasks: 5
- Total Earnings: 200 EGP
- Tier: Bronze (tier1)
- Profile Strength: 80%
- Verified: Yes

**Access to:**
- User dashboard
- Available tasks
- Task history
- Wallet and transactions
- Profile management
- Settings
- Notifications
- Referrals
- Achievements

---

## 📢 Advertiser Account

**Purpose:** Advertiser dashboard and campaign management

- **Email:** `advertiser@example.com`
- **Password:** `advertiser123`
- **Role:** Advertiser
- **Login URL:** `/advertiser/login`
- **Dashboard:** `/advertiser/dashboard`

**Advertiser Details:**
- Name: Test Advertiser
- Slug: test-advertiser
- Status: Active

**Access to:**
- Advertiser dashboard
- Campaign creation and management
- Task review queue
- Analytics and reports
- Billing and invoices
- Payment methods
- Team management
- Account settings
- Audience insights
- Competitor analysis

---

## 🌐 Direct Access URLs

### Production Server (Port 3001)

| Account Type | Login URL |
|-------------|-----------|
| **Admin** | https://3001-i27w4hmugree3esahwqsk-deaa76c2.manusvm.computer/admin/login |
| **User** | https://3001-i27w4hmugree3esahwqsk-deaa76c2.manusvm.computer/login |
| **Advertiser** | https://3001-i27w4hmugree3esahwqsk-deaa76c2.manusvm.computer/advertiser/login |

### Local Development (Port 3000)

| Account Type | Login URL |
|-------------|-----------|
| **Admin** | http://localhost:3000/admin/login |
| **User** | http://localhost:3000/login |
| **Advertiser** | http://localhost:3000/advertiser/login |

### Local Production (Port 3001)

| Account Type | Login URL |
|-------------|-----------|
| **Admin** | http://localhost:3001/admin/login |
| **User** | http://localhost:3001/login |
| **Advertiser** | http://localhost:3001/advertiser/login |

---

## 🔑 API Authentication

### User Login API

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 10,
    "openId": "user_test_001",
    "name": "Ahmed Mohamed",
    "email": "ahmed@example.com",
    "role": "user",
    "balance": 150,
    "tier": "tier1"
  }
}
```

### Advertiser Login API

```bash
curl -X POST http://localhost:3001/api/auth/advertiser/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "advertiser@example.com",
    "password": "advertiser123"
  }'
```

**Response:**
```json
{
  "success": true,
  "advertiser": {
    "id": 10,
    "email": "advertiser@example.com",
    "nameEn": "Test Advertiser",
    "slug": "test-advertiser",
    "isActive": true
  }
}
```

### Admin Login API

```bash
curl -X POST http://localhost:3001/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@taskkash.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "admin": {
    "id": 1,
    "openId": "admin_001",
    "email": "admin@taskkash.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

---

## 🔒 Security Notes

### For Development/Testing

These credentials are for **development and testing only**. They are:
- ✅ Safe to use in local development
- ✅ Safe to use in testing environments
- ❌ **NOT safe for production use**

### For Production Deployment

**IMPORTANT:** Before deploying to production:

1. **Change all default passwords**
   ```javascript
   // In server/_core/auth-routes.ts
   const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
   ```

2. **Use environment variables**
   ```env
   ADMIN_EMAIL=your-admin@email.com
   ADMIN_PASSWORD=your-secure-password
   ```

3. **Implement password requirements**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Password strength validation

4. **Add two-factor authentication**
   - Especially for admin accounts
   - SMS or authenticator app

5. **Enable rate limiting**
   - Prevent brute force attacks
   - Limit login attempts

---

## 📝 Password Reset

Currently, password reset is not implemented. To reset passwords:

### User Password Reset
```sql
-- Update user password in database
UPDATE users 
SET password = '$2a$10$new_hashed_password' 
WHERE email = 'user@example.com';
```

### Admin Password Reset
```javascript
// Update in server/_core/auth-routes.ts
const ADMIN_PASSWORD_HASH = await bcrypt.hash("new_password", 10);
```

---

## 🎯 Quick Login Guide

### For Admins

1. Go to `/admin/login`
2. Enter: admin@taskkash.com
3. Enter: admin123
4. Click "Admin Login"
5. Redirected to `/admin/dashboard`

### For Users

1. Go to `/login`
2. Enter: ahmed@example.com
3. Enter: password123
4. Click "Login"
5. Redirected to `/home`

### For Advertisers

1. Go to `/advertiser/login`
2. Enter: advertiser@example.com
3. Enter: advertiser123
4. Click "Login"
5. Redirected to `/advertiser/dashboard`

---

## 🔄 Session Management

### Session Duration
- **Default:** 30 days
- **Cookie Name:** `manus_session`
- **Type:** HTTP-only, Secure (in production)

### Logout
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Cookie: manus_session=<token>"
```

### Check Current Session
```bash
curl http://localhost:3001/api/auth/me \
  -H "Cookie: manus_session=<token>"
```

---

## ⚠️ Important Reminders

1. **Never commit credentials to Git**
   - Use `.env` files
   - Add `.env` to `.gitignore`

2. **Change passwords before production**
   - All default passwords must be changed
   - Use strong, unique passwords

3. **Protect admin access**
   - Limit admin account creation
   - Monitor admin activity
   - Use IP whitelisting if possible

4. **Regular security audits**
   - Review access logs
   - Check for suspicious activity
   - Update dependencies regularly

---

## 📞 Support

If you forget credentials or need to reset:

1. Check this file for default credentials
2. Review `.env` file for custom credentials
3. Check database for user records
4. Update passwords in code if needed

---

**Keep this file secure and do not share publicly!** 🔒
