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

      <el-table v-loading="loading" :data="tableData" stripe border class="el-table">
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
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
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
import type { Boarding } from '@/types/boarding'
import dayjs from 'dayjs'
import { Plus } from '@element-plus/icons-vue' // 引入 Plus 图标

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
    const params = {
      skip: (currentPage.value - 1) * pageSize.value,
      limit: pageSize.value
    }
    const data = await getBoardingList(params)
    tableData.value = data
    // 注意：这里需要后端返回总数，暂时使用数据长度作为示例
    total.value = data.length
  } catch (error) {
    ElMessage.error('加载数据失败')
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
  // 重置表单
  Object.assign(formData, {
    pet_id: 1,
    start_date: new Date(),
    end_date: new Date(),
    daily_rate: 80,
    status: 'pending',
    notes: '',
  })
  formRef.value?.resetFields()
  dialogVisible.value = true
}

const handleEdit = (row: Boarding) => {
  isEdit.value = true
  currentEditId.value = row.id
  dialogTitle.value = '编辑寄养'
  Object.assign(formData, {
    ...row,
    start_date: dayjs(row.start_date).toDate(), // 转换成 Date 对象以适配 date-picker
    end_date: dayjs(row.end_date).toDate(), 
  })
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

/* Table specific overrides */
.el-table {
    border-radius: 12px;
    overflow: hidden; 
    border: 1px solid var(--pet-border);
}

/* Customizing stripe row: 使用主色调浅粉色的极淡背景 */
.el-table :deep(.el-table__row.el-table__row--striped) {
    /* 使用 color-mix 或直接一个极浅的颜色，这里使用一个固定的浅色以兼容 */
    background-color: #FFF0F5 !important; 
}

/* Customizing header: 使用玉米色背景，文字为深色 */
.el-table :deep(.el-table__header-wrapper) th {
    background-color: var(--pet-background); /* #FFF8DC */
    color: var(--pet-text);
    font-weight: 600;
}

/* Links in table (Edit/Cancel/Delete): 使用深粉色 */
.el-button--link.el-button--primary {
    color: var(--pet-primary-dark); /* #FF69B4 */
}
.el-button--link.el-button--primary:hover {
    color: var(--pet-primary); /* #FFB6C1 */
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
</style>