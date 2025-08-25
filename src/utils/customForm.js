import { sortBy } from 'es-toolkit/array'

export function buildFormConfig(columnConfigList) {
    return {
        searchFormConfig: buildSearchFormConfig(columnConfigList),
        addFormConfig: buildAddFormConfig(columnConfigList),
        editFormConfig: buildEditFormConfig(columnConfigList),
    }
}
function buildSearchFormConfig(columnConfigList) {
    const result = columnConfigList.filter(item => item.isSearchCondition === true)
        .map(item => ({
            field: item.field,
            label: item.label,
            type: item.type,
            required: false,
            options: item.options || [],
            sort: item.searchSort || 999,
            span: item.searchSpan || 6 // 4列
        }));
    return {
        labelPosition: 'right',
        labelWidth: '110px',
        gutter: 0,
        size: 'default',
        formItems: sortBy(result, ['sort']),
        show: result.length > 0
    }
}
function buildAddFormConfig(columnConfigList) {
    const result = columnConfigList.filter(item => item.isAddForm === true)
        .map(item => ({
            field: item.field,
            label: item.label,
            type: item.type,
            required: item.addRequired,
            pattern: item.regex || null,
            patternMessage: item.validFailMsg || '校验失败，请输入正确的格式',
            options: item.options || [],
            sort: item.addSort || 999,
            span: item.addSpan || 12
        }));
    return {
        labelPosition: 'right',
        labelWidth: '130px',
        gutter: 20,
        size: 'default',
        formItems: sortBy(result, ['sort'])
    }

}
function buildEditFormConfig(columnConfigList) {
    const result = columnConfigList.filter(item => item.isEditForm === true)
        .map(item => ({
            field: item.field,
            label: item.label,
            type: item.type,
            required: item.editRequired,
            pattern: item.regex || null,
            patternMessage: item.validFailMsg || '校验失败，请输入正确的格式',
            options: item.options || [],
            sort: item.editSort || 999,
            span: item.editSpan || 12
        }));
    return {
        labelPosition: 'right',
        labelWidth: '130px',
        gutter: 20,
        size: 'default',
        formItems: sortBy(result, ['sort'])
    }
}

