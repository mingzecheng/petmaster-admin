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

      <el-table v-loading="loading" :data="tableData" stripe border class="el-table">
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="宠物" width="150" align="center">
          <template #default="{ row }">
            {{ getPetName(row.pet_id) }}
          </template>
        </el-table-column>
        <el-table-column label="服务" width="150" align="center">
          <template #default="{ row }">
            {{ getServiceName(row.service_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="appointment_time" label="预约时间" min-width="180">
          <template #default="{ row }">
            {{ formatDate(row.appointment_time) }}
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
        <el-form-item label="选择宠物" prop="pet_id">
          <el-select v-model="formData.pet_id" placeholder="请选择宠物" style="width: 100%" filterable>
            <el-option v-for="pet in petList" :key="pet.id" :label="`${pet.name} (${pet.species})`" :value="pet.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择服务" prop="service_id">
          <el-select v-model="formData.service_id" placeholder="请选择服务" style="width: 100%" filterable>
            <el-option v-for="service in serviceList" :key="service.id" :label="`${service.name} - ¥${service.price}`" :value="service.id" />
          </el-select>
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
import { getPetList } from '@/api/pet'
import { getServiceList } from '@/api/service'
import type { Appointment, AppointmentCreate, AppointmentUpdate } from '@/types/appointment'
import type { Pet } from '@/types/pet'
import type { Service } from '@/types/service'
import dayjs from 'dayjs'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const tableData = ref<Appointment[]>([])
const petList = ref<Pet[]>([])
const serviceList = ref<Service[]>([])
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
  appointment_date: '',  // 前端内部使用date，提交时转为time
  status: 'pending',
})

const rules = {
  pet_id: [{ required: true, message: '请选择宠物', trigger: 'change' }],
  service_id: [{ required: true, message: '请选择服务', trigger: 'change' }],
  appointment_date: [{ required: true, message: '请选择预约时间', trigger: 'change' }],
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      skip: (currentPage.value - 1) * pageSize.value,
      //limit: pageSize.value
    }
    const data = await getAppointmentList(params)
    tableData.value = data
    // 注意：这里需要后端返回总数，暂时使用数据长度作为示例
    total.value = data.length
  } catch (error) {
    ElMessage.error('加载数据失败')
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
  // 重置表单
  Object.assign(formData, {
    pet_id: 1,
    service_id: 1,
    appointment_date: new Date(),
    status: 'pending',
    notes: '',
  })
  formRef.value?.resetFields()
  dialogVisible.value = true
}

const handleEdit = (row: Appointment) => {
  isEdit.value = true
  currentEditId.value = row.id
  dialogTitle.value = '编辑预约'
  Object.assign(formData, {
    pet_id: row.pet_id,
    service_id: row.service_id,
    appointment_date: dayjs(row.appointment_time).toDate(), // 后端的time转为前端的date
    status: row.status,
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
        if (isEdit.value) {
          // 编辑时可以包含status
          const submitData = {
            appointment_time: dayjs(formData.appointment_date).format('YYYY-MM-DD HH:mm:ss'),
            status: formData.status,
          }
          await updateAppointment(currentEditId.value, submitData)
        } else {
          // 创建时只发送必要字段
          const submitData = {
            pet_id: formData.pet_id,
            service_id: formData.service_id,
            appointment_time: dayjs(formData.appointment_date).format('YYYY-MM-DD HH:mm:ss'),
          }
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

const loadPets = async () => {
  try {
    const data = await getPetList()
    petList.value = data
  } catch (error) {
    console.error('加载宠物列表失败', error)
  }
}

const loadServices = async () => {
  try {
    const data = await getServiceList()
    serviceList.value = data
  } catch (error) {
    console.error('加载服务列表失败', error)
  }
}

const getPetName = (petId: number) => {
  const pet = petList.value.find(p => p.id === petId)
  return pet ? `${pet.name} (${pet.species})` : `ID: ${petId}`
}

const getServiceName = (serviceId: number) => {
  const service = serviceList.value.find(s => s.id === serviceId)
  return service ? service.name : `ID: ${serviceId}`
}

onMounted(() => {
  loadData()
  loadPets()
  loadServices()
})
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

/* 标题左侧的装饰色带 */
.title::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 20px;
    background: var(--pet-primary-dark); /* Accent bar */
    border-radius: 3px;
    margin-right: 12px;
}

/* Table specific overrides */
.el-table {
    border-radius: var(--pet-radius);
    overflow: hidden; /* Ensure rounded corners work */
}

/* Customizing stripe row for better contrast */
.el-table :deep(.el-table__row.el-table__row--striped) {
    background-color: var(--pet-background) !important; /* Use a very light background for stripes */
}

/* Customizing header */
.el-table :deep(.el-table__header-wrapper) th {
    background-color: var(--pet-background);
    color: var(--pet-text);
    font-weight: 600;
}

/* Links in table (Edit/Cancel) */
.el-button--link.el-button--primary {
    color: var(--pet-primary-dark); /* Darker yellow for links */
}
.el-button--link.el-button--primary:hover {
    color: var(--pet-primary);
}


.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

/* Pagination active color */
.pagination :deep(.el-pager li.is-active) {
    background-color: var(--pet-primary) !important;
    color: var(--pet-text) !important;
    font-weight: 600;
}
</style>