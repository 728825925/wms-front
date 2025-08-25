// 分页参数类
export class PaginationQuery {
  constructor(pageNum = 1, pageSize = 10, query = {}) {
    this.pageNum = pageNum
    this.pageSize = pageSize
    this.query = query
  }

  // 构建请求参数
  toRequestData() {
    return {
      pageNum: this.pageNum,
      pageSize: this.pageSize,
      query: this.query
    }
  }

  // 重置分页参数
  reset() {
    this.pageNum = 1
    this.pageSize = 10
    this.query = {}
  }
}

// 分页响应数据类
export class PaginationResponse {
  constructor(records = [], pageNum = 1, pageSize = 10, total = 0) {
    this.records = records
    this.pageNum = pageNum
    this.pageSize = pageSize
    this.total = total
  }

  // 从后端响应数据创建分页对象
  static fromResponse(data) {
    return new PaginationResponse(
      data.records || [],
      data.pageNum || 1,
      data.pageSize || 10,
      data.total || 0
    )
  }

  // 获取总页数
  get totalPages() {
    return Math.ceil(this.total / this.pageSize)
  }

  // 是否有下一页
  get hasNext() {
    return this.pageNum < this.totalPages
  }

  // 是否有上一页
  get hasPrev() {
    return this.pageNum > 1
  }
}

// 分页 Hook（Composition API）
import { ref } from 'vue'
export function usePagination(initialQuery = {}) {
  const pagination = ref(new PaginationQuery(1, 10, initialQuery))
  const loading = ref(false)
  const data = ref([])
  const total = ref(0)

  // 获取分页数据
  const fetchData = async (apiFunction) => {
    loading.value = true
    try {
      const response = await apiFunction(pagination.value.toRequestData())
      const paginationResponse = PaginationResponse.fromResponse(response.data || response)
      data.value = paginationResponse.records
      total.value = paginationResponse.total
      pagination.value.pageNum = paginationResponse.pageNum
      pagination.value.pageSize = paginationResponse.pageSize
    } catch (error) {
      console.error('获取分页数据失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 页码改变
  const handlePageChange = (page) => {
    pagination.value.pageNum = page
  }

  // 每页条数改变
  const handleSizeChange = (size) => {
    pagination.value.pageSize = size
    pagination.value.pageNum = 1
  }

  // 搜索
  const handleSearch = (query) => {
    pagination.value.query = { ...pagination.value.query, ...query }
    pagination.value.pageNum = 1
  }

  // 重置
  const handleReset = () => {
    pagination.value.reset()
  }

  return {
    pagination,
    loading,
    data,
    total,
    fetchData,
    handlePageChange,
    handleSizeChange,
    handleSearch,
    handleReset
  }
} 