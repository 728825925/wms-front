<template>
  <el-dialog
    :model-value="visible"
    :title="null"
    :close-on-click-modal="false"
    @close="handleClose"
    class="custom-dialog"
  >
    <!-- 自定义头部：标题靠左 -->
    <template #header>
      <div class="dialog-header">
        <h3 class="dialog-title">{{ title }}</h3>
      </div>
    </template>
    <!-- 表单区域 -->
    <div class="form-container">
      <CustomForm
        :modelValue="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
        :config="config"
        ref="customFormRef"
      />
    </div>
    <!-- 底部按钮：靠右 -->
    <template #footer>
      <div class="dialog-footer">
        <ProButton type="default" @click="onCancel">取消</ProButton>
        <ProButton type="primary" @click="onSubmit">确认</ProButton>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import ProButton from './ProButton.vue'

export default {
  name: 'CustomDialogForm',
  components: { ProButton },
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, required: true },
    config: { type: Object, required: true },
    modelValue: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {}
  },
  methods: {
    handleClose() {
      this.$refs.customFormRef.reset()
      this.$emit('update:visible', false)
    },
    onSubmit() {
      this.$refs.customFormRef.validate(async (valid) => {
        if (valid) {
          this.$emit('submit', this.$refs.customFormRef.form)
        }
      })
    },
    onCancel() {
      this.$emit('update:visible', false)
    },
  },
}
</script>

<style scoped lang="scss">
// ==================== 对话框整体风格 ====================
.custom-dialog {
  :deep(.el-dialog__header) {
    padding: 16px 20px 8px;
  }

  :deep(.el-dialog__body) {
    padding: 12px 20px 20px;
  }

  :deep(.el-dialog__footer) {
    padding: 10px 20px 20px;
  }
}

// ==================== 自定义标题栏 ====================
.dialog-header {
  width: 100%;
  margin-bottom: 16px;
  padding-bottom: 8px;
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
  font-family: '微软雅黑', 'Microsoft YaHei', sans-serif;
  margin: 0;
}

// ==================== 表单容器 ====================
.form-container {
  max-width: 760px;
  margin: 0 auto;
}

// ==================== 表单项样式 ====================
:deep(.el-form-item) {
  padding-top: 12px;
  margin-bottom: 12px;
}

// 标签样式：加粗、字体统一
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #1f1f1f;
  font-family: '微软雅黑', 'Microsoft YaHei', Arial, sans-serif;
  font-size: 14px;
  letter-spacing: 0.3px;
}

// 动态输入框统一宽度
:deep(.dynamic-input) {
  width: 100% !important;
  font-family: '微软雅黑', 'Microsoft YaHei', sans-serif;
}

// 保证所有输入组件撑满
:deep(.el-input__wrapper),
:deep(.el-select__wrapper),
:deep(.el-date-editor) {
  width: 100%;
}

// ==================== 右侧列微调：稍微靠左一点 ====================
:deep(.form-item-right) {
  padding-right: 12px !important; // 默认是 15px，减小右边距
  padding-left: 15px !important;
}

// ==================== 底部按钮靠右 ====================
.dialog-footer {
  padding-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .pro-button {
    min-width: 80px;
    padding: 8px 20px;
    border-radius: 6px;
    font-weight: 500;
    font-family: '微软雅黑', 'Microsoft YaHei', sans-serif;
  }
}

// ==================== 响应式适配 ====================
@media (max-width: 768px) {
  .form-container {
    padding: 0 10px;
  }

  :deep(.el-col-xs-24) {
    width: 100%;
    flex: 0 0 100%;
  }

  :deep(.form-item-right) {
    padding-right: 15px !important;
  }
}
</style>