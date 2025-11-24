<template>
  <div class="transaction-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">交易记录</span>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" stripe border>
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
const pageSize = ref(10)
const total = ref(0)

const loadData = async () => {
  loading.value = true
  try {
    const data = await getTransactionList({ skip: (currentPage.value - 1) * pageSize.value, limit: pageSize.value })
    tableData.value = data
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
}
.title {
  font-size: 18px;
  font-weight: 500;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
