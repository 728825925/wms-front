// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import './assets/main.css'
import '@/icons/iconify-bundle.js'

import App from './App.vue'
import router from './router'
import { Icon } from '@iconify/vue'
import customLoadingDirective from '@/directives/custom-loading'
import permission from '@/directives/permission'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'

// ✅ 1. 创建 app 和 pinia
const app = createApp(App)
const pinia = createPinia()

// ✅ 2. 使用插件
pinia.use(piniaPluginPersistedstate)

app.use(ElementPlus, { locale: zhCn })
app.component('IconifyIcon', Icon)
app.directive('custom-loading', customLoadingDirective)
app.directive('permission', permission)
const elementPlusConfig = { locale: zhCn }

// ✅ 3. 定义一个共享的 appContext 对象
const appContext = {
  plugins: [
    { plugin: pinia },
    { plugin: router },
    { plugin: ElementPlus, options: elementPlusConfig } // 带配置
  ], directives: {
    'custom-loading': customLoadingDirective,
    'permission': permission
  },
  components: {
    'IconifyIcon': Icon
  },
  config: {
    locale: zhCn // Element Plus 语言包
  }
}

// ✅ 4. 挂载前初始化
async function initApp() {
  app.use(pinia)
  const authStore = useAuthStore(pinia)
  const menuStore = useMenuStore(pinia)

  if (authStore.token) {
    await menuStore.initDynamicRoutes()
  }

  app.use(router)
  app.mount('#app')
}

initApp().catch(err => {
  console.error('应用初始化失败:', err)
})

// ✅ 5. 导出 app 和 appContext
export { app, appContext }