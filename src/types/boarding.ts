export type BoardingStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'refunded'

export interface Boarding {
  id: number
  pet_id: number
  start_date: string
  end_date: string
  daily_rate: number
  total_cost: number
  status: BoardingStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface BoardingCreate {
  pet_id: number
  start_date: string
  end_date: string
  daily_rate: number
  notes?: string
}

export interface BoardingUpdate {
  start_date?: string
  end_date?: string
  daily_rate?: number
  status?: BoardingStatus
  notes?: string
}
