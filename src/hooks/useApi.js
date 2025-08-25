import { ref } from 'vue'

export function useApi(apiFn, options = {}) {
  const loading = ref(false)
  const data = ref(null)
  const error = ref(null)

  const run = async (...args) => {
    loading.value = true
    error.value = null
    try {
      const res = await apiFn(...args)
      if (res && res.code === 200) {
        data.value = res
        // 不再弹窗
        return res.data
      } else {
        error.value = res?.msg || '请求失败'
        // 不再弹窗
        return null
      }
    } catch (e) {
      error.value = e.message || '网络错误'
      // 不再弹窗
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, data, error, run }
} 