<template>
  <el-container class="layout-container">
    <el-aside :width="appStore.sidebarCollapsed ? '72px' : '240px'" class="sidebar"> 
      <div class="logo">
        <div class="logo-icon">
          <el-icon :size="26"><Orange /></el-icon>
        </div>
        <transition name="fade">
          <span v-if="!appStore.sidebarCollapsed" class="logo-text">PetMaster</span>
        </transition>
      </div>
      
      <el-scrollbar>
        <el-menu
          :default-active="activeMenu"
          :collapse="appStore.sidebarCollapsed"
          :collapse-transition="false"
          router
          class="sidebar-menu"
        >
          <template v-for="route in menuRoutes" :key="route.path">
            <el-menu-item
              v-if="!route.meta?.roles || route.meta.roles.includes(userStore.userInfo?.role || '')"
              :index="route.path"
            >
              <el-icon v-if="route.meta?.icon">
                <component :is="route.meta.icon" />
              </el-icon>
              <template #title>
                <span class="menu-title">{{ route.meta?.title }}</span>
              </template>
            </el-menu-item>
          </template>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container class="main-container">
      <el-header class="header glass-effect">
        <div class="header-left">
          <div class="collapse-btn" @click="appStore.toggleSidebar">
            <el-icon :size="20">
              <Expand v-if="appStore.sidebarCollapsed" />
              <Fold v-else />
            </el-icon>
          </div>
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-tooltip content="全屏" placement="bottom">
            <div class="icon-btn">
              <el-icon :size="20"><FullScreen /></el-icon>
            </div>
          </el-tooltip>
          
          <el-tooltip content="通知" placement="bottom">
            <div class="icon-btn">
              <el-badge is-dot class="badge-dot">
                <el-icon :size="20"><Bell /></el-icon>
              </el-badge>
            </div>
          </el-tooltip>

          <el-dropdown trigger="click">
            <div class="user-info">
              <el-avatar :size="36" :src="userStore.userInfo?.avatar" class="user-avatar">
                {{ userStore.userInfo?.username?.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-details">
                <span class="username">{{ userStore.userInfo?.username }}</span>
                <span class="role-badge">{{ userStore.userInfo?.role === 'admin' ? '管理员' : '用户' }}</span>
              </div>
              <el-icon class="el-icon--right"><CaretBottom /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="user-dropdown">
                <el-dropdown-item @click="router.push('/profile')">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
    <!-- 添加背景装饰 -->
    <div class="layout-bg-decoration"></div>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { ElMessageBox } from 'element-plus'
import { 
  Orange, Expand, Fold, User, SwitchButton, 
  FullScreen, Bell, CaretBottom 
} from '@element-plus/icons-vue' 

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const activeMenu = computed(() => route.path)

const menuRoutes = computed(() => {
  const routes = router.getRoutes()
  return routes.find(r => r.path === '/')?.children || []
})

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    userStore.logout()
    router.push('/login')
  } catch (error) {
    // 取消操作
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background-color: var(--pet-bg-base);
  position: relative;
  overflow: hidden;
}

.layout-bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  background-image: 
    radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
    radial-gradient(circle at 85% 85%, rgba(255, 214, 0, 0.1) 0%, transparent 40%);
}

/* 侧边栏 - Premium Vibrant Design */
.sidebar {
  background: linear-gradient(135deg, #FFC107 0%, #FF9800 50%, #FF6F00 100%);
  border-right: none;
  transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
  z-index: 20;
  box-shadow: 4px 0 24px rgba(255, 111, 0, 0.25);
  position: relative;
  overflow: hidden;
}

/* 侧边栏背景纹理 */
.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 10% 10%, rgba(255, 255, 255, 0.2) 0%, transparent 20%),
    radial-gradient(circle at 90% 90%, rgba(255, 255, 255, 0.15) 0%, transparent 30%);
  pointer-events: none;
}

.logo {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  color: #FF6F00;
  animation: float-logo 4s ease-in-out infinite;
}

@keyframes float-logo {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.logo-text {
  font-size: 24px;
  font-weight: 800;
  font-family: 'Outfit', sans-serif;
  color: #FFFFFF;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sidebar-menu {
  border: none;
  padding: 12px;
  background: transparent;
  position: relative;
  z-index: 1;
}

.sidebar-menu :deep(.el-menu-item) {
  height: 54px;
  line-height: 54px;
  margin: 6px 12px;
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
  border: 1px solid transparent;
  width: auto;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
  transform: translateX(6px);
  backdrop-filter: blur(4px);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: #FFFFFF;
  color: #FF6F00; /* 深橙色文字 */
  font-weight: 800;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}

.sidebar-menu :deep(.el-menu-item .el-icon) {
  transition: transform 0.3s;
}

.sidebar-menu :deep(.el-menu-item:hover .el-icon) {
  transform: scale(1.2) rotate(5deg);
}

.sidebar-menu :deep(.el-menu-item.is-active .el-icon) {
  color: #FF6F00;
  transform: scale(1.1);
}

.menu-title {
  margin-left: 10px;
  font-size: 15px;
}

/* 折叠状态下的特殊样式 */
.sidebar-menu.el-menu--collapse :deep(.el-menu-item) {
  justify-content: center !important;
  padding: 0 !important;
  margin: 8px auto !important; /* 上下间距，左右自动居中 */
  width: 48px !important; /* 固定宽度，确保正方形或近正方形 */
  height: 48px !important;
  border-radius: 14px;
}

/* 折叠时彻底隐藏文字和标题，防止占位 */
.sidebar-menu.el-menu--collapse :deep(.el-menu-item span),
.sidebar-menu.el-menu--collapse :deep(.el-menu-item .menu-title),
.sidebar-menu.el-menu--collapse :deep(.el-menu-item template) {
  display: none !important;
}

/* 确保图标居中且无边距 */
.sidebar-menu.el-menu--collapse :deep(.el-menu-item .el-icon) {
  margin: 0 !important;
  transform: none;
  position: static; /* 防止绝对定位干扰 */
}

/* 折叠状态下的 Hover 和 Active 效果 */
.sidebar-menu.el-menu--collapse :deep(.el-menu-item:hover),
.sidebar-menu.el-menu--collapse :deep(.el-menu-item.is-active) {
  background-color: #FFFFFF !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.sidebar-menu.el-menu--collapse :deep(.el-menu-item:hover .el-icon),
.sidebar-menu.el-menu--collapse :deep(.el-menu-item.is-active .el-icon) {
  transform: scale(1.15);
}

/* 展开状态下图标有右边距 */
.sidebar-menu:not(.el-menu--collapse) :deep(.el-menu-item .el-icon) {
  margin-right: 12px;
}

/* 头部 */
.header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 10;
  position: sticky;
  top: 0;
  background: rgba(255, 253, 231, 0.8); /* 适配新背景色 */
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-btn {
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
  color: var(--pet-text-secondary);
}

.collapse-btn:hover {
  background: var(--pet-bg-base);
  color: var(--pet-text-main);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  color: var(--pet-text-secondary);
  transition: all 0.2s;
}

.icon-btn:hover {
  background: var(--pet-bg-base);
  color: var(--pet-primary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 30px;
  transition: background 0.2s;
}

.user-info:hover {
  background: var(--pet-bg-base);
}

.user-avatar {
  background: var(--pet-primary-light);
  color: var(--pet-primary-dark);
  font-weight: 600;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.user-details {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: var(--pet-text-main);
}

.role-badge {
  font-size: 11px;
  color: var(--pet-text-secondary);
}

/* 主内容区 */
.main-content {
  padding: 24px;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>