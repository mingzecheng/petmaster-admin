<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row animate-slide-up" style="animation-delay: 0.1s">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card card-1 tilt-effect clickable-card" @click="showUserStats">
          <div class="stat-icon pet-icon">
            <el-icon :size="24"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">总用户数 (点击查看详情)</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card card-2 tilt-effect">
          <div class="stat-icon pet-icon">
            <el-icon :size="24"><Orange /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalPets }}</div>
            <div class="stat-label">宠物总数</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card card-3 tilt-effect">
          <div class="stat-icon pet-icon">
            <el-icon :size="24"><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.todayAppointments }}</div>
            <div class="stat-label">今日预约</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card card-4 tilt-effect">
          <div class="stat-icon pet-icon">
            <el-icon :size="24"><Wallet /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ stats.todayRevenue }}</div>
            <div class="stat-label">今日营收</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 用户分布统计弹窗 -->
    <el-dialog v-model="userStatsVisible" title="用户分布统计" width="600px" align-center class="stats-dialog">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="role-stat-item admin-bg">
            <el-icon :size="32" class="role-icon-lg"><UserFilled /></el-icon>
            <div class="role-count">{{ stats.totalAdmins }}</div>
            <div class="role-name">管理员</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="role-stat-item staff-bg">
            <el-icon :size="32" class="role-icon-lg"><User /></el-icon>
            <div class="role-count">{{ stats.totalStaff }}</div>
            <div class="role-name">员工</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="role-stat-item member-bg">
            <el-icon :size="32" class="role-icon-lg"><Avatar /></el-icon>
            <div class="role-count">{{ stats.totalMembers }}</div>
            <div class="role-name">会员</div>
          </div>
        </el-col>
      </el-row>
    </el-dialog>

    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近7天预约趋势</span>
              <el-icon color="var(--pet-primary-dark)"><TrendCharts /></el-icon>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>服务类型分布</span>
              <el-icon color="var(--pet-primary-dark)"><PieChart /></el-icon>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-container"></div>
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
          <el-empty v-if="recentAppointments.length === 0" description="暂无预约" :image-size="80" />
          <div v-else class="list-items">
            <div
              v-for="item in recentAppointments"
              :key="item.id"
              class="list-item"
            >
              <div class="item-icon pet-icon">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="item-content">
                <div class="item-title">预约 #{{ item.id }}</div>
                <div class="item-time">{{ formatDate(item.appointment_date) }}</div>
              </div>
              <el-tag :type="getStatusType(item.status)" class="status-tag">{{ getStatusText(item.status) }}</el-tag>
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
          <el-empty v-if="ongoingBoarding.length === 0" description="暂无寄养" :image-size="80" />
          <div v-else class="list-items">
            <div
              v-for="item in ongoingBoarding"
              :key="item.id"
              class="list-item"
            >
              <div class="item-icon pet-icon secondary-icon">
                <el-icon><House /></el-icon>
              </div>
              <div class="item-content">
                <div class="item-title">寄养 #{{ item.id }}</div>
                <div class="item-time">{{ formatDate(item.start_date) }} - {{ formatDate(item.end_date) }}</div>
              </div>
              <el-tag type="success" class="status-tag">进行中</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getUserList } from '@/api/user'
import { getPetList } from '@/api/pet'
import { getAppointmentList } from '@/api/appointment'
import { getOngoingBoarding } from '@/api/boarding'
import type { Appointment } from '@/types/appointment'
import type { Boarding } from '@/types/boarding'
import dayjs from 'dayjs'
import { User, Orange, Calendar, Wallet, TrendCharts, PieChart, DataAnalysis, House, ArrowRight, UserFilled, Avatar } from '@element-plus/icons-vue' 
import { getStatistics, getAppointmentTrend, getServiceDistribution } from '@/api/dashboard'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

const router = useRouter()

const stats = ref({
  totalUsers: 0,
  totalAdmins: 0,
  totalStaff: 0,
  totalMembers: 0,
  totalPets: 0,
  todayAppointments: 0,
  todayRevenue: 0,
})

const loading = ref(false)
const userStatsVisible = ref(false)
const recentAppointments = ref<Appointment[]>([])
const ongoingBoarding = ref<Boarding[]>([])

const trendChartRef = ref<HTMLDivElement>()
const pieChartRef = ref<HTMLDivElement>()
let trendChart: ECharts | null = null
let pieChart: ECharts | null = null

const showUserStats = () => {
  userStatsVisible.value = true
}

const loadStats = async () => {
  loading.value = true
  try {
    // 获取统计数据
    const statsData = await getStatistics()
    stats.value = statsData
    
    // 获取最近预约
    const recent = await getAppointmentList({ skip: 0, limit: 5 })
    recentAppointments.value = recent.slice(0, 3)
    
    // 获取进行中的寄养
    const ongoing = await getOngoingBoarding({ skip: 0, limit: 5 })
    ongoingBoarding.value = ongoing.slice(0, 3)
    
    // 初始化图表
    await nextTick()
    initCharts()
    
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载数据失败，请刷新页面重试')
  } finally {
    loading.value = false
  }
}

const initCharts = async () => {
  try {
    // 获取图表数据
    const [trendData, distributionData] = await Promise.all([
      getAppointmentTrend(),
      getServiceDistribution()
    ])
    
    // 初始化预约趋势图
    if (trendChartRef.value) {
      trendChart = echarts.init(trendChartRef.value)
      trendChart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: trendData.map(item => dayjs(item.date).format('MM-DD')),
          axisLine: { lineStyle: { color: '#E0E0E0' } },
          axisLabel: { color: '#666' }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#E0E0E0' } },
          axisLabel: { color: '#666' },
          splitLine: { lineStyle: { color: '#F5F5F5' } }
        },
        series: [{
          data: trendData.map(item => item.count),
          type: 'line',
          smooth: true,
          lineStyle: { color: '#FFD600', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(255, 214, 0, 0.3)' },
                { offset: 1, color: 'rgba(255, 214, 0, 0.05)' }
              ]
            }
          },
          itemStyle: { color: '#FFD600' }
        }],
        grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true }
      })
    }
    
    // 初始化服务分布饼图
    if (pieChartRef.value) {
      pieChart = echarts.init(pieChartRef.value)
      pieChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: '5%',
          top: 'center'
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          data: distributionData.map((item, index) => ({
            value: item.count,
            name: item.serviceName,
            itemStyle: {
              color: ['#FFD600', '#2979FF', '#00E676', '#FF6D00', '#9C27B0'][index % 5]
            }
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: { show: true, formatter: '{b}\n{d}%' }
        }]
      })
    }
  } catch (error) {
    console.error('初始化图表失败:', error)
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

onUnmounted(() => {
  // 销毁图表实例
  trendChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-row {
  margin-bottom: 20px;
}

/* 统一卡片样式，并使用伪元素实现色带 */
.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 24px;
  background: #FFFFFF;
  border-radius: 20px;
  box-shadow: var(--pet-shadow-sm);
  margin-bottom: 20px;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: default;
  border: 1px solid transparent;
  overflow: hidden;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.stat-card:hover {
  transform: translateY(-8px) rotateX(2deg) rotateY(2deg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 214, 0, 0.2);
  z-index: 10;
}

/* 左侧色带 */
.stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 6px;
    border-radius: var(--pet-radius-card) 0 0 var(--pet-radius-card);
}

/* 颜色映射 */
.card-1::before { background: var(--pet-primary-dark); } /* 深橙色 */
.card-2::before { background: var(--pet-secondary); } /* 蓝色 */
.card-3::before { background: var(--pet-accent); } /* 绿色 */
.card-4::before { background: var(--pet-primary); } /* 活力黄 */


.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  flex-shrink: 0;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(-5deg);
}

/* 图标内部颜色已统一为 var(--pet-text) 深色 */
.stat-icon :deep(.el-icon) {
  color: #FFFFFF; 
}

/* 统一图标背景为渐变，并使用不同的渐变色 */
.card-1 .stat-icon {
  background: linear-gradient(135deg, #FFD600, #FFAB00); 
  box-shadow: 0 8px 20px rgba(255, 214, 0, 0.4);
  color: #212121 !important; /* 黄色背景用深色图标 */
}
.card-1 .stat-icon :deep(.el-icon) { color: #212121; }

.card-2 .stat-icon {
  background: linear-gradient(135deg, #2979FF, #1565C0); 
  box-shadow: 0 8px 20px rgba(41, 121, 255, 0.3);
}

.card-3 .stat-icon {
  background: linear-gradient(135deg, #00E676, #00C853); 
  box-shadow: 0 8px 20px rgba(0, 230, 118, 0.3);
}

.card-4 .stat-icon {
  background: linear-gradient(135deg, #FF6D00, #E65100); 
  box-shadow: 0 8px 20px rgba(255, 109, 0, 0.3);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px; 
  font-weight: 800; 
  color: var(--pet-text-main);
  margin-bottom: 4px;
  letter-spacing: -1px;
  font-family: 'Outfit', sans-serif;
}

.stat-label {
  font-size: 13px;
  color: var(--pet-text-light);
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card,
.list-card {
  margin-bottom: 20px;
  border-radius: var(--pet-radius-card);
  transition: all 0.3s;
  border: 1px solid var(--pet-border);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 18px;
  color: var(--pet-text-main);
}

.chart-container {
  height: 300px;
  width: 100%;
}

.list-items {
  max-height: 300px;
  overflow-y: auto;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--pet-border);
  transition: all 0.3s;
  border-radius: 4px;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item:hover {
  background: var(--pet-background);
  padding-left: 8px;
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

/* 预约图标使用主色 */
.list-item .item-icon.pet-icon {
  /* 使用新的主色渐变 */
  background: linear-gradient(135deg, var(--pet-primary), var(--pet-primary-dark));
  color: var(--pet-text-on-primary);
}

/* 寄养图标使用辅色 */
.list-item .item-icon.pet-icon.secondary-icon {
  background: linear-gradient(135deg, var(--pet-secondary), #1565C0);
  color: white;
}


.item-content {
  flex: 1;
  margin-right: 12px;
}

.item-title {
  font-size: 14px;
  color: var(--pet-text);
  margin-bottom: 4px;
  font-weight: 500;
}

.item-time {
  font-size: 12px;
  color: var(--pet-text-light);
}

.status-tag {
  flex-shrink: 0;
}

.clickable-card {
  cursor: pointer;
}

.clickable-card:active {
  transform: scale(0.98);
}

.role-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 10px;
  border-radius: 16px;
  color: white;
  transition: transform 0.3s;
}

.role-stat-item:hover {
  transform: translateY(-5px);
}

.role-icon-lg {
  margin-bottom: 10px;
  opacity: 0.9;
}

.role-count {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.2;
  font-family: 'Outfit', sans-serif;
}

.role-name {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

.admin-bg {
  background: linear-gradient(135deg, #FFD600, #FFAB00);
  box-shadow: 0 10px 20px rgba(255, 214, 0, 0.3);
}

.staff-bg {
  background: linear-gradient(135deg, #2979FF, #1565C0);
  box-shadow: 0 10px 20px rgba(41, 121, 255, 0.3);
}

.member-bg {
  background: linear-gradient(135deg, #00E676, #00C853);
  box-shadow: 0 10px 20px rgba(0, 230, 118, 0.3);
}
</style>