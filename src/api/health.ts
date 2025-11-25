/**
 * 宠物健康记录 API 接口
 */
import request from '@/utils/request'
import type { HealthRecord, HealthRecordCreate, HealthRecordUpdate } from '@/types/health'

/**
 * 创建健康记录
 */
export const createHealthRecord = (data: HealthRecordCreate) => {
    return request<HealthRecord>({
        url: '/pet_health_records/',
        method: 'post',
        data,
    })
}

/**
 * 获取宠物的所有健康记录
 */
export const getPetHealthRecords = (petId: number, params?: { skip?: number; limit?: number }) => {
    return request<HealthRecord[]>({
        url: `/pet_health_records/pet/${petId}`,
        method: 'get',
        params,
    })
}

/**
 * 获取指定健康记录
 */
export const getHealthRecord = (recordId: number) => {
    return request<HealthRecord>({
        url: `/pet_health_records/${recordId}`,
        method: 'get',
    })
}

/**
 * 更新健康记录
 */
export const updateHealthRecord = (recordId: number, data: HealthRecordUpdate) => {
    return request<HealthRecord>({
        url: `/pet_health_records/${recordId}`,
        method: 'put',
        data,
    })
}

/**
 * 删除健康记录
 */
export const deleteHealthRecord = (recordId: number) => {
    return request({
        url: `/pet_health_records/${recordId}`,
        method: 'delete',
    })
}
