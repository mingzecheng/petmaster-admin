import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import NProgress from 'nprogress'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
})

// 请求重试配置
const MAX_RETRY_COUNT = 2
const RETRY_DELAY = 1000

// 为axios实例添加重试计数
interface AxiosConfigWithRetry extends AxiosRequestConfig {
  __retryCount?: number
}

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

    const config = error.config as AxiosConfigWithRetry

    // 判断是否需要重试：网络错误或5xx服务器错误
    const shouldRetry = (!error.response || (error.response?.status >= 500 && error.response?.status < 600))

    if (shouldRetry && config) {
      config.__retryCount = config.__retryCount || 0

      if (config.__retryCount < MAX_RETRY_COUNT) {
        config.__retryCount++
        console.log(`正在重试第 ${config.__retryCount} 次...`)

        // 等待一段时间后重试
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(service.request(config))
          }, RETRY_DELAY)
        })
      }
    }

    if (error.response) {
      const { status, data } = error.response

      // 提取错误信息，支持多种格式
      const getErrorMessage = (data: any): string => {
        if (data?.error?.message) {
          return data.error.message  // 后端自定义错误格式
        }
        if (data?.detail) {
          return data.detail  // FastAPI 默认格式
        }
        return '请求失败'
      }

      switch (status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          const userStore = useUserStore()
          userStore.logout()
          router.push('/login')
          break
        case 403:
          ElMessage.error(getErrorMessage(data) || '没有权限访问')
          break
        case 404:
          ElMessage.error(getErrorMessage(data) || '请求的资源不存在')
          break
        case 422:
          ElMessage.error(getErrorMessage(data) || '数据验证失败')
          break
        case 500:
          ElMessage.error(getErrorMessage(data) || '服务器错误，请稍后重试')
          break
        default:
          ElMessage.error(getErrorMessage(data))
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

/**
 * 封装的请求函数
 * @param config - Axios 请求配置
 * @returns 返回解包后的响应数据 (response.data)
 */
const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return service(config)
}

export default request
