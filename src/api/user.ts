import request from '@/utils/request'
import type { User, LoginForm, UserUpdate, TokenResponse } from '@/types/user'
// RegisterForm removed - registration only available in mini-program

// 登录
export const login = (data: LoginForm) => {
  return request<TokenResponse>({
    url: '/auth/login',
    method: 'post',
    data,
  })
}


// 获取当前用户信息
export const getCurrentUser = () => {
  return request<User>({
    url: '/users/me',
    method: 'get',
  })
}

// 更新当前用户信息
export const updateCurrentUser = (data: UserUpdate) => {
  return request<User>({
    url: '/users/me',
    method: 'put',
    data,
  })
}

// 获取用户列表（管理员）
export const getUserList = (params?: { skip?: number; limit?: number }) => {
  return request<User[]>({
    url: '/users/',
    method: 'get',
    params,
  })
}

// 获取指定用户信息（管理员）
export const getUser = (id: number) => {
  return request<User>({
    url: `/users/${id}`,
    method: 'get',
  })
}

// 更新用户信息（管理员）
export const updateUser = (id: number, data: UserUpdate) => {
  return request<User>({
    url: `/users/${id}`,
    method: 'put',
    data,
  })
}

// 删除用户(管理员)
export const deleteUser = (id: number) => {
  return request({
    url: `/users/${id}`,
    method: 'delete',
  })
}

// 修改当前用户密码
export const changePassword = (data: { old_password: string; new_password: string }) => {
  return request({
    url: '/users/me/change-password',
    method: 'post',
    data,
  })
}
