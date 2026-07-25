import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { templateFields } from '@/config/templateFields'

export const useTenderStore = defineStore('tender', () => {
  // 当前模板类型
  const currentTemplate = ref(null) // engineering / goods / service
  // 当前文档类型
  const currentDocType = ref('bid') // bid / 其他文档类型，默认招标公告
  // 当前录入方式
  const currentInputMethod = ref(null) // ai / form
  // 表单数据
  const formData = ref({})
  // AI解析数据
  const aiParsedData = ref({})
  // 当前任务ID
  const currentTaskId = ref(null)

  // 当前模板配置
  const currentTemplateConfig = computed(() => {
    return currentTemplate.value ? templateFields[currentTemplate.value] : null
  })

  // 当前模板名称
  const currentTemplateName = computed(() => {
    return currentTemplateConfig.value?.name || '--'
  })

  // 选择模板
  function selectTemplate(type) {
    currentTemplate.value = type
    // 加载本地草稿
    loadDraft()
  }

  // 设置文档类型
  function setDocType(type) {
    currentDocType.value = type
  }

  // 选择录入方式
  function selectInputMethod(method) {
    currentInputMethod.value = method
  }

  // 更新表单字段
  function updateField(key, value) {
    formData.value[key] = value
    saveDraft()
  }

  // 批量设置表单数据
  function setFormData(data) {
    formData.value = { ...formData.value, ...data }
    saveDraft()
  }

  // 保存草稿到localStorage
  function saveDraft() {
    try {
      localStorage.setItem(
        'tender_draft_' + currentTemplate.value,
        JSON.stringify(formData.value)
      )
    } catch (e) {
      console.warn('保存草稿失败', e)
    }
  }

  // 加载本地草稿
  function loadDraft() {
    try {
      const saved = localStorage.getItem('tender_draft_' + currentTemplate.value)
      if (saved) {
        formData.value = JSON.parse(saved)
      } else {
        formData.value = {}
      }
    } catch (e) {
      formData.value = {}
    }
  }

  // 清空数据
  function reset() {
    currentTemplate.value = null
    currentDocType.value = 'bid'
    currentInputMethod.value = null
    formData.value = {}
    aiParsedData.value = {}
    currentTaskId.value = null
  }

  // 校验表单
  function validateForm() {
    const config = currentTemplateConfig.value
    if (!config) return { valid: true, errors: [] }

    const errors = []
    let firstErrorField = null

    config.groups.forEach(group => {
      if (group.isTable) return
      group.fields.forEach(field => {
        if (field.required && (!formData.value[field.key] || formData.value[field.key] === '')) {
          errors.push(field.label)
          if (!firstErrorField) firstErrorField = field.key
        }
      })
    })

    return { valid: errors.length === 0, errors, firstErrorField }
  }

  // 计算填写进度
  const fillProgress = computed(() => {
    const config = currentTemplateConfig.value
    if (!config) return 0

    let total = 0
    let filled = 0

    config.groups.forEach(group => {
      if (group.isTable) return
      group.fields.forEach(field => {
        total++
        if (formData.value[field.key] && formData.value[field.key] !== '') {
          filled++
        }
      })
    })

    return total > 0 ? Math.round((filled / total) * 100) : 0
  })

  return {
    currentTemplate,
    currentDocType,
    currentInputMethod,
    formData,
    aiParsedData,
    currentTaskId,
    currentTemplateConfig,
    currentTemplateName,
    fillProgress,
    selectTemplate,
    setDocType,
    selectInputMethod,
    updateField,
    setFormData,
    saveDraft,
    loadDraft,
    reset,
    validateForm,
  }
})