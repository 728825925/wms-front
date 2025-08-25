<template>
  <div class="search-table-card-root">
    <el-card class="search-card" v-if="formConfig?.searchFormConfig?.formItems?.length > 0">
      <div class="search-title-row">
        <span class="search-title">搜索</span>
        <div class="search-actions">
          <slot name="search-actions"></slot>
        </div>
      </div>
      <div class="search-divider"></div>
      <div class="search-form" style="padding: 20px 20px 20px 10px">
        <CustomForm
          v-if="formConfig?.searchFormConfig?.formItems?.length > 0"
          :config="formConfig.searchFormConfig"
          ref="searchFormRef"
        />
        <el-row>
          <el-col :span="24" class="search-btn-col">
            <ProButton
              type="default"
              icon="ep:refresh"
              plain
              @click="onReset"
              style="margin-right: 8px"
              >重置</ProButton
            >
            <ProButton type="primary" icon="ep:search" plain @click="onSearch">搜索</ProButton>
          </el-col>
        </el-row>
      </div>
    </el-card>
    <el-card class="table-card">
      <div class="table-title-row">
        <span class="table-title">{{ tableTitle }}列表</span>
        <div class="table-actions">
          <slot name="table-actions">
            <ProButton
              v-for="btn in tableConfig.toolbarButtons"
              :key="btn.key"
              :type="btn.type"
              :icon="btn.icon"
              plain
              @click="onToolbarAction(btn.action)"
              v-permission="btn.permission"
            >
              {{ btn.label }}
            </ProButton>
          </slot>
        </div>
      </div>
      <div class="search-divider"></div>
      <slot name="header"></slot>
      <el-table
        ref="tableRef"
        :data="tableConfig.tableData"
        style="width: 100%; padding: 16px"
        :border="false"
        v-custom-loading="{ active: isLoading, text: '拼命加载中  ...' }"
        row-key="id"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column
          label="序号"
          type="index"
          width="60"
          fixed="left"
          :index="(index) => index + 1"
        />
        <el-table-column v-for="col in tableConfig.tableColumns" :key="col.prop" v-bind="col">
          <template v-if="col.vSlot" #default="scope">
            <component :is="() => col.vSlot(scope)" />
          </template>
        </el-table-column>
        <slot></slot>
        <el-table-column
          fixed="right"
          label="操作"
          :width="tableConfig.actionButtons?.length * 88 + 30"
          align="center"
        >
          <template #default="scope">
            <div class="action-btn-group">
              <ProButton
                v-for="btn in tableConfig.actionButtons"
                :key="btn.key"
                :type="btn.type || 'default'"
                :icon="btn.icon"
                plain
                @click="onAction(btn.action, scope.row)"
                class="table-action-btn"
                v-permission="btn.permission"
              >
                {{ btn.label }}
              </ProButton>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="pagination"
        v-bind="pagination"
        @current-change="onPageChange"
        @size-change="onSizeChange"
        class="custom-pagination"
      />
    </el-card>
    <CustomDialogForm
      v-model:visible="editFormVisible"
      v-model="currentRow"
      :title="'编辑' + tableTitle"
      :config="formConfig.editFormConfig"
      @submit="onEditSubmit"
      ref="editFormDialogRef"
    />
    <CustomDialogForm
      v-model:visible="addFormVisible"
      v-model="currentRow"
      :title="'新增' + tableTitle"
      :config="formConfig.addFormConfig"
      @submit="onAddSubmit"
      ref="addFormDialogRef"
    />
    <!-- 列设置抽屉 -->
    <el-drawer
      v-model="columnSettingVisible"
      title="字段设置"
      direction="rtl"
      size="30%"
      :with-header="true"
      @close="columnSettingClose"
    >
      <ColumnSetting ref="columnSetting" :columns="columnConfigList" />
    </el-drawer>
  </div>
</template>

<script>
import { buildQueryConditions } from '@/utils/search.js'

export default {
  name: 'CustomTable',
  components: {
    CustomForm: () => import('@/components/CustomForm.vue'),
    CustomDialogForm: () => import('@/components/CustomDialogForm.vue'),
    ColumnSetting: () => import('@/components/ColumnSetting.vue'),
  },
  props: {
    tableTitle: {
      type: String,
    },
    columnConfigList: {
      type: Array,
      default: () => [],
    },
    formConfig: {
      type: Object,
      default: () => ({
        searchFormConfig: {},
        addFormConfig: {},
        editFormConfig: {},
      }),
    },
    tableConfig: {
      type: Object,
      default: () => ({
        tableData: [],
        tableColumns: [],
        actionButtons: [
          // { key: 'edit', label: '编辑', icon: 'ep:edit', action: 'edit', type: 'primary' },
          // { key: 'delete', label: '删除', icon: 'ep:delete', action: 'delete', type: 'danger' },
        ],
        toolbarButtons: [
          // {
          //   key: 'add',
          //   label: '新增',
          //   icon: 'ep:plus',
          //   action: 'add',
          //   type: 'primary',
          //   permission: 'add',
          // },
          // {
          //   key: 'batchDelete',
          //   label: '批量删除',
          //   icon: 'ep:delete',
          //   action: 'batchDelete',
          //   type: 'danger',
          //   permission: 'delete',
          // },
          // {
          //   key: 'refresh',
          //   label: '刷新',
          //   icon: 'material-symbols:refresh-rounded',
          //   action: 'refresh',
          //   type: 'default',
          // },
          // {
          //   key: 'columnSetting',
          //   label: '字段设置',
          //   icon: 'ep:setting',
          //   action: 'columnSetting',
          //   type: 'default',
          // },
        ],
      }),
    },
  },
  data() {
    return {
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
        pageSizes: [10, 20, 50, 100],
        layout: 'prev, pager, next, jumper,->, sizes, total',
      },
      currentRow: {}, //当前行 作为v-model传递给新增编辑表单
      addFormVisible: false,
      editFormVisible: false, // 编辑表单可见性
      isLoading: false, // 自定义加载动画
      columnSettingVisible: false,
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.onSearch()
    })
  },
  methods: {
    onReset() {
      //发送重置前的表单信息
      this.$emit('reset', this.$refs.searchFormRef.form)
      this.$refs.searchFormRef.reset()
    },
    onSearch() {
      this.isLoading = true
      const formData = this.$refs.searchFormRef?.getQueryConditions?.() ?? []
      const params = buildQueryConditions(formData, this.pagination, this.sortConditions)
      // 传一个回调函数给父组件，告诉它“我这边加载完成了”
      this.$emit('search', params, () => {
        this.isLoading = false // 父组件调用这个回调，关闭 loading
      })
    },
    onAddSubmit(formData) {
      this.$emit('addData', formData, () => {
        this.$message.success('新增成功')
        this.addFormVisible = false
        this.onSearch()
      })
    },
    onEditSubmit(formData) {
      this.$emit('updateData', formData, () => {
        this.$message.success('编辑成功')
        this.editFormVisible = false
        this.onSearch()
      })
    },
    openAddForm() {
      this.currentRow = {} // 重置表单数据
      this.addFormVisible = true
    },
    openEditForm(row) {
      this.currentRow = {} // 重置表单数据
      this.currentRow = { ...row } //  深拷贝一份
      this.editFormVisible = true
    },
    onToolbarAction(action) {
      switch (action) {
        case 'add':
          this.openAddForm()
          break
        case 'batchDelete':
          this.batchDelete()
          break
        case 'refresh':
          this.onSearch()
          break
        case 'columnSetting':
          this.openColumnSetting()
          break
        default:
          // 可以 emit 事件，让父组件处理
          this.$emit('toolbar-action', action)
      }
    },
    onAction(action, row) {
      let handled = false // 标志变量
      switch (action) {
        case 'edit':
          this.openEditForm(row)
          handled = true
          break
        case 'delete':
          // 添加删除确认逻辑
          this.onDelete([row])
          handled = true
          break
        default:
          break
      }
      if (!handled) {
        this.$emit('action', action, row)
      }
    },
    // 打开列设置抽屉和保存设置的方法
    openColumnSetting() {
      this.columnSettingVisible = true
    },
    columnSettingClose() {
      this.columnSettingVisible = false
      this.$refs.columnSetting.reset()
    },
    onDelete(rows) {
      const message =
        rows.length === 1 ? '确定要删除这条数据吗？' : `确定要删除这 ${rows.length} 条数据吗？`
      this.$confirm(message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const idList = rows.map((row) => row.id)
          try {
            this.$emit('deleteData', idList, () => {
              this.$message.success('删除成功')
              this.onSearch()
            })
          } catch (error) {
            this.$message.error('删除失败：' + (error.message || '未知错误'))
          }
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    },
    batchDelete() {
      const selectedRows = this.$refs.tableRef?.getSelectionRows() || []
      if (selectedRows.length === 0) {
        this.$message.warning('请先选择要删除的数据')
        return
      }
      this.onDelete(selectedRows)
    },
    onPageChange(page) {
      this.pagination.currentPage = page
      this.onSearch()
    },
    onSizeChange(size) {
      this.pagination.pageSize = size
      this.onSearch()
    },
    handleSortChange({ prop, order }) {
      if (!order) {
        this.sortConditions = []
      } else {
        this.sortConditions = [
          {
            field: prop,
            ascending: order === 'ascending',
          },
        ]
      }
    },
  },
}
</script>

<style scoped lang="scss">
.search-card,
.table-card {
  border: none !important;
  box-shadow: 0 2px 8px 0 rgba(99, 108, 255, 0.08), 0 1.5px 4px 0 rgba(0, 0, 0, 0.04);
  border-radius: 10px;
  padding: 0;
}
:deep(.el-card) {
  border: none !important;
}
.search-title-row,
.table-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 52px;
  min-height: 52px;
  background: transparent;
  position: relative;
}

.divider {
  width: 100%;
  height: 1px;
  background: #f0f0f0;
  margin: 0;
  position: relative;
}

/* 表格卡片分割线全屏显示 */
.table-card .divider {
  margin-left: -30px; /* 抵消table-card的左右padding */
  margin-right: -30px;
  width: calc(100% + 60px); /* 宽度补偿 */
}
.search-title,
.table-title {
  font-size: 16px;
  font-weight: bold;
  color: #1f1f1f;
  font-family: '微软雅黑', 'Microsoft YaHei', Arial, sans-serif;
  line-height: 52px; /* 修改为与容器高度一致 */
}
.search-actions,
.table-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 240px;
  min-height: 32px;
}
.search-divider,
.table-divider {
  width: 100%;
  height: 1px;
  background: #f0f0f0;
  margin: 0;
  position: relative;
  left: 0;
}

.table-card {
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}
:deep(.table-card .el-card__body) {
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
  height: 100%;
}
:deep(.el-table) {
  flex: 1 1 auto;
  min-height: 0;
  border-radius: 10px !important;
  box-shadow: none !important;
  border: 1px solid #f0f0f0 !important;
  font-family: '微软雅黑', 'Microsoft YaHei', Arial, sans-serif !important;
  overflow: visible !important;
  height: 100%;
}
:deep(.el-table th) {
  font-weight: 600 !important;
  color: #333 !important;
  background: #fafafa !important;
  font-size: 15px !important;
  position: relative;
  border-bottom: 1px solid #f0f0f0 !important; /* 添加表头底部边框 */
}
:deep(.el-table th:not(:last-child))::after {
  content: '';
  position: absolute;
  right: 0;
  top: 15px;
  height: calc(100% - 30px);
  width: 1px;
  background-color: #e5e7eb;
}

:deep(.el-table__body td) {
  color: #000 !important;
}
:deep(.el-table__column--selection .cell),
:deep(.operation-column .el-button) {
  color: var(--table-primary) !important;
}
:deep(.el-table::before) {
  height: 0 !important;
}
:deep(.el-table td) {
  color: #1f1f1f !important;
  font-size: 14px !important;
}
:deep(.el-table__body tr) {
  background: #fff !important;
}
:deep(.el-table__body tr:hover) {
  background: #f5f7ff !important;
}
:deep(.el-table__header) {
  border-radius: 10px 10px 0 0 !important;
}
:deep(.el-table__footer) {
  border-radius: 0 0 10px 10px !important;
}
:deep(.el-pagination) {
  font-family: '微软雅黑', 'Microsoft YaHei', Arial, sans-serif !important;
}
.custom-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px 15px;
  width: 100%;
}

:deep(.custom-pagination .el-pagination) {
  display: flex;
  width: 100%;
  justify-content: space-between;
}

// 确保 "->" 分隔符正确工作
:deep(.custom-pagination .el-pagination__rightwrapper) {
  display: flex;
  align-items: center;
}

// 调整间距
:deep(.custom-pagination .el-pagination__total) {
  margin-left: 10px;
}

:deep(.el-pagination .el-pager li) {
  border-radius: 5px !important;
  color: #1f1f1f !important;
  // border: 1px solid transparent !important;
  background: #fff !important;
  font-weight: bold !important;
  margin: 0 2px !important;
  min-width: 24px !important;
  height: 24px !important;
  line-height: 24px !important;
  transition: all 0.2s;
}
:deep(.el-pagination .el-pager li.is-active) {
  color: #636cff !important;
  background: #fff !important;
  border: 1.5px solid #636cff !important;
}
:deep(.el-pagination .el-pager li.is-disabled) {
  color: #bfbfbf !important;
  background: #fafafa !important;
  border: 1.5px solid #e5e6eb !important;
}
:deep(.el-pagination button) {
  border-radius: 8px !important;
  color: #1f1f1f !important;
  border: none !important;
  background: transparent !important;
  min-width: 32px !important;
  height: 32px !important;
}
:deep(.el-pagination button:disabled) {
  color: #bfbfbf !important;
  background: transparent !important;
}
:deep(.el-pagination .el-pagination__sizes .el-select .el-input__wrapper) {
  border-radius: 8px !important;
  border: 1.5px solid #636cff !important;
  background: #fff !important;
  min-height: 32px !important;
  box-shadow: none !important;
}
.layout-main,
.layout-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.search-table-card-root {
  --table-primary: #636cff;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}
:deep(.table-card .el-card__body) {
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
}
:deep(.el-button) {
  height: 32px !important;
  min-height: 32px !important;
  box-sizing: border-box;
}
.search-card {
  margin-bottom: 16px;
}
.search-btn-col {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
/* 移除表格所有外边框 */
:deep(.el-table),
:deep(.el-table--fit),
:deep(.el-table--scrollable-x),
:deep(.el-table--enable-row-transition),
:deep(.el-table--layout-fixed),
:deep(.is-scrolling-left),
:deep(.el-table__inner-wrapper) {
  border: none !important;
}

/* 修改行选中复选框的颜色 */
:deep(.el-table__selection-column .el-checkbox__inner) {
  border-color: #636cff !important;
}
:deep(.el-table__selection-column .el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #636cff !important;
  border-color: #636cff !important;
}

/* 确保按钮不被挤压 */
.table-action-btn {
  flex: 0 0 auto; /* 不伸缩，按内容定宽 */
  /* 或者固定宽度（如果文字长度相近） */
  /* width: 80px; */
}
:deep(.table-action-btn) {
  margin-right: 8px; /* 添加8px间距 */
  padding: 0 12px; /* 减小内边距以缩小宽度 */
}
:deep(.table-action-btn:last-child) {
  margin-right: 0; /* 移除最后一个按钮的右边距 */
}
.action-btn-group {
  display: inline-flex; /* 关键：只占内容宽度 */
  justify-content: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

/* 修改行选中时的背景色 */
:deep(.el-table__body tr.current-row),
:deep(.el-table__body tr.hover-row) {
  background-color: rgba(99, 108, 255, 0.08) !important; /* 淡蓝色背景 */
}
/* 仅修改表头标题文字（不影响排序图标） */
:deep(.el-table .el-table__header-wrapper th .cell) {
  font-weight: bold !important;
  font-size: 14px;
}
//抽屉标题头
:deep(.el-drawer__header) {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 58px; /* 设置 header 的高度 */
  margin: 0; /* 移除默认的 margin，如果有的话 */
  padding: 0 16px;
}
:deep(.el-drawer__header) span {
  flex: 1; /* 让 span 占据剩余空间 */
  margin: 0;
  color: rgba(0, 0, 0, 0.88);
  font-weight: 600;
  font-size: 16px;
  line-height: 1.5; /* 根据需要调整行高 */
  overflow: hidden; /* 防止文字溢出 */
  text-overflow: ellipsis; /* 当文字超出容器宽度时显示省略号 */
  white-space: nowrap; /* 强制单行显示 */
}
:deep(.el-drawer__body) {
  border-top: 1px solid #e4e7ed;
}
</style>