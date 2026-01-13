# TASKKASH v2 - Setup Instructions

**Quick Setup Guide for TASKKASH v2**

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Extract Files
```bash
unzip taskkash-v2-complete-backup.zip
cd taskkash-v2
```

### Step 2: Install Dependencies
```bash
pnpm install
```

### Step 3: Start the Application
```bash
# For development
pnpm dev

# For production
pnpm build && pnpm start
```

### Step 4: Access the Application

Open your browser and go to:
- **Development:** http://localhost:3000
- **Production:** http://localhost:3001

---

## 🔐 Test Accounts

### Admin
- URL: http://localhost:3001/admin/login
- Email: admin@taskkash.com
- Password: admin123

### User
- URL: http://localhost:3001/login
- Email: ahmed@example.com
- Password: password123

### Advertiser
- URL: http://localhost:3001/advertiser/login
- Email: advertiser@example.com
- Password: advertiser123

---

## 🛠️ Detailed Setup

### Prerequisites

1. **Node.js** (v22.13.0 or higher)
   ```bash
   node --version
   ```

2. **pnpm** (Package Manager)
   ```bash
   npm install -g pnpm
   ```

3. **MySQL** (Optional, for advertiser features)
   - Install MySQL Server
   - Create database: `taskkash`

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=production
PORT=3001

# Database Configuration (Optional)
DATABASE_URL=mysql://username:password@localhost:3306/taskkash

# JWT Secret (Optional - for custom security)
JWT_SECRET=your-secure-random-secret-key-here
```

### Database Setup (Optional)

If you want to use MySQL for advertiser data:

```sql
CREATE DATABASE taskkash;
USE taskkash;

CREATE TABLE advertisers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nameEn VARCHAR(255),
  nameAr VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert test advertiser (password: advertiser123)
INSERT INTO advertisers (email, password, nameEn, slug, isActive)
VALUES (
  'advertiser@example.com',
  '$2a$10$YourHashedPasswordHere',
  'Test Advertiser',
  'test-advertiser',
  true
);
```

---

## 📦 Build Commands

### Development Mode
```bash
pnpm dev
```
- Runs on port 3000
- Hot reload enabled
- Development tools available

### Production Build
```bash
pnpm build
```
- Builds frontend to `dist/public`
- Builds backend to `dist/index.js`
- Optimized for production

### Production Start
```bash
pnpm start
```
- Runs on port 3001 (or PORT from .env)
- Serves built files
- Production optimizations enabled

---

## 🌐 Deployment Options

### Option 1: Local Server

```bash
# Build the project
pnpm build

# Start the server
PORT=3001 pnpm start
```

### Option 2: PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Build the project
pnpm build

# Start with PM2
pm2 start dist/index.js --name taskkash

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### Option 3: Docker

Create `Dockerfile`:
```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

EXPOSE 3001

CMD ["pnpm", "start"]
```

Build and run:
```bash
docker build -t taskkash-v2 .
docker run -p 3001:3001 taskkash-v2
```

### Option 4: Cloud Platforms

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

---

## 🔧 Configuration

### Port Configuration

Change the port in `.env`:
```env
PORT=8080
```

Or set it when starting:
```bash
PORT=8080 pnpm start
```

### Database Configuration

Update MySQL connection in `.env`:
```env
DATABASE_URL=mysql://user:pass@host:3306/database
```

### Security Configuration

For production, update these in `server/_core/auth-routes.ts`:

1. Change admin password
2. Use environment variables for credentials
3. Add rate limiting
4. Enable HTTPS

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Dependencies Installation Failed

```bash
# Clear cache and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Build Errors

```bash
# Clean build and rebuild
rm -rf dist
pnpm build
```

### Database Connection Issues

1. Check MySQL is running
2. Verify credentials in `.env`
3. Test connection:
   ```bash
   mysql -u username -p -h localhost
   ```

---

## 📝 Verification Steps

After setup, verify everything works:

### 1. Check Server is Running
```bash
curl http://localhost:3001
```

### 2. Test User Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmed@example.com","password":"password123"}'
```

### 3. Test Admin Login
```bash
curl -X POST http://localhost:3001/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@taskkash.com","password":"admin123"}'
```

### 4. Access Admin Panel

Open browser: http://localhost:3001/admin/login

---

## 🎯 Next Steps

After successful setup:

1. **Test all features**
   - User login and registration
   - Admin panel access
   - Advertiser dashboard

2. **Customize settings**
   - Update branding
   - Configure email settings
   - Set up payment methods

3. **Security hardening**
   - Change default passwords
   - Enable HTTPS
   - Add rate limiting

4. **Deploy to production**
   - Choose hosting platform
   - Configure domain
   - Set up SSL certificate

---

## 📞 Need Help?

If you encounter issues:

1. Check the logs:
   ```bash
   # Server logs
   tail -f /tmp/server.log
   
   # PM2 logs
   pm2 logs taskkash
   ```

2. Check browser console for frontend errors

3. Verify all dependencies are installed:
   ```bash
   pnpm list
   ```

4. Review the README_COMPLETE.md for detailed information

---

## ✅ Setup Complete!

Once you see "Server running on http://localhost:3001/" you're ready to go!

**Enjoy using TASKKASH v2!** 🚀
