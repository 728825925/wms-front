<template>
  <el-form
    ref="formRef"
    :model="form"
    :label-position="config.labelPosition || 'right'"
    :label-width="config.labelWidth || '80px'"
    :size="config.size || 'default'"
  >
    <el-row :gutter="config.gutter || 20">
      <template v-for="item in config.formItems" :key="item.field">
        <!-- 跳过不显示的字段 -->
        <el-col v-if="!item.hidden" :span="item.span || 24">
          <el-form-item :label="item.label" :prop="item.field" :rules="getRules(item)">
            <!-- 特殊处理 select -->
            <el-select
              v-if="item.type === 'select'"
              v-model="form[item.field]"
              v-bind="item.attrs"
              :multiple="item.attrs?.multiple || item.multiple"
              :placeholder="item.placeholder || `请输入${item.label}`"
            >
              <el-option
                v-for="opt in item.options"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>

            <!-- 其他组件用 component -->
            <component
              v-else
              :is="getComponentName(item.type)"
              v-model="form[item.field]"
              v-bind="getItemProps(item)"
              :placeholder="item.placeholder || `请输入${item.label}`"
            >
              <!-- radio group 也需要单独处理 -->
              <template v-if="item.type === 'radio' && item.options">
                <el-radio v-for="opt in item.options" :key="opt.value" :label="opt.value">
                  {{ opt.label }}
                </el-radio>
              </template>

              <!-- checkbox group -->
              <template v-if="item.type === 'checkbox' && item.options">
                <el-checkbox v-for="opt in item.options" :key="opt.value" :label="opt.value">
                  {{ opt.label }}
                </el-checkbox>
              </template>
            </component>
          </el-form-item>
        </el-col>
      </template>
    </el-row>
  </el-form>
</template>

<script>
// import { cloneDeep } from 'es-toolkit/object'

export default {
  name: 'CustomForm',
  props: {
    config: {
      type: Object,
      required: true,
      validator: (value) => value.formItems && Array.isArray(value.formItems),
    },
    modelValue: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      form: this.filterModelValue(this.modelValue),
    }
  },
  mounted() {
    this.$emit('ready')
  },
  watch: {
    modelValue: {
      handler(val) {
        this.form = this.filterModelValue(val)
      },
      deep: true,
    },
  },
  methods: {
    getComponentName(type) {
      const TYPE_MAP = {
        input: 'el-input',
        number: 'el-input-number',
        select: 'el-select',
        radio: 'el-radio-group',
        checkbox: 'el-checkbox-group',
        date: 'el-date-picker',
        datetime: 'el-date-picker',
        textarea: 'el-input',
        switch: 'el-switch',
      }
      return TYPE_MAP[type] || 'el-input'
    },
    getItemProps(item) {
      const props = { ...item.attrs }

      if (item.type === 'date' || item.type === 'datetime') {
        // 强制使用 datetimerange（带时间的范围）
        props.type = 'datetimerange'

        // 范围连接符
        props['range-separator'] = '至'
        props['start-placeholder'] = item.startPlaceholder || '开始时间'
        props['end-placeholder'] = item.endPlaceholder || '结束时间'

        // 统一格式为：yyyy-MM-dd HH:mm:ss
        props.format = 'YYYY-MM-DD HH:mm:ss'
        props['value-format'] = 'YYYY-MM-DD HH:mm:ss'

        // 强制开启时分秒选择（包括秒）
        props.showTime = { showSeconds: true }

        // 设置默认时间：开始 00:00:00，结束 23:59:59
        props.defaultTime = [
          new Date(2000, 0, 1, 0, 0, 0), // 开始时间默认为当天 00:00:00
          new Date(2000, 0, 1, 23, 59, 59), // 结束时间默认为当天 23:59:59
        ]
      }

      return props
    },
    getRules(item) {
      const rules = []
      const TRIGGER_MAP = {
        input: 'blur',
        number: 'blur',
        select: 'change',
        radio: 'change',
        checkbox: 'change',
        date: 'change',
        datetime: 'change',
        textarea: 'blur',
        switch: 'change',
      }

      if (item.required) {
        rules.push({
          required: true,
          message: item.message || `${item.label}不能为空`,
          trigger: item.trigger || TRIGGER_MAP[item.type] || 'blur',
        })
      }

      if (item.pattern) {
        const pattern = typeof item.pattern === 'string' ? new RegExp(item.pattern) : item.pattern
        rules.push({
          pattern,
          message: item.patternMessage || `请输入正确的${item.label}格式`,
          trigger: item.trigger || TRIGGER_MAP[item.type] || 'blur',
        })
      }

      if (Array.isArray(item.rules)) {
        item.rules.forEach((rule) => {
          rules.push({
            ...rule,
            message: rule.message || `${item.label}不符合要求`,
            trigger: rule.trigger || TRIGGER_MAP[item.type] || 'blur',
          })
        })
      }

      return rules.length > 0 ? rules : undefined
    },
    validate(callback) {
      this.$refs.formRef.validate(callback)
    },
    reset() {
      this.$refs.formRef.resetFields()
    },
    getQueryConditions() {
      const formItems = this.config.formItems
      return formItems
        .filter((item) => {
          const value = this.form[item.field]
          return value !== null && value !== undefined && value !== ''
        })
        .map((item) => ({
          prop: item.field,
          value: this.form[item.field],
          operator: item.operator || 'LIKE',
          component: ['date', 'datetime'].includes(item.type) ? 'el-date-picker' : 'other',
        }))
    },
    filterModelValue(value) {
      const result = {}
      this.config.formItems.forEach((item) => {
        if (item.field && Object.prototype.hasOwnProperty.call(value, item.field)) {
          // 只复制 formItems 中定义的字段
          result[item.field] = value[item.field]
        }
        if (value.id !== undefined && value.id !== null && value.id !== '') {
          result.id = value.id
        }
      })
      return result
    },
  },
}
</script>

<style scoped lang="scss">
:deep(.el-form-item__label) {
  font-weight: 500 !important;
  color: #1f1f1f !important;
  font-family: '微软雅黑', 'Microsoft YaHei', Arial, sans-serif !important;
  font-size: 14px !important;
  letter-spacing: 0.5px;
}

:deep(.el-form-item__label::after) {
  font-weight: 500 !important;
  color: #1f1f1f !important;
  font-size: 14px !important;
}
</style>