<template>
  <div class="profile-container">
    <el-row :gutter="24">
      <!-- 左侧:个人信息展示 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <el-card shadow="hover" class="user-card">
          <div class="user-header">
            <el-avatar :size="100" class="user-avatar-large">
              {{ userStore.userInfo?.username?.charAt(0).toUpperCase() }}
            </el-avatar>
            <h2 class="username">{{ userStore.userInfo?.username }}</h2>
            <el-tag :type="getRoleType(userStore.userInfo?.role)" size="large" class="role-tag">
              {{ getRoleText(userStore.userInfo?.role) }}
            </el-tag>
          </div>
          
          <el-divider />
          
          <div class="user-info">
            <div class="info-item">
              <el-icon><Message /></el-icon>
              <span class="label">邮箱:</span>
              <span class="value">{{ userStore.userInfo?.email || '未设置' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span class="label">注册时间:</span>
              <span class="value">{{ formatDate(userStore.userInfo?.created_at) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧:编辑表单 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16">
        <!-- 基本信息编辑 -->
        <el-card shadow="hover" class="edit-card">
          <template #header>
            <div class="card-header">
              <span class="title">基本信息</span>
            </div>
          </template>

          <el-form
            ref="infoFormRef"
            :model="infoForm"
            :rules="infoRules"
            label-width="100px"
            size="large"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="infoForm.username" placeholder="请输入用户名" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="infoForm.email" placeholder="请输入邮箱" type="email" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="infoLoading" @click="handleUpdateInfo">
                保存修改
              </el-button>
              <el-button @click="resetInfoForm">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 密码修改 -->
        <el-card shadow="hover" class="edit-card" style="margin-top: 24px">
          <template #header>
            <div class="card-header">
              <span class="title">修改密码</span>
            </div>
          </template>

          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
            size="large"
          >
            <el-form-item label="原密码" prop="old_password">
              <el-input
                v-model="passwordForm.old_password"
                type="password"
                placeholder="请输入原密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="new_password">
              <el-input
                v-model="passwordForm.new_password"
                type="password"
                placeholder="请输入新密码(至少6位)"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirm_password">
              <el-input
                v-model="passwordForm.confirm_password"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="passwordLoading" @click="handleChangePassword">
                修改密码
              </el-button>
              <el-button @click="resetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { updateCurrentUser, changePassword } from '@/api/user'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Message, Calendar } from '@element-plus/icons-vue'
import type { UserUpdate, ChangePasswordForm } from '@/types/user'
import dayjs from 'dayjs'

const userStore = useUserStore()

const infoFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const infoLoading = ref(false)
const passwordLoading = ref(false)

// 基本信息表单
const infoForm = reactive<UserUpdate>({
  username: '',
  email: '',
})

// 密码修改表单
const passwordForm = reactive<ChangePasswordForm>({
  old_password: '',
  new_password: '',
  confirm_password: '',
})

// 验证确认密码
const validateConfirmPassword = (value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.new_password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const infoRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度3-50个字符', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
}

const passwordRules: FormRules = {
  old_password: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度6-50个字符', trigger: 'blur' },
  ],
  confirm_password: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

// 初始化表单数据
const initFormData = () => {
  if (userStore.userInfo) {
    infoForm.username = userStore.userInfo.username
    infoForm.email = userStore.userInfo.email || ''
  }
}

// 重置基本信息表单
const resetInfoForm = () => {
  initFormData()
  infoFormRef.value?.clearValidate()
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.old_password = ''
  passwordForm.new_password = ''
  passwordForm.confirm_password = ''
  passwordFormRef.value?.clearValidate()
}

// 更新基本信息
const handleUpdateInfo = async () => {
  if (!infoFormRef.value) return

  await infoFormRef.value.validate(async (valid) => {
    if (valid) {
      infoLoading.value = true
      try {
        await updateCurrentUser(infoForm)
        await userStore.fetchUserInfo()
        ElMessage.success('信息更新成功')
      } catch (error: any) {
        ElMessage.error(error.response?.data?.error?.message || '更新失败')
      } finally {
        infoLoading.value = false
      }
    }
  })
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true
      try {
        await changePassword({
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password,
        })
        ElMessage.success('密码修改成功,请重新登录')
        resetPasswordForm()
        
        // 延迟后退出登录
        setTimeout(() => {
          userStore.logout()
          window.location.href = '/login'
        }, 1500)
      } catch (error: any) {
        ElMessage.error(error.response?.data?.error?.message || '修改失败')
      } finally {
        passwordLoading.value = false
      }
    }
  })
}

// 获取角色类型
const getRoleType = (role?: string) => {
  const types: Record<string, any> = {
    admin: 'danger',
    staff: 'warning',
    member: 'success',
  }
  return types[role || 'member']
}

// 获取角色文本
const getRoleText = (role?: string) => {
  const texts: Record<string, string> = {
    admin: '管理员',
    staff: '员工',
    member: '会员',
  }
  return texts[role || 'member']
}

// 格式化日期
const formatDate = (date?: string) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

onMounted(() => {
  initFormData()
})
</script>

<style scoped>
.profile-container {
  padding: 24px;
  min-height: 100%;
  background-image: 
    radial-gradient(circle at 10% 10%, rgba(255, 214, 0, 0.05) 0%, transparent 20%),
    radial-gradient(circle at 90% 90%, rgba(255, 111, 0, 0.05) 0%, transparent 20%);
}

.user-card,
.edit-card {
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: visible; /* 允许阴影溢出 */
}

.user-card:hover,
.edit-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(255, 160, 0, 0.1);
  border-color: rgba(255, 214, 0, 0.3);
}

.user-header {
  text-align: center;
  padding: 32px 0 24px;
  position: relative;
}

.user-avatar-large {
  background: linear-gradient(135deg, #FFC107 0%, #FF6F00 100%);
  color: #fff;
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 20px;
  border: 4px solid #fff;
  box-shadow: 0 12px 24px rgba(255, 111, 0, 0.25);
  transition: transform 0.3s ease;
}

.user-card:hover .user-avatar-large {
  transform: scale(1.05) rotate(5deg);
}

.username {
  margin: 12px 0 8px;
  font-size: 26px;
  font-weight: 800;
  color: #2c3e50;
  letter-spacing: -0.5px;
}

.role-tag {
  font-weight: 600;
  padding: 0 16px;
  height: 32px;
  line-height: 30px;
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.user-info {
  padding: 12px 8px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: rgba(249, 250, 251, 0.5);
  transition: all 0.3s ease;
}

.info-item:hover {
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transform: translateX(4px);
}

.info-item .el-icon {
  font-size: 20px;
  color: #FF9800;
  background: rgba(255, 152, 0, 0.1);
  padding: 8px;
  border-radius: 10px;
  margin-right: 16px;
  box-sizing: content-box;
}

.info-item .label {
  font-weight: 600;
  color: #606266;
  min-width: 70px;
  font-size: 14px;
}

.info-item .value {
  color: #2c3e50;
  font-weight: 500;
  font-size: 15px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.card-header .title {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  position: relative;
  padding-left: 16px;
}

.card-header .title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background: linear-gradient(to bottom, #FFC107, #FF6F00);
  border-radius: 2px;
}

.el-form {
  max-width: 100%;
  padding: 0 12px;
}

/* 自定义输入框样式 */
:deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 4px 12px;
  box-shadow: 0 0 0 1px #e4e7ed inset;
  transition: all 0.3s;
  background-color: #fcfcfc;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #FFB300 inset;
  background-color: #fff;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(255, 179, 0, 0.2) inset, 0 0 0 1px #FFB300 inset;
  background-color: #fff;
}

/* 按钮样式优化 */
.el-button--primary {
  background: linear-gradient(135deg, #FFC107 0%, #FF8F00 100%);
  border: none;
  height: 44px;
  padding: 0 32px;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(255, 143, 0, 0.25);
  transition: all 0.3s;
}

.el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 143, 0, 0.35);
  background: linear-gradient(135deg, #FFCA28 0%, #FFA000 100%);
}

.el-button--primary:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(255, 143, 0, 0.2);
}

.el-button--default {
  height: 44px;
  padding: 0 24px;
  border-radius: 12px;
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #606266;
  transition: all 0.3s;
}

.el-button--default:hover {
  color: #FF8F00;
  border-color: #FFB300;
  background-color: #FFF8E1;
}

@media (max-width: 768px) {
  .edit-card {
    margin-top: 24px;
  }
  
  .profile-container {
    padding: 16px;
  }
}
</style>
