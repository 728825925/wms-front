<template>
  <div class="column-setting-container">
    <!-- 使用 draggable 包裹 el-table，实现拖拽 -->
    <VueDraggable
      v-model="localColumns"
      target="tbody"
      :animation="200"
      handle=".cursor-move"
      @start="onDragStart"
      @end="onDragEnd"
      class="draggable-table"
    >
      <el-table
        :data="localColumns"
        :border="false"
        style="width: 100%"
        row-key="id"
        @expand-change="handleExpandChange"
      >
        <!-- 拖动图标列 -->
        <el-table-column width="40" align="center">
          <template #default>
            <svg
              class="inline-block mr-8px h-full cursor-move text-icon"
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
            >
              <path
                fill="currentColor"
                d="M7 19v-2h2v2zm4 0v-2h2v2zm4 0v-2h2v2zm-8-4v-2h2v2zm4 0v-2h2v2zm4 0v-2h2v2zm-8-4V9h2v2zm4 0V9h2v2zm4 0V9h2v2zM7 7V5h2v2zm4 0V5h2v2zm4 0V5h2v2z"
              ></path>
            </svg>
          </template>
        </el-table-column>

        <el-table-column prop="field" label="字段英文" />
        <!-- 修改字段中文列为input框 -->
        <el-table-column label="字段中文">
          <template #default="scope">
            <el-input v-model="scope.row.label" placeholder="请输入字段中文" size="small" />
          </template>
        </el-table-column>
        <!-- 添加字段类型列 -->
        <el-table-column label="字段类型">
          <template #default="scope">
            <span :class="['type-badge', scope.row.type]">{{
              getChineseType(scope.row.type)
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="显示状态" align="center">
          <template #default="scope">
            <div class="cell-content">
              <el-switch
                v-model="scope.row.visible"
                active-color="#1890ff"
                inactive-color="#cccccc"
                :disabled="scope.row.fixed"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column type="expand">
          <template #default="scope">
            <el-form :model="scope.row" label-width="180px" class="expand-form antdpro-expand-form">
              <el-form-item label="是否作为搜索框条件">
                <el-switch
                  v-model="scope.row.isSearchCondition"
                  active-color="#1890ff"
                  inactive-color="#cccccc"
                />
              </el-form-item>
              <el-form-item label="是否作为新增表单字段">
                <el-switch
                  v-model="scope.row.isAddForm"
                  active-color="#1890ff"
                  inactive-color="#cccccc"
                />
              </el-form-item>
              <el-form-item label="新增表单字段必填">
                <el-switch
                  v-model="scope.row.addRequired"
                  :disabled="!scope.row.isAddForm"
                  active-color="#1890ff"
                  inactive-color="#cccccc"
                />
              </el-form-item>
              <el-form-item label="是否作为编辑表单字段">
                <el-switch
                  v-model="scope.row.isEditForm"
                  active-color="#1890ff"
                  inactive-color="#cccccc"
                />
              </el-form-item>
              <el-form-item label="编辑表单字段必填">
                <el-switch
                  v-model="scope.row.editRequired"
                  :disabled="!scope.row.isEditForm"
                  active-color="#1890ff"
                  inactive-color="#cccccc"
                />
              </el-form-item>
              <el-form-item label="查询表单排序">
                <el-input
                  v-model.number="scope.row.searchSort"
                  type="number"
                  min="1"
                  placeholder="请输入正整数"
                  size="small"
                  oninput="value = value.replace(/[^0-9]/g, '').replace(/^0+/, '')"
                />
              </el-form-item>
              <el-form-item label="新增表单排序">
                <el-input
                  v-model.number="scope.row.addSort"
                  type="number"
                  min="1"
                  placeholder="请输入正整数"
                  size="small"
                  oninput="value = value.replace(/[^0-9]/g, '').replace(/^0+/, '')"
                />
              </el-form-item>
              <el-form-item label="编辑表单排序">
                <el-input
                  v-model.number="scope.row.editSort"
                  type="number"
                  min="1"
                  placeholder="请输入正整数"
                  size="small"
                  oninput="value = value.replace(/[^0-9]/g, '').replace(/^0+/, '')"
                />
              </el-form-item>
              <!-- 添加新属性字段 -->
              <el-form-item label="校验规则(regex)">
                <el-input v-model="scope.row.regex" placeholder="输入校验规则" size="small" />
              </el-form-item>
              <el-form-item label="校验失败提示">
                <el-input
                  v-model="scope.row.validFailMsg"
                  placeholder="输入校验失败提示"
                  size="small"
                />
              </el-form-item>
              <el-form-item label="宽度">
                <el-input
                  v-model.number="scope.row.width"
                  type="number"
                  placeholder="输入宽度数值"
                  size="small"
                />
              </el-form-item>
              <el-form-item label="对齐方式">
                <el-select v-model="scope.row.align" placeholder="请选择对齐方式" size="small">
                  <el-option label="左对齐" value="left" />
                  <el-option label="居中" value="center" />
                  <el-option label="右对齐" value="right" />
                </el-select>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
      </el-table>
    </VueDraggable>

    <!-- 固定底部按钮 -->
    <div class="fixed-footer">
      <div class="action-buttons">
        <ProButton type="primary" @click="handleSave">保存设置</ProButton>
        <ProButton @click="reset">重置</ProButton>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import ProButton from './ProButton.vue'
import { cloneDeep } from 'es-toolkit/object'
import { sortBy } from 'es-toolkit/array'

import { batchUpdateColumnConfig } from '@/api/columnConfig'

export default defineComponent({
  name: 'ColumnSetting',
  components: {
    VueDraggable,
    ProButton,
  },
  props: {
    columns: {
      type: Array,
      required: true,
    },
  },
  emits: ['save'],
  data() {
    return {
      expandedRows: [],
      localColumns: [],
      // 添加类型映射
      typeMap: {
        string: '字符串',
        number: '数值',
        date: '日期',
        select: '枚举',
        boolean: '布尔',
        object: '对象',
      },
    }
  },
  methods: {
    reset() {
      this.localColumns = cloneDeep(this.columns)
      this.localColumns = sortBy(this.localColumns, [
        (obj) => (obj.visible ? 0 : 1),
        (obj) => obj.sort,
      ])
    },
    // 添加获取中文类型的方法
    getChineseType(type) {
      return this.typeMap[type] || type
    },
    handleSave() {
      this.localColumns.forEach((column, index) => {
        column.sort = index + 1 // 直接赋值
      })
      batchUpdateColumnConfig(this.localColumns).then((res) => {
        if (res.code === 200) {
          this.$message.success('字段配置保存成功')
          this.$router.go(0)
        }
      })
    },
    handleCancel() {
      console.log(12)
      //   this.$parent.closeDrawer()
    },
    handleExpandChange(row, expanded) {
      const index = this.expandedRows.indexOf(row.id)
      if (expanded) {
        if (index === -1) {
          this.expandedRows.push(row.id)
        }
      } else {
        if (index > -1) {
          this.expandedRows.splice(index, 1)
        }
      }
    },
    onDragStart() {
      //   console.log('开始拖拽')
    },
    onDragEnd() {
      //   console.log(this.localColumns.map((item) => item.label))
    },
  },
  mounted() {
    this.localColumns = cloneDeep(this.columns)
    this.localColumns = sortBy(this.localColumns, [
      (obj) => (obj.visible ? 0 : 1),
      (obj) => obj.sort,
    ])
  },
})
</script>

<style scoped lang="scss">
.column-setting-container {
  width: 100%;
  height: calc(100% - 58px);
  overflow: auto;
  position: relative;
  box-sizing: border-box;
  /* 隐藏垂直滚动条但保留滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
}

/* Chrome, Safari 和 Opera */
.column-setting-container::-webkit-scrollbar {
  width: 0;
  height: auto; /* 保持水平滚动条可见（如果有） */
}
.draggable-table {
  :deep(.el-table__body-wrapper) {
    overflow: visible;
  }
}

.fixed-footer {
  display: flex;
  position: fixed;
  border-top: 1px solid #e4e7ed;
  width: 30%;
  height: 58px;
  // right: 0;
  bottom: 0;
  // padding: 0 20px;
  background-color: #fff;
  align-items: center;
  z-index: 10;
}

.action-buttons {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  width: 100%;
}

.expand-form {
  padding: 20px;
  min-height: 180px;
  box-sizing: border-box;
}

// 更新antdpro风格的展开行样式（移除边框）
.antdpro-expand-form {
  background-color: #fafafa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin: 12px;
  padding: 24px;

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    border-radius: 4px;
    transition: all 0.3s;
  }

  :deep(.el-input__wrapper:focus-within),
  :deep(.el-select__wrapper:focus-within) {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  :deep(.el-switch__core) {
    border-radius: 10px;
  }

  :deep(.el-switch__label) {
    height: 20px;
    line-height: 20px;
  }

  // 优化表单布局，使标签和内容对齐更美观
  :deep(.el-form-item__content) {
    line-height: 32px;
  }
}

/* 拖拽手型图标 */
.cursor-move {
  cursor: move;
  user-select: none;
  vertical-align: middle; // 添加垂直居中
  display: inline-block; // 确保是行内块元素
  height: 100%; // 可选：保持高度充满
  line-height: inherit; // 可选：继承行高
}

/* 字段类型样式 */
.type-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

// 根据不同类型显示不同颜色
.type-badge.select {
  background-color: #e6f7ff;
  color: #1890ff;
}
.type-badge.number {
  background-color: #fff2e8;
  color: #fa8c16;
}
.type-badge.object {
  background-color: #f6ffed;
  color: #52c41a;
}
.type-badge.boolean {
  background-color: #e8f5ff;
  color: #1890ff;
}
.type-badge.string {
  background-color: #fff0f6;
  color: #eb2f96;
}
.type-badge.date {
  background-color: #f0f2f5;
  color: #595959;
}
</style>