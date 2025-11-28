export interface Service {
  id: number
  name: string
  description?: string
  price: number
  duration_minutes?: number
  created_at: string
  updated_at: string
}

export interface ServiceCreate {
  name: string
  description?: string
  price: number
  duration_minutes?: number
}

export interface ServiceUpdate {
  name?: string
  description?: string
  price?: number
  duration_minutes?: number
}
