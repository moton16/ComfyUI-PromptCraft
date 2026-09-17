// Toast 通知 composable
// 复用现有的 showLlmStatusToast 逻辑

import { ref } from 'vue'

const toasts = ref([])
const timers = new Map()
let toastId = 0

export function useToast() {
  function show(message, type = 'info', duration = 3000) {
    const id = ++toastId
    toasts.value.push({ id, message, type })

    const timer = setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
      timers.delete(id)
    }, duration)
    timers.set(id, timer)
  }

  // 清理所有未到期的定时器（Toast 组件卸载时调用，避免卸载后定时器仍更新状态）
  function clearTimers() {
    timers.forEach(timer => clearTimeout(timer))
    timers.clear()
  }

  return {
    toasts,
    clearTimers,
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'error', 5000),
    info: (msg) => show(msg, 'info'),
    warning: (msg) => show(msg, 'warning'),
  }
}
