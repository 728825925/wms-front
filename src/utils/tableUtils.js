import { h, resolveComponent } from 'vue' // Vue 3 的 h 函数

// 修改函数参数，添加customSlots
export function buildTableColumns(fieldConfigList, dictData, customSlots = []) {
    return fieldConfigList
        .filter((item) => item.visible !== false)
        .sort((a, b) => (a.sort ?? 999) - (b.sort ?? 999))
        .map((item, index, arr) => {
            const isLastColumn = index === arr.length - 1

            const column = {
                prop: item.field,
                label: item.label,
                // 最后一列宽度自适应
                width: isLastColumn ? undefined : (item.width || 150),
                resizable: false,
                align: item.align || 'left',
                showOverflowTooltip: true,
            }

            // 检查是否有自定义slot配置
            const customSlot = customSlots.find(slot => slot.prop === item.field)
            if (customSlot && customSlot.render) {
                // 使用自定义slot渲染
                column.vSlot = customSlot.render
            } else {
                // 原有逻辑
                switch (item.type) {
                    case 'select':
                        column.vSlot = ({ row }) => renderSelectCell(row, item, dictData)
                        break
                    default:
                        column.vSlot = ({ row }) => h('span', row[item.field])
                }
            }

            return column
        })
}

// 1. 定义20种不同的颜色
const PREDEFINED_COLORS = [
    '#636cff', '#0082ff', '#008df5', '#008fcb', '#008d96',
    '#00895f', '#008416', '#2d7d00', '#5b7600', '#897000',
    '#b76b00', '#e56500', '#ff5c00', '#ff473d', '#ff3370',
    '#ff1fa3', '#c61acb', '#8a2be2', '#722ed1', '#531dab'
];

// 2. 改进getTagColor函数
function getTagColor(value, dictCode, dictData) {
    // 如果提供了字典数据和字典代码，尝试基于字典项分配颜色
    if (dictData && dictCode && dictData[dictCode]) {
        const dictItems = dictData[dictCode];
        // 查找当前值对应的字典项
        const dictItem = dictItems.find(
            d => d.itemValue === String(value) || d.itemValue == value
        );

        if (dictItem) {
            // 使用字典项的id或itemValue生成索引
            // 这里优先使用id，如果没有则使用itemValue的哈希
            const index = dictItem.id ?
                dictItem.id % PREDEFINED_COLORS.length :
                Array.from(String(dictItem.itemValue))
                    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % PREDEFINED_COLORS.length;
            return PREDEFINED_COLORS[index];
        }
    }

    // 回退方案：使用原值的哈希（保持兼容性）
    const hash = Array.from(String(value))
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return PREDEFINED_COLORS[hash % PREDEFINED_COLORS.length];
}

// 渲染 select 类型的单元格（显示字典标签）
function renderSelectCell(row, item, dictData) {
    const value = row[item.field];
    const dictItems = dictData[item.dictCode] || [];
    const dictItem = dictItems.find(
        d => d.itemValue === String(value) || d.itemValue == value
    );
    return h(
        resolveComponent('el-tag'),
        {
            style: {
                backgroundColor: getTagColor(value, item.dictCode, dictData), // 传递更多参数
                border: 'none',
            },
            effect: 'dark',
        },
        {
            default: () => dictItem?.itemName || value,
        }
    );
}

