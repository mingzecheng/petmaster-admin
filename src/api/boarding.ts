import request from '@/utils/request'
import type {
  Boarding,
  BoardingCreate,
  BoardingUpdate,
  BoardingStatus
} from '@/types/boarding'

// 创建寄养记录
export const createBoarding = (data: BoardingCreate) => {
  return request<Boarding>({
    url: '/boarding/',
    method: 'post',
    data,
  })
}

// 获取寄养列表
export const getBoardingList = (params?: {
  skip?: number
  limit?: number
  pet_id?: number
  status_filter?: BoardingStatus
}) => {
  return request<Boarding[]>({
    url: '/boarding',
    method: 'get',
    params,
  })
}

// 获取进行中的寄养
export const getOngoingBoarding = (params?: { skip?: number; limit?: number }) => {
  return request<Boarding[]>({
    url: '/boarding',
    method: 'get',
    params: {
      ...params,
      status_filter: 'active' as BoardingStatus,
    },
  })
}

// 获取寄养详情
export const getBoarding = (id: number) => {
  return request<Boarding>({
    url: `/boarding/${id}`,
    method: 'get',
  })
}

// 更新寄养信息
export const updateBoarding = (id: number, data: BoardingUpdate) => {
  return request<Boarding>({
    url: `/boarding/${id}`,
    method: 'put',
    data,
  })
}

// 删除寄养记录
export const deleteBoarding = (id: number) => {
  return request({
    url: `/boarding/${id}`,
    method: 'delete',
  })
}
