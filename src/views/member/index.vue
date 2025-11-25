<template>
  <div class="member-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">会员管理</span>
        </div>
      </template>

      <!-- 筛选 -->
      <el-form :inline="true" class="filter-form">
        <el-form-item label="用户名">
          <el-input v-model="filters.username" placeholder="请输入用户名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="mobile" label="手机号" width="130" />
        <el-table-column label="会员等级" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.member_level" :color="row.member_level.color">
              {{ row.member_level.name }}
            </el-tag>
            <span v-else class="text-muted">未设置</span>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="当前积分" width="100" align="right" />
        <el-table-column prop="total_points" label="累计积分" width="100" align="right" />
        <el-table-column label="会员卡余额" width="120" align="right">
          <template #default="{ row }">
            <span v-if="row.member_card">¥{{ row.member_card.balance }}</span>
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
            <el-button type="success" size="small" link @click="showRecharge(row)" v-if="row.member_card">
              充值
            </el-button>
            <el-button type="warning" size="small" link @click="handleCreateCard(row)" v-else>
              开卡
            </el-button>
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
          <el-select v-model="rechargeForm.payment_method" placeholder="请选择" style="width: 100%">
            <el-option label="现金" value="cash" />
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信" value="wechat" />
            <el-option label="银行卡" value="bankcard" />
          </el-select>
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
import { getUsers } from '@/api/user'
import {
  getUserPointRecords,
  adjustUserPoints,
  createMemberCard,
  rechargeMemberCard,
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
  payment_method: 'cash',
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
      ...filters,
    }
    const data = await getUsers(params) as any
    tableData.value = data.users || []
    total.value = data.total || 0
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
  rechargeForm.payment_method = 'cash'
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

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.member-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.filter-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-muted {
  color: #909399;
}

.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}
</style>
