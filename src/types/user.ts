export interface User {
  id: number
  username: string
  mobile?: string
  email?: string
  role: 'admin' | 'staff' | 'member'
  created_at: string
  updated_at: string
}

export interface LoginForm {
  username: string
  password: string
}

export interface RegisterForm {
  username: string
  password: string
  mobile?: string
  email?: string
}

export interface UserUpdate {
  username?: string
  mobile?: string
  email?: string
  role?: 'admin' | 'staff' | 'member'
}

export interface ChangePasswordForm {
  old_password: string
  new_password: string
  confirm_password: string  // 仅前端使用
}

export interface TokenResponse {
  access_token: string
  token_type: string
}
