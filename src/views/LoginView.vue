<template>
  <div class="login-container">
    <div class="login-background">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">欢迎登录</h1>
          <p class="login-subtitle">请输入您的账号信息</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              clearable
            >
              <template #prefix>
                <IconUser class="input-icon" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              clearable
            >
              <template #prefix>
                <IconLock class="input-icon" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <el-link :underline="false">忘记密码？</el-link>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-button"
              :loading="loading"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <p>还没有账号？ <el-link type="primary" :underline="false">立即注册</el-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IconUser from '../components/icons/IconUser.vue'
import IconLock from '../components/icons/IconLock.vue'
import { useAuthStore } from '../stores/auth'
import { loginApi, getUserInfo } from '../api'
import { useApi } from '@/hooks/useApi'
import { useMenuStore } from '@/stores/menu'
import router from '@/router'

export default {
  name: 'LoginView',
  components: {
    IconUser,
    IconLock,
  },
  data() {
    return {
      loading: false,
      rememberMe: false,
      loginForm: {
        username: '',
        password: '',
      },
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
        ],
      },
      loginApiHook: null,
      userInfoApiHook: null,
    }
  },
  created() {
    this.loginApiHook = useApi(loginApi)
    this.userInfoApiHook = useApi(getUserInfo)
  },
  methods: {
    async handleLogin() {
      if (!this.$refs.loginFormRef) return
      try {
        await this.$refs.loginFormRef.validate()
        this.loading = true
        const loginRes = await this.loginApiHook.run({
          account: this.loginForm.username,
          password: this.loginForm.password,
          rememberMe: this.rememberMe,
        })
        if (loginRes && loginRes.token) {
          const authStore = useAuthStore()
          const menuStore = useMenuStore()
          // 1. 设置token
          authStore.setToken(loginRes.token)
          try {
            // 2. 获取用户信息
            const userInfoRes = await this.userInfoApiHook.run()
            if (userInfoRes && userInfoRes.userInfo && typeof userInfoRes.userInfo === 'object') {
              authStore.setUserInfo(userInfoRes.userInfo)
              authStore.setPermissions(userInfoRes.permissions)
              authStore.setRoles(userInfoRes.roles)
            } else {
              this.$message.warning('用户信息获取失败，请联系管理员')
              throw new Error('用户信息获取失败')
            }
            // 3. 获取并注册菜单路由
            await menuStore.initDynamicRoutes();
            // debugger;
            // 4. 跳转到首页
            await router.push(menuStore.homeRoute.path || '/home') // 使用store中的home路径
          } catch (error) {
            console.error('登录后初始化失败:', error)
            // 失败时清除token
            // authStore.clearToken()  
            this.$message.error('系统初始化失败，请稍后重试')
          }
        } else {
          this.$message.error('登录失败，请检查用户名和密码')
        }
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  min-width: 100vw;
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
}

.login-background {
  width: 100vw;
  height: 100vh;
  max-width: none;
  max-height: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  backdrop-filter: blur(10px);
  width: 400px;
  max-width: 480px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
  transition: all 0.3s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.input-icon {
  color: #7f8c8d;
  font-size: 16px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-button {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.login-footer p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
    width: 100%;
    max-width: 100vw;
  }

  .login-title {
    font-size: 24px;
  }

  .login-options {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}

/* 动画效果 */
.login-card {
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 复选框样式优化 */
.login-form :deep(.el-checkbox__label) {
  color: #7f8c8d;
  font-size: 14px;
}

/* 链接样式优化 */
.login-form :deep(.el-link) {
  font-size: 14px;
}

.login-footer :deep(.el-link) {
  font-size: 14px;
}
</style> 