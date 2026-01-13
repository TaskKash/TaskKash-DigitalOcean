# TaskKash Comprehensive Deployment Guide

**Version**: 2.1  
**Last Updated**: November 6, 2025  
**Author**: Manus AI

---

## Table of Contents

1. [Introduction](#introduction)
2. [Server Requirements](#server-requirements)
3. [Pre-Installation Checklist](#pre-installation-checklist)
4. [Installation Steps](#installation-steps)
5. [Database Setup](#database-setup)
6. [Application Configuration](#application-configuration)
7. [Building and Deployment](#building-and-deployment)
8. [Nginx Configuration](#nginx-configuration)
9. [SSL Certificate Setup](#ssl-certificate-setup)
10. [Post-Deployment Testing](#post-deployment-testing)
11. [Troubleshooting](#troubleshooting)
12. [Maintenance and Updates](#maintenance-and-updates)

---

## 1. Introduction

TaskKash is a bilingual (English/Arabic) video task completion platform with a rewards system. Users watch brand videos, answer verification questions, earn money, and withdraw earnings. This guide provides step-by-step instructions for deploying TaskKash in any production environment.

### Key Features

- **Bilingual Support**: Full English and Arabic translations with RTL support
- **Video Task System**: 30 video tasks from 10 Egyptian advertisers
- **Wallet System**: Complete transaction history and withdrawal functionality
- **Retry Mechanism**: 3 attempts per task with answer review
- **Responsive Design**: Mobile-first design optimized for all devices
- **Advertiser Filtering**: Filter tasks by advertiser
- **Profile Strength**: Gamified profile completion system

---

## 2. Server Requirements

### 2.1. Hardware Requirements

| Component   | Minimum Requirement | Recommended Specification | Notes                                    |
|-------------|---------------------|---------------------------|------------------------------------------|
| **CPU**     | 2 Cores             | 4 Cores or more           | Multi-core processors improve performance |
| **RAM**     | 4 GB                | 8 GB or more              | More RAM allows for better caching       |
| **Storage** | 50 GB SSD           | 100 GB NVMe SSD or more   | SSD is required for database performance |
| **Network** | 100 Mbps            | 1 Gbps                    | Higher bandwidth for video streaming     |

### 2.2. Software Requirements

| Software          | Version Required | Installation Source                                  |
|-------------------|------------------|------------------------------------------------------|
| **Operating System** | Ubuntu 22.04 LTS | https://ubuntu.com/download/server                   |
| **Node.js**       | v22.x            | https://nodejs.org/ or via nvm                       |
| **pnpm**          | v9.x or higher   | `npm install -g pnpm`                                |
| **MySQL**         | v8.x             | `sudo apt install mysql-server`                      |
| **Nginx**         | Latest stable    | `sudo apt install nginx`                             |
| **PM2**           | Latest           | `npm install -g pm2`                                 |
| **Git**           | Latest           | `sudo apt install git`                               |

### 2.3. Network Requirements

- **Domain Name**: A registered domain name pointing to your server's IP address
- **SSL Certificate**: Required for HTTPS (can use Let's Encrypt for free)
- **Firewall**: Configure to allow ports 80 (HTTP), 443 (HTTPS), and 22 (SSH)
- **DNS**: Properly configured A records pointing to your server

---

## 3. Pre-Installation Checklist

Before starting the installation, ensure you have:

- [ ] A server meeting the hardware requirements
- [ ] Root or sudo access to the server
- [ ] A registered domain name
- [ ] DNS configured to point to your server
- [ ] SSH access to the server
- [ ] Basic knowledge of Linux command line
- [ ] Database credentials ready (username, password)
- [ ] A strong JWT secret generated

### Generate JWT Secret

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 4. Installation Steps

### 4.1. Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 4.2. Install System Dependencies

```bash
sudo apt install -y nginx mysql-server git curl build-essential
```

### 4.3. Install Node.js via nvm

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load nvm
source ~/.bashrc

# Install Node.js v22
nvm install 22
nvm use 22
nvm alias default 22

# Verify installation
node --version  # Should output v22.x.x
```

### 4.4. Install pnpm

```bash
npm install -g pnpm

# Verify installation
pnpm --version  # Should output 9.x.x or higher
```

### 4.5. Install PM2

```bash
npm install -g pm2

# Verify installation
pm2 --version
```

---

## 5. Database Setup

### 5.1. Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

Follow the prompts to:
- Set a root password
- Remove anonymous users
- Disallow root login remotely
- Remove test database
- Reload privilege tables

### 5.2. Create Database and User

```bash
# Log in to MySQL as root
sudo mysql -u root -p
```

Execute the following SQL commands:

```sql
-- Create the database
CREATE DATABASE taskkash CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a dedicated user
CREATE USER 'taskkash_user'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON taskkash.* TO 'taskkash_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 5.3. Import Database Schema

Extract the deployment package and import the schema:

```bash
# Extract the package
tar -xzf TaskKash_Deployment_Package_v2.1.tar.gz
cd taskkash-v2

# Import the schema
mysql -u taskkash_user -p taskkash < taskkash_schema.sql
```

Enter the password when prompted.

### 5.4. Verify Database

```bash
# Log in to verify
mysql -u taskkash_user -p taskkash

# Check tables
SHOW TABLES;

# Exit
EXIT;
```

You should see tables like `users`, `tasks`, `advertisers`, `questions`, `transactions`, etc.

---

## 6. Application Configuration

### 6.1. Navigate to Application Directory

```bash
cd /path/to/taskkash-v2
```

### 6.2. Create Environment Configuration

```bash
# Copy the template
cp .env.template .env

# Edit the file
nano .env
```

### 6.3. Configure Environment Variables

Update the `.env` file with your actual values:

```env
# Database Configuration
DATABASE_URL="mysql://taskkash_user:YourStrongPassword123!@localhost:3306/taskkash"

# Security - IMPORTANT: Use strong, unique secrets
JWT_SECRET="your-generated-jwt-secret-here"
SESSION_SECRET="your-generated-session-secret-here"

# Application Metadata
VITE_APP_ID="taskkash_prod"
VITE_APP_TITLE="TaskKash"
VITE_APP_LOGO="/taskkash-logo.png"

# Environment
NODE_ENV="production"

# Server Configuration
PORT=3000
```

**Important**: Replace all placeholder values with your actual configuration.

---

## 7. Building and Deployment

### 7.1. Install Dependencies

```bash
pnpm install
```

This will install all required packages for both frontend and backend.

### 7.2. Build the Application

```bash
pnpm run build
```

This command:
- Builds the React frontend (output: `dist/public/`)
- Compiles the TypeScript backend (output: `dist/`)
- Optimizes assets for production

### 7.3. Deploy with PM2

#### Option 1: Using the Deployment Script

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

#### Option 2: Manual PM2 Setup

```bash
# Start the application
pm2 start dist/index.js --name "taskkash-app"

# Configure PM2 to start on system boot
pm2 startup

# Save the PM2 process list
pm2 save
```

### 7.4. Verify Application is Running

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs taskkash-app

# Monitor in real-time
pm2 monit
```

---

## 8. Nginx Configuration

### 8.1. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/taskkash
```

Copy the content from `nginx.conf.template` and replace:
- `YOUR_DOMAIN.COM` with your actual domain
- SSL certificate paths (we'll set these up in the next section)

### 8.2. Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/taskkash /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# If test passes, restart Nginx
sudo systemctl restart nginx
```

---

## 9. SSL Certificate Setup

### 9.1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 9.2. Obtain SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts to:
- Enter your email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### 9.3. Verify SSL Certificate

Visit `https://yourdomain.com` in your browser. You should see a secure connection (padlock icon).

### 9.4. Set Up Auto-Renewal

Certbot automatically sets up a cron job for renewal. Verify it:

```bash
sudo certbot renew --dry-run
```

---

## 10. Post-Deployment Testing

### 10.1. Test Application Access

1. Open your browser and navigate to `https://yourdomain.com`
2. You should see the TaskKash welcome page

### 10.2. Test User Login

Use the test credentials:

| Email                  | Password    | Role | Balance |
|------------------------|-------------|------|---------|
| ahmed@example.com      | password123 | User | 200 EGP |
| fatima@example.com     | password123 | User | 500 EGP |
| omar@example.com       | password123 | User | 2000 EGP |

### 10.3. Test Core Features

- [ ] User login and authentication
- [ ] Home page displays correctly
- [ ] Tasks page shows all 30 tasks
- [ ] Advertiser filter works
- [ ] Video player loads and plays
- [ ] Questions appear after watching 80% of video
- [ ] Answer submission and retry mechanism
- [ ] Wallet page shows transactions
- [ ] Total earnings calculation is correct
- [ ] Notification badge is visible (red background)
- [ ] Language toggle (English/Arabic) works
- [ ] RTL layout for Arabic
- [ ] Profile page displays user information
- [ ] Logout functionality works

### 10.4. Test Mobile Responsiveness

Access the application from a mobile device and verify:
- [ ] Layout is responsive
- [ ] Video player works on mobile
- [ ] Touch interactions work properly
- [ ] Arabic RTL displays correctly

---

## 11. Troubleshooting

### 11.1. Application Won't Start

**Symptom**: PM2 shows the app as stopped or errored.

**Solution**:
```bash
# Check logs
pm2 logs taskkash-app

# Common issues:
# 1. Database connection error - verify DATABASE_URL in .env
# 2. Port already in use - change PORT in .env
# 3. Missing dependencies - run pnpm install again
```

### 11.2. Database Connection Error

**Symptom**: Error messages about database connection in logs.

**Solution**:
```bash
# Verify MySQL is running
sudo systemctl status mysql

# Test database connection
mysql -u taskkash_user -p taskkash

# Check DATABASE_URL format in .env
# Correct format: mysql://username:password@host:port/database
```

### 11.3. Nginx 502 Bad Gateway

**Symptom**: Nginx shows 502 error when accessing the site.

**Solution**:
```bash
# Check if Node.js app is running
pm2 status

# Verify the app is listening on the correct port
sudo netstat -tulpn | grep 3000

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### 11.4. SSL Certificate Issues

**Symptom**: Browser shows SSL certificate error.

**Solution**:
```bash
# Verify certificate files exist
sudo ls -la /etc/letsencrypt/live/yourdomain.com/

# Test certificate
sudo certbot certificates

# Renew if needed
sudo certbot renew
```

### 11.5. Translation Keys Not Displaying

**Symptom**: Seeing keys like `profileStrength.title` instead of translated text.

**Solution**:
```bash
# Rebuild the application
pnpm run build

# Restart PM2
pm2 restart taskkash-app

# Clear browser cache on client side
```

### 11.6. Total Earnings Shows 0

**Symptom**: Wallet page shows 0 for total earnings despite having transactions.

**Solution**: This was fixed in v2.1. If you're still seeing this:
```bash
# Pull latest code
git pull

# Rebuild
pnpm run build

# Restart
pm2 restart taskkash-app
```

---

## 12. Maintenance and Updates

### 12.1. Regular Maintenance Tasks

#### Daily
- Monitor PM2 logs: `pm2 logs taskkash-app`
- Check disk space: `df -h`

#### Weekly
- Review Nginx access logs: `sudo tail -f /var/log/nginx/taskkash_access.log`
- Check for failed transactions in database

#### Monthly
- Update system packages: `sudo apt update && sudo apt upgrade`
- Review and archive old logs
- Backup database

### 12.2. Database Backup

```bash
# Create backup directory
mkdir -p ~/backups

# Backup database
mysqldump -u taskkash_user -p taskkash > ~/backups/taskkash_$(date +%Y%m%d).sql

# Compress backup
gzip ~/backups/taskkash_$(date +%Y%m%d).sql
```

### 12.3. Application Updates

```bash
# Navigate to application directory
cd /path/to/taskkash-v2

# Pull latest changes (if using Git)
git pull

# Install any new dependencies
pnpm install

# Rebuild application
pnpm run build

# Restart PM2
pm2 restart taskkash-app

# Verify
pm2 status
```

### 12.4. Monitoring

Consider setting up monitoring tools:

- **PM2 Plus**: For application monitoring
- **Uptime Robot**: For uptime monitoring
- **New Relic**: For performance monitoring
- **Sentry**: For error tracking

---

## Appendix A: File Structure

```
taskkash-v2/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── lib/               # Utilities and i18n
│   │   └── contexts/          # React contexts
│   └── public/                # Static assets
├── server/                     # Backend Express application
│   ├── routes/                # API routes
│   ├── db/                    # Database queries
│   └── index.ts               # Server entry point
├── dist/                       # Built application (generated)
├── .env                        # Environment configuration
├── .env.template               # Environment template
├── deploy.sh                   # Deployment script
├── nginx.conf.template         # Nginx configuration template
├── taskkash_schema.sql         # Database schema
├── DATABASE_SCHEMA.md          # Schema documentation
├── SETUP.md                    # Setup instructions
└── README.md                   # Project readme
```

---

## Appendix B: Environment Variables Reference

| Variable                | Required | Default      | Description                                  |
|-------------------------|----------|--------------|----------------------------------------------|
| `DATABASE_URL`          | Yes      | -            | MySQL connection string                      |
| `JWT_SECRET`            | Yes      | -            | Secret for JWT token signing                 |
| `SESSION_SECRET`        | Yes      | -            | Secret for session encryption                |
| `NODE_ENV`              | Yes      | development  | Environment (development/production)         |
| `PORT`                  | No       | 3000         | Port for the application server              |
| `VITE_APP_ID`           | Yes      | -            | Application identifier                       |
| `VITE_APP_TITLE`        | Yes      | -            | Application title                            |
| `VITE_APP_LOGO`         | Yes      | -            | Path to application logo                     |
| `VITE_OAUTH_PORTAL_URL` | No       | -            | OAuth server URL (if using OAuth)            |
| `OAUTH_SERVER_URL`      | No       | -            | OAuth server URL for backend (if using OAuth)|

---

## Appendix C: Common PM2 Commands

| Command                              | Description                          |
|--------------------------------------|--------------------------------------|
| `pm2 start dist/index.js --name app` | Start application                    |
| `pm2 stop app`                       | Stop application                     |
| `pm2 restart app`                    | Restart application                  |
| `pm2 delete app`                     | Remove application from PM2          |
| `pm2 logs app`                       | View application logs                |
| `pm2 logs app --lines 100`           | View last 100 log lines              |
| `pm2 monit`                          | Monitor all applications             |
| `pm2 status`                         | Show status of all applications      |
| `pm2 save`                           | Save current process list            |
| `pm2 startup`                        | Generate startup script              |
| `pm2 list`                           | List all applications                |

---

## Appendix D: Support and Resources

### Official Resources

- **Node.js Documentation**: https://nodejs.org/docs/
- **MySQL Documentation**: https://dev.mysql.com/doc/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **Let's Encrypt**: https://letsencrypt.org/

### Community Support

- **Stack Overflow**: https://stackoverflow.com/
- **GitHub Issues**: For project-specific issues
- **Digital Ocean Community**: https://www.digitalocean.com/community/

---

## Conclusion

This comprehensive guide provides all the necessary information to deploy TaskKash in any production environment. By following these steps carefully and ensuring all requirements are met, you should be able to deploy the application successfully without encountering the issues experienced in initial deployments.

If you encounter any issues not covered in this guide, please refer to the troubleshooting section or consult the official documentation for the relevant technologies.

**Good luck with your deployment!**

---

**Document Version**: 2.1  
**Last Updated**: November 6, 2025  
**Author**: Manus AI  
**License**: MIT
