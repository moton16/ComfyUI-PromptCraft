// Toast 通知 composable
// 复用现有的 showLlmStatusToast 逻辑

import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
  function show(message, type = 'info', duration = 3000) {
    const id = ++toastId
    toasts.value.push({ id, message, type })

    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  return {
    toasts,
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'error', 5000),
    info: (msg) => show(msg, 'info'),
    warning: (msg) => show(msg, 'warning'),
  }
}
