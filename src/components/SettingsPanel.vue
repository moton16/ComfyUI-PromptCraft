<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useApi } from '../composables/useApi.js'
import { useI18n } from '../composables/useI18n.js'

const props = defineProps({
  comfyApi: { type: Object, required: true },
})

const { t, getLang, setLang } = useI18n()
const api = useApi(props.comfyApi)

// 状态
const currentLang = ref(getLang())
const isPanelHidden = ref(localStorage.getItem('moton-pe-panel-hidden') === 'true')
const services = ref([])
const currentService = ref({})
const isLoading = ref(false)
const reloadSuccess = ref(false)

// 分类配置
const categories = [
  { key: 'enhance_basic', label: t('settings.basic_enhance') },
  { key: 'enhance_detail', label: t('settings.detail_enhance') },
  { key: 'enhance_normal', label: t('settings.normal_enhance') },
  { key: 'agent', label: 'AI Agent' },
]

// 工具配置
const tools = [
  { action: 'open-rules', icon: '📐', name: t('settings.rule_manager'), desc: t('settings.rule_manager_desc') },
  { action: 'open-library', icon: '▤', name: t('settings.prompt_library'), desc: t('settings.prompt_library_desc') },
  { action: 'open-history', icon: '⏱', name: t('settings.prompt_history'), desc: t('settings.prompt_history_desc') },
  { action: 'reload-cache', icon: '↻', name: t('settings.reload_cache'), desc: t('settings.reload_cache_desc') },
]

// 加载服务数据
async function loadServices() {
  isLoading.value = true
  try {
    const data = await api.get('/services')
    services.value = data.services || []
    currentService.value = data.current || {}
  } catch (e) {
    console.error('[PromptCraft] Load services failed:', e)
  } finally {
    isLoading.value = false
  }
}

// 切换语言
function handleLangChange(lang) {
  currentLang.value = lang
  setLang(lang)
}

// 切换浮动面板
function handlePanelToggle() {
  isPanelHidden.value = !isPanelHidden.value
  localStorage.setItem('moton-pe-panel-hidden', isPanelHidden.value ? 'true' : '')
  window.dispatchEvent(new CustomEvent('promptcraft:toggle-panel', {
    detail: { visible: !isPanelHidden.value }
  }))
}

// 更新服务分类
async function handleCategoryChange(category, serviceId) {
  try {
    await api.put('/services/current', { category, service_id: serviceId, model: '' })
    currentService.value[category] = { service_id: serviceId }
  } catch (e) {
    console.error('[PromptCraft] Update category failed:', e)
  }
}

// 添加服务
async function handleAddService() {
  try {
    await api.post('/services', { name: t('settings.new_service') })
    await loadServices()
  } catch (e) {
    console.error('[PromptCraft] Add service failed:', e)
  }
}

// 执行工具操作
function executeToolAction(action) {
  switch (action) {
    case 'open-rules':
      window.dispatchEvent(new CustomEvent('promptcraft:open-rule-manager'))
      break
    case 'open-library':
      window.dispatchEvent(new CustomEvent('promptcraft:open-library-editor'))
      break
    case 'open-history':
      window.dispatchEvent(new CustomEvent('promptcraft:open-history'))
      break
    case 'reload-cache':
      handleReloadCache()
      break
  }
}

// 重载缓存
async function handleReloadCache() {
  try {
    await api.post('/library/sfw_reload', {})
    await api.post('/library/nsfw_reload', {})
    reloadSuccess.value = true
    setTimeout(() => { reloadSuccess.value = false }, 1200)
  } catch (e) {
    console.error('[PromptCraft] Cache reload failed:', e)
  }
}

// 打开 LoRA Hub
function openHub() {
  window.dispatchEvent(new CustomEvent('promptcraft:open-hub'))
}

// 打开服务管理
function openServiceManager() {
  window.dispatchEvent(new CustomEvent('promptcraft:open-services'))
}

// 获取服务 badge
function getServiceBadges(svc) {
  const badges = []
  const current = currentService.value

  if (current.enhance_basic?.service_id === svc.id) {
    badges.push({ text: t('settings.basic_enhance'), class: 'sp-badge-amber' })
  }
  if (current.enhance_detail?.service_id === svc.id) {
    badges.push({ text: t('settings.detail_enhance'), class: 'sp-badge-amber' })
  }
  if (current.enhance_normal?.service_id === svc.id) {
    badges.push({ text: t('settings.normal_enhance'), class: 'sp-badge-amber' })
  }
  if (current.agent?.service_id === svc.id) {
    badges.push({ text: 'Agent', class: 'sp-badge-teal' })
  }

  return badges
}

onMounted(loadServices)
</script>

<template>
  <div class="sp-settings">
    <!-- Brand header -->
    <div class="sp-brand">
      <div class="sp-brand-icon">◆</div>
      <span class="sp-brand-text">PromptCraft</span>
      <span class="sp-brand-ver">v1.3.0_Beta2</span>
    </div>

    <!-- 语言切换 -->
    <div class="sp-section">
      <div class="sp-section-header">
        <span class="sp-section-icon">🌐</span>
        <span class="sp-section-title">{{ t('settings.language') }}</span>
      </div>
      <div class="sp-section-body">
        <div class="sp-lang-row">
          <select
            class="sp-select"
            :value="currentLang"
            @change="handleLangChange($event.target.value)"
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
          <span class="sp-hint">{{ t('settings.language_hint') }}</span>
        </div>
      </div>
    </div>

    <!-- API 服务 -->
    <div class="sp-section">
      <div class="sp-section-header">
        <span class="sp-section-icon">⬡</span>
        <span class="sp-section-title">{{ t('settings.api_services') }}</span>
      </div>
      <div class="sp-section-body">
        <!-- 分类选择 -->
        <div class="sp-cat-row">
          <div
            v-for="cat in categories"
            :key="cat.key"
            class="sp-cat-item"
          >
            <span class="sp-cat-label">{{ cat.label }}</span>
            <select
              class="sp-select sp-cat-select"
              :value="currentService[cat.key]?.service_id || ''"
              @change="handleCategoryChange(cat.key, $event.target.value)"
            >
              <option
                v-for="svc in services"
                :key="svc.id"
                :value="svc.id"
              >
                {{ svc.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- 服务列表 -->
        <div class="sp-svc-list">
          <div
            v-for="svc in services"
            :key="svc.id"
            class="sp-svc-mini"
          >
            <span class="sp-svc-name">{{ svc.name }}</span>
            <span class="sp-svc-url">{{ svc.api_url || t('settings.not_configured') }}</span>
            <span
              v-for="badge in getServiceBadges(svc)"
              :key="badge.text"
              class="sp-badge"
              :class="badge.class"
            >
              {{ badge.text }}
            </span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="sp-actions">
          <button class="sp-btn sp-btn-primary" @click="openServiceManager">
            {{ t('settings.manage_services') }}
          </button>
          <button class="sp-btn" @click="handleAddService">
            {{ t('settings.add_service') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 浮动面板开关 -->
    <div class="sp-section">
      <div class="sp-section-header">
        <span class="sp-section-icon">◆</span>
        <span class="sp-section-title">{{ t('settings.floating_panel') }}</span>
      </div>
      <div class="sp-section-body">
        <label class="sp-toggle-label">
          <input
            type="checkbox"
            :checked="!isPanelHidden"
            @change="handlePanelToggle"
          />
          <span>{{ t('settings.show_panel') }}</span>
        </label>
        <span class="sp-hint">{{ t('settings.panel_hint') }}</span>
      </div>
    </div>

    <!-- Prompt 工具 -->
    <div class="sp-section">
      <div class="sp-section-header">
        <span class="sp-section-icon">📐</span>
        <span class="sp-section-title">{{ t('settings.prompt_tools') }}</span>
      </div>
      <div class="sp-section-body">
        <div class="sp-tool-grid">
          <div
            v-for="tool in tools"
            :key="tool.action"
            class="sp-tool-card"
            :class="{ 'sp-tool-success': tool.action === 'reload-cache' && reloadSuccess }"
            @click="executeToolAction(tool.action)"
          >
            <div class="sp-tool-icon">{{ tool.icon }}</div>
            <div class="sp-tool-info">
              <div class="sp-tool-name">{{ tool.name }}</div>
              <div class="sp-tool-desc">{{ tool.desc }}</div>
            </div>
            <span class="sp-tool-arrow">→</span>
          </div>
        </div>
      </div>
    </div>

    <!-- LoRA Hub -->
    <div class="sp-section">
      <div class="sp-section-header">
        <span class="sp-section-icon">⬡</span>
        <span class="sp-section-title">LoRA Hub</span>
      </div>
      <div class="sp-section-body">
        <div class="sp-hub-card" @click="openHub">
          <div class="sp-hub-icon">⬡</div>
          <div class="sp-hub-info">
            <div class="sp-hub-name">{{ t('settings.open_lora_hub') }}</div>
            <div class="sp-hub-desc">{{ t('settings.lora_hub_desc') }}</div>
          </div>
          <span class="sp-tool-arrow">→</span>
        </div>
      </div>
    </div>

    <!-- 关于 -->
    <div class="sp-section sp-section-flat">
      <div class="sp-about">
        <span>PromptCraft v1.3.0_Beta2</span>
        <span class="sp-dot">·</span>
        <span>Author: Moton</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sp-settings {
  padding: 12px;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.sp-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--pc-border, #333);
}

.sp-brand-icon {
  font-size: 18px;
  color: var(--pc-accent, #c8842a);
}

.sp-brand-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--pc-text, #e0e0e0);
}

.sp-brand-ver {
  font-size: 11px;
  color: var(--pc-text-3, #666);
  padding: 2px 6px;
  background: var(--pc-surface, #2a2a3e);
  border-radius: 4px;
}

.sp-section {
  margin-bottom: 16px;
  border: 1px solid var(--pc-border, #333);
  border-radius: 8px;
  overflow: hidden;
}

.sp-section-flat {
  border: none;
  background: transparent;
}

.sp-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--pc-surface, #2a2a3e);
  border-bottom: 1px solid var(--pc-border, #333);
}

.sp-section-icon {
  font-size: 14px;
}

.sp-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--pc-text, #e0e0e0);
}

.sp-section-body {
  padding: 12px;
}

.sp-lang-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sp-select {
  padding: 6px 10px;
  background: var(--comfy-input-bg, #1a1a2e);
  border: 1px solid var(--pc-border, #444);
  border-radius: 6px;
  color: var(--pc-text, #e0e0e0);
  font-size: 12px;
  cursor: pointer;
}

.sp-select:focus {
  outline: none;
  border-color: var(--pc-accent, #6c5ce7);
}

.sp-hint {
  font-size: 11px;
  color: var(--pc-text-3, #666);
}

.sp-cat-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.sp-cat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sp-cat-label {
  font-size: 11px;
  color: var(--pc-text-2, #999);
}

.sp-cat-select {
  width: 100%;
}

.sp-svc-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.sp-svc-mini {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--pc-surface, #2a2a3e);
  border-radius: 6px;
  font-size: 12px;
}

.sp-svc-name {
  font-weight: 500;
  color: var(--pc-text, #e0e0e0);
}

.sp-svc-url {
  flex: 1;
  color: var(--pc-text-3, #666);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sp-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
}

.sp-badge-amber {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.sp-badge-teal {
  background: rgba(20, 184, 166, 0.2);
  color: #14b8a6;
}

.sp-actions {
  display: flex;
  gap: 8px;
}

.sp-btn {
  padding: 8px 16px;
  background: var(--pc-surface, #2a2a3e);
  border: 1px solid var(--pc-border, #444);
  border-radius: 6px;
  color: var(--pc-text-2, #999);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.sp-btn:hover {
  border-color: var(--pc-accent, #6c5ce7);
  color: var(--pc-text, #e0e0e0);
}

.sp-btn-primary {
  background: var(--pc-accent, #6c5ce7);
  border-color: var(--pc-accent, #6c5ce7);
  color: white;
}

.sp-btn-primary:hover {
  background: var(--pc-accent-hi, #7c6cf7);
}

.sp-toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--pc-text-2, #999);
}

.sp-toggle-label input {
  cursor: pointer;
}

.sp-tool-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sp-tool-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--pc-surface, #2a2a3e);
  border: 1px solid var(--pc-border, #333);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.sp-tool-card:hover {
  border-color: var(--pc-accent, #6c5ce7);
  background: var(--pc-surface-hi, #3a3a4e);
}

.sp-tool-success {
  border-color: var(--pc-ok, #10b981);
  background: rgba(16, 185, 129, 0.1);
}

.sp-tool-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.sp-tool-info {
  flex: 1;
}

.sp-tool-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--pc-text, #e0e0e0);
  margin-bottom: 2px;
}

.sp-tool-desc {
  font-size: 11px;
  color: var(--pc-text-3, #666);
}

.sp-tool-arrow {
  color: var(--pc-text-3, #666);
  font-size: 14px;
}

.sp-hub-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--pc-surface, #2a2a3e);
  border: 1px solid var(--pc-border, #333);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.sp-hub-card:hover {
  border-color: var(--pc-accent, #6c5ce7);
  background: var(--pc-surface-hi, #3a3a4e);
}

.sp-hub-icon {
  font-size: 24px;
  color: var(--pc-accent, #c8842a);
}

.sp-hub-info {
  flex: 1;
}

.sp-hub-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--pc-text, #e0e0e0);
  margin-bottom: 4px;
}

.sp-hub-desc {
  font-size: 12px;
  color: var(--pc-text-3, #666);
}

.sp-about {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  font-size: 12px;
  color: var(--pc-text-3, #666);
}

.sp-dot {
  color: var(--pc-text-3, #444);
}
</style>
