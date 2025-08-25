import request from '@/utils/request'

export function getUserList(params) {
  return request({
    url: '/system/user/list',
    method: 'post',
    data: params // 这里传递参数
  })
}

export function addUser(params) {
  return request({
    url: '/system/user',
    method: 'post',
    data: params // 这里传递参数
  })
}

export function editUser(params) {
  return request({
    url: '/system/user',
    method: 'put',
    data: params // 这里传递参数
  })
}

export function deleteUser(userIds) {
  return request({
    url: '/system/user',
    method: 'delete',
    params: { userId: userIds } 
  })
}