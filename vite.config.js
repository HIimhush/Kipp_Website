import { defineConfig } from 'vite';

export default defineConfig({
    publicDir: 'public',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            output: {
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name.endsWith('.gltf') ||
                        assetInfo.name.endsWith('.bin') ||
                        assetInfo.name.endsWith('.ttf') ||
                        assetInfo.name.endsWith('.woff') ||
                        assetInfo.name.endsWith('.woff2')) {
                        return 'assets/[name]-[hash][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                }
            }
        }
    }
});
