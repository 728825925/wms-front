import request from '@/utils/request'

export function getDictList(params) {
  return request({
    url: '/system/dict/type/list',
    method: 'post',
    data: params // 这里传递参数
  })
}

export function addDict(params) {
  return request({
    url: '/system/dict/type',
    method: 'post',
    data: params // 这里传递参数
  })
}

export function editDict(params) {
  return request({
    url: '/system/dict/type',
    method: 'put',
    data: params // 这里传递参数
  })
}

export function deleteDict(id) {
  return request({
    url: '/system/dict/type',
    method: 'delete',
    params: { id: id } 
  })
}

export function getDictItemList(params) {
  return request({
    url: '/system/dict/item/list',
    method: 'post',
    data: params // 这里传递参数
  })
}

export function addDictItem(params) {
  return request({
    url: '/system/dict/item',
    method: 'post',
    data: params // 这里传递参数
  })
}

export function editDictItem(params) {
  return request({
    url: '/system/dict/item',
    method: 'put',
    data: params // 这里传递参数
  })
}

export function deleteDictItem(id) {
  return request({
    url: '/system/dict/item',
    method: 'delete',
    params: { id: id } 
  })
}