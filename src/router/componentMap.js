// 1. 扫描所有 views 下的 .vue 文件和 layouts 下的布局组件
const modules = import.meta.glob(['@/views/**/*.vue', '@/layouts/**/*.vue'])
// 2. 自动构建 componentMap
const componentMap = {}

// 遍历所有匹配的文件路径
for (const [path, importer] of Object.entries(modules)) {
  // 从路径提取组件名，比如：
  // '@/views/User.vue'        → User
  // '@/views/order/List.vue' → List
  // '@/layouts/MenuLayout.vue' → layout:menu
  let componentName = ''
  if (path.includes('layouts/')) {
    // 处理布局组件
    componentName = 'layout:' + path.replace(/.*layouts\//, '').replace(/\.vue$/, '')
  } else {
    // 处理普通页面组件
    componentName = path
      .replace(/\.\/views\/|\.vue$/g, '')  // 去掉前后缀
      .split('/')                         // 拆分路径
      .pop()                              // 取最后一段
  }

  if (componentName) {
    componentMap[componentName] = importer
  }
}

export default componentMap