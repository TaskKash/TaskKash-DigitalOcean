import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taskkash.app',
  appName: 'TaskKash',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
