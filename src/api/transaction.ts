import request from '@/utils/request'
import type { Transaction, TransactionCreate, TransactionType } from '@/types/transaction'

// 创建交易记录
export const createTransaction = (data: TransactionCreate) => {
  return request<Transaction>({
    url: '/transactions/',
    method: 'post',
    data,
  })
}

// 获取交易列表
export const getTransactionList = (params?: { 
  skip?: number
  limit?: number
  user_id?: number
  transaction_type?: TransactionType
}) => {
  return request<Transaction[]>({
    url: '/transactions/',
    method: 'get',
    params,
  })
}

// 获取我的交易记录
export const getMyTransactions = (params?: { skip?: number; limit?: number }) => {
  return request<Transaction[]>({
    url: '/transactions/me',
    method: 'get',
    params,
  })
}

// 获取我的总积分
export const getMyPoints = () => {
  return request<{ user_id: number; total_points: number }>({
    url: '/transactions/me/points',
    method: 'get',
  })
}

// 获取我的总消费
export const getMySpending = () => {
  return request<{ user_id: number; total_spending: number }>({
    url: '/transactions/me/spending',
    method: 'get',
  })
}

// 获取交易详情
export const getTransaction = (id: number) => {
  return request<Transaction>({
    url: `/transactions/${id}`,
    method: 'get',
  })
}
