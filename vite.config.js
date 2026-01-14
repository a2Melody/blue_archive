import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'

const HMR_HOST = process.env.VITE_HMR_HOST || undefined // 可选：填你的 ngrok 域名

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        allowedHosts: true, // 或改成数组白名单：['.ngrok-free.dev', '.netlify.app']
        // HMR 在 ngrok 下更稳定
        hmr: HMR_HOST ? { protocol: 'wss', host: HMR_HOST, clientPort: 443 } : undefined,
        proxy: {
            // API 走本机后端（Vite 在本机，能访问 localhost）
            '/api': {
                target: 'https://localhost:8443',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, '/api')
            },
            // WebSocket 代理到后端（/ws/chat）
            '/ws': {
                target: 'https://localhost:8443',
                ws: true,
                changeOrigin: true,
                secure: false
            }
        }
    }
})