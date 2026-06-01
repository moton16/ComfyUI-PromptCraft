<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../composables/useI18n.js'
import { useApi } from '../composables/useApi.js'
import { useToast } from '../composables/useToast.js'
import * as StackAPI from '../../js/lora_group/stack_api.js'

const props = defineProps({
  comfyApi: { type: Object, required: true },
  node: { type: Object, default: null },
  executor: { type: Object, default: null },
  renderStack: { type: Function, default: null },
  onClose: { type: Function, default: () => {} },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const api = useApi(props.comfyApi)
const toast = useToast()

// 状态
const activeTab = ref('lora')
const selectedLora = ref(null)
const selectedGroup = ref(null)
const searchQuery = ref('')
const isLoading = ref(false)
const folderTree = ref(null)
const allLoras = ref([])
const currentPath = ref(['/'])
const groups = ref({})
const loraDetail = ref(null)
const promptGroups = ref([])
const membershipGroups = ref([])
const stackCount = ref(0)

// 搜索过滤
const filteredLoras = computed(() => {
  if (!searchQuery.value.trim()) return allLoras.value
  const q = searchQuery.value.toLowerCase()
  return allLoras.value.filter(l => l.toLowerCase().includes(q))
})

const filteredGroups = computed(() => {
  if (!searchQuery.value.trim()) return groups.value
  const q = searchQuery.value.toLowerCase()
  const result = {}
  for (const [name, info] of Object.entries(groups.value)) {
    if (name.toLowerCase().includes(q) || (info.label || '').toLowerCase().includes(q)) {
      result[name] = info
    }
  }
  return result
})

// 快捷指令
const shortcuts = [
  { label: t('agent.shortcut_status'), cmd: '显示当前节点的状态' },
  { label: t('agent.shortcut_clear'), cmd: '清空所有 LoRA' },
  { label: t('agent.shortcut_help'), cmd: '你能做什么？' },
]

// 加载文件夹树
async function loadFolderTree() {
  isLoading.value = true
  try {
    const data = await api.get('/lora_folders')
    folderTree.value = data
    allLoras.value = data.all || []
  } catch (e) {
    console.error('[PromptCraft] Load folder tree failed:', e)
  } finally {
    isLoading.value = false
  }
}

// 加载群组
async function loadGroups() {
  try {
    const data = await api.get('/groups')
    groups.value = data || {}
  } catch (e) {
    console.error('[PromptCraft] Load groups failed:', e)
  }
}

// 切换 Tab
function switchTab(tab) {
  activeTab.value = tab
  searchQuery.value = ''
  if (tab === 'lora' && !folderTree.value) {
    loadFolderTree()
  } else if (tab === 'group') {
    loadGroups()
  }
}

// 选择 LoRA
async function selectLora(loraPath) {
  selectedLora.value = loraPath
  selectedGroup.value = null
  isLoading.value = true

  try {
    // 并行加载数据
    const [promptData, allGroups, loraInfo] = await Promise.all([
      api.get(`/lora_prompts/${encodeURIComponent(loraPath)}`).catch(() => ({ groups: [] })),
      api.get('/groups').catch(() => ({})),
      api.get(`/lora_info/${encodeURIComponent(loraPath)}`).catch(() => null),
    ])

    loraDetail.value = loraInfo
    promptGroups.value = promptData.groups || []

    // 检查群组成员资格
    const memberOf = Object.keys(allGroups)
    membershipGroups.value = []
    for (const gName of memberOf) {
      try {
        const gDetail = await api.get(`/groups/${encodeURIComponent(gName)}`)
        if (gDetail.loras?.some(l => l.lora === loraPath)) {
          membershipGroups.value.push(gName)
        }
      } catch {}
    }
  } catch (e) {
    console.error('[PromptCraft] Load lora detail failed:', e)
  } finally {
    isLoading.value = false
  }
}

// 选择群组
async function selectGroup(groupName) {
  selectedGroup.value = groupName
  selectedLora.value = null
  isLoading.value = true

  try {
    const data = await api.get(`/groups/${encodeURIComponent(groupName)}`)
    loraDetail.value = { group: data }
  } catch (e) {
    console.error('[PromptCraft] Load group detail failed:', e)
  } finally {
    isLoading.value = false
  }
}

// 添加到栈
function addToStack() {
  if (!selectedLora.value) return

  const nodeId = props.node?.id
  if (!nodeId) {
    toast.error(t('hub.no_node'))
    return
  }

  const added = StackAPI.addLora(nodeId, selectedLora.value, 1.0, 1.0)
  if (added) {
    toast.success(t('hub.added_to_stack'))
    stackCount.value = StackAPI.getStack(nodeId).items.length
  } else {
    toast.warning(t('hub.already_in_stack'))
  }
}

// 关闭面板
function handleClose() {
  emit('close')
  props.onClose()
}

// 键盘快捷键
function handleKeydown(e) {
  if (e.key === 'Escape') {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  loadFolderTree()

  // 初始化栈计数
  if (props.node?.id) {
    stackCount.value = StackAPI.getStack(props.node.id).items.length
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="hp-container">
    <!-- Header -->
    <div class="hp-header">
      <div class="hp-header-left">
        <h2 class="hp-title">LoRA Hub</h2>
      </div>
      <div class="hp-header-right">
        <button class="hp-close" @click="handleClose">×</button>
      </div>
    </div>

    <!-- Body -->
    <div class="hp-body">
      <!-- Sidebar -->
      <div class="hp-sidebar">
        <!-- Tabs -->
        <div class="hp-tabs">
          <button
            class="hp-tab"
            :class="{ 'hp-tab-active': activeTab === 'lora' }"
            @click="switchTab('lora')"
          >
            <span class="hp-tab-icon">◆</span> LoRA
          </button>
          <button
            class="hp-tab"
            :class="{ 'hp-tab-active': activeTab === 'group' }"
            @click="switchTab('group')"
          >
            <span class="hp-tab-icon">✦</span> {{ t('hub.tab_group') }}
          </button>
          <button
            class="hp-tab"
            :class="{ 'hp-tab-active': activeTab === 'agent' }"
            @click="switchTab('agent')"
          >
            <span class="hp-tab-icon">◈</span> Agent
          </button>
        </div>

        <!-- Search -->
        <div v-if="activeTab !== 'agent'" class="hp-search">
          <input
            v-model="searchQuery"
            class="hp-search-input"
            :placeholder="activeTab === 'lora' ? t('hub.search_lora') : t('hub.search_group')"
          />
        </div>

        <!-- LoRA List -->
        <div v-if="activeTab === 'lora'" class="hp-list">
          <div v-if="isLoading" class="hp-loading">{{ t('common.loading') }}</div>
          <div v-else-if="filteredLoras.length === 0" class="hp-empty">{{ t('hub.no_lora') }}</div>
          <div v-else>
            <div
              v-for="lora in filteredLoras"
              :key="lora"
              class="hp-lora-item"
              :class="{ 'hp-selected': selectedLora === lora }"
              @click="selectLora(lora)"
            >
              <span class="hp-lora-icon">◆</span>
              <span class="hp-lora-name">{{ lora.split('/').pop().replace(/\.safetensors$/, '') }}</span>
            </div>
          </div>
        </div>

        <!-- Group List -->
        <div v-if="activeTab === 'group'" class="hp-list">
          <div v-if="isLoading" class="hp-loading">{{ t('common.loading') }}</div>
          <div v-else-if="Object.keys(filteredGroups).length === 0" class="hp-empty">{{ t('hub.no_groups') }}</div>
          <div v-else>
            <div
              v-for="(info, name) in filteredGroups"
              :key="name"
              class="hp-group-item"
              :class="{ 'hp-selected': selectedGroup === name }"
              @click="selectGroup(name)"
            >
              <span class="hp-group-icon">✦</span>
              <div class="hp-group-info">
                <div class="hp-group-name">{{ info.label || name }}</div>
                <div class="hp-group-meta">{{ t('hub.lora_count', { count: info.count || 0 }) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Agent Tab -->
        <div v-if="activeTab === 'agent'" class="hp-list">
          <div class="hp-agent-placeholder">
            <div class="hp-agent-icon">◈</div>
            <div class="hp-agent-text">AI Agent</div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="hp-content">
        <!-- Welcome -->
        <div v-if="!selectedLora && !selectedGroup" class="hp-welcome">
          <div class="hp-welcome-icon">◆</div>
          <div class="hp-welcome-title">LoRA Hub</div>
          <div class="hp-welcome-desc">{{ t('hub.welcome_desc') }}</div>
        </div>

        <!-- LoRA Detail -->
        <div v-else-if="selectedLora" class="hp-detail">
          <div v-if="isLoading" class="hp-loading">{{ t('common.loading') }}</div>
          <template v-else>
            <!-- Info Card -->
            <div class="hp-info-card">
              <div class="hp-info-header">
                <div class="hp-info-name">{{ selectedLora.split('/').pop().replace(/\.safetensors$/, '') }}</div>
                <div class="hp-info-path">{{ selectedLora }}</div>
              </div>
              <div v-if="loraDetail" class="hp-info-fields">
                <div v-if="loraDetail.base_model" class="hp-info-field">
                  <span class="hp-field-label">{{ t('hub.field_model') }}</span>
                  <span class="hp-field-value">{{ loraDetail.base_model }}</span>
                </div>
              </div>
            </div>

            <!-- Prompt Groups -->
            <div class="hp-section">
              <div class="hp-section-title">{{ t('hub.prompt_groups') }}</div>
              <div v-if="promptGroups.length === 0" class="hp-empty">{{ t('hub.no_prompt_groups') }}</div>
              <div v-else class="hp-prompt-groups">
                <div v-for="pg in promptGroups" :key="pg.name" class="hp-prompt-group">
                  <div class="hp-pg-header">
                    <span class="hp-pg-name">{{ pg.name }}</span>
                  </div>
                  <div class="hp-pg-content">
                    <div class="hp-pg-label">{{ t('hub.positive_prompt') }}</div>
                    <div class="hp-pg-text">{{ (pg.prompts || []).join(', ') }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Membership -->
            <div class="hp-section">
              <div class="hp-section-title">{{ t('hub.belong_groups') }}</div>
              <div v-if="membershipGroups.length === 0" class="hp-empty">{{ t('hub.not_in_group') }}</div>
              <div v-else class="hp-membership">
                <span v-for="g in membershipGroups" :key="g" class="hp-membership-tag">{{ g }}</span>
              </div>
            </div>

            <!-- Add to Stack -->
            <div class="hp-section">
              <button class="hp-btn hp-btn-primary" @click="addToStack">
                {{ t('hub.add_to_stack') }}
              </button>
            </div>
          </template>
        </div>

        <!-- Group Detail -->
        <div v-else-if="selectedGroup" class="hp-detail">
          <div v-if="isLoading" class="hp-loading">{{ t('common.loading') }}</div>
          <template v-else>
            <div class="hp-group-header">
              <div class="hp-group-title">{{ loraDetail?.group?.label || selectedGroup }}</div>
              <div class="hp-group-count">{{ t('hub.lora_count', { count: loraDetail?.group?.loras?.length || 0 }) }}</div>
            </div>
            <div class="hp-group-lora-list">
              <div v-if="!loraDetail?.group?.loras?.length" class="hp-empty">{{ t('hub.no_lora_in_group') }}</div>
              <div
                v-for="lora in (loraDetail?.group?.loras || [])"
                :key="lora.lora"
                class="hp-gl-item"
              >
                <span class="hp-gl-name">{{ lora.lora.split('/').pop().replace(/\.safetensors$/, '') }}</span>
                <span class="hp-gl-weight">W: {{ lora.weight }} / CLIP: {{ lora.clip_weight }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="hp-footer">
      <div class="hp-footer-stack">{{ t('hub.stack_count', { count: stackCount }) }}</div>
    </div>
  </div>
</template>

<style scoped>
.hp-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--pc-bg, #1e1e2e);
  color: var(--pc-text, #e0e0e0);
  font-family: 'Segoe UI', Arial, sans-serif;
}

.hp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--pc-border, #333);
  background: var(--pc-surface, #2a2a3e);
}

.hp-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--pc-accent, #c8842a);
}

.hp-close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--pc-text-2, #999);
  font-size: 18px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
}

.hp-close:hover {
  background: var(--pc-surface-hi, #3a3a4e);
  color: var(--pc-text, #e0e0e0);
}

.hp-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.hp-sidebar {
  width: 280px;
  border-right: 1px solid var(--pc-border, #333);
  display: flex;
  flex-direction: column;
}

.hp-tabs {
  display: flex;
  border-bottom: 1px solid var(--pc-border, #333);
}

.hp-tab {
  flex: 1;
  padding: 10px 12px;
  background: transparent;
  border: none;
  color: var(--pc-text-2, #999);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.hp-tab:hover {
  background: var(--pc-surface, #2a2a3e);
}

.hp-tab-active {
  color: var(--pc-accent, #c8842a);
  border-bottom: 2px solid var(--pc-accent, #c8842a);
}

.hp-tab-icon {
  font-size: 14px;
}

.hp-search {
  padding: 10px 12px;
  border-bottom: 1px solid var(--pc-border, #333);
}

.hp-search-input {
  width: 100%;
  padding: 8px 10px;
  background: var(--comfy-input-bg, #1a1a2e);
  border: 1px solid var(--pc-border, #444);
  border-radius: 6px;
  color: var(--pc-text, #e0e0e0);
  font-size: 12px;
}

.hp-search-input:focus {
  outline: none;
  border-color: var(--pc-accent, #6c5ce7);
}

.hp-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.hp-loading,
.hp-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--pc-text-3, #666);
  font-size: 13px;
}

.hp-lora-item,
.hp-group-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 4px;
}

.hp-lora-item:hover,
.hp-group-item:hover {
  background: var(--pc-surface, #2a2a3e);
}

.hp-lora-item.hp-selected,
.hp-group-item.hp-selected {
  background: var(--pc-accent, #6c5ce7);
  color: white;
}

.hp-lora-icon,
.hp-group-icon {
  font-size: 14px;
  color: var(--pc-accent, #c8842a);
}

.hp-selected .hp-lora-icon,
.hp-selected .hp-group-icon {
  color: white;
}

.hp-lora-name {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hp-group-info {
  flex: 1;
  min-width: 0;
}

.hp-group-name {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 2px;
}

.hp-group-meta {
  font-size: 11px;
  color: var(--pc-text-3, #666);
}

.hp-selected .hp-group-meta {
  color: rgba(255, 255, 255, 0.7);
}

.hp-agent-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.hp-agent-icon {
  font-size: 32px;
  margin-bottom: 12px;
  color: var(--pc-accent, #c8842a);
}

.hp-agent-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--pc-text, #e0e0e0);
}

.hp-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.hp-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.hp-welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--pc-accent, #c8842a);
}

.hp-welcome-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--pc-text, #e0e0e0);
  margin-bottom: 8px;
}

.hp-welcome-desc {
  font-size: 14px;
  color: var(--pc-text-2, #999);
  max-width: 400px;
  line-height: 1.6;
}

.hp-detail {
  height: 100%;
}

.hp-info-card {
  background: var(--pc-surface, #2a2a3e);
  border: 1px solid var(--pc-border, #333);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.hp-info-header {
  margin-bottom: 12px;
}

.hp-info-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--pc-text, #e0e0e0);
  margin-bottom: 4px;
}

.hp-info-path {
  font-size: 12px;
  color: var(--pc-text-3, #666);
  word-break: break-all;
}

.hp-info-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hp-info-field {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.hp-field-label {
  color: var(--pc-text-3, #666);
  min-width: 60px;
}

.hp-field-value {
  color: var(--pc-text, #e0e0e0);
}

.hp-section {
  margin-bottom: 20px;
}

.hp-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--pc-text, #e0e0e0);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--pc-border, #333);
}

.hp-prompt-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hp-prompt-group {
  background: var(--pc-surface, #2a2a3e);
  border: 1px solid var(--pc-border, #333);
  border-radius: 8px;
  padding: 12px;
}

.hp-pg-header {
  margin-bottom: 8px;
}

.hp-pg-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--pc-accent, #c8842a);
}

.hp-pg-content {
  font-size: 12px;
}

.hp-pg-label {
  color: var(--pc-text-3, #666);
  margin-bottom: 4px;
}

.hp-pg-text {
  color: var(--pc-text, #e0e0e0);
  line-height: 1.5;
}

.hp-membership {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hp-membership-tag {
  padding: 4px 10px;
  background: var(--pc-surface, #2a2a3e);
  border: 1px solid var(--pc-border, #444);
  border-radius: 12px;
  font-size: 12px;
  color: var(--pc-text, #e0e0e0);
}

.hp-group-header {
  margin-bottom: 16px;
}

.hp-group-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--pc-text, #e0e0e0);
  margin-bottom: 4px;
}

.hp-group-count {
  font-size: 13px;
  color: var(--pc-text-2, #999);
}

.hp-group-lora-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hp-gl-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--pc-surface, #2a2a3e);
  border: 1px solid var(--pc-border, #333);
  border-radius: 6px;
}

.hp-gl-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--pc-text, #e0e0e0);
}

.hp-gl-weight {
  font-size: 11px;
  color: var(--pc-text-3, #666);
}

.hp-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.hp-btn-primary {
  background: var(--pc-accent, #6c5ce7);
  color: white;
}

.hp-btn-primary:hover {
  background: var(--pc-accent-hi, #7c6cf7);
}

.hp-footer {
  padding: 10px 16px;
  border-top: 1px solid var(--pc-border, #333);
  background: var(--pc-surface, #2a2a3e);
}

.hp-footer-stack {
  font-size: 12px;
  color: var(--pc-text-2, #999);
}
</style>
