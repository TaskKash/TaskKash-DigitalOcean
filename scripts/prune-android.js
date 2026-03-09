import fs from 'fs';
import path from 'path';

const androidAssetsPath = path.resolve('android/app/src/main/assets/public/videos');

if (fs.existsSync(androidAssetsPath)) {
    console.log('🗑️ Removing large video assets from Android build folder to reduce APK size...');
    fs.rmSync(androidAssetsPath, { recursive: true, force: true });
    console.log('✅ Videos excluded from native bundle.');
} else {
    console.log('ℹ️ No videos folder found in Android assets, skipping cleanup.');
}
