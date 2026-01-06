<template>
  <div class="product-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">商品管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加商品
          </el-button>
        </div>
      </template>

      <el-table 
        v-loading="loading" 
        :data="tableData" 
        stripe 
        border 
        class="theme-table"
      >
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="price" label="价格" width="100" align="center">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.stock > 10 ? 'success' : 'danger'">
              {{ row.stock }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-input v-model="formData.category" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="formData.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="formData.stock" :min="0" style="width: 100%" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProductList, createProduct, updateProduct, deleteProduct } from '@/api/product'
import type { Product, ProductCreate } from '@/types/product'
import type { FormInstance } from 'element-plus' // 引入 FormInstance 类型

const loading = ref(false)
const tableData = ref<Product[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('添加商品')
const submitting = ref(false)
const formRef = ref<FormInstance>() // 明确 FormRef 类型
const isEdit = ref(false)
const currentEditId = ref(0)

const formData = reactive<ProductCreate>({
  name: '',
  category: '',
  price: 0,
  stock: 0,
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      skip: (currentPage.value - 1) * pageSize.value,
      limit: pageSize.value
    }
    const data = await getProductList(params)
    tableData.value = data
    if (data.length === pageSize.value) {
      total.value = currentPage.value * pageSize.value + 1
    } else {
      total.value = (currentPage.value - 1) * pageSize.value + data.length
    }
  } catch(error) {
     ElMessage.error('加载数据失败');
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '添加商品'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Product) => {
  isEdit.value = true
  currentEditId.value = row.id
  dialogTitle.value = '编辑商品'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = async (row: Product) => {
  try {
    await ElMessageBox.confirm(`确定要删除商品 "${row.name}" 吗？`, '提示', { type: 'warning' })
    await deleteProduct(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value) {
          await updateProduct(currentEditId.value, formData)
        } else {
          await createProduct(formData)
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
  // 重置表单数据
  Object.assign(formData, {
    name: '',
    category: '',
    price: 0,
    stock: 0,
  })
}

onMounted(() => loadData())
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0; /* 增加内边距以匹配其他组件 */
}

.title {
  font-size: 20px; /* 增大字号 */
  font-weight: 600; /* 加粗 */
  color: var(--pet-text);
  display: flex;
  align-items: center;
}

/* 标题左侧的装饰色带，使用热情的粉红色 */
.title::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 20px;
    background: var(--pet-primary-dark); /* #FF69B4 */
    border-radius: 3px;
    margin-right: 12px;
}

/* Table specific overrides - 使用 theme-table 替代默认 .el-table */
.theme-table {
    border-radius: 12px;
    overflow: hidden; 
    border: 1px solid var(--pet-border);
}

/* Customizing stripe row: 使用主色调浅粉色的极淡背景 */
.theme-table :deep(.el-table__row.el-table__row--striped) {
    background-color: #FFF0F5 !important; 
}

/* Customizing header: 使用玉米色背景，文字为深色 */
.theme-table :deep(.el-table__header-wrapper) th {
    background-color: var(--pet-background); /* #FFF8DC */
    color: var(--pet-text);
    font-weight: 600;
}

/* Link buttons in table: 使用深粉色作为主链接色 */
.theme-table .el-button--link.el-button--primary {
    color: var(--pet-primary-dark); /* #FF69B4 */
}
.theme-table .el-button--link.el-button--primary:hover {
    color: var(--pet-primary); /* #FFB6C1 */
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

/* Pagination active color: 使用浅粉色作为激活背景 */
.pagination :deep(.el-pager li.is-active) {
    background-color: var(--pet-primary) !important; /* #FFB6C1 */
    color: white !important; /* 确保高对比度 */
    font-weight: 600;
}
</style>