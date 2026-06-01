<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useApi } from '../../composables/useApi.js'
import { useI18n } from '../../composables/useI18n.js'
import BaseDialog from '../common/BaseDialog.vue'

const props = defineProps({
  comfyApi: { type: Object, required: true },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const api = useApi(props.comfyApi)

// 状态
const currentTab = ref('sfw')
const currentLibData = ref(null)
const categories = ref({})
const status = reactive({ message: '', isError: false })
const isLoading = ref(false)

// 加载图书馆数据
async function loadLibrary(type) {
  isLoading.value = true
  currentTab.value = type
  status.message = t('library_editor.status.loading')
  status.isError = false

  try {
    const data = await api.get(`/library/${type}`)
    currentLibData.value = data
    categories.value = data.categories || {}

    const catCount = Object.keys(categories.value).length
    let optCount = 0
    Object.values(categories.value).forEach(cat => {
      optCount += (cat.options || []).length
      const subgroups = cat.subgroups || {}
      Object.values(subgroups).forEach(sg => {
        optCount += (sg.options || []).length
      })
    })

    status.message = t('library_editor.status.loaded', {
      type: type.toUpperCase(),
      catCount,
      optCount
    })
  } catch (e) {
    status.message = t('library_editor.status.load_exception', { error: e.message })
    status.isError = true
  } finally {
    isLoading.value = false
  }
}

// 收集表格数据
function collectCategories() {
  const newCats = {}

  Object.entries(categories.value).forEach(([key, cat]) => {
    const opts = []
    const existingCat = cat || {}

    // 收集选项
    if (existingCat.options) {
      existingCat.options.forEach(opt => {
        if (opt.label && opt.en) {
          opts.push({ label: opt.label, en: opt.en })
        }
      })
    }

    newCats[key] = {
      label: key,
      description: existingCat.description || '',
      options: opts
    }

    // 收集子组
    if (existingCat.subgroups) {
      const newSubgroups = {}
      Object.entries(existingCat.subgroups).forEach(([sgKey, sg]) => {
        const sgOpts = []
        if (sg.options) {
          sg.options.forEach(opt => {
            if (opt.label && opt.en) {
              sgOpts.push({ label: opt.label, en: opt.en })
            }
          })
        }
        newSubgroups[sgKey] = {
          label: sg.label || sgKey,
          options: sgOpts
        }
      })
      newCats[key].subgroups = newSubgroups
    }
  })

  return newCats
}

// 保存图书馆
async function saveLibrary() {
  try {
    const newCategories = collectCategories()
    const payload = { ...currentLibData.value, categories: newCategories }

    status.message = t('library_editor.status.saving')
    status.isError = false

    await api.post(`/library/${currentTab.value}`, payload)
    await api.post(`/library/${currentTab.value}_reload`, {})

    status.message = t('library_editor.status.saved', { type: currentTab.value.toUpperCase() })
    currentLibData.value = payload
  } catch (e) {
    status.message = t('library_editor.status.save_failed', { error: e.message })
    status.isError = true
  }
}

// 更新选项
function updateOption(catKey, optIndex, field, value) {
  if (categories.value[catKey]?.options?.[optIndex]) {
    categories.value[catKey].options[optIndex][field] = value
  }
}

// 更新子组选项
function updateSubgroupOption(catKey, sgKey, optIndex, field, value) {
  if (categories.value[catKey]?.subgroups?.[sgKey]?.options?.[optIndex]) {
    categories.value[catKey].subgroups[sgKey].options[optIndex][field] = value
  }
}

// 键盘快捷键（Escape 由 BaseDialog 处理）
function handleKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    saveLibrary()
  }
}

onMounted(() => {
  loadLibrary('sfw')
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <BaseDialog
    :title="t('library_editor.title')"
    width="900px"
    @close="emit('close')"
  >
    <!-- 描述 -->
    <p class="le-desc">{{ t('library_editor.desc') }}</p>

    <!-- 标签切换 -->
    <div class="le-tabs">
      <button
        class="le-tab"
        :class="{ 'le-tab-active': currentTab === 'sfw' }"
        @click="loadLibrary('sfw')"
      >
        {{ t('library_editor.tab_sfw') }}
      </button>
      <button
        class="le-tab"
        :class="{ 'le-tab-active': currentTab === 'nsfw' }"
        @click="loadLibrary('nsfw')"
      >
        {{ t('library_editor.tab_nsfw') }}
      </button>
    </div>

    <!-- 状态栏 -->
    <div class="le-status-bar">
      <span
        class="le-status"
        :class="{ 'le-status-error': status.isError }"
      >
        {{ status.message }}
      </span>
      <button class="le-btn" @click="loadLibrary(currentTab)">
        {{ t('library_editor.refresh') }}
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="le-content">
      <div v-if="isLoading" class="le-loading">
        {{ t('library_editor.status.loading') }}
      </div>

      <table v-else class="le-table">
        <tbody>
          <tr
            v-for="(cat, catKey) in categories"
            :key="catKey"
            class="le-cat-row"
          >
            <td class="le-cat-label">{{ catKey }}</td>
            <td class="le-cat-options">
              <!-- 主选项 -->
              <div class="le-opt-list">
                <div
                  v-for="(opt, optIdx) in cat.options"
                  :key="optIdx"
                  class="le-opt-item"
                >
                  <input
                    class="le-input"
                    :value="opt.label"
                    @input="updateOption(catKey, optIdx, 'label', $event.target.value)"
                    placeholder="Label"
                  />
                  <input
                    class="le-input le-input-en"
                    :value="opt.en"
                    @input="updateOption(catKey, optIdx, 'en', $event.target.value)"
                    placeholder="English"
                  />
                </div>
              </div>

              <!-- 子组 -->
              <div
                v-for="(sg, sgKey) in cat.subgroups"
                :key="sgKey"
                class="le-subgroup"
              >
                <div class="le-sg-label">🎲 {{ sg.label || sgKey }}</div>
                <div class="le-opt-list">
                  <div
                    v-for="(opt, optIdx) in sg.options"
                    :key="optIdx"
                    class="le-opt-item"
                  >
                    <input
                      class="le-input"
                      :value="opt.label"
                      @input="updateSubgroupOption(catKey, sgKey, optIdx, 'label', $event.target.value)"
                      placeholder="Label"
                    />
                    <input
                      class="le-input le-input-en"
                      :value="opt.en"
                      @input="updateSubgroupOption(catKey, sgKey, optIdx, 'en', $event.target.value)"
                      placeholder="English"
                    />
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <span class="le-hint">{{ t('library_editor.save_hint') }}</span>
      <button class="le-btn le-btn-primary" @click="saveLibrary">
        {{ t('common.save') }}
      </button>
      <button class="le-btn" @click="emit('close')">
        {{ t('common.close') }}
      </button>
    </template>
  </BaseDialog>
</template>

<style scoped>
.le-desc {
  color: var(--pc-text-2, #999);
  font-size: 12px;
  margin: 0 0 8px 0;
}

.le-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
}

.le-tab {
  padding: 6px 16px;
  border: 1px solid var(--pc-border, #444);
  border-radius: 7px;
  background: var(--pc-surface, #2a2a3e);
  color: var(--pc-text-2, #999);
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  font-family: inherit;
  transition: all 0.15s;
}

.le-tab:hover {
  border-color: var(--pc-accent, #6c5ce7);
}

.le-tab-active {
  background: var(--pc-accent-bg, #f5f0e8);
  border-color: var(--pc-accent, #c8842a);
  color: var(--pc-accent, #c8842a);
  font-weight: 600;
}

.le-status-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}

.le-status {
  color: var(--pc-ok, #4a8);
  font-size: 12px;
  flex: 1;
}

.le-status-error {
  color: var(--pc-err, #d44);
}

.le-content {
  flex: 1;
  overflow-y: auto;
  max-height: 60vh;
  border: 1px solid var(--pc-border, #333);
  border-radius: 8px;
  background: var(--pc-surface, #2a2a3e);
}

.le-loading {
  padding: 60px;
  text-align: center;
  color: var(--pc-text-3, #666);
}

.le-table {
  width: 100%;
  border-collapse: collapse;
}

.le-cat-row {
  border-bottom: 1px solid var(--pc-border, #333);
}

.le-cat-label {
  vertical-align: top;
  padding: 10px 8px;
  width: 100px;
  font-weight: 600;
  color: var(--pc-accent, #c8842a);
  font-size: 13px;
}

.le-cat-options {
  padding: 6px 8px;
}

.le-opt-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.le-opt-item {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 2px;
}

.le-input {
  flex: 1;
  background: var(--comfy-input-bg, #1a1a2e);
  color: var(--pc-text, #e0e0e0);
  border: 1px solid var(--pc-border, #444);
  border-radius: 5px;
  padding: 4px 8px;
  font-size: 12px;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;
}

.le-input:focus {
  border-color: var(--pc-accent, #6c5ce7);
}

.le-input-en {
  font-family: 'JetBrains Mono', monospace;
}

.le-subgroup {
  margin-top: 8px;
  padding: 6px 8px;
  background: var(--pc-surface-hi, #f8f6f0);
  border-radius: 6px;
  border: 1px solid var(--pc-border, #e8e4d8);
}

.le-sg-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--pc-accent, #b07830);
  margin-bottom: 4px;
}

.le-hint {
  color: var(--pc-text-3, #bbb);
  font-size: 11px;
}

.le-btn {
  padding: 8px 20px;
  background: var(--pc-surface, #2a2a3e);
  color: var(--pc-text-2, #999);
  border: 1px solid var(--pc-border, #444);
  border-radius: 7px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}

.le-btn:hover {
  border-color: var(--pc-accent, #6c5ce7);
  color: var(--pc-text, #e0e0e0);
}

.le-btn-primary {
  background: var(--pc-accent, #6c5ce7);
  color: white;
  border-color: var(--pc-accent, #6c5ce7);
}

.le-btn-primary:hover {
  background: var(--pc-accent-hi, #7c6cf7);
}
</style>
