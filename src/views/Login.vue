<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="logo-icon pet-bounce">
          <el-icon :size="48" color="#212121"><Orange /></el-icon>
        </div>
        <h2 class="text-gradient">宠物店后台管理系统</h2>
        <p>Pet Master Management System</p>
      </div>

      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            clearable
            class="custom-input"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
            class="custom-input"
          />
        </el-form-item>

        <!-- reCAPTCHA v2 弹窗 -->
        <div v-show="showRecaptchaModal" class="recaptcha-modal" @click.self="showRecaptchaModal = false">
          <div class="recaptcha-content">
            <div class="recaptcha-header">
              <span>请完成安全验证</span>
              <el-icon class="close-icon" @click="showRecaptchaModal = false"><Close /></el-icon>
            </div>
            <div id="recaptcha-container" class="recaptcha-wrapper"></div>
          </div>
        </div>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>🐾 默认管理员账号: admin / admin123</p>
      </div>
    </div>

    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="pet-element paw-1">🐾</div>
      <div class="pet-element paw-2">🐾</div>
      <div class="pet-element bone">🦴</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useRecaptcha } from '@/composables/useRecaptcha'
import type { FormInstance, FormRules } from 'element-plus'
import type { LoginForm } from '@/types/user'
import { Orange, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const { version: recaptchaVersion, renderV2, executeRecaptcha } = useRecaptcha()

const formRef = ref<FormInstance>()
const loading = ref(false)
const showRecaptchaModal = ref(false)

const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
  ],
}

// v2: 组件挂载时渲染验证框
onMounted(async () => {
  if (recaptchaVersion === 'v2') {
    try {
      // 传入回调：验证成功后自动关闭弹窗并尝试登录
      await renderV2('recaptcha-container', (token) => {
        showRecaptchaModal.value = false
        handleLogin()
      })
    } catch (error) {
      console.error('Failed to render reCAPTCHA v2:', error)
      ElMessage.warning('验证码加载失败，请刷新页面重试')
    }
  }
})

const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      // v2 特殊处理：如果未验证，显示弹窗
      if (recaptchaVersion === 'v2') {
        try {
          // 尝试获取 token，如果失败（未验证）则抛出错误
          await executeRecaptcha('login')
        } catch (error) {
          // 未验证，显示弹窗
          showRecaptchaModal.value = true
          return
        }
      }

      loading.value = true
      try {
        // 获取 reCAPTCHA token (v2 或 v3)
        let recaptchaToken: string | undefined
        try {
          recaptchaToken = await executeRecaptcha('login')
        } catch (error: any) {
          console.error('reCAPTCHA error:', error)
          ElMessage.error(error.message || '验证码验证失败')
          loading.value = false
          return
        }

        // 登录请求
        const success = await userStore.login({
          ...loginForm,
          recaptcha_token: recaptchaToken,
        })
        
        if (success) {
          router.push('/dashboard')
        }
      } catch (error: any) {
        ElMessage.error(error.response?.data?.error?.message || '登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  position: relative;
  width: 100%;
  height: 100vh;
  /* 活力黄背景 - 更高饱和度 */
  background: radial-gradient(circle at top right, #FFF59D 0%, #FFFDE7 40%, #FFF176 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 增加动态背景层 */
.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 214, 0, 0.1) 10%, transparent 20%),
              radial-gradient(circle, rgba(41, 121, 255, 0.05) 10%, transparent 20%);
  background-size: 30px 30px;
  animation: bgMove 60s linear infinite;
  opacity: 0.5;
  z-index: 0;
}

@keyframes bgMove {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.login-box {
  position: relative;
  /* ... existing styles ... */
}

/* reCAPTCHA 弹窗样式 - 优化版 */
.recaptcha-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(255, 214, 0, 0.15) 0%,
    rgba(41, 121, 255, 0.15) 100%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: overlayFadeIn 0.3s ease;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.recaptcha-content {
  position: relative;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.98) 100%
  );
  padding: 32px 28px 28px;
  border-radius: 20px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset,
    0 8px 16px rgba(41, 121, 255, 0.1);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 2px solid rgba(255, 214, 0, 0.2);
  overflow: hidden;
}

/* 添加装饰性渐变边框效果 */
.recaptcha-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(
    90deg,
    #FFD600 0%,
    #2979FF 50%,
    #FFD600 100%
  );
  background-size: 200% 100%;
  animation: gradientMove 3s linear infinite;
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.recaptcha-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(255, 214, 0, 0.15);
}

.recaptcha-header span {
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #FFD600 0%, #2979FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 添加安全图标 */
.recaptcha-header span::before {
  content: '🔒';
  font-size: 20px;
  filter: grayscale(0);
  -webkit-text-fill-color: initial;
}

.close-icon {
  cursor: pointer;
  font-size: 22px;
  color: #999;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 6px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.02);
}

.close-icon:hover {
  color: #FF5252;
  background: rgba(255, 82, 82, 0.1);
  transform: rotate(90deg);
}

.recaptcha-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) inset;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .recaptcha-content {
    margin: 0 16px;
    padding: 24px 20px 20px;
    border-radius: 16px;
  }
  
  .recaptcha-header span {
    font-size: 16px;
  }
}


.login-box {
  position: relative;
  z-index: 10;
  width: 420px;
  padding: 48px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  backdrop-filter: blur(20px);
  animation: slideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border-radius: 24px;
  /* 使用新的橙黄渐变 */
  background: linear-gradient(135deg, var(--pet-primary), var(--pet-primary-dark));
  margin-bottom: 20px;
  /* 更新阴影颜色 */
  box-shadow: 0 12px 24px rgba(255, 214, 0, 0.4);
  transform: rotate(-5deg);
  transition: transform 0.3s;
}

.logo-icon:hover {
  transform: rotate(0deg) scale(1.05);
}

.logo-icon :deep(.el-icon) {
    color: var(--pet-text-on-primary); /* 图标内部用深色文字，增强对比度 */
}

.login-header h2 {
  margin: 16px 0 8px;
  font-size: 28px;
  color: var(--pet-text);
  font-weight: 700;
}

.login-header p {
  color: var(--pet-text-light);
  font-size: 14px;
}

.login-form {
  margin-top: 24px;
}

.custom-input :deep(.el-input__wrapper) {
  border-radius: var(--pet-radius);
  background: var(--pet-background); /* 使用主题背景色 */
  box-shadow: none;
  border: 1px solid var(--pet-border);
  transition: all 0.3s;
}

.custom-input :deep(.el-input__wrapper:hover) {
  border-color: var(--pet-primary);
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--pet-primary) inset;
  border-color: var(--pet-primary);
}

.login-button {
  width: 100%;
  height: 52px;
  font-size: 18px;
  font-weight: 700;
  border-radius: 12px;
  transition: all 0.3s;
  /* 使用新的黄色渐变 */
  background: linear-gradient(135deg, var(--pet-primary), var(--pet-primary-dark));
  border: none;
  letter-spacing: 1px;
  color: var(--pet-text-on-primary); /* 按钮文字用深色，确保对比度 */
  box-shadow: 0 8px 20px rgba(255, 214, 0, 0.3);
}

.login-button:hover {
  transform: translateY(-3px);
  /* 更新阴影颜色 */
  box-shadow: 0 12px 24px rgba(255, 214, 0, 0.4);
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  color: var(--pet-text-light);
  font-size: 13px;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  /* 使用浅色黄/白 */
  background: rgba(250, 215, 32, 0.1); 
  filter: blur(50px);
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  left: -150px;
  /* 更新颜色 */
  background: rgba(250, 215, 32, 0.3); 
  animation-delay: 0s;
}

.circle-2 {
  width: 400px;
  height: 400px;
  bottom: -200px;
  right: -200px;
  background: rgba(255, 255, 255, 0.2); 
  animation-delay: 2s;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.5);
  animation-delay: 4s;
}

.pet-element {
  position: absolute;
  font-size: 24px;
  opacity: 0.5;
  color: var(--pet-text-light); 
  animation: float 15s infinite ease-in-out;
}

.paw-1 {
  top: 20%;
  left: 10%;
  animation-delay: 1s;
}

.paw-2 {
  bottom: 30%;
  right: 15%;
  animation-delay: 3s;
}

.bone {
  top: 40%;
  right: 20%;
  animation-delay: 5s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(30px, 30px) scale(1.1);
  }
}
</style>