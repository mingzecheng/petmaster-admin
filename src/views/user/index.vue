<template>
  <div class="user-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">用户管理</span>
        </div>
      </template>

      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="tableData"
          stripe
          border
          class="theme-table"
        >
          <el-table-column type="index" label="#" width="60" align="center" />
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="username" label="用户名" min-width="120" />
          <el-table-column prop="mobile" label="手机号" min-width="130" />
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="role" label="角色" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getRoleType(row.role)">
                {{ getRoleText(row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                link
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                link
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

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
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="formData.mobile" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="员工" value="staff" />
            <el-option label="会员" value="member" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getUserList, updateUser, deleteUser } from '@/api/user'
import type { User, UserUpdate } from '@/types/user'
import dayjs from 'dayjs'

const loading = ref(false)
const tableData = ref<User[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const dialogTitle = ref('编辑用户')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const currentEditId = ref(0)

const formData = reactive<UserUpdate>({
  username: '',
  mobile: '',
  email: '',
  role: 'member',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

// ------------------- 后端交互逻辑保持不变 -------------------
const loadData = async () => {
  loading.value = true
  try {
    const skip = (currentPage.value - 1) * pageSize.value
    const data = await getUserList({ skip, limit: pageSize.value })
    tableData.value = data
    total.value = data.length
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleEdit = (row: User) => {
  currentEditId.value = row.id
  formData.username = row.username
  formData.mobile = row.mobile || ''
  formData.email = row.email || ''
  formData.role = row.role
  dialogVisible.value = true
}

const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteUser(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await updateUser(currentEditId.value, formData)
        ElMessage.success('保存成功')
        dialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error('保存失败')
      } finally {
        submitting.value = false
      }
    }
  })
}
// ------------------- 后端交互逻辑保持不变 -------------------

// 辅助函数（保持不变）
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const getRoleType = (role: string) => {
  const types: Record<string, any> = {
    admin: 'danger',
    staff: 'warning',
    member: '',
  }
  return types[role] || ''
}

const getRoleText = (role: string) => {
  const texts: Record<string, string> = {
    admin: '管理员',
    staff: '员工',
    member: '会员',
  }
  return texts[role] || role
}

const resetForm = () => {
  formRef.value?.resetFields()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.user-page {
  height: 100%;
}

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

/* 标题左侧的装饰色带 */
.title::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 24px;
    background: var(--pet-primary);
    border-radius: 4px;
    margin-right: 12px;
    box-shadow: 0 2px 8px rgba(255, 214, 0, 0.4);
}

.table-container {
  margin-top: 0px; /* 移除容器的边距，让表格样式来控制 */
}

/* Table specific overrides - 应用主题样式 */
.theme-table {
    width: 100%; /* 确保宽度继承 */
    border-radius: 12px;
    overflow: hidden; 
    border: 1px solid var(--pet-border);
}

/* Customizing stripe row */
.theme-table :deep(.el-table__row.el-table__row--striped) {
    background-color: var(--pet-bg-base) !important; 
}

/* Customizing header */
.theme-table :deep(.el-table__header-wrapper) th {
    background-color: #FAFAFA;
    color: var(--pet-text-secondary);
    font-weight: 700;
    height: 50px;
}

/* Link buttons in table */
.theme-table .el-button--link.el-button--primary {
    color: var(--pet-secondary);
}
.theme-table .el-button--link.el-button--primary:hover {
    color: var(--pet-secondary-dark);
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
    color: var(--pet-text-on-primary) !important;
    font-weight: 700;
    border: none;
}

.pagination :deep(.el-pager li:hover) {
    color: var(--pet-primary-dark);
}
</style>