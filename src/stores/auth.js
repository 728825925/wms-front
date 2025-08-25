import { defineStore } from 'pinia'
import { useMenuStore } from './menu'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    userInfo: null,
    permissions: [],
    roles: []
  }),

  actions: {
    setToken(val) {
      this.token = val;
      if (val) {
        localStorage.setItem('token', val);
      } else {
        localStorage.removeItem('token');
      }
    },
    setUserInfo(info) {
      this.userInfo = info;
    },
    setPermissions(perms) {
      this.permissions = perms;
    },
    setRoles(rs) {
      this.roles = rs;
    },
    logout() {
      const menuStore = useMenuStore()
      menuStore.resetRoutes() 
      localStorage.clear()
      sessionStorage.clear()
      this.$reset();
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    }
  },
  persist: true
})
