<template>
  <div class="member-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">会员管理</span>
        </div>
      </template>

      <!-- 筛选区域 -->
      <div class="filter-container">
        <el-form :inline="true" :model="filters" class="filter-form">
          <el-form-item label="用户名">
            <el-input
              v-model="filters.username"
              placeholder="请输入用户名"
              clearable
              style="width: 200px"
              @keyup.enter="loadData"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData" icon="Search">查询</el-button>
            <el-button @click="resetFilters" icon="Refresh">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 会员列表 -->
      <el-table v-loading="loading" :data="tableData" stripe border class="theme-table">
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="username" label="用户名" width="120" show-overflow-tooltip />
        <el-table-column prop="mobile" label="手机号" width="130" />
        
        <!-- 会员等级 -->
        <el-table-column label="会员等级" width="130" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.member_level" :color="row.member_level.color" effect="plain" style="border: none; font-weight: 600">
              {{ row.member_level.name }}
            </el-tag>
            <el-tag v-else type="info" effect="plain">普通会员</el-tag>
          </template>
        </el-table-column>
        
        <!-- 积分信息 -->
        <el-table-column label="当前积分" width="100" align="center">
          <template #default="{ row }">
            <div style="color: #E6A23C; font-weight: 600; font-size: 16px">{{ row.points }}</div>
          </template>
        </el-table-column>
        <el-table-column label="累计积分" width="100" align="center">
          <template #default="{ row }">
            <div class="text-muted">{{ row.total_points }}</div>
          </template>
        </el-table-column>
        
        <!-- 会员卡信息 -->
        <el-table-column label="会员卡" width="260" align="center">
          <template #default="{ row }">
            <div v-if="row.member_card" class="card-info">
              <div class="card-balance">余额: <strong style="color: #67C23A; font-size: 16px">¥{{ row.member_card.balance }}</strong></div>
              <div class="card-meta">
                <span class="card-number">{{ row.member_card.card_number }}</span>
                <el-tag :type="getCardStatusType(row.member_card.status)" size="small" effect="plain">
                  {{ getCardStatusText(row.member_card.status) }}
                </el-tag>
              </div>
            </div>
            <span v-else class="text-muted">无会员卡</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="showPointDetail(row)">
              积分明细
            </el-button>
            <el-button type="primary" size="small" link @click="showAdjustPoints(row)">
              调整积分
            </el-button>
            <el-button type="success" size="small" link @click="showRecharge(row)" v-if="row.member_card && row.member_card.status === 'active'">
              充值
            </el-button>
            <el-button type="warning" size="small" link @click="handleCreateCard(row)" v-if="!row.member_card">
              开卡
            </el-button>
            
            <!-- 会员卡状态管理 -->
            <template v-if="row.member_card">
              <el-dropdown trigger="click" @command="(cmd) => handleCardAction(cmd, row)">
                <el-button type="primary" size="small" link>
                  更多 <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="freeze" v-if="row.member_card.status === 'active'">
                      <el-icon><Lock /></el-icon> 冻结
                    </el-dropdown-item>
                    <el-dropdown-item command="unfreeze" v-if="row.member_card.status === 'frozen'">
                      <el-icon><Unlock /></el-icon> 解冻
                    </el-dropdown-item>
                    <el-dropdown-item command="cancel" divided>
                      <el-icon><CircleClose /></el-icon> 注销
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 积分明细对话框 -->
    <el-dialog v-model="pointDetailVisible" title="积分明细" width="800px">
      <el-table :data="pointRecords" v-loading="recordLoading" max-height="400">
        <el-table-column prop="created_at" label="时间" width="180" />
        <el-table-column label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 'earn' ? 'success' : row.type === 'use' ? 'danger' : 'info'">
              {{ row.type === 'earn' ? '获得' : row.type === 'use' ? '使用' : '调整' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="积分" width="100">
          <template #default="{ row }">
            <span :class="row.points > 0 ? 'text-success' : 'text-danger'">
              {{ row.points > 0 ? '+' : '' }}{{ row.points }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额" width="100" />
        <el-table-column prop="reason" label="原因" min-width="150" show-overflow-tooltip />
      </el-table>
    </el-dialog>

    <!-- 调整积分对话框 -->
    <el-dialog v-model="adjustDialogVisible" title="调整积分" width="500px">
      <el-form ref="adjustFormRef" :model="adjustForm" :rules="adjustRules" label-width="80px">
        <el-form-item label="用户" >
          <el-input :value="currentUser?.username" disabled />
        </el-form-item>
        <el-form-item label="当前积分">
          <el-input :value="currentUser?.points" disabled />
        </el-form-item>
        <el-form-item label="调整积分" prop="points">
          <el-input-number v-model="adjustForm.points" placeholder="正数增加，负数减少" style="width: 100%" />
        </el-form-item>
        <el-form-item label="调整原因" prop="reason">
          <el-input v-model="adjustForm.reason" type="textarea" :rows="3" placeholder="请输入调整原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="adjusting" @click="handleAdjustPoints">确定</el-button>
      </template>
    </el-dialog>

    <!-- 充值对话框 -->
    <el-dialog v-model="rechargeDialogVisible" title="会员卡充值" width="500px">
      <el-form ref="rechargeFormRef" :model="rechargeForm" :rules="rechargeRules" label-width="100px">
        <el-form-item label="卡号">
          <el-input :value="currentUser?.member_card?.card_number" disabled />
        </el-form-item>
        <el-form-item label="当前余额">
          <el-input :value="`¥${currentUser?.member_card?.balance}`" disabled />
        </el-form-item>
        <el-form-item label="充值金额" prop="amount">
          <el-input-number v-model="rechargeForm.amount" :min="0" :precision="2" :step="100" style="width: 100%" />
        </el-form-item>
        <el-form-item label="支付方式">
          <el-input value="支付宝" disabled />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="rechargeForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rechargeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="recharging" @click="handleRecharge">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { ArrowDown, Lock, Unlock, CircleClose } from '@element-plus/icons-vue'
import { getUserList } from '@/api/user'
import { 
  createMemberCard, 
  rechargeMemberCard, 
  getRechargeRecords,
  freezeMemberCard,
  unfreezeMemberCard,
  cancelMemberCard,
  getUserPointRecords,
  adjustUserPoints
} from '@/api/member'
import type { UserWithMember, PointRecord, PointAdjust, CardRechargeRequest } from '@/types/member'

const loading = ref(false)
const tableData = ref<UserWithMember[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const filters = reactive({
  username: '',
})

const pointDetailVisible = ref(false)
const pointRecords = ref<PointRecord[]>([])
const recordLoading = ref(false)

const adjustDialogVisible = ref(false)
const adjustFormRef = ref<FormInstance>()
const adjusting = ref(false)
const currentUser = ref<UserWithMember | null>(null)
const adjustForm = reactive<PointAdjust>({
  points: 0,
  reason: '',
})

const adjustRules: FormRules = {
  points: [{ required: true, message: '请输入调整积分', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入调整原因', trigger: 'blur' }],
}

const rechargeDialogVisible = ref(false)
const rechargeFormRef = ref<FormInstance>()
const recharging = ref(false)
const rechargeForm = reactive<CardRechargeRequest>({
  amount: 0,
  payment_method: 'alipay',
  remark: '',
})

const rechargeRules: FormRules = {
  amount: [{ required: true, message: '请输入充值金额', trigger: 'blur' }],
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      skip: (currentPage.value - 1) * pageSize.value,
      limit: pageSize.value,
      role: 'member',  // 只加载会员用户
      ...filters,
    }
    const data = await getUserList(params) as any
    tableData.value = data || []
    total.value = data.length || 0
  } catch (error: any) {
    ElMessage.error(error.response?.data?.detail || '加载失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.username = ''
  loadData()
}

const showPointDetail = async (row: UserWithMember) => {
  currentUser.value = row
  recordLoading.value = true
  pointDetailVisible.value = true
  try {
    pointRecords.value = await getUserPointRecords(row.id, { limit: 50 })
  } catch (error: any) {
    ElMessage.error(error.response?.data?.detail || '加载失败')
  } finally {
    recordLoading.value = false
  }
}

const showAdjustPoints = (row: UserWithMember) => {
  currentUser.value = row
  adjustForm.points = 0
  adjustForm.reason = ''
  adjustDialogVisible.value = true
}

const handleAdjustPoints = async () => {
  if (!adjustFormRef.value || !currentUser.value) return
  await adjustFormRef.value.validate(async (valid) => {
    if (valid) {
      adjusting.value = true
      try {
        await adjustUserPoints(currentUser.value!.id, adjustForm)
        ElMessage.success('调整成功')
        adjustDialogVisible.value = false
        loadData()
      } catch (error: any) {
        ElMessage.error(error.response?.data?.detail || '调整失败')
      } finally {
        adjusting.value = false
      }
    }
  })
}

const showRecharge = (row: UserWithMember) => {
  currentUser.value = row
  rechargeForm.amount = 0
  rechargeForm.payment_method = 'alipay'
  rechargeForm.remark = ''
  rechargeDialogVisible.value = true
}

const handleRecharge = async () => {
  if (!rechargeFormRef.value || !currentUser.value?.member_card) return
  await rechargeFormRef.value.validate(async (valid) => {
    if (valid) {
      recharging.value = true
      try {
        await rechargeMemberCard(currentUser.value!.member_card!.id, rechargeForm)
        ElMessage.success('充值成功')
        rechargeDialogVisible.value = false
        loadData()
      } catch (error: any) {
        ElMessage.error(error.response?.data?.detail || '充值失败')
      } finally {
        recharging.value = false
      }
    }
  })
}

const handleCreateCard = async (row: UserWithMember) => {
  try {
    await ElMessageBox.confirm(`确定为用户"${row.username}"开通会员卡吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    })
    await createMemberCard({ user_id: row.id })
    ElMessage.success('开卡成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.detail || '开卡失败')
    }
  }
}

// 会员卡状态管理
const handleCardAction = async (command: string, row: UserWithMember) => {
  if (!row.member_card) return
  
  const cardId = row.member_card.id
  const cardNumber = row.member_card.card_number
  
  try {
    let confirmMessage = ''
    let successMessage = ''
    let action: () => Promise<any>
    
    switch (command) {
      case 'freeze':
        confirmMessage = `确定要冻结会员卡 ${cardNumber} 吗？冻结后该卡将无法使用。`
        successMessage = '会员卡已冻结'
        action = () => freezeMemberCard(cardId)
        break
      case 'unfreeze':
        confirmMessage = `确定要解冻会员卡 ${cardNumber} 吗？`
        successMessage = '会员卡已解冻'
        action = () => unfreezeMemberCard(cardId)
        break
      case 'cancel':
        if (row.member_card.balance > 0) {
          ElMessage.warning('会员卡余额不为零，无法注销')
          return
        }
        confirmMessage = `确定要注销会员卡 ${cardNumber} 吗？\n\n注意：\n1. 注销后会删除会员卡记录\n2. 用户可以重新办理会员卡\n3. 此操作不可恢复`
        successMessage = '会员卡已注销，用户可重新办卡'
        action = () => cancelMemberCard(cardId)
        break
      default:
        return
    }
    
    await ElMessageBox.confirm(confirmMessage, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    await action()
    ElMessage.success(successMessage)
    
    // 如果是注销操作，手动清除本地的 member_card 状态，并重置等级和积分
    if (command === 'cancel') {
      row.member_card = null as any
      row.member_level = null as any
      row.points = 0
      row.total_points = 0
    }
    
    await loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.detail || '操作失败')
    }
  }
}

// 获取会员卡状态类型
const getCardStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    'active': 'success',
    'frozen': 'warning',
    'cancelled': 'info'
  }
  return typeMap[status] || 'info'
}

// 获取会员卡状态文本
const getCardStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'active': '正常',
    'frozen': '冻结',
    'cancelled': '已注销'
  }
  return textMap[status] || status
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.member-page {
  padding: 20px;
  background-color: var(--pet-background-light, #f5f7fa);
  min-height: calc(100vh - 84px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--pet-text, #303133);
  display: flex;
  align-items: center;
}

.title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 18px;
  background: var(--pet-primary, #409eff);
  border-radius: 2px;
  margin-right: 10px;
}

/* 筛选区域优化 */
.filter-container {
  background-color: #fff;
  padding: 18px 20px 0;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.filter-form {
  margin-bottom: 0;
}

/* 表格优化 */
.theme-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

/* 会员卡信息样式 */
.card-info {
  background: linear-gradient(to right bottom, #f8f9fa, #eef1f6);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.card-balance {
  margin-bottom: 4px;
  font-size: 14px;
  color: #606266;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-number {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12px;
  color: #909399;
}

/* 状态文本颜色 */
.text-muted {
  color: #909399;
  font-size: 13px;
}

.text-success {
  color: #67c23a;
  font-weight: 600;
}

.text-danger {
  color: #f56c6c;
  font-weight: 600;
}

/* 分页样式 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}
</style>
