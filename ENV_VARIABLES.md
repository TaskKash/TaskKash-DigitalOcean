# Environment Variables Documentation

This document lists all environment variables used in TASKKASH v2.

## 📋 Required Variables

### Database
- `DATABASE_URL` - SQLite database file path
  - Example: `file:./.data/sqlite.db`

### Authentication
- `JWT_SECRET` - Secret key for JWT token signing
- `OAUTH_SERVER_URL` - OAuth server URL (Manus platform)
- `OWNER_OPEN_ID` - Owner's OpenID from OAuth
- `OWNER_NAME` - Owner's display name

### Application
- `VITE_APP_TITLE` - Application title shown in browser
  - Default: "TASKKASH"
- `VITE_APP_LOGO` - Path to logo file
  - Default: "/taskkash-logo.png"
- `VITE_APP_ID` - Unique application identifier

### OAuth
- `VITE_OAUTH_PORTAL_URL` - OAuth portal URL for authentication

## 📊 Optional Variables

### Analytics
- `VITE_ANALYTICS_WEBSITE_ID` - Website ID for analytics tracking
- `VITE_ANALYTICS_ENDPOINT` - Analytics service endpoint

### API Keys (Manus AI Features)
- `BUILT_IN_FORGE_API_KEY` - Backend Forge API key
- `BUILT_IN_FORGE_API_URL` - Forge API endpoint
- `VITE_FRONTEND_FORGE_API_KEY` - Frontend Forge API key
- `VITE_FRONTEND_FORGE_API_URL` - Frontend Forge API endpoint

## 🔒 Security Notes

1. **Never commit `.env` file** to version control
2. **Change all secrets** in production environment
3. **VITE_ prefix** means the variable is exposed to the client browser
4. **Non-VITE_ variables** are server-side only and secure

## 📝 How to Configure

### On Manus Platform:
1. Go to Management UI → Settings → Secrets
2. Add/edit environment variables
3. Restart the application

### Self-Hosting:
1. Copy environment variables to `.env` file
2. Update values according to your setup
3. Restart the server

## 🎨 Customization Variables

To customize the application appearance:

- **Logo:** Update `VITE_APP_LOGO` in Settings → General
- **Title:** Update `VITE_APP_TITLE` in Settings → General
- **Colors:** Edit `client/src/index.css` (no env variable needed)

## ⚠️ Important

All environment variables listed above are already configured in the current deployment. When setting up in a new environment, you'll need to configure them again.
