/**
 * 构建分页查询条件
 * @param {Array} formConfig - 搜索表单的配置项（包含 prop, operator, component 等）
 * @param {Object} formData - 用户输入的实际数据，如 { name: '张三', createTime: ['2024-01-01', '2024-01-31'] }
 * @param {Object} pagination - 分页信息 { currentPage, pageSize }
 * @param {Array} [sortConditions] - 排序条件（可选）
 * @returns {Object} 查询参数对象
 */
export function buildQueryConditions(formConfig, formData, pagination, sortConditions = []) {
  // 1. 构建 conditions
  const conditions = formConfig
    .filter(item => {
      const value = formData[item.prop]
      // 过滤掉空值（'', null, undefined）
      return value !== '' && value !== null && value !== undefined
    })
    .map(item => {
      const value = formData[item.prop]
      // 处理日期范围选择器（el-date-picker）
      if (item.component === 'el-date-picker' && Array.isArray(value) && value.length === 2) {
        return [
          {
            field: item.prop,
            operator: 'GE',
            value: new Date(value[0]).getTime(), // 转为时间戳
          },
          {
            field: item.prop,
            operator: 'LE',
            value: new Date(value[1]).getTime(),
          },
        ]
      }

      // 处理其他组件（input, select 等）
      return {
        field: item.prop,
        operator: item.operator || 'LIKE', // 默认模糊查询
        value: value,
      }
    })
    .flat() // 扁平化，处理日期返回的数组

  // 2. 设置默认排序（如果没有排序条件）
  let finalSortConditions = sortConditions
  if (finalSortConditions.length === 0) {
    finalSortConditions = [
      {
        field: 'createTime',
        ascending: false, // 倒序
      },
    ]
  }

  // 3. 返回完整查询参数
  return {
    pageNum: pagination.currentPage,
    pageSize: pagination.pageSize,
    conditions,
    sortConditions: finalSortConditions,
  }
}