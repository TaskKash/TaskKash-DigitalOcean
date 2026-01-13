# TaskKash Production Deployment Guide

**Author:** Manus AI  
**Version:** 2.0  
**Date:** 2025-11-12

## 1. Introduction

This document provides a comprehensive guide for deploying the TaskKash platform to a production environment. It covers server requirements, database setup, application configuration, and deployment steps to ensure a smooth and successful launch.

## 2. Server Requirements

### 2.1. Minimum Requirements (for small-scale testing)
- **CPU:** 2 vCPU cores
- **RAM:** 4 GB
- **Storage:** 40 GB SSD
- **OS:** Ubuntu 22.04 LTS

### 2.2. Recommended Requirements (for production)
- **CPU:** 4 vCPU cores (ARM or x86)
- **RAM:** 8 GB
- **Storage:** 80 GB NVMe SSD
- **OS:** Ubuntu 22.04 LTS

## 3. Software Dependencies

- **Node.js:** v22.x (Install via NVM)
- **MySQL:** v8.0
- **pnpm:** v10.x (Install via `npm install -g pnpm`)
- **PM2:** Process manager for Node.js (Install via `pnpm install -g pm2`)
- **Nginx:** Web server and reverse proxy

## 4. Database Setup

### 4.1. Create Database and User

```sql
CREATE DATABASE taskkash CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'taskkash_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON taskkash.* TO 'taskkash_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4.2. Import Schema and Data

1. **Import Schema:**
   ```bash
   mysql -u taskkash_user -p taskkash < database_schema.sql
   ```

2. **Import Sample Data (Optional):**
   ```bash
   mysql -u taskkash_user -p taskkash < sample_data.sql
   ```

## 5. Application Setup

### 5.1. Clone the Repository

```bash
git clone https://github.com/your-repo/taskkash-v2.git
cd taskkash-v2
```

### 5.2. Install Dependencies

```bash
pnpm install
```

### 5.3. Configure Environment Variables

Create a `.env` file in the root directory with the following content:

```env
# Application
PORT=3005
NODE_ENV=production

# Database
DATABASE_URL="mysql://taskkash_user:YOUR_SECURE_PASSWORD@localhost:3306/taskkash"

# Authentication
SESSION_SECRET="YOUR_VERY_SECRET_SESSION_KEY"

# Manus SDK (if applicable)
MANUS_API_KEY="YOUR_MANUS_API_KEY"
```

### 5.4. Build the Application

```bash
pnpm build
```

## 6. Production Deployment

### 6.1. Start with PM2

```bash
pm2 start dist/index.js --name "taskkash-app"
```

### 6.2. Configure Nginx Reverse Proxy

Create a new Nginx config file at `/etc/nginx/sites-available/taskkash.com`:

```nginx
server {
    listen 80;
    server_name taskkash.com www.taskkash.com;

    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/taskkash.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6.3. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d taskkash.com -d www.taskkash.com
```

## 7. Backup Procedures

### 7.1. Daily Database Backup

Create a cron job to run a daily backup:

```bash
# /etc/cron.daily/taskkash_backup

#!/bin/bash

DATE=$(date +%Y-%m-%d)
mysqldump -u taskkash_user -pYOUR_SECURE_PASSWORD taskkash | gzip > /var/backups/taskkash/db_backup_$DATE.sql.gz
```

### 7.2. Weekly Application Backup

```bash
# /etc/cron.weekly/taskkash_app_backup

#!/bin/bash

DATE=$(date +%Y-%m-%d)
tar -czf /var/backups/taskkash/app_backup_$DATE.tar.gz /path/to/taskkash-v2
```

## 8. Known Issues

- **Wallet API:** The `/api/wallet` endpoint currently returns HTML instead of JSON due to a routing conflict. This needs to be investigated and fixed in a future update.

---

This guide provides all the necessary steps to deploy and maintain the TaskKash platform. For any questions, please refer to the source code or contact the development team.
