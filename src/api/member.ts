/**
 * 会员系统 API 接口
 */
import request from '@/utils/request'
import type {
    MemberLevel,
    MemberLevelCreate,
    MemberLevelUpdate,
    PointRecord,
    PointAdjust,
    MemberCard,
    MemberCardCreate,
    CardRechargeRequest,
    CardRechargeRecord,
} from '@/types/member'

// ============ 会员等级 API ============

/**
 * 获取所有会员等级
 */
export const getMemberLevels = () => {
    return request<MemberLevel[]>({
        url: '/member_levels',
        method: 'get',
    })
}

/**
 * 获取指定会员等级
 */
export const getMemberLevel = (id: number) => {
    return request<MemberLevel>({
        url: `/member_levels/${id}`,
        method: 'get',
    })
}

/**
 * 创建会员等级
 */
export const createMemberLevel = (data: MemberLevelCreate) => {
    return request<MemberLevel>({
        url: '/member_levels',
        method: 'post',
        data,
    })
}

/**
 * 更新会员等级
 */
export const updateMemberLevel = (id: number, data: MemberLevelUpdate) => {
    return request<MemberLevel>({
        url: `/member_levels/${id}`,
        method: 'put',
        data,
    })
}

/**
 * 删除会员等级
 */
export const deleteMemberLevel = (id: number) => {
    return request({
        url: `/member_levels/${id}`,
        method: 'delete',
    })
}

// ============ 积分管理 API ============

/**
 * 获取用户积分明细
 */
export const getUserPointRecords = (userId: number, params?: { skip?: number; limit?: number }) => {
    return request<PointRecord[]>({
        url: `/points/users/${userId}/records`,
        method: 'get',
        params,
    })
}

/**
 * 手动调整用户积分
 */
export const adjustUserPoints = (userId: number, data: PointAdjust) => {
    return request<PointRecord>({
        url: `/points/users/${userId}/adjust`,
        method: 'post',
        data,
    })
}

/**
 * 消费获得积分
 */
export const earnPointsFromTransaction = (transactionId: number) => {
    return request<PointRecord>({
        url: `/points/transactions/${transactionId}/earn`,
        method: 'post',
    })
}

// ============ 会员卡 API ============

/**
 * 开通会员卡
 */
export const createMemberCard = (data: MemberCardCreate) => {
    return request<MemberCard>({
        url: '/member_cards/',
        method: 'post',
        data,
    })
}

/**
 * 获取会员卡详情
 */
export const getMemberCard = (cardId: number) => {
    return request<MemberCard>({
        url: `/member_cards/${cardId}`,
        method: 'get',
    })
}

/**
 * 获取用户的会员卡
 */
export const getUserMemberCard = (userId: number) => {
    return request<MemberCard>({
        url: `/member_cards/users/${userId}`,
        method: 'get',
    })
}

/**
 * 会员卡充值
 */
export const rechargeMemberCard = (cardId: number, data: CardRechargeRequest) => {
    return request<CardRechargeRecord>({
        url: `/member_cards/${cardId}/recharge`,
        method: 'post',
        data,
    })
}

/**
 * 获取充值记录
 */
export const getRechargeRecords = (cardId: number) => {
    return request<CardRechargeRecord[]>({
        url: `/member_cards/${cardId}/recharge_records`,
        method: 'get',
    })
}

/**
 * 冻结会员卡
 */
export const freezeMemberCard = (cardId: number) => {
    return request<MemberCard>({
        url: `/member_cards/${cardId}/freeze`,
        method: 'post',
    })
}

/**
 * 解冻会员卡
 */
export const unfreezeMemberCard = (cardId: number) => {
    return request<MemberCard>({
        url: `/member_cards/${cardId}/unfreeze`,
        method: 'post',
    })
}

/**
 * 注销会员卡
 */
export const cancelMemberCard = (cardId: number) => {
    return request({
        url: `/member_cards/${cardId}/cancel`,
        method: 'post',
    })
}
