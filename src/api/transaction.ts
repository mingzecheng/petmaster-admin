/**
 * @description 支付记录 API（原交易模块改为使用支付记录）
 */
import request from '@/utils/request'
import type { Payment, PaymentCreate, PaymentStatus } from '@/types/transaction'

/**
 * 获取支付列表
 * @param params - 查询参数
 */
export const getTransactionList = (params?: {
  skip?: number
  limit?: number
  user_id?: number
  pay_status?: PaymentStatus
}) => {
  return request<Payment[]>({
    url: '/payments/',
    method: 'get',
    params,
  })
}

/**
 * 获取支付详情
 * @param outTradeNo - 商户订单号
 */
export const getPaymentStatus = (outTradeNo: string) => {
  return request<{
    out_trade_no: string
    status: PaymentStatus
    amount: string
    subject: string
    description?: string
    created_at: string
    paid_at?: string
  }>({
    url: `/payments/${outTradeNo}/status`,
    method: 'get',
  })
}

/**
 * 创建支付宝支付
 * @param data - 支付数据
 */
export const createAlipayPayment = (data: PaymentCreate) => {
  return request<{
    payment_id: number
    out_trade_no: string
    amount: string
    subject: string
    qr_code?: string
    pay_url?: string
    status: string
    message: string
  }>({
    url: '/payments/alipay/create',
    method: 'post',
    data,
  })
}
