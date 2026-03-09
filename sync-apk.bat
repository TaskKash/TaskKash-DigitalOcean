@echo off
echo ========================================
echo TaskKash APK Preparation Tool
echo ========================================
cd /d %~dp0

echo [1/1] Running Complete Web Build ^& Android Sync...
call npm run build

echo ----------------------------------------
echo ✅ DONE! The latest code is now inside the Android folder.
echo 📲 Go to Android Studio and click: Build -^> Build APK(s)
echo ----------------------------------------
pause
