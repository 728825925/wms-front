import request from '@/utils/request'

// 登录
export function loginApi({ account, password, rememberMe }) {
  return request({
    url: '/auth/login',
    method: 'post',
    data: { account, password, rememberMe }
  })
}

// 退出登录
export function logoutApi() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

// 获取当前用户菜单
export function getCurrentUserMenu() {
  return request({
    url: '/system/menu/route/current-user',
    method: 'get'
  })
}

// 获取当前用户信息
export function getUserInfo() {
  return request({
    url: '/auth/userinfo',
    method: 'get'
  })
} 