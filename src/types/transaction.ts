/**
 * 支付状态枚举
 */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'

/**
 * 支付方式枚举
 */
export type PaymentMethod = 'alipay' | 'wechat' | 'card' | 'cash'

/**
 * 支付记录
 */
export interface Payment {
  id: number
  user_id: number
  out_trade_no: string
  trade_no?: string
  amount: string
  status: PaymentStatus
  method: PaymentMethod
  subject: string
  description?: string
  related_id?: number
  related_type?: string
  response_data?: string
  notify_data?: string
  error_message?: string
  created_at: string
  paid_at?: string
  updated_at: string
}

/**
 * 创建支付参数
 */
export interface PaymentCreate {
  amount: number
  subject: string
  description?: string
  method?: PaymentMethod
  related_id?: number
  related_type?: string
}
