<template>
  <div class="dynamic-form">
    <el-collapse v-model="activeGroups" accordion>
      <el-collapse-item
        v-for="(group, gIndex) in groups"
        :key="gIndex"
        :name="gIndex"
      >
        <template #title>
          <div class="group-title">
            <el-icon><component :is="group.icon || 'Document'" /></el-icon>
            <span>{{ group.name }}</span>
            <span class="group-count" v-if="!group.isTable">
              {{ getGroupProgress(group) }}
            </span>
          </div>
        </template>
        
        <!-- 表格类型 -->
        <div v-if="group.isTable" class="table-group">
          <el-table :data="tableData[gIndex] || []" border style="width: 100%">
            <el-table-column
              v-for="col in group.tableColumns"
              :key="col.key"
              :label="col.label"
            >
              <template #default="{ row, $index }">
                <el-input
                  v-if="col.type === 'input'"
                  v-model="row[col.key]"
                  size="small"
                  @change="handleTableChange(gIndex)"
                />
                <el-input-number
                  v-else-if="col.type === 'number'"
                  v-model="row[col.key]"
                  size="small"
                  :min="0"
                  @change="handleTableChange(gIndex)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ $index }">
                <el-button type="danger" link size="small" @click="removeRow(gIndex, $index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="primary" plain size="small" style="margin-top: 12px" @click="addRow(gIndex, group)">
            + 添加一行
          </el-button>
        </div>
        
        <!-- 普通表单字段 -->
        <div v-else class="form-grid">
          <el-form-item
            v-for="field in group.fields"
            :key="field.key"
            :label="field.label"
            :required="field.required"
            class="form-item"
          >
            <el-input
              v-if="field.type === 'input'"
              v-model="formData[field.key]"
              :placeholder="field.placeholder || '请输入'"
              @input="debouncedUpdate"
            />
            <el-input-number
              v-else-if="field.type === 'number'"
              v-model="formData[field.key]"
              :placeholder="field.placeholder || '请输入'"
              :min="0"
              style="width: 100%"
              @change="debouncedUpdate"
            />
            <el-select
              v-else-if="field.type === 'select'"
              v-model="formData[field.key]"
              :placeholder="field.placeholder || '请选择'"
              style="width: 100%"
              @change="debouncedUpdate"
            >
              <el-option
                v-for="opt in field.options"
                :key="opt"
                :label="opt"
                :value="opt"
              />
            </el-select>
            <el-input
              v-else-if="field.type === 'textarea'"
              v-model="formData[field.key]"
              type="textarea"
              :rows="3"
              :placeholder="field.placeholder || '请输入'"
              @input="debouncedUpdate"
            />
            <el-date-picker
              v-else-if="field.type === 'date'"
              v-model="formData[field.key]"
              type="date"
              style="width: 100%"
              value-format="YYYY-MM-DD"
              @change="debouncedUpdate"
            />
          </el-form-item>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  groups: {
    type: Array,
    required: true
  },
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const formData = reactive({ ...props.modelValue })
const activeGroups = ref([0])
const tableData = reactive({})

// 初始化表格数据
props.groups.forEach((group, idx) => {
  if (group.isTable) {
    tableData[idx] = formData.purchaseItems || [{}]
  }
})

watch(() => props.modelValue, (val) => {
  Object.assign(formData, val)
}, { deep: true })

let timer = null
function debouncedUpdate() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    emit('update:modelValue', { ...formData })
    emit('change')
  }, 500)
}

function handleTableChange(gIndex) {
  const group = props.groups[gIndex]
  const key = group.name === '采购清单' ? 'purchaseItems' : 'tableData_' + gIndex
  formData[key] = tableData[gIndex]
  debouncedUpdate()
}

function addRow(gIndex, group) {
  if (!tableData[gIndex]) tableData[gIndex] = []
  const newRow = {}
  group.tableColumns.forEach(col => {
    newRow[col.key] = col.type === 'number' ? 0 : ''
  })
  tableData[gIndex].push(newRow)
  handleTableChange(gIndex)
}

function removeRow(gIndex, index) {
  tableData[gIndex].splice(index, 1)
  handleTableChange(gIndex)
}

function getGroupProgress(group) {
  if (!group.fields) return ''
  let total = group.fields.length
  let filled = group.fields.filter(f => formData[f.key] && formData[f.key] !== '').length
  return `${filled}/${total}`
}
</script>

<style scoped>
.dynamic-form {
  background: #fff;
  border-radius: 12px;
  padding: 8px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.group-count {
  margin-left: auto;
  font-size: 12px;
  color: #94a3b8;
  font-weight: normal;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 24px;
  padding: 8px 0;
}

.form-item {
  margin-bottom: 0;
}

.table-group {
  padding: 8px 0;
}

:deep(.el-collapse-item__header) {
  height: 52px;
  line-height: 52px;
}

:deep(.el-collapse-item__wrap) {
  padding: 0 16px 16px;
}
</style>
