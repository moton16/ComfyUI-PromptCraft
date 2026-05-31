<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useApi } from '../../composables/useApi.js'
import { useI18n } from '../../composables/useI18n.js'
import BaseDialog from '../common/BaseDialog.vue'
import BaseToggle from '../common/BaseToggle.vue'

const props = defineProps({
  comfyApi: { type: Object, required: true },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const api = useApi(props.comfyApi)

const form = reactive({
  sfw_rules: '',
  nsfw_rules: '',
  sfw_enabled: true,
  nsfw_enabled: true,
})

const status = reactive({
  message: '',
  isError: false,
})

async function loadRules() {
  status.message = t('rule_manager.status.loading')
  status.isError = false

  try {
    const data = await api.get('/system_prompt')
    Object.assign(form, {
      sfw_rules: data?.sfw_rules || '',
      nsfw_rules: data?.nsfw_rules || '',
      sfw_enabled: data?.sfw_enabled !== false,
      nsfw_enabled: data?.nsfw_enabled !== false,
    })
    status.message = t('rule_manager.status.loaded')
  } catch (e) {
    status.message = t('rule_manager.status.load_failed', { error: e.message })
    status.isError = true
  }
}

async function saveRules() {
  status.message = t('rule_manager.status.saving')
  status.isError = false

  try {
    await api.post('/system_prompt', { ...form })
    status.message = t('rule_manager.status.saved')
  } catch (e) {
    status.message = t('rule_manager.status.save_failed', { error: e.message })
    status.isError = true
  }
}

function handleKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    saveRules()
  }
}

onMounted(loadRules)
</script>

<template>
  <BaseDialog
    :title="t('rule_manager.title')"
    width="900px"
    @close="emit('close')"
  >
    <div class="mpe-rule-manager" @keydown="handleKeydown">
      <!-- 基础扩写 -->
      <div class="mpe-rule-section">
        <div class="mpe-rule-header">
          <span class="mpe-rule-title">{{ t('rule_manager.basic') }}</span>
          <BaseToggle
            v-model="form.sfw_enabled"
            :label="t('rule_manager.enable')"
          />
        </div>
        <textarea
          v-model="form.sfw_rules"
          class="mpe-textarea"
          :placeholder="t('rule_manager.placeholder_basic')"
        />
      </div>

      <!-- 详细扩写 -->
      <div class="mpe-rule-section">
        <div class="mpe-rule-header">
          <span class="mpe-rule-title">{{ t('rule_manager.detail') }}</span>
          <BaseToggle
            v-model="form.nsfw_enabled"
            :label="t('rule_manager.enable')"
          />
        </div>
        <textarea
          v-model="form.nsfw_rules"
          class="mpe-textarea"
          :placeholder="t('rule_manager.placeholder_detail')"
        />
      </div>

      <!-- 底部 -->
      <div class="mpe-footer">
        <span
          class="mpe-status"
          :class="{ 'mpe-status-error': status.isError }"
        >
          {{ status.message }}
        </span>
        <button class="mpe-btn mpe-btn-save" @click="saveRules">
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
.mpe-rule-manager {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mpe-rule-section {
  border: 1px solid var(--pc-border, #333);
  border-radius: 10px;
  overflow: hidden;
}

.mpe-rule-header {
  background: var(--pc-surface, #2a2a3e);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mpe-rule-title {
  font-weight: 600;
  color: var(--pc-accent, #6c5ce7);
  font-size: 14px;
}

.mpe-textarea {
  width: 100%;
  height: 150px;
  background: var(--comfy-input-bg, #1a1a2e);
  color: var(--pc-text, #e0e0e0);
  border: none;
  padding: 10px 14px;
  font-size: 13px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  resize: vertical;
  box-sizing: border-box;
  outline: none;
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
