export type TransactionType = 'purchase' | 'service' | 'boarding' | 'refund'

export interface Transaction {
  id: number
  user_id: number
  transaction_type: TransactionType
  amount: number
  points_earned: number
  description?: string
  created_at: string
}

export interface TransactionCreate {
  user_id: number
  transaction_type: TransactionType
  amount: number
  points_earned?: number
  description?: string
}
