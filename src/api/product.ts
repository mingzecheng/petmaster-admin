import request from '@/utils/request'
import type { Product, ProductCreate, ProductUpdate } from '@/types/product'

// 创建商品
export const createProduct = (data: ProductCreate) => {
  return request<Product>({
    url: '/products/',
    method: 'post',
    data,
  })
}

// 获取商品列表
export const getProductList = (params?: { 
  skip?: number
  limit?: number
  category?: string
  name?: string
}) => {
  return request<Product[]>({
    url: '/products/',
    method: 'get',
    params,
  })
}

// 获取商品详情
export const getProduct = (id: number) => {
  return request<Product>({
    url: `/products/${id}`,
    method: 'get',
  })
}

// 更新商品信息
export const updateProduct = (id: number, data: ProductUpdate) => {
  return request<Product>({
    url: `/products/${id}`,
    method: 'put',
    data,
  })
}

// 删除商品
export const deleteProduct = (id: number) => {
  return request({
    url: `/products/${id}`,
    method: 'delete',
  })
}

// 更新库存
export const updateStock = (id: number, quantity: number) => {
  return request<Product>({
    url: `/products/${id}/stock`,
    method: 'patch',
    params: { quantity },
  })
}
