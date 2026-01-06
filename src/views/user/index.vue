<template>
  <div class="user-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">用户管理</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon style="margin-right: 5px"><Plus /></el-icon>
            新增用户
          </el-button>
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
        <el-form-item v-if="isCreateMode" label="密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择角色" style="width: 100%">
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
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { getUserList, createUser, updateUser, deleteUser } from '@/api/user'
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
const isCreateMode = ref(false)

const formData = reactive({
  username: '',
  password: '',
  email: '',
  role: 'member' as 'admin' | 'staff' | 'member',
})

/** 正则表达式 */
const REGEX = {
  /** 用户名：字母开头，3-20位字母、数字、下划线 */
  username: /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/,
  /** 密码：6-20位，必须包含字母和数字 */
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,20}$/,
  /** 邮箱 */
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
}

/** 自定义验证器 */
const validateUsername = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (!REGEX.username.test(value)) {
    callback(new Error('字母开头，3-20位字母数字下划线'))
  } else {
    callback()
  }
}

const validatePassword = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (!REGEX.password.test(value)) {
    callback(new Error('6-20位，必须包含字母和数字'))
  } else {
    callback()
  }
}

const validateEmail = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback() // 邮箱可选
  } else if (!REGEX.email.test(value)) {
    callback(new Error('请输入正确的邮箱地址'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  username: [{ required: true, validator: validateUsername, trigger: 'blur' }],
  password: [{ required: true, validator: validatePassword, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

// ------------------- 后端交互逻辑 -------------------
const loadData = async () => {
  loading.value = true
  try {
    const skip = (currentPage.value - 1) * pageSize.value
    const data = await getUserList({ skip, limit: pageSize.value })
    tableData.value = data
    if (data.length === pageSize.value) {
      total.value = currentPage.value * pageSize.value + 1
    } else {
      total.value = (currentPage.value - 1) * pageSize.value + data.length
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  isCreateMode.value = true
  dialogTitle.value = '新增用户'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: User) => {
  isCreateMode.value = false
  dialogTitle.value = '编辑用户'
  currentEditId.value = row.id
  formData.username = row.username
  formData.password = '' // 编辑模式不显示密码
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
        if (isCreateMode.value) {
          // 创建新用户 - 禁止创建管理员
          if (formData.role === 'admin') {
            ElMessage.error('无法创建管理员账户')
            submitting.value = false
            return
          }
          await createUser(formData)
          ElMessage.success('用户创建成功')
        } else {
          // 更新用户 - 不包含密码
          const updateData: UserUpdate = {
            username: formData.username,
            email: formData.email,
            role: formData.role,
          }
          await updateUser(currentEditId.value, updateData)
          ElMessage.success('用户更新成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error(isCreateMode.value ? '创建失败' : '更新失败')
      } finally {
        submitting.value = false
      }
    }
  })
}
// ------------------- 后端交互逻辑 -------------------

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
  if (formRef.value) {
    formRef.value.resetFields()
  }
  // 重置表单数据
  formData.username = ''
  formData.password = ''
  formData.email = ''
  formData.role = 'member'
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