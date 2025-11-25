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
              class="custom-filter-input"
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
        class="el-table"
      >
      <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="图片" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.image_url"
              :src="getImageUrl(row.image_url)!"
              :preview-src-list="[getImageUrl(row.image_url)!]"
              :preview-teleported="true"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 8px; cursor: pointer;"
            />
            <span v-else style="color: #999;">暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="species" label="物种" width="100" />
        <el-table-column prop="breed" label="品种" width="120" />
        <el-table-column prop="gender" label="性别" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.gender" :type="row.gender === 'male' ? 'info' : 'danger'" size="small">
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
          <el-col :span="24">
            <el-form-item label="品种">
              <el-input v-model="formData.breed" placeholder="请输入品种" />
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
            <el-form-item label="生日">
              <el-date-picker
                v-model="formData.birthday"
                type="date"
                placeholder="请选择生日"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="健康状态">
          <el-input v-model="formData.health_status" placeholder="请输入健康状态" />
        </el-form-item>

        <el-form-item label="宠物图片">
          <div class="pet-image-upload">
            <el-upload
              v-if="!imagePreview"
              class="image-uploader"
              :http-request="handleImageUpload"
              :show-file-list="false"
              :before-upload="beforeImageUpload"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              drag
            >
              <el-icon class="upload-icon"><Plus /></el-icon>
              <div class="upload-text">点击或拖拽上传图片</div>
              <div class="upload-tip">支持JPG、PNG、GIF、WebP格式，最大5MB</div>
            </el-upload>
            <div v-else class="image-preview-container">
              <el-image
                :src="imagePreview"
                :preview-src-list="[imagePreview]"
                fit="cover"
                class="preview-image"
              />
              <div class="image-actions">
                <el-button type="danger" size="small" @click="handleRemoveImage">删除图片</el-button>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 健康档案对话框 -->
    <el-dialog
      v-model="healthDialogVisible"
      :title="`${currentPetName} 的健康记录`"
      width="800px"
    >
      <el-table
        v-loading="healthLoading"
        :data="healthRecords"
        stripe
        border
        max-height="400px"
      >
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="record_date" label="记录日期" width="120" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="veterinarian" label="兽医" width="100" />
      </el-table>
      <div v-if="healthRecords.length === 0 && !healthLoading" style="text-align: center; padding: 40px; color: #999;">
        暂无健康记录
      </div>
     <template #footer>
        <el-button @click="healthDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, UploadRequestOptions } from 'element-plus'
import { getPetList, createPet, updatePet, deletePet, uploadPetImage, deletePetImage, getHealthRecords } from '@/api/pet'
import type { Pet, PetCreate, PetUpdate, HealthRecord } from '@/types/pet'
import { Plus } from '@element-plus/icons-vue'
import { getImageUrl } from '@/utils/config' 

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
  gender: undefined,
  birthday: undefined,
  weight: undefined,
  owner_id: 1,
  health_status: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入宠物名称', trigger: 'blur' }],
  species: [{ required: true, message: '请输入物种', trigger: 'blur' }],
  owner_id: [{ required: true, message: '请输入主人ID', trigger: 'blur' }],
}

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      skip: (currentPage.value - 1) * pageSize.value,
      limit: pageSize.value
    }
    
    if (filters.owner_id) {
      params.owner_id = Number(filters.owner_id)
    }
    
    const data = await getPetList(params)
    tableData.value = data
    // 注意：这里需要后端返回总数，暂时使用数据长度作为示例
    total.value = data.length
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.owner_id = ''
  currentPage.value = 1 
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '添加宠物'
  resetForm() 
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
    gender: row.gender,
    birthday: row.birthday,
    weight: row.weight,
    owner_id: row.owner_id,
    health_status: row.health_status,
  })
  
  // 加载现有图片
  if (row.image_url) {
    imagePreview.value = getImageUrl(row.image_url)
  } else {
    imagePreview.value = null
  }
  uploadedFile.value = null
  
  dialogVisible.value = true
}

// 健康档案相关
const healthDialogVisible = ref(false)
const healthLoading = ref(false)
const healthRecords = ref<HealthRecord[]>([])
const currentPetName = ref('')

const handleViewHealth = async (row: Pet) => {
  currentPetName.value = row.name
  healthDialogVisible.value = true
  healthLoading.value = true
  
  try {
    const records = await getHealthRecords(row.id)
    healthRecords.value = records
  } catch (error) {
    ElMessage.error('加载健康记录失败')
    healthRecords.value = []
  } finally {
    healthLoading.value = false
  }
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
        let petId: number
        
        if (isEdit.value) {
          await updatePet(currentEditId.value, formData)
          petId = currentEditId.value
        } else {
          const newPet = await createPet(formData as PetCreate)
          petId = newPet.id
        }
        
        // 如果有上传的图片,上传图片
        if (uploadedFile.value) {
          try {
            await uploadPetImage(petId, uploadedFile.value)
          } catch (error) {
            ElMessage.warning('宠物信息保存成功,但图片上传失败')
          }
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
    gender: undefined,
    birthday: undefined,
    weight: undefined,
    owner_id: 1,
    health_status: '',
  })
  imagePreview.value = null
  uploadedFile.value = null
}

// 图片上传相关
const imagePreview = ref<string | null>(null)
const uploadedFile = ref<File | null>(null)

const beforeImageUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB!')
    return false
  }
  return true
}

const handleImageUpload = async (options: UploadRequestOptions) => {
  const file = options.file as File
  
  // 保存文件用于后续上传
  uploadedFile.value = file
  
  // 创建预览
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const handleRemoveImage = async () => {
  try {
    // 如果是编辑模式且宠物已有图片,调用删除接口
    if (isEdit.value && currentEditId.value) {
      const pet = tableData.value.find(p => p.id === currentEditId.value)
      if (pet?.image_url) {
        await deletePetImage(currentEditId.value)
        ElMessage.success('图片删除成功')
      }
    }
  } catch (error) {
    ElMessage.error('删除图片失败')
  } finally {
    // 清空预览和上传文件
    imagePreview.value = null
    uploadedFile.value = null
  }
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
  padding: 8px 0;
}

.title {
  font-size: 20px;
  font-weight: 600; 
  color: var(--pet-text);
  display: flex;
  align-items: center;
}

/* 标题左侧的装饰色带 */
.title::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 24px;
    background: var(--pet-primary);
    border-radius: 4px;
    margin-right: 12px;
    box-shadow: 0 2px 8px rgba(255, 214, 0, 0.4);
}

.filter-container {
  margin-bottom: 16px;
  padding: 10px 0;
}

/* Table specific overrides */
.el-table {
    border-radius: 12px;
    overflow: hidden; 
    border: 1px solid var(--pet-border);
}

/* Customizing stripe row */
.el-table :deep(.el-table__row.el-table__row--striped) {
    background-color: var(--pet-bg-base) !important; 
}

/* Customizing header */
.el-table :deep(.el-table__header-wrapper) th {
    background-color: #FAFAFA;
    color: var(--pet-text-secondary);
    font-weight: 700;
    height: 50px;
}

/* Link buttons in table */
.el-table .el-button--link.el-button--primary {
    color: var(--pet-secondary);
}
.el-table .el-button--link.el-button--primary:hover {
    color: var(--pet-secondary-dark);
}

/* General Link button style for 'info' type to fit theme */
.el-table .el-button--link.el-button--info {
    color: var(--pet-text-light); /* Darker text for secondary action */
}
.el-table .el-button--link.el-button--info:hover {
    color: var(--pet-primary);
}


.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

/* Pagination active color */
.pagination :deep(.el-pager li.is-active) {
    background-color: var(--pet-primary) !important;
    color: var(--pet-text-on-primary) !important;
    font-weight: 700;
    border: none;
}

.pagination :deep(.el-pager li:hover) {
    color: var(--pet-primary-dark);
}

/* 筛选输入框圆角 */
.custom-filter-input :deep(.el-input__wrapper) {
    border-radius: 8px;
}

/* 图片上传组件样式 */
.pet-image-upload {
  width: 100%;
}

.image-uploader :deep(.el-upload) {
  border: 2px dashed var(--pet-border);
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  width: 100%;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--pet-bg-base);
}

.image-uploader :deep(.el-upload:hover) {
  border-color: var(--pet-primary);
  background-color: rgba(255, 214, 0, 0.05);
}

.image-uploader :deep(.el-upload-dragger) {
  border: none;
  background: transparent;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 48px;
  color: var(--pet-primary);
  margin-bottom: 12px;
}

.upload-text {
  font-size: 16px;
  color: var(--pet-text);
  margin-bottom: 8px;
}

.upload-tip {
  font-size: 12px;
  color: var(--pet-text-light);
}

.image-preview-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.preview-image {
  width: 300px;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid var(--pet-border);
}

.image-actions {
  display: flex;
  gap: 12px;
}

</style>