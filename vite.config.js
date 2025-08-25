
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'
import svgLoader from 'vite-svg-loader'
// import jsx from '@vitejs/plugin-vue-jsx'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    Icons({
      compiler: 'vue3',
      autoInstall: true
    }),
    vue(),
    vueJsx({
      // 包含.jsx文件
      include: /\.(jsx|tsx|js|ts)$/,
      // 排除node_modules
      exclude: /node_modules/
    }),
    vueDevTools(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver(), IconsResolver({ prefix: 'Icon' })],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver(), IconsResolver({ enabledCollections: ['ep'] })],
      dts: 'src/components.d.ts',
    }),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(fileURLToPath(new URL('./src/icons', import.meta.url)))],
      symbolId: 'icon-[dir]-[name]',
    }),
    svgLoader(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 9527
  }
})
