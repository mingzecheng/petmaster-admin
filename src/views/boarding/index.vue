<template>
  <div class="boarding-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">寄养管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加寄养
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="pet_id" label="宠物ID" width="100" align="center" />
        <el-table-column prop="start_date" label="开始日期" width="120">
          <template #default="{ row }">{{ formatDate(row.start_date) }}</template>
        </el-table-column>
        <el-table-column prop="end_date" label="结束日期" width="120">
          <template #default="{ row }">{{ formatDate(row.end_date) }}</template>
        </el-table-column>
        <el-table-column prop="daily_rate" label="日费用" width="100" align="center">
          <template #default="{ row }">¥{{ row.daily_rate }}</template>
        </el-table-column>
        <el-table-column prop="total_cost" label="总费用" width="100" align="center">
          <template #default="{ row }">¥{{ row.total_cost }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="宠物ID" prop="pet_id">
          <el-input-number v-model="formData.pet_id" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="开始日期" prop="start_date">
          <el-date-picker v-model="formData.start_date" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束日期" prop="end_date">
          <el-date-picker v-model="formData.end_date" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="日费用" prop="daily_rate">
          <el-input-number v-model="formData.daily_rate" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option label="待确认" value="pending" />
            <el-option label="进行中" value="active" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.notes" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBoardingList, createBoarding, updateBoarding, deleteBoarding } from '@/api/boarding'
import type { Boarding, BoardingCreate } from '@/types/boarding'
import dayjs from 'dayjs'

const loading = ref(false)
const tableData = ref<Boarding[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('添加寄养')
const formRef = ref()
const isEdit = ref(false)
const currentEditId = ref(0)

const formData = reactive<any>({
  pet_id: 1,
  start_date: '',
  end_date: '',
  daily_rate: 0,
  status: 'pending',
  notes: '',
})

const rules = {
  pet_id: [{ required: true, message: '请输入宠物ID', trigger: 'blur' }],
  start_date: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  end_date: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  daily_rate: [{ required: true, message: '请输入日费用', trigger: 'blur' }],
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getBoardingList({ skip: (currentPage.value - 1) * pageSize.value, limit: pageSize.value })
    tableData.value = data
    total.value = data.length
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD')

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    pending: 'warning',
    active: 'primary',
    completed: 'success',
    cancelled: 'info',
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待确认',
    active: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return texts[status] || status
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '添加寄养'
  dialogVisible.value = true
}

const handleEdit = (row: Boarding) => {
  isEdit.value = true
  currentEditId.value = row.id
  dialogTitle.value = '编辑寄养'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = async (row: Boarding) => {
  try {
    await ElMessageBox.confirm('确定要删除此寄养记录吗？', '提示', { type: 'warning' })
    await deleteBoarding(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleSubmit = async () => {
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const submitData = {
          ...formData,
          start_date: dayjs(formData.start_date).format('YYYY-MM-DD'),
          end_date: dayjs(formData.end_date).format('YYYY-MM-DD'),
        }
        if (isEdit.value) {
          await updateBoarding(currentEditId.value, submitData)
        } else {
          await createBoarding(submitData)
        }
        ElMessage.success('保存成功')
        dialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }
  })
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
