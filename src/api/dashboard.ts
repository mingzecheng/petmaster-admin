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

/**
 * 获取 Dashboard 统计数据
 * 通过组合调用多个API来获取统计信息
 */
export const getStatistics = async (): Promise<DashboardStats> => {
    try {
        // 并行请求多个 API (request已经在拦截器中返回response.data)
        const [usersResponse, petsResponse, appointmentsResponse, paymentsResponse] = await Promise.all([
            request<any[]>({ url: '/users/', method: 'get', params: { skip: 0, limit: 1000 } }),
            request<any[]>({ url: '/pets/', method: 'get', params: { skip: 0, limit: 1000 } }),
            request<any[]>({ url: '/appointments/', method: 'get', params: { skip: 0, limit: 1000 } }),
            request<any[]>({ url: '/payments/', method: 'get', params: { skip: 0, limit: 1000 } }),
        ])

        // 统计各角色用户数
        const users = usersResponse as unknown as any[]
        const totalAdmins = users.filter(u => u.role === 'admin').length
        const totalStaff = users.filter(u => u.role === 'staff').length
        const totalMembers = users.filter(u => u.role === 'member').length

        // 计算今日预约数
        const today = new Date().toISOString().split('T')[0]
        const todayAppointments = (appointmentsResponse as unknown as any[]).filter((apt: any) =>
            apt.appointment_time?.startsWith(today)
        ).length

        // 计算今日营收（从支付记录中统计已支付的订单）
        const todayRevenue = (paymentsResponse as unknown as any[])
            .filter((payment: any) => {
                const paymentDate = payment.paid_at ? new Date(payment.paid_at).toISOString().split('T')[0] : ''
                return paymentDate === today && payment.status === 'paid'
            })
            .reduce((sum: number, payment: any) => sum + (parseFloat(payment.amount) || 0), 0)

        return {
            totalUsers: users.length || 0,
            totalAdmins: totalAdmins || 0,
            totalStaff: totalStaff || 0,
            totalMembers: totalMembers || 0,
            totalPets: (petsResponse as unknown as any[]).length || 0,
            todayAppointments: todayAppointments || 0,
            todayRevenue: todayRevenue || 0,
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
