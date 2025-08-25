<template>
  <el-tree
    ref="treeRef"
    :data="data"
    show-checkbox
    node-key="id"
    default-expand-all
    :default-checked-keys="checkedKeys"
    :props="treeProps"
  />
</template>

<script>
import { getPermTreeByRoleId } from '@/api/menu'

export default {
  name: 'PermTree',
  props: {
    row: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      treeProps: {
        children: 'children',
        label: (node) => {
          return node.meta?.title || node.title || '未命名'
        },
      },
      data: [],
    }
  },
  methods: {
    getCheckedKeys() {
      const checkedKeys = this.$refs.treeRef.getCheckedKeys()
      const halfCheckedKeys = this.$refs.treeRef.getHalfCheckedKeys() // 返回半选中的父节点
      return [...checkedKeys, ...halfCheckedKeys]
    },
  },
  computed: {
    // 收集所有 hasPerm === true 的节点 id
    checkedKeys() {
      const keys = []
      const traverse = (nodes) => {
        nodes.forEach((node) => {
          if (node.hasPerm === true) {
            keys.push(node.id)
          }
          if (node.children && node.children.length > 0) {
            traverse(node.children)
          }
        })
      }
      traverse(this.data)
      return keys
    },
  },
  created() {
    getPermTreeByRoleId({ roleId: this.row.id }).then((res) => {
      this.data = res.data
    })
  },
}
</script>