<template>
  <div class="not-found">
    <div class="content">
      <div class="error-code">404</div>
      <div class="error-title">页面不存在</div>
      <div class="error-desc">抱歉，您访问的页面不存在</div>
      <el-button type="primary" size="large" @click="goHome">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.not-found {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.content {
  text-align: center;
  color: #fff;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 20px;
}

.error-title {
  font-size: 32px;
  margin-bottom: 16px;
}

.error-desc {
  font-size: 18px;
  margin-bottom: 32px;
  opacity: 0.8;
}
</style>
