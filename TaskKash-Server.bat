@echo off
title TaskKash Dev Server
echo =====================================
echo  TaskKash Dev Server Manager
echo =====================================
echo.
echo [1] Start Server
echo [2] Stop Server
echo [3] Restart Server
echo [4] View Live Logs
echo [5] Check Status
echo [6] Exit
echo.
set /p choice="Choose an option: "

if "%choice%"=="1" (
    pm2 start ecosystem.config.cjs
    echo Server started! Visit http://localhost:3001
    pause
)
if "%choice%"=="2" (
    pm2 stop taskkash-dev
    echo Server stopped.
    pause
)
if "%choice%"=="3" (
    pm2 restart taskkash-dev
    echo Server restarted! Visit http://localhost:3001
    pause
)
if "%choice%"=="4" (
    pm2 logs taskkash-dev
)
if "%choice%"=="5" (
    pm2 status
    pause
)
if "%choice%"=="6" exit
