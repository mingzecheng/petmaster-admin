export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'refunded'

export interface Appointment {
  id: number
  pet_id: number
  service_id: number
  appointment_time: string  // 后端使用 appointment_time
  status: AppointmentStatus
  created_at: string
  updated_at: string
}

export interface AppointmentCreate {
  pet_id: number
  service_id: number
  appointment_time: string  // 后端使用 appointment_time
}

export interface AppointmentUpdate {
  appointment_time?: string  // 后端使用 appointment_time
  status?: AppointmentStatus
}

/**
 * 取消预约请求
 */
export interface AppointmentCancelRequest {
  reason: string  // 取消原因
}
