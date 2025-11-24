<template>
  <div class="pet-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">宠物管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加宠物
          </el-button>
        </div>
      </template>

      <div class="filter-container">
        <el-form :inline="true" :model="filters">
          <el-form-item label="主人ID">
            <el-input
              v-model="filters.owner_id"
              placeholder="请输入主人ID"
              clearable
              @clear="loadData"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData">查询</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="species" label="物种" width="100" />
        <el-table-column prop="breed" label="品种" width="120" />
        <el-table-column prop="age" label="年龄" width="80" align="center" />
        <el-table-column prop="gender" label="性别" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.gender" :type="row.gender === 'male' ? 'primary' : 'danger'" size="small">
              {{ row.gender === 'male' ? '雄性' : '雌性' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="体重(kg)" width="100" align="center" />
        <el-table-column prop="owner_id" label="主人ID" width="100" align="center" />
        <el-table-column prop="health_status" label="健康状态" min-width="120" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="info" size="small" link @click="handleViewHealth(row)">
              健康记录
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="宠物名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入宠物名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物种" prop="species">
              <el-input v-model="formData.species" placeholder="请输入物种" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="品种">
              <el-input v-model="formData.breed" placeholder="请输入品种" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年龄">
              <el-input-number v-model="formData.age" :min="0" :max="50" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别">
              <el-select v-model="formData.gender" placeholder="请选择性别" style="width: 100%">
                <el-option label="雄性" value="male" />
                <el-option label="雌性" value="female" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="体重(kg)">
              <el-input-number v-model="formData.weight" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="主人ID" prop="owner_id">
              <el-input-number v-model="formData.owner_id" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="颜色">
              <el-input v-model="formData.color" placeholder="请输入颜色" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="健康状态">
          <el-input v-model="formData.health_status" placeholder="请输入健康状态" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="formData.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getPetList, createPet, updatePet, deletePet } from '@/api/pet'
import type { Pet, PetCreate, PetUpdate } from '@/types/pet'

const loading = ref(false)
const tableData = ref<Pet[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const filters = reactive({
  owner_id: '',
})

const dialogVisible = ref(false)
const dialogTitle = ref('添加宠物')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const currentEditId = ref(0)

const formData = reactive<PetCreate | PetUpdate>({
  name: '',
  species: '',
  breed: '',
  age: undefined,
  gender: undefined,
  color: '',
  weight: undefined,
  owner_id: 1,
  health_status: '',
  notes: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入宠物名称', trigger: 'blur' }],
  species: [{ required: true, message: '请输入物种', trigger: 'blur' }],
  owner_id: [{ required: true, message: '请输入主人ID', trigger: 'blur' }],
}

const loadData = async () => {
  loading.value = true
  try {
    const skip = (currentPage.value - 1) * pageSize.value
    const params: any = { skip, limit: pageSize.value }
    if (filters.owner_id) {
      params.owner_id = Number(filters.owner_id)
    }
    const data = await getPetList(params)
    tableData.value = data
    total.value = data.length
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.owner_id = ''
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '添加宠物'
  dialogVisible.value = true
}

const handleEdit = (row: Pet) => {
  isEdit.value = true
  currentEditId.value = row.id
  dialogTitle.value = '编辑宠物'
  Object.assign(formData, {
    name: row.name,
    species: row.species,
    breed: row.breed,
    age: row.age,
    gender: row.gender,
    color: row.color,
    weight: row.weight,
    owner_id: row.owner_id,
    health_status: row.health_status,
    notes: row.notes,
  })
  dialogVisible.value = true
}

const handleViewHealth = (row: Pet) => {
  ElMessage.info(`查看宠物 ${row.name} 的健康记录`)
}

const handleDelete = async (row: Pet) => {
  try {
    await ElMessageBox.confirm(`确定要删除宠物 "${row.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deletePet(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value) {
          await updatePet(currentEditId.value, formData)
        } else {
          await createPet(formData as PetCreate)
        }
        ElMessage.success('保存成功')
        dialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error('保存失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    name: '',
    species: '',
    breed: '',
    age: undefined,
    gender: undefined,
    color: '',
    weight: undefined,
    owner_id: 1,
    health_status: '',
    notes: '',
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.pet-page {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 500;
}

.filter-container {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
