export function buildQueryConditions(formData, pagination, sortConditions = []) {
    const conditions = formData.map(item => {
        if (item.component === 'el-date-picker' && Array.isArray(item.value) && item.value.length === 2) {
            item.value = [new Date(item.value[0]).getTime(), new Date(item.value[1]).getTime()]
            return [
                {
                    field: item.prop,
                    operator: 'GE',
                    value: new Date(item.value[0]).getTime(), // 转为时间戳
                },
                {
                    field: item.prop,
                    operator: 'LE',
                    value: new Date(item.value[1]).getTime(),
                },
            ]
        }
        return {
            field: item.prop,
            operator: item.operator || 'LIKE', // 默认模糊查询
            value: item.value,
        }
    }).flat();
    // 设置默认排序（如果没有排序条件）
    let finalSortConditions = sortConditions
    if (finalSortConditions.length === 0) {
        finalSortConditions = [
            {
                field: 'createTime',
                ascending: false, // 倒序
            },
        ]
    }

    return {
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        conditions,
        sortConditions: finalSortConditions,
    }
}