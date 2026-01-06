import request from '@/utils/request'
import type {
  Appointment,
  AppointmentCreate,
  AppointmentUpdate,
  AppointmentStatus,
} from '@/types/appointment'

// 创建预约
export const createAppointment = (data: AppointmentCreate) => {
  return request<Appointment>({
    url: '/appointments/',
    method: 'post',
    data,
  })
}

// 获取预约列表
export const getAppointmentList = (params?: {
  skip?: number
  limit?: number
  pet_id?: number
  status_filter?: AppointmentStatus
  start_date?: string
  end_date?: string
}) => {
  return request<Appointment[]>({
    url: '/appointments/',
    method: 'get',
    params,
  })
}

// 获取预约详情
export const getAppointment = (id: number) => {
  return request<Appointment>({
    url: `/appointments/${id}`,
    method: 'get',
  })
}

// 更新预约信息
export const updateAppointment = (id: number, data: AppointmentUpdate) => {
  return request<Appointment>({
    url: `/appointments/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 取消预约
 * @param id 预约ID
 * @param reason 取消原因
 */
export const cancelAppointment = (id: number, reason: string = '用户取消') => {
  return request({
    url: `/appointments/${id}/cancel`,
    method: 'post',
    data: { reason }
  })
}

// 更新预约状态
export const updateAppointmentStatus = (id: number, status: AppointmentStatus) => {
  return request<Appointment>({
    url: `/appointments/${id}`,
    method: 'put',
    data: { status },
  })
}
