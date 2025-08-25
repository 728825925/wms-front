import axios from 'axios'
import { ElMessage } from 'element-plus'
import { showMessage, ResultCode } from './message.js'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + import.meta.env.VITE_API_PREFIX,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  paramsSerializer: params => {
  return Object.entries(params)
    .map(([key, val]) => {
      if (Array.isArray(val)) {
        return val.map(v => `${key}=${encodeURIComponent(v)}`).join('&');
      }
      return `${key}=${encodeURIComponent(val)}`;
    })
    .join('&');
  }
})

// 请求拦截器：自动加 token
request.interceptors.request.use(
  config => {
    // 从 localStorage 取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { data } = response
    // 根据后端 Result 结构处理响应
    if (data && typeof data === 'object') {
      const { code, msg } = data
      // 成功状态
      if (code === ResultCode.SUCCESS) {
        return data
      }
      // 错误状态 - 显示错误消息
      showMessage(data, { duration: 3000 })
      return Promise.reject(new Error(msg || '请求失败'))
    }
    
    // 如果不是标准的 Result 结构，直接返回
    return data
  },
  error => {
    const { response } = error
    
    if (response) {
      const { status, data } = response
      
      // 根据 HTTP 状态码处理错误
      switch (status) {
        case 401:
          ElMessage.error({ message: '未授权，请重新登录', duration: 3000 })
          // 可以在这里处理登录跳转
          break
        case 403:
          ElMessage.error({ message: '拒绝访问', duration: 3000 })
          break
        case 404:
          ElMessage.error({ message: '请求错误，未找到该资源', duration: 3000 })
          break
        case 500:
          ElMessage.error({ message: '服务器端出错', duration: 3000 })
          break
        default:
          // 如果后端返回了 Result 结构，使用 showMessage 显示
          if (data && data.code && data.msg) {
            showMessage(data, { duration: 3000 })
          } else {
            ElMessage.error({ message: `连接错误${status}`, duration: 3000 })
          }
      }
    } else {
      ElMessage.error({ message: '连接到服务器失败', duration: 3000 })
    }
    
    return Promise.reject(error)
  }
)

export default request 