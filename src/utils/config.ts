// API基础URL配置
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8001'

// 获取完整的图片URL
export const getImageUrl = (imagePath: string | null | undefined): string | null => {
    if (!imagePath) return null
    // 如果已经是完整URL,直接返回
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
    }
    // 拼接基础URL
    return `${API_BASE_URL}/uploads/${imagePath}`
}
