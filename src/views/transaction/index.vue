<template>
  <div class="transaction-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">交易记录</span>
        </div>
      </template>

      <el-table 
        v-loading="loading" 
        :data="tableData" 
        stripe 
        border
        class="theme-table"
      >
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="user_id" label="用户ID" width="100" align="center" />
        <el-table-column prop="transaction_type" label="交易类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.transaction_type)">
              {{ getTypeText(row.transaction_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.amount >= 0 ? '#67c23a' : '#f56c6c' }">
              ¥{{ row.amount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="points_earned" label="积分" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.points_earned" type="success">+{{ row.points_earned }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="created_at" label="交易时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getTransactionList } from '@/api/transaction'
import type { Transaction } from '@/types/transaction'
import dayjs from 'dayjs'

const loading = ref(false)
const tableData = ref<Transaction[]>([])
const currentPage = ref(1)
const pageSize = ref(10) // 保持默认值，尽管 layout 中没有显示 sizes
const total = ref(0)

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      skip: (currentPage.value - 1) * pageSize.value,
      limit: pageSize.value
    }
    const data = await getTransactionList(params)
    tableData.value = data
    // 注意：这里需要后端返回总数，暂时使用数据长度作为示例
    total.value = data.length
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')

const getTypeColor = (type: string) => {
  const colors: Record<string, any> = {
    purchase: 'primary',
    service: 'success',
    boarding: 'warning',
    refund: 'info',
  }
  // 由于全局 primary 被定义为粉色系，这里使用 primary 来适配
  if (type === 'purchase') return 'primary'
  return colors[type] || ''
}

const getTypeText = (type: string) => {
  const texts: Record<string, string> = {
    purchase: '商品购买',
    service: '服务消费',
    boarding: '寄养消费',
    refund: '退款',
  }
  return texts[type] || type
}

onMounted(() => loadData())
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--pet-text);
  display: flex;
  align-items: center;
}

/* 标题左侧的装饰色带，使用热情的粉红色 */
.title::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 20px;
    background: var(--pet-primary-dark); /* #FF69B4 */
    border-radius: 3px;
    margin-right: 12px;
}

/* Table specific overrides - 应用主题样式 */
.theme-table {
    border-radius: 12px;
    overflow: hidden; 
    border: 1px solid var(--pet-border);
    margin-bottom: 0 !important; 
}

/* Customizing stripe row: 使用主色调浅粉色的极淡背景 */
.theme-table :deep(.el-table__row.el-table__row--striped) {
    background-color: #FFF0F5 !important; 
}

/* Customizing header: 使用玉米色背景，文字为深色 */
.theme-table :deep(.el-table__header-wrapper) th {
    background-color: var(--pet-background); /* #FFF8DC */
    color: var(--pet-text);
    font-weight: 600;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

/* Pagination active color: 使用浅粉色作为激活背景 */
.pagination :deep(.el-pager li.is-active) {
    background-color: var(--pet-primary) !important; /* #FFB6C1 */
    color: white !important; /* 确保高对比度 */
    font-weight: 600;
}

/* 增强金额的视觉强调 */
.el-table :deep(.el-table__cell span[style*="#67c23a"]),
.el-table :deep(.el-table__cell span[style*="#f56c6c"]) {
    font-weight: 600;
}
</style>