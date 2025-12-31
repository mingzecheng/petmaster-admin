export interface Product {
  id: number
  name: string
  category: string

  price: number
  stock: number
  image_url?: string
  created_at: string
  updated_at: string
}

export interface ProductCreate {
  name: string
  category: string

  price: number
  stock: number
  image_url?: string
}

export interface ProductUpdate {
  name?: string
  category?: string

  price?: number
  stock?: number
  image_url?: string
}
