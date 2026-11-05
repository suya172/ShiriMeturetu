import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// GitHub Pages 用の base URL 設定
const getBasePath = () => {
  if (process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1]
    return `/${repoName}/`
  }
  return './'
}

// https://vite.dev/config/
export default defineConfig({
  base: getBasePath(),
  resolve: {
    alias: {
      path: 'path-browserify',
      'zlibjs/bin/gunzip.min.js': path.resolve(__dirname, 'src/shims/gunzip-shim.ts'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    vue(),
    tailwindcss(),
  ],
  build: {
    sourcemap: false,
  },
})
