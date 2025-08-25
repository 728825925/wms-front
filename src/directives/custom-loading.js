// src/directives/custom-loading.js
import { h, render } from 'vue'
import CustomLoading from '@/components/CustomLoading.vue'

// 默认配置
const DEFAULT_CONFIG = {
  active: true,
  text: '拼命加载中 ...',
  background: 'rgba(255, 255, 255, 0.7)',
  zIndex: 9999,
  minShowTime: 200 // 最少显示时间，单位毫秒
}

function normalizeConfig(value) {
  if (typeof value === 'boolean') {
    return { ...DEFAULT_CONFIG, active: value }
  }
  if (typeof value === 'string') {
    return { ...DEFAULT_CONFIG, text: value }
  }
  return { ...DEFAULT_CONFIG, ...value }
}

function handleLoading(el, binding) {
  const config = normalizeConfig(binding.value)
  
  if (!el._loadingContainer) {
    el.style.position = 'relative'
    
    const container = document.createElement('div')
    container.className = 'custom-loading-container'
    Object.assign(container.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: config.background,
      zIndex: config.zIndex
    })
    
    el._loadingContainer = container
    el._loadingInstance = h(CustomLoading, { text: config.text })
  }

  if (config.active) {
    // 记录开始显示时间
    el._loadingStartTime = Date.now()
    if (!el.contains(el._loadingContainer)) {
      render(el._loadingInstance, el._loadingContainer)
      el.appendChild(el._loadingContainer)
    }
  } else {
    const remainingTime = config.minShowTime - (Date.now() - (el._loadingStartTime || 0))
    
    if (remainingTime > 0) {
      // 如果显示时间不足，延迟关闭
      setTimeout(() => {
        if (el.contains(el._loadingContainer)) {
          render(null, el._loadingContainer)
          el._loadingContainer.remove()
        }
      }, remainingTime)
    } else {
      // 已经显示足够时间，立即关闭
      if (el.contains(el._loadingContainer)) {
        render(null, el._loadingContainer)
        el._loadingContainer.remove()
      }
    }
  }
}

export default {
  mounted(el, binding) {
    handleLoading(el, binding)
  },
  updated(el, binding) {
    handleLoading(el, binding)
  }
}