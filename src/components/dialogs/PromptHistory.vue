<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useApi } from '../../composables/useApi.js'
import { useI18n } from '../../composables/useI18n.js'
import { useToast } from '../../composables/useToast.js'
import BaseDialog from '../common/BaseDialog.vue'

const props = defineProps({
  comfyApi: { type: Object, required: true },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const api = useApi(props.comfyApi)
const toast = useToast()

// 状态
const entries = ref([])
const limit = ref(50)
const status = reactive({ message: '', isError: false })
const isLoading = ref(false)

// 格式化时间
function formatTime(ts) {
  const d = new Date(ts * 1000)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 截断文本
function truncate(s, max) {
  if (!s) return ''
  return s.length > max ? s.slice(0, max) + '...' : s
}

// 获取标签
function getTags(extra) {
  const tags = []
  if (extra?.llm_enhanced) tags.push('LLM')
  if (extra?.special) tags.push('NSFW')
  return tags
}

// 加载历史记录
async function loadHistory() {
  isLoading.value = true
  status.message = t('history.status.loading')
  status.isError = false

  try {
    const data = await api.get('/prompt_history')
    entries.value = data.entries || []
    limit.value = data.limit ?? 50

    if (entries.value.length === 0) {
      status.message = t('history.no_record')
    } else {
      status.message = t('history.count', { count: entries.value.length })
    }
  } catch (e) {
    status.message = t('history.status.load_exception', { error: e.message })
    status.isError = true
  } finally {
    isLoading.value = false
  }
}

// 复制提示词
async function copyPrompt(entry) {
  try {
    await navigator.clipboard.writeText(entry.positive || '')
    toast.show(t('history.copied_positive'), 'success')
  } catch (e) {
    toast.show(t('history.copy_failed'), 'error')
  }
}

// 删除记录
async function deleteEntry(entryId) {
  try {
    await api.del(`/prompt_history/${entryId}`)
    await loadHistory()
    toast.show(t('history.deleted'), 'success')
  } catch (e) {
    toast.show(t('history.delete_failed'), 'error')
  }
}

// 更新限制
async function updateLimit(newLimit) {
  try {
    await api.put('/prompt_history/limit', { limit: newLimit })
    limit.value = newLimit
    status.message = t('history.limit_set', {
      value: newLimit === 0 ? t('history.limit_none') : newLimit
    })
    await loadHistory()
  } catch (e) {
    status.message = t('history.limit_update_failed')
    status.isError = true
  }
}

// 清空历史
async function clearHistory() {
  if (!confirm(t('history.confirm_clear'))) return

  try {
    await api.del('/prompt_history')
    await loadHistory()
    status.message = t('history.cleared')
    toast.show(t('history.cleared'), 'success')
  } catch (e) {
    status.message = t('history.clear_failed')
    status.isError = true
  }
}

// 键盘快捷键
function handleKeydown(e) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  loadHistory()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <BaseDialog
    :title="t('history.title')"
    width="900px"
    @close="emit('close')"
  >
    <!-- 工具栏 -->
    <div class="ph-toolbar">
      <span class="ph-hint">{{ t('history.click_hint') }}</span>

      <div class="ph-controls">
        <label class="ph-limit-label">
          {{ t('history.limit_label') }}
          <select
            class="ph-limit-select"
            :value="limit"
            @change="updateLimit(parseInt($event.target.value))"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="0">{{ t('history.no_limit') }}</option>
          </select>
        </label>

        <button class="ph-btn ph-btn-danger" @click="clearHistory">
          {{ t('history.clear_all') }}
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="ph-content">
      <div v-if="isLoading" class="ph-loading">
        {{ t('history.status.loading') }}
      </div>

      <div v-else-if="entries.length === 0" class="ph-empty">
        {{ t('history.empty') }}
      </div>

      <div v-else class="ph-list">
        <div
          v-for="(entry, idx) in entries"
          :key="entry.id"
          class="ph-entry"
          @click="copyPrompt(entry)"
        >
          <div class="ph-entry-content">
            <div class="ph-entry-meta">
              <span class="ph-time">{{ formatTime(entry.timestamp) }}</span>
              <span
                v-for="tag in getTags(entry.extra)"
                :key="tag"
                class="ph-tag"
              >
                {{ tag }}
              </span>
            </div>

            <div class="ph-positive">
              {{ truncate(entry.positive, 120) }}
            </div>

            <div v-if="entry.negative" class="ph-negative">
              Neg: {{ truncate(entry.negative, 60) }}
            </div>
          </div>

          <div class="ph-entry-actions">
            <button
              class="ph-btn"
              @click.stop="copyPrompt(entry)"
              :title="t('history.copy_positive')"
            >
              {{ t('common.copy') }}
            </button>
            <button
              class="ph-btn ph-btn-icon"
              @click.stop="deleteEntry(entry.id)"
              :title="t('common.delete')"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 状态栏 -->
    <template #footer>
      <span
        class="ph-status"
        :class="{ 'ph-status-error': status.isError }"
      >
        {{ status.message }}
      </span>
      <button class="ph-btn" @click="emit('close')">
        {{ t('common.close') }}
      </button>
    </template>
  </BaseDialog>
</template>

<style scoped>
.ph-toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.ph-hint {
  color: var(--pc-text-3, #999);
  font-size: 12px;
  flex: 1;
}

.ph-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ph-limit-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--pc-text-2, #666);
}

.ph-limit-select {
  background: var(--pc-surface, #2a2a3e);
  color: var(--pc-text, #e0e0e0);
  border: 1px solid var(--pc-border, #444);
  border-radius: 5px;
  padding: 2px 6px;
  font-size: 12px;
}

.ph-content {
  flex: 1;
  overflow-y: auto;
  max-height: 60vh;
  border: 1px solid var(--pc-border, #333);
  border-radius: 8px;
  background: var(--pc-surface, #2a2a3e);
}

.ph-loading,
.ph-empty {
  padding: 60px;
  text-align: center;
  color: var(--pc-text-3, #666);
}

.ph-list {
  display: flex;
  flex-direction: column;
}

.ph-entry {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  border-bottom: 1px solid var(--pc-border, #333);
  cursor: pointer;
  transition: background 0.12s;
}

.ph-entry:hover {
  background: var(--pc-surface-hi, #f5f0e8);
}

.ph-entry:last-child {
  border-bottom: none;
}

.ph-entry-content {
  flex: 1;
  min-width: 0;
}

.ph-entry-meta {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 3px;
}

.ph-time {
  color: var(--pc-text-3, #999);
  font-size: 11px;
}

.ph-tag {
  background: var(--pc-accent-bg, #f0e8d8);
  color: var(--pc-accent, #b07830);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 10px;
}

.ph-positive {
  color: var(--pc-text, #e0e0e0);
  font-size: 12px;
  word-break: break-all;
  line-height: 1.4;
}

.ph-negative {
  color: var(--pc-text-3, #999);
  font-size: 11px;
  margin-top: 2px;
}

.ph-entry-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.ph-btn {
  padding: 3px 8px;
  background: var(--pc-surface, #2a2a3e);
  color: var(--pc-text-2, #666);
  border: 1px solid var(--pc-border, #444);
  border-radius: 5px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.15s;
}

.ph-btn:hover {
  border-color: var(--pc-accent, #6c5ce7);
  color: var(--pc-text, #e0e0e0);
}

.ph-btn-icon {
  padding: 3px 6px;
  color: var(--pc-err, #d44);
}

.ph-btn-icon:hover {
  border-color: var(--pc-err, #d44);
  color: var(--pc-err, #d44);
}

.ph-btn-danger {
  color: var(--pc-err, #d44);
  border-color: var(--pc-err, #d44);
}

.ph-btn-danger:hover {
  background: var(--pc-err, #d44);
  color: white;
}

.ph-status {
  color: var(--pc-ok, #4a8);
  font-size: 12px;
  flex: 1;
}

.ph-status-error {
  color: var(--pc-err, #d44);
}
</style>
