<template>
  <div class="transaction-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">支付记录</span>
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
        <el-table-column prop="out_trade_no" label="订单号" width="280" show-overflow-tooltip />
        <el-table-column prop="subject" label="商品标题" min-width="150" show-overflow-tooltip />
        <el-table-column prop="amount" label="金额" width="120" align="center">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="method" label="支付方式" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ getMethodText(row.method) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updated_at) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
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
import type { Payment, PaymentStatus, PaymentMethod } from '@/types/transaction'
import dayjs from 'dayjs'

/** 加载状态 */
const loading = ref(false)

/** 表格数据 */
const tableData = ref<Payment[]>([])

/** 当前页码 */
const currentPage = ref(1)

/** 每页条数 */
const pageSize = ref(10)

/** 总条数 */
const total = ref(0)

/**
 * 加载数据
 */
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      skip: (currentPage.value - 1) * pageSize.value,
      limit: pageSize.value
    }
    const data = await getTransactionList(params)
    tableData.value = data
    // 注意：后端 API 目前不返回总条数，暂时使用数据长度估算
    total.value = data.length >= pageSize.value 
      ? currentPage.value * pageSize.value + 1 
      : (currentPage.value - 1) * pageSize.value + data.length
  } catch (error) {
    console.error('加载支付记录失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')

/**
 * 获取支付状态标签颜色
 */
const getStatusColor = (status: PaymentStatus): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const colors: Record<PaymentStatus, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    pending: 'warning',
    paid: 'success',
    failed: 'danger',
    cancelled: 'info',
    refunded: 'primary',
  }
  return colors[status] || 'info'
}

/**
 * 获取支付状态文本
 */
const getStatusText = (status: PaymentStatus) => {
  const texts: Record<PaymentStatus, string> = {
    pending: '待支付',
    paid: '已支付',
    failed: '支付失败',
    cancelled: '已取消',
    refunded: '已退款',
  }
  return texts[status] || status
}

/**
 * 获取支付方式文本
 */
const getMethodText = (method: PaymentMethod) => {
  const texts: Record<PaymentMethod, string> = {
    alipay: '支付宝',
    wechat: '微信',
    card: '银行卡',
    cash: '现金',
  }
  return texts[method] || method
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

/* 金额样式 */
.amount {
    font-weight: 600;
    color: #67c23a;
}

/* 无数据样式 */
.no-data {
    color: #c0c4cc;
}
</style>