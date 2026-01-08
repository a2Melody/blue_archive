import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            // 将 @ 映射到 ./src，便于在代码里使用 @/xxx 导入
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        host: true,
        port: 5173,
        proxy: {
            '/api': {
                target: 'https://localhost:8443',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, '/api')
            }
        }
    }
})