export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Appointment {
  id: number
  pet_id: number
  service_id: number
  appointment_date: string
  status: AppointmentStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface AppointmentCreate {
  pet_id: number
  service_id: number
  appointment_date: string
  notes?: string
}

export interface AppointmentUpdate {
  appointment_date?: string
  status?: AppointmentStatus
  notes?: string
}
