<template>
  <div class="pagination-table">
    <!-- 搜索区域 -->
    <div v-if="showSearch" class="search-area">
      <el-form :model="searchForm" inline>
        <slot
          name="search"
          :search-form="searchForm"
          :handle-search="handleSearch"
          :handle-reset="handleReset"
        >
          <!-- 默认搜索表单 -->
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="请输入关键词"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </slot>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <el-table
      v-loading="loading"
      :data="data"
      :height="height"
      :max-height="maxHeight"
      :stripe="stripe"
      :border="border"
      :size="size"
      :fit="fit"
      :show-header="showHeader"
      :highlight-current-row="highlightCurrentRow"
      :current-row-key="currentRowKey"
      :row-class-name="rowClassName"
      :row-style="rowStyle"
      :cell-class-name="cellClassName"
      :cell-style="cellStyle"
      :header-row-class-name="headerRowClassName"
      :header-row-style="headerRowStyle"
      :header-cell-class-name="headerCellClassName"
      :header-cell-style="headerCellStyle"
      :row-key="rowKey"
      :empty-text="emptyText"
      :default-expand-all="defaultExpandAll"
      :expand-row-keys="expandRowKeys"
      :default-sort="defaultSort"
      :tooltip-effect="tooltipEffect"
      :show-summary="showSummary"
      :sum-text="sumText"
      :summary-method="summaryMethod"
      :span-method="spanMethod"
      :select-on-indeterminate="selectOnIndeterminate"
      :indent="indent"
      :lazy="lazy"
      :load="load"
      :tree-props="treeProps"
      :table-layout="tableLayout"
      :scrollbar-always-on="scrollbarAlwaysOn"
      :flexible="flexible"
      @select="handleSelect"
      @select-all="handleSelectAll"
      @selection-change="handleSelectionChange"
      @cell-mouse-enter="handleCellMouseEnter"
      @cell-mouse-leave="handleCellMouseLeave"
      @cell-click="handleCellClick"
      @cell-dblclick="handleCellDblclick"
      @row-click="handleRowClick"
      @row-contextmenu="handleRowContextmenu"
      @row-dblclick="handleRowDblclick"
      @header-click="handleHeaderClick"
      @header-contextmenu="handleHeaderContextmenu"
      @sort-change="handleSortChange"
      @filter-change="handleFilterChange"
      @current-change="handleCurrentChange"
      @header-dragend="handleHeaderDragend"
      @expand-change="handleExpandChange"
    >
      <slot />
    </el-table>

    <!-- 分页区域 -->
    <div v-if="showPagination" class="pagination-area">
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="pageSizes"
        :total="total"
        :layout="paginationLayout"
        :small="small"
        :background="background"
        :pager-count="pagerCount"
        :hide-on-single-page="hideOnSinglePage"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  // 数据相关
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  total: {
    type: Number,
    default: 0,
  },

  // 分页相关
  showPagination: {
    type: Boolean,
    default: true,
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100],
  },
  paginationLayout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper',
  },

  // 搜索相关
  showSearch: {
    type: Boolean,
    default: true,
  },
  searchForm: {
    type: Object,
    default: () => ({}),
  },

  // 表格相关
  height: [String, Number],
  maxHeight: [String, Number],
  stripe: {
    type: Boolean,
    default: true,
  },
  border: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: 'default',
  },
  fit: {
    type: Boolean,
    default: true,
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  highlightCurrentRow: {
    type: Boolean,
    default: false,
  },
  currentRowKey: [String, Number],
  rowClassName: [String, Function],
  rowStyle: [Object, Function],
  cellClassName: [String, Function],
  cellStyle: [Object, Function],
  headerRowClassName: [String, Function],
  headerRowStyle: [Object, Function],
  headerCellClassName: [String, Function],
  headerCellStyle: [Object, Function],
  rowKey: [String, Function],
  emptyText: String,
  defaultExpandAll: Boolean,
  expandRowKeys: Array,
  defaultSort: Object,
  tooltipEffect: String,
  showSummary: Boolean,
  sumText: String,
  summaryMethod: Function,
  spanMethod: Function,
  selectOnIndeterminate: {
    type: Boolean,
    default: true,
  },
  indent: {
    type: Number,
    default: 16,
  },
  lazy: Boolean,
  load: Function,
  treeProps: Object,
  tableLayout: String,
  scrollbarAlwaysOn: Boolean,
  flexible: Boolean,
})

// Emits
const emit = defineEmits([
  'search',
  'reset',
  'page-change',
  'size-change',
  'select',
  'select-all',
  'selection-change',
  'cell-mouse-enter',
  'cell-mouse-leave',
  'cell-click',
  'cell-dblclick',
  'row-click',
  'row-contextmenu',
  'row-dblclick',
  'header-click',
  'header-contextmenu',
  'sort-change',
  'filter-change',
  'current-change',
  'header-dragend',
  'expand-change',
])

// 分页数据
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
})

// 搜索表单
const searchForm = ref({ ...props.searchForm })

// 监听 props 变化
watch(
  () => props.searchForm,
  (newVal) => {
    searchForm.value = { ...newVal }
  },
  { deep: true }
)

// 搜索处理
const handleSearch = () => {
  emit('search', searchForm.value)
}

// 重置处理
const handleReset = () => {
  searchForm.value = {}
  emit('reset')
}

// 分页处理
const handlePageChange = (page) => {
  pagination.value.pageNum = page
  emit('page-change', page)
}

const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.pageNum = 1
  emit('size-change', size)
}

// 表格事件处理
const handleSelect = (selection, row) => emit('select', selection, row)
const handleSelectAll = (selection) => emit('select-all', selection)
const handleSelectionChange = (selection) => emit('selection-change', selection)
const handleCellMouseEnter = (row, column, cell, event) =>
  emit('cell-mouse-enter', row, column, cell, event)
const handleCellMouseLeave = (row, column, cell, event) =>
  emit('cell-mouse-leave', row, column, cell, event)
const handleCellClick = (row, column, cell, event) => emit('cell-click', row, column, cell, event)
const handleCellDblclick = (row, column, cell, event) =>
  emit('cell-dblclick', row, column, cell, event)
const handleRowClick = (row, column, event) => emit('row-click', row, column, event)
const handleRowContextmenu = (row, column, event) => emit('row-contextmenu', row, column, event)
const handleRowDblclick = (row, column, event) => emit('row-dblclick', row, column, event)
const handleHeaderClick = (column, event) => emit('header-click', column, event)
const handleHeaderContextmenu = (column, event) => emit('header-contextmenu', column, event)
const handleSortChange = ({ column, prop, order }) => emit('sort-change', { column, prop, order })
const handleFilterChange = (filters) => emit('filter-change', filters)
const handleCurrentChange = (currentRow, oldCurrentRow) =>
  emit('current-change', currentRow, oldCurrentRow)
const handleHeaderDragend = (newWidth, oldWidth, column, event) =>
  emit('header-dragend', newWidth, oldWidth, column, event)
const handleExpandChange = (row, expandedRows) => emit('expand-change', row, expandedRows)
</script>

<style scoped>
.pagination-table {
  width: 100%;
}

.search-area {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
}

.pagination-area {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style> 