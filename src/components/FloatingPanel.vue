<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useDraggable } from '../composables/useDraggable.js'
import { useI18n } from '../composables/useI18n.js'

const props = defineProps({
  comfyApi: { type: Object, required: true },
  onOpenRuleManager: { type: Function, required: true },
  onOpenLibraryEditor: { type: Function, required: true },
  onOpenPromptHistory: { type: Function, required: true },
  onOpenHubPanel: { type: Function, required: true },
})

const emit = defineEmits(['close'])

const { t } = useI18n()

// 状态
const isExpanded = ref(false)
const showContextMenu = ref(false)
const contextMenuPosition = reactive({ x: 0, y: 0 })

// 拖拽功能
const { position, isDragging, setPosition } = useDraggable({
  containerSelector: '.fp-container',
  handleSelector: '.fp-gear',
  storageKey: 'moton-pe-panel-state',
  initialPosition: {
    x: Math.min(window.innerWidth - 56, window.innerWidth - 40),
    y: Math.min(window.innerHeight - 56, window.innerHeight - 40)
  }
})

// 快捷按钮
const quickButtons = [
  { text: t('panel.rules'), action: 'ruleManager' },
  { text: t('panel.library'), action: 'libraryEditor' },
  { text: t('panel.history'), action: 'promptHistory' },
  { text: t('panel.lora_hub'), action: 'hubPanel' },
]

// 切换展开/折叠
function toggleExpand() {
  if (isDragging.value) return
  isExpanded.value = !isExpanded.value
}

// 执行快捷操作
function executeAction(action) {
  isExpanded.value = false
  switch (action) {
    case 'ruleManager':
      props.onOpenRuleManager()
      break
    case 'libraryEditor':
      props.onOpenLibraryEditor()
      break
    case 'promptHistory':
      props.onOpenPromptHistory()
      break
    case 'hubPanel':
      props.onOpenHubPanel()
      break
  }
}

// 显示右键菜单（带视口边界检测）
function showMenu(e) {
  e.preventDefault()
  const menuWidth = 140
  const menuHeight = 36
  contextMenuPosition.x = Math.min(e.clientX, window.innerWidth - menuWidth - 8)
  contextMenuPosition.y = Math.min(e.clientY, window.innerHeight - menuHeight - 8)
  showContextMenu.value = true
}

// 关闭右键菜单
function closeMenu() {
  showContextMenu.value = false
}

// 关闭浮窗
function closePanel() {
  localStorage.setItem('moton-pe-panel-hidden', 'true')
  closeMenu()
  emit('close')
  alert(t('panel.closed_alert'))
}

// 点击外部关闭菜单
function handleClickOutside(e) {
  if (showContextMenu.value) {
    const menu = document.querySelector('.fp-context-menu')
    if (menu && !menu.contains(e.target)) {
      closeMenu()
    }
  }
}

// 键盘快捷键
function handleKeydown(e) {
  if (e.key === 'Escape') {
    if (showContextMenu.value) {
      closeMenu()
    } else if (isExpanded.value) {
      isExpanded.value = false
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    class="fp-container"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`,
      cursor: isDragging ? 'grabbing' : 'grab'
    }"
    @contextmenu="showMenu"
  >
    <!-- 齿轮按钮 -->
    <div
      class="fp-gear"
      :class="{ 'fp-gear-expanded': isExpanded }"
      @click.stop="toggleExpand"
      @touchstart.stop.prevent="toggleExpand"
    >
      {{ isExpanded ? '▼' : '◆' }}
    </div>

    <!-- 展开的面板 -->
    <Transition name="fp-panel">
      <div v-if="isExpanded" class="fp-panel">
        <div class="fp-title">◆ PromptCraft</div>

        <button
          v-for="btn in quickButtons"
          :key="btn.action"
          class="fp-btn"
          @click.stop="executeAction(btn.action)"
        >
          {{ btn.text }}
        </button>

        <button class="fp-close" @click.stop="isExpanded = false">
          ✕
        </button>
      </div>
    </Transition>

    <!-- 右键菜单 -->
    <Transition name="fp-menu">
      <div
        v-if="showContextMenu"
        class="fp-context-menu"
        :style="{
          left: `${contextMenuPosition.x}px`,
          top: `${contextMenuPosition.y}px`
        }"
      >
        <div class="fp-menu-item" @click="closePanel">
          {{ t('panel.close_floating') }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fp-container {
  position: fixed;
  z-index: 999999;
  user-select: none;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.fp-gear {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.12);
  color: rgba(200, 132, 42, 0.4);
  font-size: 15px;
  line-height: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s;
  opacity: 0.35;
}

.fp-gear:hover {
  opacity: 1;
  background: #fff;
  color: #c8842a;
  border-color: rgba(200, 132, 42, 0.4);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.fp-gear-expanded {
  opacity: 1;
  background: #fff;
  color: #c8842a;
  border-color: rgba(200, 132, 42, 0.4);
}

.fp-panel {
  position: absolute;
  bottom: 38px;
  right: 0;
  background: var(--pc-surface, #fff);
  border: 1px solid var(--pc-border, #e0e0e0);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  min-width: 200px;
}

.fp-title {
  color: var(--pc-accent, #c8842a);
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.fp-btn {
  padding: 5px 12px;
  background: transparent;
  color: var(--pc-text-2, #888);
  border: 1px solid transparent;
  border-radius: 5px;
  cursor: pointer;
  font-size: 11.5px;
  white-space: nowrap;
  text-align: left;
  width: 100%;
  transition: all 0.15s;
  font-family: inherit;
}

.fp-btn:hover {
  background: var(--pc-surface-hi, #f5f5f5);
  color: var(--pc-text, #333);
  border-color: var(--pc-border, #e0e0e0);
}

.fp-close {
  padding: 3px 10px;
  background: transparent;
  color: var(--pc-text-3, #ccc);
  border: 1px solid var(--pc-border, #e0e0e0);
  border-radius: 5px;
  cursor: pointer;
  font-size: 11px;
  align-self: flex-end;
  margin-top: 2px;
  transition: all 0.15s;
}

.fp-close:hover {
  color: var(--pc-text, #333);
  border-color: var(--pc-text-3, #ccc);
}

.fp-context-menu {
  position: fixed;
  z-index: 1000001;
  background: var(--pc-surface, #fff);
  border: 1px solid var(--pc-border, #e0e0e0);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  min-width: 140px;
}

.fp-menu-item {
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
  color: var(--pc-text-2, #666);
  border-radius: 4px;
  transition: all 0.15s;
}

.fp-menu-item:hover {
  background: var(--pc-surface-hi, #f5f5f5);
  color: var(--pc-text, #333);
}

/* 动画 */
.fp-panel-enter-active {
  transition: all 0.2s ease;
}

.fp-panel-leave-active {
  transition: all 0.2s ease;
}

.fp-panel-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fp-panel-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fp-menu-enter-active {
  transition: all 0.15s ease;
}

.fp-menu-leave-active {
  transition: all 0.15s ease;
}

.fp-menu-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.fp-menu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
