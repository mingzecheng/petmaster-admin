<template>
  <div class="service-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">服务管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加服务
          </el-button>
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
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="服务名称" min-width="150" />
        <el-table-column prop="price" label="价格" width="120" align="center">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="duration_minutes" label="时长(分钟)" width="120" align="center" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
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
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="服务名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="formData.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="时长(分钟)">
          <el-input-number v-model="formData.duration_minutes" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" />
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
import { getServiceList, createService, updateService, deleteService } from '@/api/service'
import type { Service, ServiceCreate } from '@/types/service'

const loading = ref(false)
const tableData = ref<Service[]>([])
const currentPage = ref(1)
const pageSize = ref(10) // 默认添加 pageSize
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('添加服务')
const formRef = ref()
const isEdit = ref(false)
const currentEditId = ref(0)

const formData = reactive<ServiceCreate>({
  name: '',
  price: 0,
  duration_minutes: 0,
  description: '',
})

const rules = {
  name: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      skip: (currentPage.value - 1) * pageSize.value,
      limit: pageSize.value
    }
    const data = await getServiceList(params)
    tableData.value = data
    // 注意：这里需要后端返回总数，暂时使用数据长度作为示例
    total.value = data.length
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '添加服务'
  // 重置表单
  formRef.value?.resetFields()
  Object.assign(formData, { name: '', price: 0, duration_minutes: 0, description: '' })
  dialogVisible.value = true
}

const handleEdit = (row: Service) => {
  isEdit.value = true
  currentEditId.value = row.id
  dialogTitle.value = '编辑服务'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = async (row: Service) => {
  try {
    await ElMessageBox.confirm(`确定要删除服务 "${row.name}" 吗？`, '提示', { type: 'warning' })
    await deleteService(row.id)
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
        if (isEdit.value) {
          await updateService(currentEditId.value, formData)
        } else {
          await createService(formData)
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
  padding: 8px 0; /* 增加内边距以匹配其他组件 */
}

.title {
  font-size: 20px; /* 增大字号 */
  font-weight: 600; /* 加粗 */
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

/* Table specific overrides - 使用 theme-table 替代默认 .el-table */
.theme-table {
    border-radius: 12px;
    overflow: hidden; 
    border: 1px solid var(--pet-border);
    margin-bottom: 0 !important; /* 确保表格底部不会有额外的间距 */
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

/* Link buttons in table: 使用深粉色作为主链接色 */
.theme-table .el-button--link.el-button--primary {
    color: var(--pet-primary-dark); /* #FF69B4 */
}
.theme-table .el-button--link.el-button--primary:hover {
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