export const DEFAULT_TABLE_CONFIG = {
    actionButtons: [
        { key: 'edit', label: '编辑', icon: 'ep:edit', action: 'edit', type: 'primary' },
        { key: 'delete', label: '删除', icon: 'ep:delete', action: 'delete', type: 'danger' },
    ],
    toolbarButtons: [
        {
            key: 'add',
            label: '新增',
            icon: 'ep:plus',
            action: 'add',
            type: 'primary',
            permission: 'add',
        },
        {
            key: 'batchDelete',
            label: '批量删除',
            icon: 'ep:delete',
            action: 'batchDelete',
            type: 'danger',
            permission: 'delete',
        },
        {
            key: 'refresh',
            label: '刷新',
            icon: 'material-symbols:refresh-rounded',
            action: 'refresh',
            type: 'default',
        },
        {
            key: 'columnSetting',
            label: '字段设置',
            icon: 'ep:setting',
            action: 'columnSetting',
            type: 'default',
        },
    ],
}
