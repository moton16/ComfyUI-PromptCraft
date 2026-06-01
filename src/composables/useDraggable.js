// 拖拽 composable
// 为浮动面板提供拖拽功能，支持 ref 和 selector 两种定位方式

import { ref, onMounted, onUnmounted, nextTick } from 'vue'

/**
 * 拖拽功能 composable
 *
 * 两种使用方式：
 * 1. Ref 模式（原有）：传入 elementRef / handleRef
 * 2. Selector 模式（新）：传入 containerSelector / handleSelector
 *
 * @param {Object} options
 * @param {import('vue').Ref<HTMLElement>} [options.elementRef] - 要拖拽的元素引用
 * @param {import('vue').Ref<HTMLElement>} [options.handleRef] - 拖拽把手引用（默认使用 elementRef）
 * @param {string} [options.containerSelector] - CSS 选择器（替代 elementRef）
 * @param {string} [options.handleSelector] - 拖拽把手 CSS 选择器（替代 handleRef）
 * @param {Object} [options.initialPosition] - 初始位置 { x, y }
 * @param {string} [options.storageKey] - localStorage key，用于持久化位置
 * @param {boolean} [options.constrainToViewport=true] - 是否限制在视口内
 * @param {function} [options.onDragEnd] - 拖拽结束回调
 */
export function useDraggable(options = {}) {
  const {
    elementRef,
    handleRef,
    containerSelector,
    handleSelector,
    initialPosition = { x: 20, y: 20 },
    storageKey,
    constrainToViewport = true,
    onDragEnd,
  } = options

  // 尝试从 localStorage 恢复位置
  function loadSavedPosition() {
    if (!storageKey) return null
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const pos = JSON.parse(saved)
        if (typeof pos.x === 'number' && typeof pos.y === 'number') {
          return pos
        }
      }
    } catch {}
    return null
  }

  const savedPosition = loadSavedPosition()
  const position = ref(savedPosition || { ...initialPosition })
  const isDragging = ref(false)

  let startX = 0
  let startY = 0
  let startLeft = 0
  let startTop = 0
  let _containerEl = null
  let _handleEl = null

  function getEventPos(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    return { x: e.clientX, y: e.clientY }
  }

  function constrainPosition(x, y) {
    if (!constrainToViewport) {
      return { x, y }
    }

    const el = _containerEl
    if (!el) {
      return { x, y }
    }

    const rect = el.getBoundingClientRect()
    const maxX = window.innerWidth - rect.width
    const maxY = window.innerHeight - rect.height

    return {
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY)),
    }
  }

  function onMouseDown(e) {
    // 只响应左键点击
    if (e.button && e.button !== 0) return

    const pos = getEventPos(e)
    startX = pos.x
    startY = pos.y
    startLeft = position.value.x
    startTop = position.value.y

    isDragging.value = true

    // 阻止文本选择
    e.preventDefault()

    // 添加全局事件监听
    document.addEventListener('mousemove', onMouseMove, { passive: false })
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('touchmove', onMouseMove, { passive: false })
    document.addEventListener('touchend', onMouseUp)
  }

  function onMouseMove(e) {
    if (!isDragging.value) return

    const pos = getEventPos(e)
    const deltaX = pos.x - startX
    const deltaY = pos.y - startY

    const newX = startLeft + deltaX
    const newY = startTop + deltaY

    const constrained = constrainPosition(newX, newY)
    position.value = constrained

    // 阻止滚动
    e.preventDefault()
  }

  function onMouseUp() {
    isDragging.value = false

    // 持久化位置
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(position.value))
      } catch {}
    }

    // 移除全局事件监听
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('touchmove', onMouseMove)
    document.removeEventListener('touchend', onMouseUp)

    // 触发回调
    if (onDragEnd) {
      onDragEnd(position.value)
    }
  }

  // 解析元素：支持 ref 和 selector
  function resolveElements() {
    const container = elementRef?.value || (containerSelector ? document.querySelector(containerSelector) : null)
    const handle = handleRef?.value || (handleSelector ? document.querySelector(handleSelector) : null)
    _containerEl = container
    _handleEl = handle || container
  }

  // 设置拖拽把手
  function setupDragHandle() {
    resolveElements()
    if (_handleEl) {
      _handleEl.addEventListener('mousedown', onMouseDown)
      _handleEl.addEventListener('touchstart', onMouseDown, { passive: false })
    }
  }

  // 清理事件监听
  function cleanup() {
    if (_handleEl) {
      _handleEl.removeEventListener('mousedown', onMouseDown)
      _handleEl.removeEventListener('touchstart', onMouseDown)
    }

    // 确保清理全局监听
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('touchmove', onMouseMove)
    document.removeEventListener('touchend', onMouseUp)
  }

  // 生命周期钩子
  onMounted(() => {
    // selector 模式需要 nextTick 等待父组件渲染完成
    if (containerSelector || handleSelector) {
      nextTick(() => setupDragHandle())
    } else {
      setupDragHandle()
    }
  })

  onUnmounted(() => {
    cleanup()
  })

  // 手动更新位置
  function setPosition(x, y) {
    const constrained = constrainPosition(x, y)
    position.value = constrained

    // 持久化
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(position.value))
      } catch {}
    }
  }

  // 重置到初始位置
  function resetPosition() {
    setPosition(initialPosition.x, initialPosition.y)
  }

  return {
    position,
    isDragging,
    setPosition,
    resetPosition,
  }
}
