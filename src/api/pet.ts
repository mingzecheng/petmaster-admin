import request from '@/utils/request'
import type { Pet, PetCreate, PetUpdate, HealthRecord, HealthRecordCreate } from '@/types/pet'

// 创建宠物
export const createPet = (data: PetCreate) => {
  return request<Pet>({
    url: '/pets/',
    method: 'post',
    data,
  })
}

// 获取宠物列表
export const getPetList = (params?: { skip?: number; limit?: number; owner_id?: number }) => {
  return request<Pet[]>({
    url: '/pets/',
    method: 'get',
    params,
  })
}

// 获取宠物详情
export const getPet = (id: number) => {
  return request<Pet>({
    url: `/pets/${id}`,
    method: 'get',
  })
}

// 更新宠物信息
export const updatePet = (id: number, data: PetUpdate) => {
  return request<Pet>({
    url: `/pets/${id}`,
    method: 'put',
    data,
  })
}

// 删除宠物
export const deletePet = (id: number) => {
  return request({
    url: `/pets/${id}`,
    method: 'delete',
  })
}

// 添加健康记录
export const createHealthRecord = (petId: number, data: HealthRecordCreate) => {
  return request<HealthRecord>({
    url: `/pets/${petId}/health-records`,
    method: 'post',
    data,
  })
}

// 获取宠物健康记录
export const getHealthRecords = (petId: number, params?: { skip?: number; limit?: number }) => {
  return request<HealthRecord[]>({
    url: `/pets/${petId}/health-records`,
    method: 'get',
    params,
  })
}
