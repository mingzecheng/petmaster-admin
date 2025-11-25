import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import NProgress from 'nprogress'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false, title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'DataAnalysis' },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '用户管理', icon: 'User', roles: ['admin'] },
      },
      {
        path: 'pets',
        name: 'Pets',
        component: () => import('@/views/pet/index.vue'),
        meta: { title: '宠物管理', icon: 'Orange' },
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/product/index.vue'),
        meta: { title: '商品管理', icon: 'ShoppingCart' },
      },
      {
        path: 'services',
        name: 'Services',
        component: () => import('@/views/service/index.vue'),
        meta: { title: '服务管理', icon: 'Service' },
      },
      {
        path: 'appointments',
        name: 'Appointments',
        component: () => import('@/views/appointment/index.vue'),
        meta: { title: '预约管理', icon: 'Calendar' },
      },
      {
        path: 'boarding',
        name: 'Boarding',
        component: () => import('@/views/boarding/index.vue'),
        meta: { title: '寄养管理', icon: 'House' },
      },
      {
        path: 'transactions',
        name: 'Transactions',
        component: () => import('@/views/transaction/index.vue'),
        meta: { title: '交易记录', icon: 'Wallet' },
      },
      {
        path: 'members',
        name: 'Members',
        component: () => import('@/views/member/index.vue'),
        meta: { title: '会员管理', icon: 'User' },
      },
      {
        path: 'member-levels',
        name: 'MemberLevels',
        component: () => import('@/views/member/levels.vue'),
        meta: { title: '会员等级', icon: 'Star' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', icon: 'User' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: { requiresAuth: false },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  NProgress.start()

  const userStore = useUserStore()

  // 设置页面标题
  document.title = to.meta.title
    ? `${to.meta.title} - 宠物管理系统`
    : '宠物管理系统'

  if (to.meta.requiresAuth !== false) {
    // 需要登录
    if (!userStore.token) {
      next('/login')
      NProgress.done()
      return
    }

    // 如果没有用户信息，获取用户信息
    if (!userStore.userInfo) {
      try {
        await userStore.fetchUserInfo()
      } catch (error) {
        next('/login')
        NProgress.done()
        return
      }
    }

    // 权限检查
    if (to.meta.roles) {
      const roles = to.meta.roles as string[]
      if (!roles.includes(userStore.userInfo?.role || '')) {
        next('/dashboard')
        NProgress.done()
        return
      }
    }
  } else {
    // 如果已登录，不允许访问登录页
    if (to.path === '/login' && userStore.token) {
      next('/dashboard')
      NProgress.done()
      return
    }
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
