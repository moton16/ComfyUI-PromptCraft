<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useApi } from '../composables/useApi.js'
import { useI18n } from '../composables/useI18n.js'
import BaseDialog from './common/BaseDialog.vue'
import BaseToggle from './common/BaseToggle.vue'

const props = defineProps({
  comfyApi: { type: Object, required: true },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const api = useApi(props.comfyApi)

// 状态
const services = ref([])
const current = ref({})
const selectedServiceId = ref(null)
const selectedService = reactive({
  name: '',
  api_url: '',
  api_key: '',
  model: '',
  temperature: 0.7,
  max_tokens: 2000,
  disable_thinking: true,
  filter_thinking_output: true,
  aggressive_thinking_control: false,
  custom_thinking_params: '',
})
const apiKeyModified = ref(false)
const status = reactive({ message: '', isError: false })
const isLoading = ref(false)

// 加载服务数据
async function loadServices() {
  isLoading.value = true
  try {
    const data = await api.get('/services')
    services.value = data.services
    current.value = data.current
  } catch (e) {
    console.error('[PromptCraft] Load services failed:', e)
  } finally {
    isLoading.value = false
  }
}

// 选择服务
async function selectService(svcId) {
  selectedServiceId.value = svcId
  apiKeyModified.value = false

  const svc = services.value.find(s => s.id === svcId)
  if (!svc) return

  Object.assign(selectedService, {
    name: svc.name || '',
    api_url: svc.api_url || '',
    api_key: '',
    model: svc.model || '',
    temperature: svc.temperature ?? 0.7,
    max_tokens: svc.max_tokens ?? 2000,
    disable_thinking: svc.disable_thinking !== false,
    filter_thinking_output: svc.filter_thinking_output !== false,
    aggressive_thinking_control: svc.aggressive_thinking_control === true,
    custom_thinking_params: svc.custom_thinking_params
      ? JSON.stringify(svc.custom_thinking_params, null, 2)
      : '',
  })
}

// 添加服务
async function handleAddService() {
  try {
    const data = await api.post('/services', { name: t('settings.new_service') })
    await loadServices()
    selectService(data.id)
  } catch (e) {
    console.error('[PromptCraft] Add service failed:', e)
  }
}

// 保存服务
async function handleSaveService() {
  if (!selectedServiceId.value) return

  const body = {}
  for (const key of ['name', 'api_url', 'model', 'temperature', 'max_tokens',
    'disable_thinking', 'filter_thinking_output', 'aggressive_thinking_control']) {
    body[key] = selectedService[key]
  }

  // API key 只在用户修改时发送
  if (apiKeyModified.value && selectedService.api_key) {
    body.api_key = selectedService.api_key
  }

  // 解析 custom_thinking_params
  if (selectedService.custom_thinking_params.trim()) {
    try {
      body.custom_thinking_params = JSON.parse(selectedService.custom_thinking_params)
    } catch (e) {
      status.message = t('service_config.custom_thinking_params_invalid')
      status.isError = true
      return
    }
  }

  try {
    await api.put(`/services/${selectedServiceId.value}`, body)
    status.message = t('service_config.status.saved')
    status.isError = false
    await loadServices()
  } catch (e) {
    status.message = t('service_config.status.save_failed', { error: e.message })
    status.isError = true
  }
}

// 删除服务
async function handleDeleteService() {
  if (!selectedServiceId.value) return
  if (!confirm(t('service_config.confirm_delete'))) return

  try {
    await api.del(`/services/${selectedServiceId.value}`)
    selectedServiceId.value = null
    await loadServices()
  } catch (e) {
    status.message = t('service_config.status.delete_failed')
    status.isError = true
  }
}

// 测试连接
async function handleTestService() {
  if (!selectedServiceId.value) return
  status.message = t('service_config.testing')
  status.isError = false

  try {
    const body = {}
    if (apiKeyModified.value) {
      body.config = { ...selectedService }
      if (!body.config.api_url) {
        status.message = t('service_config.fill_endpoint')
        status.isError = true
        return
      }
    }
    const data = await api.post(`/services/${selectedServiceId.value}/test`, body)
    status.message = t('service_config.connection_success', { name: data?.message || '' })
    status.isError = false
  } catch (e) {
    status.message = t('service_config.connection_failed', { name: e.message })
    status.isError = true
  }
}

// 更新分类绑定
async function handleCategoryChange(category, serviceId) {
  try {
    await api.put('/services/current', { category, service_id: serviceId, model: '' })
    current.value[category] = { service_id: serviceId }
  } catch (e) {
    console.error('[PromptCraft] Update category failed:', e)
  }
}

// 计算属性：获取服务的 badge
function getServiceBadges(svc) {
  const badges = []
  if (current.value.enhance_basic?.service_id === svc.id) {
    badges.push({ text: t('settings.basic_enhance'), class: 'lsc-badge-amber' })
  }
  if (current.value.enhance_detail?.service_id === svc.id) {
    badges.push({ text: t('settings.detail_enhance'), class: 'lsc-badge-amber' })
  }
  if (current.value.enhance_normal?.service_id === svc.id) {
    badges.push({ text: t('settings.normal_enhance'), class: 'lsc-badge-amber' })
  }
  if (current.value.agent?.service_id === svc.id) {
    badges.push({ text: 'Agent', class: 'lsc-badge-copper' })
  }
  return badges
}

onMounted(loadServices)
</script>

<template>
  <BaseDialog
    :title="t('service_config.title')"
    width="860px"
    @close="emit('close')"
  >
    <!-- 分类选择栏 -->
    <div class="lsc-cat-bar">
      <div class="lsc-cat-item">
        <span class="lsc-cat-label">{{ t('settings.basic_enhance') }}</span>
        <select
          class="lsc-cat-select"
          :value="current.enhance_basic?.service_id || ''"
          @change="handleCategoryChange('enhance_basic', $event.target.value)"
        >
          <option v-for="svc in services" :key="svc.id" :value="svc.id">
            {{ svc.name }}
          </option>
        </select>
      </div>
      <div class="lsc-cat-item">
        <span class="lsc-cat-label">{{ t('settings.detail_enhance') }}</span>
        <select
          class="lsc-cat-select"
          :value="current.enhance_detail?.service_id || ''"
          @change="handleCategoryChange('enhance_detail', $event.target.value)"
        >
          <option v-for="svc in services" :key="svc.id" :value="svc.id">
            {{ svc.name }}
          </option>
        </select>
      </div>
      <div class="lsc-cat-item">
        <span class="lsc-cat-label">{{ t('settings.normal_enhance') }}</span>
        <select
          class="lsc-cat-select"
          :value="current.enhance_normal?.service_id || ''"
          @change="handleCategoryChange('enhance_normal', $event.target.value)"
        >
          <option v-for="svc in services" :key="svc.id" :value="svc.id">
            {{ svc.name }}
          </option>
        </select>
      </div>
      <div class="lsc-cat-item">
        <span class="lsc-cat-label">AI Agent</span>
        <select
          class="lsc-cat-select"
          :value="current.agent?.service_id || ''"
          @change="handleCategoryChange('agent', $event.target.value)"
        >
          <option v-for="svc in services" :key="svc.id" :value="svc.id">
            {{ svc.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- 主体区域 -->
    <div class="lsc-body">
      <!-- 侧边栏：服务列表 -->
      <div class="lsc-sidebar">
        <div class="lsc-service-list">
          <div
            v-for="svc in services"
            :key="svc.id"
            class="lsc-svc-card"
            :class="{ 'lsc-selected': svc.id === selectedServiceId }"
            @click="selectService(svc.id)"
          >
            <div class="lsc-svc-card-name">{{ svc.name }}</div>
            <div class="lsc-svc-card-url">{{ svc.api_url || t('settings.not_configured') }}</div>
            <div class="lsc-svc-card-badges">
              <span
                v-for="badge in getServiceBadges(svc)"
                :key="badge.text"
                class="lsc-badge"
                :class="badge.class"
              >{{ badge.text }}</span>
            </div>
          </div>
        </div>
        <button class="lsc-add-btn" @click="handleAddService">
          + {{ t('settings.add_service') }}
        </button>
      </div>

      <!-- 详情面板 -->
      <div class="lsc-detail">
        <template v-if="selectedServiceId">
          <div class="lsc-detail-form">
            <div class="lsc-field">
              <label>{{ t('service_config.service_name') }}</label>
              <input class="lsc-input" v-model="selectedService.name" />
            </div>
            <div class="lsc-field">
              <label>{{ t('service_config.api_endpoint') }}</label>
              <input
                class="lsc-input"
                v-model="selectedService.api_url"
                placeholder="https://api.example.com/v1/chat/completions"
              />
            </div>
            <div class="lsc-field">
              <label>API Key</label>
              <input
                class="lsc-input"
                type="password"
                v-model="selectedService.api_key"
                @input="apiKeyModified = true"
                :placeholder="t('service_config.api_key_placeholder')"
              />
            </div>
            <div class="lsc-field">
              <label>{{ t('service_config.model_name') }}</label>
              <input
                class="lsc-input"
                v-model="selectedService.model"
                placeholder="gpt-4o-mini / deepseek-chat"
              />
            </div>
            <div class="lsc-field-row">
              <div class="lsc-field lsc-field-half">
                <label>Temperature</label>
                <input
                  class="lsc-input"
                  type="number"
                  step="0.05"
                  min="0"
                  max="2"
                  v-model.number="selectedService.temperature"
                />
              </div>
              <div class="lsc-field lsc-field-half">
                <label>Max Tokens</label>
                <input
                  class="lsc-input"
                  type="number"
                  step="50"
                  min="50"
                  max="4000"
                  v-model.number="selectedService.max_tokens"
                />
              </div>
            </div>
            <div class="lsc-field-row">
              <div class="lsc-field lsc-field-half">
                <BaseToggle
                  v-model="selectedService.disable_thinking"
                  :label="t('service_config.disable_thinking')"
                />
              </div>
              <div class="lsc-field lsc-field-half">
                <BaseToggle
                  v-model="selectedService.filter_thinking_output"
                  :label="t('service_config.filter_thinking')"
                />
              </div>
            </div>
            <div class="lsc-field">
              <label>{{ t('service_config.custom_thinking_params') }}</label>
              <textarea
                class="lsc-textarea"
                v-model="selectedService.custom_thinking_params"
                :placeholder="t('service_config.custom_thinking_params_placeholder')"
              />
              <div class="lsc-field-hint">{{ t('service_config.custom_thinking_params_hint') }}</div>
            </div>
            <div class="lsc-field">
              <BaseToggle
                v-model="selectedService.aggressive_thinking_control"
                :label="t('service_config.aggressive_thinking_control')"
              />
              <div class="lsc-field-hint lsc-field-hint-warning">
                {{ t('service_config.aggressive_thinking_control_hint') }}
              </div>
              <div class="lsc-field-desc">
                {{ t('service_config.aggressive_thinking_control_desc') }}
              </div>
            </div>
            <div class="lsc-actions">
              <button class="lsc-btn lsc-btn-primary" @click="handleTestService">
                🧪 {{ t('service_config.test_connection') }}
              </button>
              <button class="lsc-btn lsc-btn-save" @click="handleSaveService">
                💾 {{ t('service_config.save') }}
              </button>
              <button class="lsc-btn lsc-btn-danger" @click="handleDeleteService">
                {{ t('service_config.delete_service') }}
              </button>
            </div>
            <div
              v-if="status.message"
              class="lsc-status"
              :class="status.isError ? 'lsc-status-error' : 'lsc-status-ok'"
            >
              {{ status.message }}
            </div>
          </div>
        </template>
        <div v-else class="lsc-detail-placeholder">
          {{ t('service_config.detail_placeholder') }}
        </div>
      </div>
    </div>
  </BaseDialog>
</template>

<style scoped>
.lsc-cat-bar {
  display: flex;
  gap: 16px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--pc-border, #333);
  background: var(--pc-surface, #2a2a3e);
}

.lsc-cat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lsc-cat-label {
  font-size: 13px;
  color: var(--pc-text-2, #999);
  white-space: nowrap;
}

.lsc-cat-select {
  padding: 4px 8px;
  background: var(--comfy-input-bg, #1a1a2e);
  border: 1px solid var(--pc-border, #444);
  border-radius: 4px;
  color: var(--pc-text, #e0e0e0);
  font-size: 13px;
  min-width: 140px;
}

.lsc-body {
  display: flex;
  min-height: 400px;
}

.lsc-sidebar {
  width: 220px;
  border-right: 1px solid var(--pc-border, #333);
  display: flex;
  flex-direction: column;
}

.lsc-service-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.lsc-svc-card {
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 4px;
  transition: all 0.15s;
}

.lsc-svc-card:hover {
  background: var(--pc-surface, #2a2a3e);
}

.lsc-svc-card.lsc-selected {
  background: var(--pc-accent, #6c5ce7);
  color: white;
}

.lsc-svc-card-name {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 2px;
}

.lsc-svc-card-url {
  font-size: 11px;
  opacity: 0.7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lsc-svc-card-badges {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.lsc-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 500;
}

.lsc-badge-amber {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.lsc-badge-copper {
  background: rgba(184, 134, 11, 0.2);
  color: #b8860b;
}

.lsc-add-btn {
  margin: 8px;
  padding: 8px;
  background: none;
  border: 1px dashed var(--pc-border, #444);
  border-radius: 6px;
  color: var(--pc-text-2, #999);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.lsc-add-btn:hover {
  border-color: var(--pc-accent, #6c5ce7);
  color: var(--pc-accent, #6c5ce7);
}

.lsc-detail {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.lsc-detail-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--pc-text-3, #666);
  font-size: 14px;
}

.lsc-detail-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.lsc-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.lsc-field label {
  font-size: 13px;
  color: var(--pc-text-2, #999);
}

.lsc-field-row {
  display: flex;
  gap: 12px;
}

.lsc-field-half {
  flex: 1;
}

.lsc-input {
  padding: 8px 10px;
  background: var(--comfy-input-bg, #1a1a2e);
  border: 1px solid var(--pc-border, #444);
  border-radius: 6px;
  color: var(--pc-text, #e0e0e0);
  font-size: 13px;
  transition: border-color 0.15s;
}

.lsc-input:focus {
  outline: none;
  border-color: var(--pc-accent, #6c5ce7);
}

.lsc-textarea {
  padding: 8px 10px;
  background: var(--comfy-input-bg, #1a1a2e);
  border: 1px solid var(--pc-border, #444);
  border-radius: 6px;
  color: var(--pc-text, #e0e0e0);
  font-size: 12px;
  font-family: monospace;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.15s;
}

.lsc-textarea:focus {
  outline: none;
  border-color: var(--pc-accent, #6c5ce7);
}

.lsc-field-hint {
  font-size: 11px;
  color: var(--pc-text-3, #666);
}

.lsc-field-hint-warning {
  color: #f59e0b;
}

.lsc-field-desc {
  font-size: 11px;
  color: var(--pc-text-3, #666);
  margin-top: 4px;
}

.lsc-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.lsc-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.lsc-btn-primary {
  background: var(--pc-accent, #6c5ce7);
  color: white;
}

.lsc-btn-primary:hover {
  background: var(--pc-accent-hi, #7c6cf7);
}

.lsc-btn-save {
  background: var(--pc-ok, #10b981);
  color: white;
}

.lsc-btn-save:hover {
  background: #0ea572;
}

.lsc-btn-danger {
  background: var(--pc-err, #ef4444);
  color: white;
}

.lsc-btn-danger:hover {
  background: #dc2626;
}

.lsc-status {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-top: 8px;
}

.lsc-status-ok {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.lsc-status-error {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}
</style>
