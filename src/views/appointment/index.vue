<template>
  <div class="appointment-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">预约管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加预约
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="pet_id" label="宠物ID" width="100" align="center" />
        <el-table-column prop="service_id" label="服务ID" width="100" align="center" />
        <el-table-column prop="appointment_date" label="预约时间" min-width="180">
          <template #default="{ row }">
            {{ formatDate(row.appointment_date) }}
          </template>
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
            <el-button type="danger" size="small" link @click="handleCancel(row)">取消</el-button>
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
        <el-form-item label="服务ID" prop="service_id">
          <el-input-number v-model="formData.service_id" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="预约时间" prop="appointment_date">
          <el-date-picker
            v-model="formData.appointment_date"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
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
import { getAppointmentList, createAppointment, updateAppointment, cancelAppointment } from '@/api/appointment'
import type { Appointment, AppointmentCreate, AppointmentUpdate } from '@/types/appointment'
import dayjs from 'dayjs'

const loading = ref(false)
const tableData = ref<Appointment[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('添加预约')
const formRef = ref()
const isEdit = ref(false)
const currentEditId = ref(0)

const formData = reactive<any>({
  pet_id: 1,
  service_id: 1,
  appointment_date: '',
  status: 'pending',
  notes: '',
})

const rules = {
  pet_id: [{ required: true, message: '请输入宠物ID', trigger: 'blur' }],
  service_id: [{ required: true, message: '请输入服务ID', trigger: 'blur' }],
  appointment_date: [{ required: true, message: '请选择预约时间', trigger: 'change' }],
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getAppointmentList({ skip: (currentPage.value - 1) * pageSize.value, limit: pageSize.value })
    tableData.value = data
    total.value = data.length
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')

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

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '添加预约'
  dialogVisible.value = true
}

const handleEdit = (row: Appointment) => {
  isEdit.value = true
  currentEditId.value = row.id
  dialogTitle.value = '编辑预约'
  Object.assign(formData, {
    pet_id: row.pet_id,
    service_id: row.service_id,
    appointment_date: row.appointment_date,
    status: row.status,
    notes: row.notes,
  })
  dialogVisible.value = true
}

const handleCancel = async (row: Appointment) => {
  try {
    await ElMessageBox.confirm('确定要取消此预约吗？', '提示', { type: 'warning' })
    await cancelAppointment(row.id)
    ElMessage.success('取消成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error('操作失败')
  }
}

const handleSubmit = async () => {
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const submitData = {
          ...formData,
          appointment_date: dayjs(formData.appointment_date).format('YYYY-MM-DD HH:mm:ss'),
        }
        if (isEdit.value) {
          await updateAppointment(currentEditId.value, submitData)
        } else {
          await createAppointment(submitData)
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
