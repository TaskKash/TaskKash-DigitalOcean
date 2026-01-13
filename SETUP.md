
# TaskKash Deployment & Setup Guide

This guide provides comprehensive instructions for deploying the TaskKash application in any environment.

## 1. Server Requirements

### 1.1. Hardware

| Component   | Minimum Requirement | Recommended Specification |
|-------------|---------------------|---------------------------|
| **CPU**     | 2 Cores             | 4 Cores or more           |
| **RAM**     | 4 GB                | 8 GB or more              |
| **Storage** | 50 GB SSD           | 100 GB NVMe SSD or more   |

### 1.2. Software

- **Operating System**: Ubuntu 22.04 LTS (or other modern Linux distribution like CentOS, Debian).
- **Web Server**: Nginx (recommended) or Apache.
- **Node.js**: Version 22.x. You can install it using Node Version Manager (nvm) for easier management.
- **Process Manager**: PM2 is recommended to keep the application running continuously.
- **Database**: MySQL Server version 8.x.
- **Version Control**: Git for cloning the repository.

## 2. Installation & Setup

### 2.1. Install System Dependencies

Update your package manager and install necessary tools.

```bash
# For Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx mysql-server git curl
```

### 2.2. Install Node.js and pnpm

Install `nvm` and use it to install the correct Node.js version, then install `pnpm`.

```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Source nvm to use it in the current session
source ~/.bashrc

# Install Node.js v22 and set it as default
nvm install 22
nvm use 22
nvm alias default 22

# Install pnpm globally
npm install -g pnpm
```

### 2.3. Database Setup

1.  **Secure MySQL Installation**: Run the security script to set a root password and secure your MySQL instance.

    ```bash
    sudo mysql_secure_installation
    ```

2.  **Create Database and User**: Log in to MySQL as the root user and create the database and a dedicated user for the application.

    ```sql
    -- Log in to MySQL
    sudo mysql -u root -p

    -- Create the database
    CREATE DATABASE taskkash CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

    -- Create a new user and grant privileges
    CREATE USER 'taskkash_user'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
    GRANT ALL PRIVILEGES ON taskkash.* TO 'taskkash_user'@'localhost';

    -- Apply the changes
    FLUSH PRIVILEGES;

    -- Exit MySQL
    EXIT;
    ```

3.  **Import Database Schema**: Use the provided `taskkash_schema.sql` file to create the table structure.

    ```bash
    mysql -u taskkash_user -p taskkash < taskkash_schema.sql
    ```

## 3. Application Deployment

### 3.1. Clone the Repository

Clone the project source code from your Git repository.

```bash
# Replace with your repository URL
git clone https://your-git-repository.com/taskkash.git
cd taskkash
```

### 3.2. Configure Environment Variables

Create a `.env` file from the provided template and fill in the required values.

```bash
# Copy the template
cp .env.template .env

# Edit the .env file with your favorite editor (e.g., nano)
nano .env
```

Your `.env` file should look like this:

```env
# -- Database Configuration --
# Replace with your actual database credentials
DATABASE_URL="mysql://taskkash_user:YourStrongPassword123!@localhost:3306/taskkash"

# -- Security --
# IMPORTANT: Generate a new, strong, random secret for JWT
JWT_SECRET="generate-a-super-strong-random-secret-here"

# -- Application Metadata --
VITE_APP_ID="taskkash_prod"
VITE_APP_TITLE="TaskKash"
VITE_APP_LOGO="/taskkash-logo.png"

# -- Environment --
NODE_ENV="production"
```

### 3.3. Install Dependencies and Build

Install the project dependencies and build the application for production.

```bash
# Install dependencies
pnpm install

# Build the application (frontend and backend)
pnpm run build
```

### 3.4. Start the Application with PM2

Use PM2 to start the Node.js server and ensure it runs in the background and restarts automatically.

```bash
# Install PM2 globally
sudo pnpm install -g pm2

# Start the application
pm2 start dist/index.js --name "taskkash-app"

# Configure PM2 to start on system boot
pm2 startup

# Save the current process list
pm2 save
```

## 4. Nginx Configuration (Reverse Proxy)

Configure Nginx to act as a reverse proxy, which will handle incoming HTTP/S requests and forward them to the Node.js application.

1.  **Create an Nginx Configuration File**:

    ```bash
    sudo nano /etc/nginx/sites-available/taskkash
    ```

2.  **Add the Following Configuration**: Replace `your_domain.com` with your actual domain name.

    ```nginx
    server {
        listen 80;
        server_name your_domain.com www.your_domain.com;

        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name your_domain.com www.your_domain.com;

        # SSL Certificate paths (replace with your actual paths)
        ssl_certificate /etc/letsencrypt/live/your_domain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/your_domain.com/privkey.pem;

        location / {
            proxy_pass http://localhost:3000; # Forward requests to the Node.js app
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

3.  **Enable the Site and Restart Nginx**:

    ```bash
    # Create a symbolic link to enable the site
    sudo ln -s /etc/nginx/sites-available/taskkash /etc/nginx/sites-enabled/

    # Test the Nginx configuration for errors
    sudo nginx -t

    # Restart Nginx to apply the changes
    sudo systemctl restart nginx
    ```

## 5. Final Steps

- **SSL Certificate**: Use Let's Encrypt (`certbot`) to obtain a free SSL certificate for your domain.
- **Firewall**: Ensure your firewall (e.g., `ufw`) allows traffic on ports 80 and 443.
- **Monitoring**: Consider setting up monitoring for your server and application to track performance and uptime.

Your TaskKash application should now be successfully deployed and accessible at `https://your_domain.com`.
