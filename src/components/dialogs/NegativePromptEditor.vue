<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useApi } from '../../composables/useApi.js'
import { useI18n } from '../../composables/useI18n.js'
import BaseDialog from '../common/BaseDialog.vue'

const props = defineProps({
  comfyApi: { type: Object, required: true },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const api = useApi(props.comfyApi)

const content = ref('')
const status = reactive({
  message: '',
  isError: false,
})

async function loadNegative() {
  status.message = t('negative_editor.status.loading')
  status.isError = false

  try {
    const data = await api.get('/negative_prompt')
    content.value = data?.content || ''
    status.message = t('negative_editor.status.loaded')
  } catch (e) {
    status.message = t('negative_editor.status.load_failed', { error: e.message })
    status.isError = true
  }
}

async function saveNegative() {
  status.message = t('negative_editor.status.saving')
  status.isError = false

  try {
    await api.post('/negative_prompt', { content: content.value })
    status.message = t('negative_editor.status.saved')
  } catch (e) {
    status.message = t('negative_editor.status.save_failed', { error: e.message })
    status.isError = true
  }
}

function handleKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    saveNegative()
  }
}

onMounted(loadNegative)
</script>

<template>
  <BaseDialog
    :title="t('negative_editor.title')"
    width="900px"
    @close="emit('close')"
  >
    <div class="mpe-negative-editor">
      <p class="mpe-desc">{{ t('negative_editor.desc') }}</p>

      <div class="mpe-content">
        <textarea
          v-model="content"
          class="mpe-textarea"
          :placeholder="t('negative_editor.placeholder')"
          @keydown="handleKeydown"
        />
      </div>

      <div class="mpe-footer">
        <span
          class="mpe-status"
          :class="{ 'mpe-status-error': status.isError }"
        >
          {{ status.message }}
        </span>
        <button class="mpe-btn mpe-btn-save" @click="saveNegative">
          {{ t('common.save') }}
        </button>
        <button class="mpe-btn mpe-btn-close" @click="emit('close')">
          {{ t('common.close') }}
        </button>
      </div>
    </div>
  </BaseDialog>
</template>

<style scoped>
.mpe-negative-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mpe-desc {
  color: var(--pc-text-2, #999);
  font-size: 12px;
  margin: 0;
}

.mpe-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.mpe-textarea {
  width: 100%;
  min-height: 300px;
  background: var(--comfy-input-bg, #1a1a2e);
  color: var(--pc-text, #e0e0e0);
  border: 1px solid var(--pc-border, #444);
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  resize: vertical;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;
}

.mpe-textarea:focus {
  border-color: var(--pc-accent, #6c5ce7);
}

.mpe-footer {
  display: flex;
  gap: 10px;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--pc-border, #333);
}

.mpe-status {
  flex: 1;
  color: var(--pc-text-2, #999);
  font-size: 12px;
}

.mpe-status-error {
  color: var(--pc-err, #ef4444);
}

.mpe-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}

.mpe-btn-save {
  background: var(--pc-accent, #6c5ce7);
  color: white;
}

.mpe-btn-save:hover {
  background: var(--pc-accent-hi, #7c6cf7);
}

.mpe-btn-close {
  background: var(--pc-surface, #2a2a3e);
  color: var(--pc-text-2, #999);
}

.mpe-btn-close:hover {
  background: var(--pc-raised, #3a3a4e);
}
</style>
