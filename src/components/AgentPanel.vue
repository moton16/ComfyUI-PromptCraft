<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from '../composables/useI18n.js'

const props = defineProps({
  node: { type: Object, default: null },
  mode: { type: String, default: 'hub' }, // 'hub' | 'floating'
  onClose: { type: Function, default: () => {} },
  executor: { type: Object, default: null }, // Executor 模块
  renderStack: { type: Function, default: null }, // 渲染栈函数
})

const emit = defineEmits(['close'])

const { t } = useI18n()

// 对话状态
const messages = ref([])
const inputText = ref('')
const status = reactive({ message: t('agent.status.ready'), type: 'ready' })
const messagesEl = ref(null)

// 快捷指令
const shortcuts = [
  { label: t('agent.shortcut_status'), cmd: '显示当前节点的状态' },
  { label: t('agent.shortcut_clear'), cmd: '清空所有 LoRA' },
  { label: t('agent.shortcut_help'), cmd: '你能做什么？' },
]

// 操作标签映射
const actionLabels = {
  lora_add: t('agent.action.lora_add'),
  lora_remove: t('agent.action.lora_remove'),
  lora_toggle: t('agent.action.lora_toggle'),
  lora_weight: t('agent.action.lora_weight'),
  checkpoint: t('agent.action.checkpoint'),
  prompt_set: t('agent.action.prompt_set'),
  category_set: t('agent.action.category_set'),
  query: t('agent.action.query'),
}

// 获取操作标签
function getActionLabel(action) {
  return actionLabels[action] || action
}

// 发送指令
async function sendInstruction(instruction) {
  if (!instruction.trim()) return

  // 添加用户消息
  messages.value.push({ role: 'user', content: instruction })
  inputText.value = ''
  scrollToBottom()

  // 更新状态
  status.message = t('agent.thinking')
  status.type = 'thinking'

  try {
    // 检查 Executor 是否可用
    if (!props.executor) {
      throw new Error('Executor module not available')
    }

    // 构建当前状态
    const currentState = props.executor.buildCurrentState(props.node)

    // 调用 Agent API
    const responseText = await props.executor.callAgent(instruction, currentState)

    // 解析响应
    const parsed = props.executor.parseAgentResponse(responseText)

    if (parsed.error) {
      messages.value.push({ role: 'assistant', content: `${t('common.error')}: ${parsed.error}` })
    } else if (parsed.clarification) {
      messages.value.push({ role: 'assistant', content: parsed.clarification })
    } else if (parsed.operations) {
      // 执行操作
      const results = props.executor.executeOperations(parsed.operations, props.node)

      // 刷新画布
      if (props.node && props.renderStack) {
        props.renderStack(props.node)
      }

      // 构建回复文本
      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length
      let replyText = ''
      if (successCount > 0) {
        replyText += t('agent.ops_executed', { count: successCount })
      }
      if (failCount > 0) {
        replyText += ` ${t('agent.ops_failed', { count: failCount })}`
      }

      messages.value.push({ role: 'assistant', content: replyText, operations: results })
    }

    status.message = t('agent.status.ready')
    status.type = 'ready'

  } catch (e) {
    const errMsg = t('agent.request_failed', { error: e.message })
    messages.value.push({ role: 'assistant', content: errMsg })
    status.message = t('common.error')
    status.type = 'error'
  }

  scrollToBottom()
}

// 处理发送
function handleSend() {
  sendInstruction(inputText.value)
}

// 处理快捷指令
function handleShortcut(cmd) {
  sendInstruction(cmd)
}

// 处理键盘事件
function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// 自动调整输入框高度
function adjustTextareaHeight(e) {
  const textarea = e.target
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px'
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}

// 关闭面板
function handleClose() {
  emit('close')
  props.onClose()
}

// 键盘快捷键
function handleGlobalKeydown(e) {
  if (e.key === 'Escape') {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
  scrollToBottom()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <div class="ap-container" :class="{ 'ap-floating': mode === 'floating' }">
    <!-- 浮动模式的标题栏 -->
    <div v-if="mode === 'floating'" class="ap-header">
      <div class="ap-title">PromptCraft Agent</div>
      <button class="ap-close" @click="handleClose">×</button>
    </div>

    <!-- 消息区域 -->
    <div ref="messagesEl" class="ap-messages">
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="ap-welcome">
        <div class="ap-welcome-icon">✦</div>
        <div class="ap-welcome-title">PromptCraft Agent</div>
        <div class="ap-welcome-desc">{{ t('agent.welcome_desc') }}</div>
      </div>

      <!-- 消息列表 -->
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="ap-bubble"
        :class="`ap-${msg.role}`"
      >
        <div class="ap-bubble-label">
          {{ msg.role === 'user' ? t('agent.user_label') : t('agent.agent_label') }}
        </div>
        <div class="ap-bubble-content">{{ msg.content }}</div>

        <!-- 操作结果卡片 -->
        <div
          v-for="(op, opIdx) in (msg.operations || [])"
          :key="opIdx"
          class="ap-op-card"
          :class="op.success ? 'ap-op-success' : 'ap-op-fail'"
        >
          <div class="ap-op-header">
            <span class="ap-op-icon">{{ op.success ? '✓' : '✕' }}</span>
            <span class="ap-op-action">{{ getActionLabel(op.action) }}</span>
          </div>
          <div class="ap-op-message">{{ op.message || '' }}</div>

          <!-- Query 操作的状态详情 -->
          <div v-if="op.action === 'query' && op.state" class="ap-op-detail">
            <div>{{ t('agent.status_model', { model: op.state.checkpoint || '' }) }}</div>
            <div>{{ t('agent.status_lora_count', { count: op.state.stack_count || 0 }) }}</div>
            <div
              v-for="(item, itemIdx) in (op.state.stack_items || [])"
              :key="itemIdx"
              class="ap-op-lora"
            >
              {{ item.enabled ? '☑' : '☐' }} {{ item.name }} ({{ item.weight }}/{{ item.clip_weight }})
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷指令栏 -->
    <div class="ap-quickbar">
      <button
        v-for="s in shortcuts"
        :key="s.cmd"
        class="ap-quick-btn"
        @click="handleShortcut(s.cmd)"
      >
        {{ s.label }}
      </button>
    </div>

    <!-- 输入区域 -->
    <div class="ap-input-area">
      <textarea
        v-model="inputText"
        class="ap-textarea"
        :placeholder="t('agent.placeholder')"
        rows="1"
        @keydown="handleKeydown"
        @input="adjustTextareaHeight"
      />
      <button class="ap-send-btn" @click="handleSend">
        {{ t('agent.send') }}
      </button>
    </div>

    <!-- 状态栏 -->
    <div class="ap-status" :class="`ap-status-${status.type}`">
      {{ status.message }}
    </div>
  </div>
</template>

<style scoped>
.ap-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.ap-floating {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: var(--pc-bg, #1e1e2e);
}

.ap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--pc-border, #333);
  background: var(--pc-surface, #2a2a3e);
}

.ap-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--pc-text, #e0e0e0);
}

.ap-close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--pc-text-2, #999);
  font-size: 18px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
}

.ap-close:hover {
  background: var(--pc-surface-hi, #3a3a4e);
  color: var(--pc-text, #e0e0e0);
}

.ap-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.ap-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.ap-welcome-icon {
  font-size: 32px;
  margin-bottom: 12px;
  color: var(--pc-accent, #c8842a);
}

.ap-welcome-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--pc-text, #e0e0e0);
  margin-bottom: 8px;
}

.ap-welcome-desc {
  font-size: 13px;
  color: var(--pc-text-2, #999);
  max-width: 300px;
  line-height: 1.5;
}

.ap-bubble {
  margin-bottom: 16px;
  max-width: 85%;
}

.ap-user {
  margin-left: auto;
}

.ap-assistant {
  margin-right: auto;
}

.ap-bubble-label {
  font-size: 11px;
  color: var(--pc-text-3, #666);
  margin-bottom: 4px;
}

.ap-user .ap-bubble-label {
  text-align: right;
}

.ap-bubble-content {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.ap-user .ap-bubble-content {
  background: var(--pc-accent, #6c5ce7);
  color: white;
  border-bottom-right-radius: 4px;
}

.ap-assistant .ap-bubble-content {
  background: var(--pc-surface, #2a2a3e);
  color: var(--pc-text, #e0e0e0);
  border-bottom-left-radius: 4px;
}

.ap-op-card {
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12px;
}

.ap-op-success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.ap-op-fail {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.ap-op-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.ap-op-icon {
  font-weight: bold;
}

.ap-op-success .ap-op-icon {
  color: var(--pc-ok, #10b981);
}

.ap-op-fail .ap-op-icon {
  color: var(--pc-err, #ef4444);
}

.ap-op-action {
  font-weight: 500;
  color: var(--pc-text, #e0e0e0);
}

.ap-op-message {
  color: var(--pc-text-2, #999);
}

.ap-op-detail {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--pc-border, #333);
  font-size: 11px;
  color: var(--pc-text-3, #666);
}

.ap-op-lora {
  margin-top: 4px;
}

.ap-quickbar {
  display: flex;
  gap: 6px;
  padding: 8px 16px;
  border-top: 1px solid var(--pc-border, #333);
  overflow-x: auto;
}

.ap-quick-btn {
  padding: 6px 12px;
  background: var(--pc-surface, #2a2a3e);
  border: 1px solid var(--pc-border, #444);
  border-radius: 16px;
  color: var(--pc-text-2, #999);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.ap-quick-btn:hover {
  border-color: var(--pc-accent, #6c5ce7);
  color: var(--pc-text, #e0e0e0);
}

.ap-input-area {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--pc-border, #333);
  background: var(--pc-surface, #2a2a3e);
}

.ap-textarea {
  flex: 1;
  padding: 10px 12px;
  background: var(--comfy-input-bg, #1a1a2e);
  border: 1px solid var(--pc-border, #444);
  border-radius: 8px;
  color: var(--pc-text, #e0e0e0);
  font-size: 13px;
  font-family: inherit;
  resize: none;
  min-height: 40px;
  max-height: 100px;
  transition: border-color 0.15s;
}

.ap-textarea:focus {
  outline: none;
  border-color: var(--pc-accent, #6c5ce7);
}

.ap-send-btn {
  padding: 10px 20px;
  background: var(--pc-accent, #6c5ce7);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.ap-send-btn:hover {
  background: var(--pc-accent-hi, #7c6cf7);
}

.ap-status {
  padding: 8px 16px;
  font-size: 11px;
  color: var(--pc-text-3, #666);
  border-top: 1px solid var(--pc-border, #333);
  text-align: center;
}

.ap-status-thinking {
  color: var(--pc-accent, #c8842a);
}

.ap-status-error {
  color: var(--pc-err, #ef4444);
}
</style>
