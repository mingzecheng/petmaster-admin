import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import NProgress from 'nprogress'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    NProgress.start()
    const userStore = useUserStore()
    
    // 添加token
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    
    return config
  },
  (error) => {
    NProgress.done()
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    NProgress.done()
    return response.data
  },
  (error) => {
    NProgress.done()
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          const userStore = useUserStore()
          userStore.logout()
          router.push('/login')
          break
        case 403:
          ElMessage.error(data.detail || '没有权限访问')
          break
        case 404:
          ElMessage.error(data.detail || '请求的资源不存在')
          break
        case 422:
          ElMessage.error(data.detail || '数据验证失败')
          break
        case 500:
          ElMessage.error('服务器错误，请稍后重试')
          break
        default:
          ElMessage.error(data.detail || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default service
