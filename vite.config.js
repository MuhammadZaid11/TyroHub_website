import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load all environment variables (including those without VITE_ prefix)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      'process.env.NEXT_PUBLIC_FIREBASE_API_KEY': JSON.stringify(env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyB4RJVj9-RsIFM4DWr818d9ZVj4ar9JxDQ'),
      'process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'tyrohub-1e464.firebaseapp.com'),
      'process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID': JSON.stringify(env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'tyrohub-1e464'),
      'process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'tyrohub-1e464.appspot.com'), // standard bucket fallback
      'process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1022877681671'),
      'process.env.NEXT_PUBLIC_FIREBASE_APP_ID': JSON.stringify(env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1022877681671:web:6c9a11d419c027bfaf02a2'),
      'process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID': JSON.stringify(env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-B6MZZ3X3ZK'),
    },
    server: {
      port: 3000,
      host: true
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: './index.html'
        }
      }
    }
  };
});
