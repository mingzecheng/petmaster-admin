export interface Pet {
  id: number
  name: string
  species: string
  breed?: string
  age?: number
  gender?: 'male' | 'female'
  color?: string
  weight?: number
  owner_id: number
  health_status?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface PetCreate {
  name: string
  species: string
  breed?: string
  age?: number
  gender?: 'male' | 'female'
  color?: string
  weight?: number
  owner_id: number
  health_status?: string
  notes?: string
}

export interface PetUpdate {
  name?: string
  species?: string
  breed?: string
  age?: number
  gender?: 'male' | 'female'
  color?: string
  weight?: number
  health_status?: string
  notes?: string
}

export interface HealthRecord {
  id: number
  pet_id: number
  record_type: string
  description: string
  record_date: string
  vet_name?: string
  cost?: number
  next_visit_date?: string
  created_at: string
}

export interface HealthRecordCreate {
  pet_id: number
  record_type: string
  description: string
  record_date: string
  vet_name?: string
  cost?: number
  next_visit_date?: string
}
