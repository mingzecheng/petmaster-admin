<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card card-1">
          <div class="stat-icon">
            <el-icon :size="40"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card card-2">
          <div class="stat-icon">
            <el-icon :size="40"><Orange /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalPets }}</div>
            <div class="stat-label">宠物总数</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card card-3">
          <div class="stat-icon">
            <el-icon :size="40"><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.todayAppointments }}</div>
            <div class="stat-label">今日预约</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card card-4">
          <div class="stat-icon">
            <el-icon :size="40"><Wallet /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ stats.todayRevenue }}</div>
            <div class="stat-label">今日营收</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近7天预约趋势</span>
              <el-icon><TrendCharts /></el-icon>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-icon :size="60" color="#ddd"><DataAnalysis /></el-icon>
            <p>图表数据加载中...</p>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>服务类型分布</span>
              <el-icon><PieChart /></el-icon>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-icon :size="60" color="#ddd"><DataAnalysis /></el-icon>
            <p>图表数据加载中...</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card class="list-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近预约</span>
              <el-link type="primary" :underline="false" @click="goToAppointments">
                查看更多 <el-icon><ArrowRight /></el-icon>
              </el-link>
            </div>
          </template>
          <el-empty v-if="recentAppointments.length === 0" description="暂无预约" />
          <div v-else class="list-items">
            <div
              v-for="item in recentAppointments"
              :key="item.id"
              class="list-item"
            >
              <el-icon color="#409eff"><Calendar /></el-icon>
              <div class="item-content">
                <div class="item-title">预约 #{{ item.id }}</div>
                <div class="item-time">{{ formatDate(item.appointment_date) }}</div>
              </div>
              <el-tag :type="getStatusType(item.status)">{{ getStatusText(item.status) }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card class="list-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>进行中的寄养</span>
              <el-link type="primary" :underline="false" @click="goToBoarding">
                查看更多 <el-icon><ArrowRight /></el-icon>
              </el-link>
            </div>
          </template>
          <el-empty v-if="ongoingBoarding.length === 0" description="暂无寄养" />
          <div v-else class="list-items">
            <div
              v-for="item in ongoingBoarding"
              :key="item.id"
              class="list-item"
            >
              <el-icon color="#67c23a"><House /></el-icon>
              <div class="item-content">
                <div class="item-title">寄养 #{{ item.id }}</div>
                <div class="item-time">{{ formatDate(item.start_date) }} - {{ formatDate(item.end_date) }}</div>
              </div>
              <el-tag type="success">进行中</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserList } from '@/api/user'
import { getPetList } from '@/api/pet'
import { getAppointmentList } from '@/api/appointment'
import { getOngoingBoarding } from '@/api/boarding'
import type { Appointment } from '@/types/appointment'
import type { Boarding } from '@/types/boarding'
import dayjs from 'dayjs'

const router = useRouter()

const stats = ref({
  totalUsers: 0,
  totalPets: 0,
  todayAppointments: 0,
  todayRevenue: 0,
})

const recentAppointments = ref<Appointment[]>([])
const ongoingBoarding = ref<Boarding[]>([])

const loadStats = async () => {
  try {
    // 加载用户数
    const users = await getUserList({ limit: 1000 })
    stats.value.totalUsers = users.length

    // 加载宠物数
    const pets = await getPetList({ limit: 1000 })
    stats.value.totalPets = pets.length

    // 加载预约
    const appointments = await getAppointmentList({ limit: 1000 })
    const today = dayjs().format('YYYY-MM-DD')
    stats.value.todayAppointments = appointments.filter(
      (a) => dayjs(a.appointment_date).format('YYYY-MM-DD') === today
    ).length

    // 最近预约
    recentAppointments.value = appointments.slice(0, 5)

    // 加载进行中的寄养
    const boarding = await getOngoingBoarding({ limit: 5 })
    ongoingBoarding.value = boarding

    // 模拟今日营收
    stats.value.todayRevenue = Math.floor(Math.random() * 10000)
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    pending: 'warning',
    confirmed: 'primary',
    completed: 'success',
    cancelled: 'info',
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消',
  }
  return texts[status] || status
}

const goToAppointments = () => {
  router.push('/appointments')
}

const goToBoarding = () => {
  router.push('/boarding')
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  transition: all 0.3s;
  cursor: default;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.card-1 .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-2 .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.card-3 .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.card-4 .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 16px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card,
.list-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.chart-card:hover,
.list-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.list-items {
  max-height: 300px;
  overflow-y: auto;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item:hover {
  background: #f5f7fa;
}

.item-content {
  flex: 1;
  margin-left: 12px;
}

.item-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.item-time {
  font-size: 12px;
  color: #999;
}
</style>
