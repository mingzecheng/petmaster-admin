<template>
  <div class="member-levels-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">会员等级配置</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加等级
          </el-button>
        </div>
      </template>

      <el-table :data="levels" v-loading="loading" stripe border>
        <el-table-column prop="level" label="等级序号" width="100" align="center" sortable />
        <el-table-column prop="name" label="等级名称" min-width="120" />
        <el-table-column prop="min_points" label="所需积分" width="120" align="right" />
        <el-table-column prop="discount_rate" label="折扣率" width="100" align="center">
          <template #default="{ row }">
            {{ (row.discount_rate * 10).toFixed(1) }}折
          </template>
        </el-table-column>
        <el-table-column prop="color" label="颜色" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.color" :color="row.color" style="width: 50px">　</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
        <el-table-column prop="is_active" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="等级名称" prop="name">
          <el-input v-model="formData.name" placeholder="如:普通会员、银卡会员" />
        </el-form-item>
        <el-form-item label="等级序号" prop="level">
          <el-input-number v-model="formData.level" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="所需积分" prop="min_points">
          <el-input-number v-model="formData.min_points" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="折扣率" prop="discount_rate">
          <el-slider v-model="discountSlider" :min="0" :max="100" :step="5" show-stops />
          <span style="margin-left: 10px">{{ discountSlider / 10 }}折 ({{ (formData.discount_rate * 100).toFixed(0) }}%)</span>
        </el-form-item>
        <el-form-item label="等级颜色">
          <el-color-picker v-model="formData.color" />
        </el-form-item>
        <el-form-item label="等级描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="formData.is_active" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getMemberLevels,
  createMemberLevel,
  updateMemberLevel,
  deleteMemberLevel,
} from '@/api/member'
import type { MemberLevel, MemberLevelCreate } from '@/types/member'

const loading = ref(false)
const levels = ref<MemberLevel[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加会员等级')
const formRef = ref<FormInstance>()
const submitting = ref(false)
const currentId = ref<number | null>(null)

const formData = reactive<MemberLevelCreate>({
  name: '',
  level: 0,
  min_points: 0,
  discount_rate: 1.0,
  color: '#409EFF',
  description: '',
  is_active: true,
})

// 折扣滑块值(0-100, 对应0折-10折)
const discountSlider = ref(100)

// 监听滑块变化更新折扣率
watch(discountSlider, (val) => {
  formData.discount_rate = val / 100
})

// 监听折扣率变化更新滑块
watch(() => formData.discount_rate, (val) => {
  discountSlider.value = val * 100
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入等级名称', trigger: 'blur' }],
  level: [{ required: true, message: '请输入等级序号', trigger: 'blur' }],
  min_points: [{ required: true, message: '请输入所需积分', trigger: 'blur' }],
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const data = await getMemberLevels()
    levels.value = data
  } catch (error: any) {
    ElMessage.error(error.response?.data?.detail || '加载失败')
  } finally {
    loading.value = false
  }
}

// 添加
const handleAdd = () => {
  dialogTitle.value = '添加会员等级'
  currentId.value = null
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: MemberLevel) => {
  dialogTitle.value = '编辑会员等级'
  currentId.value = row.id
  Object.assign(formData, {
    name: row.name,
    level: row.level,
    min_points: row.min_points,
    discount_rate: row.discount_rate,
    color: row.color || '#409EFF',
    description: row.description || '',
    is_active: row.is_active,
  })
  discountSlider.value = row.discount_rate * 100
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: MemberLevel) => {
  try {
    await ElMessageBox.confirm(`确定删除会员等级"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteMemberLevel(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.detail || '删除失败')
    }
  }
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (currentId.value) {
          await updateMemberLevel(currentId.value, formData)
          ElMessage.success('更新成功')
        } else {
          await createMemberLevel(formData)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error: any) {
        ElMessage.error(error.response?.data?.detail || '操作失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    name: '',
    level: 0,
    min_points: 0,
    discount_rate: 1.0,
    color: '#409EFF',
    description: '',
    is_active: true,
  })
  discountSlider.value = 100
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.member-levels-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
</style>
