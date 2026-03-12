import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taskkash.app',
  appName: 'TaskKash',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      // FIX: overlaysWebView=false ensures the status bar does NOT cover app content
      // This pushes the app below the phone's status bar icons
      overlaysWebView: false,
      style: "DARK",       // White icons on the dark green status bar background
      backgroundColor: "#1a3d2b" // Match app brand color
    },
    SplashScreen: {
      launchShowDuration: 2000,
      // FIX: Changed from white (#ffffff) to TaskKash brand dark green
      backgroundColor: "#1a3d2b",
      showSpinner: false,           // Logo only, no spinner (looks more premium)
      androidScaleType: "CENTER_CROP"
    }
  }
};

export default config;
