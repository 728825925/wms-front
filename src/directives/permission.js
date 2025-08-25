import { useAuthStore } from '@/stores/auth'

export default {
  // 当指令绑定到元素时触发（页面加载、组件挂载）
  mounted(el, binding) {
    // 获取传入的权限标识
    const { value: permission } = binding

    // 表示“无需控制”，直接显示
    if (!permission) {
      return
    }
    // 获取当前用户的权限列表
    const authStore = useAuthStore()
    const userPermissions = authStore.permissions
    // 判断是否有权限
    const hasPermission = userPermissions.includes(permission)

    // 如果没有权限，隐藏该元素
    if (!hasPermission) {
        el.parentNode.removeChild(el)
    }
  },

  //当 VNode 更新时触发（比如权限动态变化）
  updated(el, binding) {
    const { value: permission } = binding
    if (!permission) {
      return
    }
    const authStore = useAuthStore()
    const userPermissions = authStore.permissions

    const hasPermission = userPermissions.includes(permission)

    if (!hasPermission) {
      el.style.display = 'none'
    } else {
      el.style.display = '' // 恢复显示
    }
  }
}