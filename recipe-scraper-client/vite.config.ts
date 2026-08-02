import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
            manifest: {
                name: 'Reciply',
                short_name: 'Reciply',
                description: 'Scrape, save, and cook your recipes.',
                theme_color: '#080b0d',
                background_color: '#080b0d',
                display: 'standalone',
                start_url: '/',
                icons: [
                    { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
                    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
                    { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
        }),
    ],
    server: {
        proxy: {
            '/api': 'http://localhost:3000',
        },
    },
});
