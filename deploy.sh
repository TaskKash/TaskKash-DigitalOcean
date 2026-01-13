#!/bin/bash

# ============================================
# TaskKash Deployment Script
# ============================================
#
# This script automates the deployment process
# for the TaskKash application.
#
# Usage: ./deploy.sh
#
# ============================================

set -e  # Exit on any error

echo "============================================"
echo "TaskKash Deployment Script"
echo "============================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Please create a .env file from .env.template"
    echo "Run: cp .env.template .env"
    echo "Then edit .env with your configuration"
    exit 1
fi

echo "✓ .env file found"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js v22.x"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "ERROR: pnpm is not installed!"
    echo "Please install pnpm: npm install -g pnpm"
    exit 1
fi

echo "✓ pnpm version: $(pnpm --version)"
echo ""

# Install dependencies
echo "Installing dependencies..."
pnpm install
echo "✓ Dependencies installed"
echo ""

# Build the application
echo "Building application..."
pnpm run build
echo "✓ Application built successfully"
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "WARNING: PM2 is not installed!"
    echo "Installing PM2..."
    pnpm install -g pm2
fi

echo "✓ PM2 is available"
echo ""

# Stop existing PM2 process if running
echo "Stopping existing TaskKash process (if any)..."
pm2 stop taskkash-app 2>/dev/null || true
pm2 delete taskkash-app 2>/dev/null || true
echo "✓ Stopped existing process"
echo ""

# Start the application with PM2
echo "Starting TaskKash application..."
pm2 start dist/index.js --name "taskkash-app"
echo "✓ Application started"
echo ""

# Save PM2 configuration
echo "Saving PM2 configuration..."
pm2 save
echo "✓ PM2 configuration saved"
echo ""

echo "============================================"
echo "Deployment Complete!"
echo "============================================"
echo ""
echo "Application Status:"
pm2 status
echo ""
echo "To view logs: pm2 logs taskkash-app"
echo "To restart: pm2 restart taskkash-app"
echo "To stop: pm2 stop taskkash-app"
echo ""
