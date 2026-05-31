<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  width: { type: String, default: '600px' },
  height: { type: String, default: 'auto' },
  showClose: { type: Boolean, default: true },
})

const emit = defineEmits(['close'])

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="pc-dialog-backdrop" @click="handleBackdropClick">
    <div class="pc-dialog" :style="{ maxWidth: width, maxHeight: height }">
      <div class="pc-dialog-header" v-if="title || showClose">
        <h3 class="pc-dialog-title">{{ title }}</h3>
        <button
          v-if="showClose"
          class="pc-dialog-close"
          @click="emit('close')"
        >×</button>
      </div>
      <div class="pc-dialog-body">
        <slot />
      </div>
      <div class="pc-dialog-footer" v-if="$slots.footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pc-dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: pc-fadeIn 0.15s ease;
}

.pc-dialog {
  background: var(--pc-bg, #1e1e2e);
  border: 1px solid var(--pc-border, #333);
  border-radius: var(--pc-radius, 12px);
  width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  animation: pc-slideIn 0.2s ease;
}

.pc-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--pc-border, #333);
}

.pc-dialog-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--pc-text, #e0e0e0);
}

.pc-dialog-close {
  background: none;
  border: none;
  color: var(--pc-text-2, #999);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.15s;
}

.pc-dialog-close:hover {
  color: var(--pc-text, #e0e0e0);
  background: var(--pc-surface, #2a2a3e);
}

.pc-dialog-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.pc-dialog-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--pc-border, #333);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@keyframes pc-fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pc-slideIn {
  from { opacity: 0; transform: translateY(-10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
