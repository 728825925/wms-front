import { getCurrentUserMenu } from './index'
import request from '@/utils/request'

export function getMenuRoutes() {
  return getCurrentUserMenu()
}

export function getPermTreeByRoleId(params) {
  return request({
    url: '/system/menu/tree-all/' + params.roleId,
    method: 'get',
    data: params // 这里传递参数
  })
}

export function getMenuList(params) {
  return request({
    url: '/system/menu/list',
    method: 'post',
    data: params // 这里传递参数
  })
}

export function addMenu(params) {
  return request({
    url: '/system/menu',
    method: 'post',
    data: params // 这里传递参数
  })
}

export function editMenu(params) {
  return request({
    url: '/system/menu',
    method: 'put',
    data: params // 这里传递参数
  })
}

export function deleteMenu(menuIds) {
  return request({
    url: '/system/menu',
    method: 'delete',
    params: { menuId: menuIds }
  })
}