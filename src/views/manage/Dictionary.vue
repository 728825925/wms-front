<!-- RoleForm.vue -->
<template>
  <div style="height: 100%">
    <CustomTable
      :tableTitle="entity.remark"
      :columnConfigList="columnConfigList"
      :formConfig="formConfig"
      :tableConfig="tableConfig"
      @reset="handleReset"
      @search="handleSearch"
      @addData="handleAddData"
      @updateData="handleUpdateData"
      @deleteData="handleDeleteData"
      @action="handleAction"
    />
  </div>
</template>

<script>
import CustomTable from '@/components/CustomTable.vue' // 路径请根据你的项目结构调整
import { getColumnConfig, getDictItemsByCodes } from '@/api/columnConfig'
import { buildFormConfig } from '@/utils/customForm'
import { buildTableColumns } from '@/utils/tableUtils.js'
// import { h, resolveComponent } from 'vue'
import { cloneDeep } from 'es-toolkit/object'
import { getDictList, addDict, editDict, deleteDict } from '@/api/dict'
import { showDialog } from '@/utils/Dialog.js'
import DictionaryItem from '@/views/manage/DictionaryItem.vue'

export default {
  name: 'DictView',
  components: {
    CustomTable,
  },
  data() {
    const permissionPrifex = 'system:dict'

    return {
      entity: {
        className: 'DictTypeDO',
        remark: '字典',
        permission: permissionPrifex + ':list',
      },
      columnConfigList: [],
      formConfig: {
        searchFormConfig: {},
        addFormConfig: {},
        editFormConfig: {},
      },
      tableConfig: {
        tableData: [],
        tableColumns: [],
        toolbarButtons: [
          {
            key: 'add',
            label: '新增',
            icon: 'ep:plus',
            action: 'add',
            type: 'primary',
            permission: permissionPrifex + ':add',
          },
          {
            key: 'batchDelete',
            label: '批量删除',
            icon: 'ep:delete',
            action: 'batchDelete',
            type: 'danger',
            permission: permissionPrifex + ':delete',
          },
          {
            key: 'refresh',
            label: '刷新',
            icon: 'material-symbols:refresh-rounded',
            action: 'refresh',
            type: 'default',
            permission: permissionPrifex + ':list',
          },
          {
            key: 'columnSetting',
            label: '字段设置',
            icon: 'ep:setting',
            action: 'columnSetting',
            type: 'default',
            permission: permissionPrifex + ':setting',
          },
        ],
        actionButtons: [
          {
            key: 'detail',
            label: '明细',
            icon: 'material-symbols:view-list-sharp',
            action: 'detail',
            type: 'primary',
            permission: permissionPrifex + ':detail',
          },
          {
            key: 'edit',
            label: '编辑',
            icon: 'ep:edit',
            action: 'edit',
            type: 'primary',
            permission: permissionPrifex + ':edit',
          },
          {
            key: 'delete',
            label: '删除',
            icon: 'ep:delete',
            action: 'delete',
            type: 'danger',
            permission: permissionPrifex + ':delete',
          },
        ],
      },
      dictData: {},
      columnOptionsMap: new Map(),
      customSlots: [],
    }
  },
  async created() {
    await this.setFieldOptions()
    await this.initAllConfig()
  },
  methods: {
    async setFieldOptions() {
      //获取parentId字段的下拉框
      //   const res = await getMenuList({
      //     pageSize: -1,
      //     pageNum: 1,
      //     conditions: [
      //       {
      //         field: 'menu_type',
      //         operator: 'EQ',
      //         value: 'M',
      //       },
      //     ],
      //     sortConditions: [],
      //   })
      //   const parentIdOptions = res.data.records.map((item) => {
      //     return {
      //       label: item.title,
      //       value: item.id,
      //     }
      //   })
      //   this.columnOptionsMap.set('parentId', parentIdOptions)
    },
    async getTableData(params) {
      return await getDictList(params)
    },
    async addData(formData) {
      return await addDict(formData)
    },
    async updateTableData(formData) {
      return await editDict(formData)
    },
    async deleteData(formData) {
      return await deleteDict(formData)
    },
    getFieldOptions() {},
    //重置查询表单 searchForm->重置前表单数据
    handleReset(searchForm) {
      searchForm
      // console.log('searchForm',JSON.stringify(searchForm))
    },
    async handleSearch(params, done) {
      const res = await this.getTableData(params)
      this.tableConfig.tableData = res.data.records
      done()
    },
    async handleAddData(formData, done) {
      await this.addData(formData)
      done()
    },
    async handleUpdateData(formData, done) {
      await this.updateTableData(formData)
      done()
    },
    async handleDeleteData(idList, done) {
      await this.deleteData(idList)
      done()
    },
    handleAction(action, row) {
      switch (action) {
        case 'detail':
          showDialog(DictionaryItem, {
            title: '详情',
            width: '80%',
            props: {
              row: row,
            },
            onClose: () => {
              console.log('详情弹窗已关闭')
            },
          })
          break
      }
    },
    async initAllConfig() {
      //获取配置
      const res = await getColumnConfig(this.entity.className)
      this.columnConfigList = cloneDeep(res.data.records)
      //获取字典
      const dictCodes = [
        ...new Set(this.columnConfigList.map((item) => item.dictCode).filter(Boolean)),
      ]
      if (dictCodes.length) {
        this.dictLoading = true
        const res = await getDictItemsByCodes(dictCodes)
        this.dictData = res.data || {}
      }
      this.columnConfigList.forEach((item) => {
        // 处理字典数据
        if (item.dictCode) {
          console.log(item.field)
          const options = this.dictData[item.dictCode] || []
          options.forEach((option) => {
            option.label = option.itemName
            option.value = option.itemValue
          })
          item.options = options
          item.type = 'select'
        }
        // 处理 columnOptionsMap 数据
        if (this.columnOptionsMap.has(item.field)) {
          item.options = this.columnOptionsMap.get(item.field)
          item.type = 'select'
        }
      })
      // debugger
      this.formConfig = buildFormConfig(this.columnConfigList)
      //构建tablecol
      this.tableConfig.tableColumns = buildTableColumns(
        this.columnConfigList,
        this.dictData || {},
        this.customSlots
      )
      this.columnConfigList = res.data.records
    },
  },
}
</script>

<style scoped>
.page-container {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
</style>@/utils/table.js