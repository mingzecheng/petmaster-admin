/**
 * 宠物健康记录相关类型定义
 */

export interface HealthRecord {
    id: number
    pet_id: number
    record_date: string
    description?: string
    veterinarian?: string
    created_at: string
}

export interface HealthRecordCreate {
    pet_id: number
    record_date: string
    description?: string
    veterinarian?: string
}

export interface HealthRecordUpdate {
    record_date?: string
    description?: string
    veterinarian?: string
}
