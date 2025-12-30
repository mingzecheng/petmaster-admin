export interface User {
  id: number
  username: string
  email?: string
  role: 'admin' | 'staff' | 'member'
  created_at: string
  updated_at: string
}

export interface LoginForm {
  username: string
  password: string
  recaptcha_token?: string
}

export interface RegisterForm {
  username: string
  password: string
  email?: string
}

export interface UserCreate {
  username: string
  password: string
  email?: string
  role: 'admin' | 'staff' | 'member'
}

export interface UserUpdate {
  username?: string
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
