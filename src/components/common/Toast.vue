<script setup>
import { useToast } from '../../composables/useToast.js'

const { toasts } = useToast()
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast-${toast.type}`"
      >
        <span class="toast-icon">
          <template v-if="toast.type === 'success'">✓</template>
          <template v-else-if="toast.type === 'error'">✕</template>
          <template v-else-if="toast.type === 'warning'">⚠</template>
          <template v-else>ℹ</template>
        </span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: var(--pc-z-toast, 10001);
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  background: var(--pc-surface, #2a2a3e);
  border: 1px solid var(--pc-border, #444);
  color: var(--pc-text, #e0e0e0);
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  max-width: 360px;
}

.toast-icon {
  font-size: 14px;
  font-weight: bold;
}

.toast-success {
  border-color: var(--pc-ok, #10b981);
}

.toast-success .toast-icon {
  color: var(--pc-ok, #10b981);
}

.toast-error {
  border-color: var(--pc-err, #ef4444);
}

.toast-error .toast-icon {
  color: var(--pc-err, #ef4444);
}

.toast-warning {
  border-color: var(--pc-warn, #f59e0b);
}

.toast-warning .toast-icon {
  color: var(--pc-warn, #f59e0b);
}

.toast-info {
  border-color: var(--pc-accent, #6c5ce7);
}

.toast-info .toast-icon {
  color: var(--pc-accent, #6c5ce7);
}

.toast-message {
  flex: 1;
  word-break: break-word;
}

/* 动画 */
.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
