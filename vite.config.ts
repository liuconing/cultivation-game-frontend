import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * 移除開發 proxy 使用的 `/api` 前綴。
 *
 * @param requestPath - 瀏覽器送入 Vite dev server 的請求路徑。
 * @returns 後端實際公開的 API 路徑。
 */
const rewriteApiPath = (requestPath: string): string =>
  requestPath.replace(/^\/api/, '')

/** 建立前端開發、建置與 API proxy 設定。 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const apiProxyTarget =
    env.API_PROXY_TARGET ?? 'http://localhost:3001'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: rewriteApiPath,
        },
      },
    },
  }
})
