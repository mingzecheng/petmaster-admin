import request from '@/utils/request'

/**
 * Dashboard 统计数据接口
 * 使用现有 API 组合实现，无需后端改动
 */

export interface DashboardStats {
    totalUsers: number
    totalAdmins: number   // 管理员数量
    totalStaff: number    // 员工数量
    totalMembers: number  // 会员数量
    totalPets: number
    todayAppointments: number
    todayRevenue: number
}

export interface AppointmentTrendData {
    date: string
    count: number
}

export interface ServiceDistributionData {
    serviceName: string
    count: number
}

/** 后端返回的统计数据（蛇形命名） */
interface DashboardStatsResponse {
    total_users: number
    total_admins: number
    total_staff: number
    total_members: number
    total_pets: number
    today_appointments: number
    today_revenue: string | number
}

/**
 * 获取 Dashboard 统计数据
 * 直接调用后端API，不在前端计算
 */
export const getStatistics = async (): Promise<DashboardStats> => {
    try {
        const result = await request<DashboardStatsResponse>({
            url: '/dashboard/stats/',
            method: 'get'
        })

        return {
            totalUsers: result.total_users || 0,
            totalAdmins: result.total_admins || 0,
            totalStaff: result.total_staff || 0,
            totalMembers: result.total_members || 0,
            totalPets: result.total_pets || 0,
            todayAppointments: result.today_appointments || 0,
            todayRevenue: parseFloat(String(result.today_revenue)) || 0,
        }
    } catch (error) {
        console.error('获取统计数据失败:', error)
        return {
            totalUsers: 0,
            totalAdmins: 0,
            totalStaff: 0,
            totalMembers: 0,
            totalPets: 0,
            todayAppointments: 0,
            todayRevenue: 0,
        }
    }
}

export interface TrendData {
    date: string
    appointments: number
    revenue: number
    boarding: number
}

/**
 * 获取最近7天趋势数据
 */
export const getTrends = async (): Promise<TrendData[]> => {
    try {
        const result = await request<TrendData[]>({
            url: '/dashboard/trends/',
            method: 'get'
        })
        return result || []
    } catch (error) {
        console.error('获取趋势数据失败:', error)
        return []
    }
}

/**
 * 获取最近7天预约趋势数据
 */
export const getAppointmentTrend = async (): Promise<AppointmentTrendData[]> => {
    try {
        const appointmentsResponse = await request<any[]>({
            url: '/appointments/',
            method: 'get',
            params: { skip: 0, limit: 1000 }
        })

        const appointments = appointmentsResponse as unknown as any[]
        const trendMap = new Map<string, number>()

        // 获取最近7天的日期
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (6 - i))
            return date.toISOString().split('T')[0]
        })

        // 初始化所有日期的计数为0
        last7Days.forEach(date => trendMap.set(date, 0))

        // 统计每天的预约数
        appointments.forEach((apt: any) => {
            const date = apt.appointment_time?.split('T')[0]
            if (date && trendMap.has(date)) {
                trendMap.set(date, (trendMap.get(date) || 0) + 1)
            }
        })

        return last7Days.map(date => ({
            date,
            count: trendMap.get(date) || 0
        }))
    } catch (error) {
        console.error('获取预约趋势数据失败:', error)
        return []
    }
}

/**
 * 获取服务类型分布数据
 */
export const getServiceDistribution = async (): Promise<ServiceDistributionData[]> => {
    try {
        const [servicesResponse, appointmentsResponse] = await Promise.all([
            request<any[]>({ url: '/services/', method: 'get', params: { skip: 0, limit: 100 } }),
            request<any[]>({ url: '/appointments/', method: 'get', params: { skip: 0, limit: 1000 } })
        ])

        const services = servicesResponse as unknown as any[]
        const appointments = appointmentsResponse as unknown as any[]

        // 统计每个服务的预约数
        const serviceCountMap = new Map<number, number>()
        appointments.forEach((apt: any) => {
            const serviceId = apt.service_id
            serviceCountMap.set(serviceId, (serviceCountMap.get(serviceId) || 0) + 1)
        })

        // 映射服务名称和数量
        return services
            .map(service => ({
                serviceName: service.name,
                count: serviceCountMap.get(service.id) || 0
            }))
            .filter(item => item.count > 0)
            .sort((a, b) => b.count - a.count)
    } catch (error) {
        console.error('获取服务分布数据失败:', error)
        return []
    }
}
