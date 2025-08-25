import request from '@/utils/request'

/**
 * 获取表字段配置
 * @param {string} className - 表名（如 SysUserDO）
 * @returns {Promise}
 */
export const getColumnConfig = (className) => {
  return request.post('/system/column-config', {
    pageNum: 1,
    pageSize: 200,
    conditions: [
      { field: 'className', operator: 'EQ', value: className }
    ],
    sortConditions: [{
      field: 'sort',
      ascending: true
    }]
  })
}

// 批量更新表字段配置
export const batchUpdateColumnConfig = (data) => {
  return request.post('/system/column-config/batch-update', data)
}

//获取字典配置
export const getDictItemsByCodes = (codes) => {
  return request({
    url: '/system/dict/item/list/codes',
    method: 'get',
    params: {
      typeCode: codes // 会自动转换为?typeCode=code1&typeCode=code2格式
    }
  })
}