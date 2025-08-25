import request from '@/utils/request'

export function getRoleList(params) {
  return request({
    url: '/system/role/list',
    method: 'post',
    data: params // 这里传递参数
  })
}

export function geAllRole() {
  return request({
    url: '/system/role/all',
    method: 'get',
  })
}

export function addRole(params) {
  return request({
    url: '/system/role',
    method: 'post',
    data: params // 这里传递参数
  })
}

export function editRole(params) {
  return request({
    url: '/system/role',
    method: 'put',
    data: params // 这里传递参数
  })
}

export function deleteRole(roleIds) {
  return request({
    url: '/system/role',
    method: 'delete',
    params: { roleId: roleIds }
  })
}
export function grantPermissions(params) {
  return request({
    url: '/system/role/grantPermissions/' + params.roleId,
    method: 'post',
    data: params.menuIds 
  })
}

