// 图片基础URL配置
const IMAGE_BASE_URL = (import.meta as any).env?.VITE_API_IMAGE_URL || 'http://127.0.0.1:8001'

// 获取完整的图片URL
export const getImageUrl = (imagePath: string | null | undefined): string | null => {
    if (!imagePath) return null
    // 如果已经是完整URL,直接返回
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
    }
    // 移除开头的斜杠（如果有）
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath
    // 拼接基础URL - 注意uploads路径不需要重复
    if (cleanPath.startsWith('uploads/')) {
        return `${IMAGE_BASE_URL}/${cleanPath}`
    }
    return `${IMAGE_BASE_URL}/uploads/${cleanPath}`
}
