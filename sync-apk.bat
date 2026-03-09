@echo off
echo 🚀 Starting TaskKash APK Build & Sync...
echo ----------------------------------------
cd /d %~dp0

echo 📦 Running Web Production Build...
call npm run build

echo 🔄 Syncing with Android Native Project...
call npx cap sync

echo 🧹 Pruning Large Assets...
node scripts/prune-android.js

echo ----------------------------------------
echo ✅ APK Build and Sync Completed!
echo 📲 Open Android Studio and click Build -> Build APK(s)
echo ----------------------------------------
pause
