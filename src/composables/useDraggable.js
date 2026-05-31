// 拖拽 composable
// 为浮动面板提供拖拽功能

import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 拖拽功能 composable
 * @param {Object} options
 * @param {import('vue').Ref<HTMLElement>} options.elementRef - 要拖拽的元素引用
 * @param {import('vue').Ref<HTMLElement>} [options.handleRef] - 拖拽把手引用（默认使用 elementRef）
 * @param {Object} [options.initialPosition] - 初始位置 { x, y }
 * @param {boolean} [options.constrainToViewport=true] - 是否限制在视口内
 * @param {function} [options.onDragEnd] - 拖拽结束回调
 */
export function useDraggable(options = {}) {
  const {
    elementRef,
    handleRef,
    initialPosition = { x: 20, y: 20 },
    constrainToViewport = true,
    onDragEnd,
  } = options

  const position = ref({ ...initialPosition })
  const isDragging = ref(false)

  let startX = 0
  let startY = 0
  let startLeft = 0
  let startTop = 0

  function getEventPos(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    return { x: e.clientX, y: e.clientY }
  }

  function constrainPosition(x, y) {
    if (!constrainToViewport || !elementRef.value) {
      return { x, y }
    }

    const rect = elementRef.value.getBoundingClientRect()
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

  // 设置拖拽把手
  function setupDragHandle() {
    const handle = handleRef?.value || elementRef.value
    if (handle) {
      handle.addEventListener('mousedown', onMouseDown)
      handle.addEventListener('touchstart', onMouseDown, { passive: false })
    }
  }

  // 清理事件监听
  function cleanup() {
    const handle = handleRef?.value || elementRef.value
    if (handle) {
      handle.removeEventListener('mousedown', onMouseDown)
      handle.removeEventListener('touchstart', onMouseDown)
    }

    // 确保清理全局监听
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('touchmove', onMouseMove)
    document.removeEventListener('touchend', onMouseUp)
  }

  // 生命周期钩子
  onMounted(() => {
    setupDragHandle()
  })

  onUnmounted(() => {
    cleanup()
  })

  // 手动更新位置
  function setPosition(x, y) {
    const constrained = constrainPosition(x, y)
    position.value = constrained
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
