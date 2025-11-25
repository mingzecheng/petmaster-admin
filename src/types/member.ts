/**
 * 会员系统相关类型定义
 */

// 会员等级
export interface MemberLevel {
    id: number
    name: string
    level: number
    min_points: number
    discount_rate: number
    icon?: string
    color?: string
    description?: string
    benefits?: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface MemberLevelCreate {
    name: string
    level: number
    min_points?: number
    discount_rate?: number
    icon?: string
    color?: string
    description?: string
    benefits?: string
    is_active?: boolean
}

export interface MemberLevelUpdate {
    name?: string
    level?: number
    min_points?: number
    discount_rate?: number
    icon?: string
    color?: string
    description?: string
    benefits?: string
    is_active?: boolean
}

// 积分记录
export interface PointRecord {
    id: number
    user_id: number
    points: number
    balance: number
    type: 'earn' | 'use' | 'adjust'
    reason?: string
    transaction_id?: number
    operator_id?: number
    created_at: string
}

export interface PointAdjust {
    points: number
    reason: string
}

// 会员卡
export interface MemberCard {
    id: number
    user_id: number
    card_number: string
    balance: number
    total_recharge: number
    total_consumption: number
    status: string
    activated_at: string
    created_at: string
    updated_at: string
}

export interface MemberCardCreate {
    user_id: number
}

export interface CardRechargeRequest {
    amount: number
    payment_method?: string
    remark?: string
}

export interface CardRechargeRecord {
    id: number
    member_card_id: number
    amount: number
    balance_before: number
    balance_after: number
    payment_method?: string
    transaction_no?: string
    operator_id?: number
    remark?: string
    created_at: string
}

// 扩展用户类型，包含会员信息
export interface UserWithMember {
    id: number
    username: string
    mobile?: string
    email?: string
    role: string
    points: number
    total_points: number
    member_level_id?: number
    member_level?: MemberLevel
    member_card?: MemberCard
    created_at: string
    updated_at: string
}
