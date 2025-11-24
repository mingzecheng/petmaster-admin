import request from '@/utils/request'
import type { Service, ServiceCreate, ServiceUpdate } from '@/types/service'

// 创建服务
export const createService = (data: ServiceCreate) => {
  return request<Service>({
    url: '/services/',
    method: 'post',
    data,
  })
}

// 获取服务列表
export const getServiceList = (params?: { skip?: number; limit?: number; name?: string }) => {
  return request<Service[]>({
    url: '/services/',
    method: 'get',
    params,
  })
}

// 获取服务详情
export const getService = (id: number) => {
  return request<Service>({
    url: `/services/${id}`,
    method: 'get',
  })
}

// 更新服务信息
export const updateService = (id: number, data: ServiceUpdate) => {
  return request<Service>({
    url: `/services/${id}`,
    method: 'put',
    data,
  })
}

// 删除服务
export const deleteService = (id: number) => {
  return request({
    url: `/services/${id}`,
    method: 'delete',
  })
}
