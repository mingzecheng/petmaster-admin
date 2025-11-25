import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, LoginForm } from '@/types/user'
import { login as loginApi, getCurrentUser } from '@/api/user'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<User | null>(null)

  // 登录
  const login = async (loginForm: LoginForm) => {
    try {
      const res = await loginApi(loginForm)
      token.value = res.access_token
      localStorage.setItem('token', res.access_token)

      // 获取用户信息
      const user = await fetchUserInfo()

      // 检查角色权限：只允许 admin 和 staff 登录后台
      if (user.role === 'member') {
        logout()
        ElMessage.error('此账号无权访问后台管理系统')
        return false
      }

      ElMessage.success('登录成功')
      return true
    } catch (error) {
      return false
    }
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const user = await getCurrentUser()
      userInfo.value = user
      return user
    } catch (error) {
      logout()
      throw error
    }
  }

  // 退出登录
  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  // 检查是否是管理员
  const isAdmin = () => {
    return userInfo.value?.role === 'admin'
  }

  // 检查是否是员工或管理员
  const isStaff = () => {
    return userInfo.value?.role === 'admin' || userInfo.value?.role === 'staff'
  }

  return {
    token,
    userInfo,
    login,
    logout,
    fetchUserInfo,
    isAdmin,
    isStaff,
  }
})
