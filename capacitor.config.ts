import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wetrio.designcalculator',
  appName: 'Design Calculator - WeTrio',
  webDir: 'build',
  backgroundColor: '#15191C',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'never'
  }
};

export default config;
