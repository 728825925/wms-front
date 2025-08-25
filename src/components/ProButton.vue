<template>
  <button
    :class="['pro-btn', type, { 'pro-btn-icon': icon && !$slots.default, plain: plain }]"
    v-bind="$attrs"
    :title="title"
    :style="$attrs.style"
  >
    <IconifyIcon v-if="icon" :icon="icon" class="pro-btn-iconify" />
    <template v-if="$slots.default">
      <slot />
    </template>
  </button>
</template>

<script>
export const buttonTypeKeys = ['default', 'primary', 'danger', 'noborder']
</script>

<script setup>

defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => buttonTypeKeys.includes(value),
  },
  icon: { type: String, default: '' },
  title: { type: String, default: '' },
  plain: { type: Boolean, default: false },
})
</script>

<style scoped lang="scss">
@use 'sass:color';
@use 'sass:map'; // 导入Sass内置map模块
// @use 'sass:map';

// Define button types in SCSS
$buttonTypes: (
  default: (
    bg: #fff,
    text: #1f1f1f,
    border: #d9d9d9,
    hoverBg: #d9d9d9,
  ),
  primary: (
    bg: #636cff,
    text: #fff,
    border: #636cff,
    hoverBg: #4f53c6,
  ),
  danger: (
    bg: #f56c6c,
    text: #fff,
    border: #f56c6c,
    hoverBg: #e05e5e,
  ),
  noborder: (
    bg: #fff,
    text: #222,
    border: transparent,
    hoverBg: #e4e7ed,
  ),
);

/* Base button styles */
.pro-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
  cursor: pointer;
  font-size: 14px;
  padding: 0 12px;
  min-width: min-content;
  height: 28px;
  border-radius: 6px;
  border: 1px solid;
  font-weight: bold;
  letter-spacing: 1px;
  font-family: '微软雅黑', 'Microsoft YaHei', Arial, sans-serif;
  transition: all 0.2s;
}

/* 添加点击时的紫色光晕效果 */
.pro-btn:active {
  box-shadow: 0 0 8px rgba(102, 51, 153, 0.7);
}

/* Generate styles for each button type */
@each $type, $colors in $buttonTypes {
  .pro-btn.#{$type} {
    background: map.get($colors, bg);
    color: map.get($colors, text);
    border-color: map.get($colors, border);

    &:hover {
      background: map.get($colors, hoverBg);
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
    }

    &.plain {
      background: #fff !important;
      border-color: map.get($colors, border) !important;
      color: map.get($colors, border) !important;

      // 特殊处理：default 类型使用深色文字
      @if $type == 'default' {
        color: map.get($colors, text) !important;
      }

      &:hover {
        // ✅ 替代 lighten($color, 40%)：直接提升 lightness 40 个百分点
        background: color.adjust(map.get($colors, border), $lightness: +40%) !important;
      }

      .pro-btn-iconify {
        color: inherit !important;
      }
    }
  }
}

/* Icon button specific styles */
.pro-btn-icon {
  padding: 0;
  min-width: 50px;
  min-height: 36px;
  justify-content: center;
}

/* Icon styles */
.pro-btn-iconify {  
  font-size: 15px;
  margin-right: 6px;
  display: flex;
  align-items: center;
}

.pro-btn-icon .pro-btn-iconify {
  margin-right: 0;
}
</style>