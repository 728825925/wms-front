import { ElMessage } from 'element-plus'

// 后端状态码映射
export const ResultCode = {
  SUCCESS: 200,
  FAILED: 500,
  VALIDATE_FAILED: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND:404,
  METHOD_NOT_ALLOWED:405,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE:503,
  
  // 业务相关状态码
  USER_NOT_EXIST: 1001,
  USER_PASSWORD_ERROR: 102,
  USER_ACCOUNT_LOCKED: 103,
  USER_NOT_LOGIN: 104,
  USER_ACCOUNT_EXISTS: 1005,
  USER_ADD_FAILED: 16,
  USER_UPDATE_FAILED: 17,
  USER_DELETE_FAILED: 108,
  USER_RESET_PWD_FAILED:1009,
  USER_LOCK_FAILED: 110,
  SUPER_ADMIN_PROTECTED: 1011,
  
  // 角色管理相关
  ROLE_NOT_EXIST:201,
  ROLE_CODE_EXISTS: 2002,
  ROLE_ADD_FAILED: 23,
  ROLE_UPDATE_FAILED: 24,
  ROLE_DELETE_FAILED: 25,
  SUPER_ADMIN_ROLE_PROTECTED: 2006,
  
  // 菜单管理相关
  MENU_NOT_EXIST:301,
  MENU_CODE_EXISTS: 3002,
  MENU_ADD_FAILED: 33,
  MENU_UPDATE_FAILED: 34,
  MENU_DELETE_FAILED: 305,
  MENU_HAS_CHILDREN:3006,
  MENU_CIRCULAR_REFERENCE: 3007,
  
  // 部门管理相关
  DEPT_NOT_EXIST:401,
  DEPT_CODE_EXISTS: 4002,
  DEPT_ADD_FAILED: 43,
  DEPT_UPDATE_FAILED: 44,
  DEPT_DELETE_FAILED: 405,
  DEPT_HAS_CHILDREN: 46,
  DEPT_HAS_USERS:4007,
  DEPT_CIRCULAR_REFERENCE: 48,
  PARENT_DEPT_NOT_EXIST: 4009
}

// 消息类型
export const MessageType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// 通用消息提示
export const showMessage = (result, options = {}) => {
  const { code, msg, data } = result
  
  // 默认配置
  const defaultOptions = {
    duration: 300,
    showClose: true,
    center: false
  }
  
  const config = { ...defaultOptions, ...options }
  
  // 根据状态码判断消息类型
  if (code === ResultCode.SUCCESS) {
    ElMessage({
      type: MessageType.SUCCESS,
      message: msg || '操作成功',
      ...config
    })
  } else {
    ElMessage({
      type: MessageType.ERROR,
      message: msg || '操作失败',
      ...config
    })
  }
  
  return result
}

// 成功消息
export const showSuccess = (message = '操作成功', options = {}) => {
  return ElMessage({
    type: MessageType.SUCCESS,
    message,
    duration: 300,
    showClose: true,
    ...options
  })
}

// 错误消息
export const showError = (message = '操作失败', options = {}) => {
  return ElMessage({
    type: MessageType.ERROR,
    message,
    duration: 400,
    showClose: true,
    ...options
  })
}

// 警告消息
export const showWarning = (message = '警告', options = {}) => {
  return ElMessage({
    type: MessageType.WARNING,
    message,
    duration: 300,
    showClose: true,
    ...options
  })
}

// 信息消息
export const showInfo = (message = '提示', options = {}) => {
  return ElMessage({
    type: MessageType.INFO,
    message,
    duration: 300,
    showClose: true,
    ...options
  })
}

// 处理 API 响应
export const handleApiResponse = (response, successMessage = '操作成功') => {
  const { code, msg, data } = response
  
  if (code === ResultCode.SUCCESS) {
    showSuccess(successMessage)
    return { success: true, data }
  } else {
    showError(msg || '操作失败')
    return { success: false, message: msg }
  }
}

// 处理分页响应
export const handlePaginationResponse = (response) => {
  const { code, msg, data } = response
  
  if (code === ResultCode.SUCCESS) {
    return { success: true, data }
  } else {
    showError(msg || '获取数据失败')
    return { success: false, message: msg }
  }
}

export default {
  showMessage,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  handleApiResponse,
  handlePaginationResponse,
  ResultCode,
  MessageType
} 