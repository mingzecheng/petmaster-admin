export interface Pet {
  id: number
  name: string
  species: string
  breed?: string
  gender?: 'male' | 'female'
  birthday?: string
  weight?: number
  owner_id: number
  health_status?: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface PetCreate {
  name: string
  species: string
  breed?: string
  gender?: 'male' | 'female'
  birthday?: string
  weight?: number
  owner_id: number
  health_status?: string
  image_url?: string
}

export interface PetUpdate {
  name?: string
  species?: string
  breed?: string
  gender?: 'male' | 'female'
  birthday?: string
  weight?: number
  health_status?: string
  image_url?: string
}

export interface HealthRecord {
  id: number
  pet_id: number
  record_date: string
  description?: string
  veterinarian?: string
  created_at: string
}

export interface HealthRecordCreate {
  pet_id?: number
  record_date: string
  description?: string
  veterinarian?: string
}
