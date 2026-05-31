// StackAPI 桥接 composable
// 将 stack_api.js 的命令式 API 转换为 Vue 响应式数据

import { ref, onUnmounted } from 'vue'
import * as StackAPI from '../../js/lora_group/stack_api.js'

/**
 * 响应式监听节点的 LoRA 栈
 * @param {string|import('vue').Ref<string>} nodeId - 节点 ID 或响应式节点 ID
 * @returns {{ items: import('vue').Ref<Array>, refresh: function }}
 */
export function useStack(nodeId) {
  // 支持传入 ref 或普通值
  const getNodeId = typeof nodeId === 'object' && nodeId.value !== undefined
    ? () => nodeId.value
    : () => nodeId

  const items = ref(StackAPI.getStack(getNodeId()).items)

  // 订阅变化
  const unsub = StackAPI.onChange((changedNodeId) => {
    if (changedNodeId === getNodeId()) {
      // 创建新数组触发响应式更新
      items.value = [...StackAPI.getStack(getNodeId()).items]
    }
  })

  // 组件卸载时取消订阅
  onUnmounted(unsub)

  // 手动刷新
  const refresh = () => {
    items.value = [...StackAPI.getStack(getNodeId()).items]
  }

  return { items, refresh }
}

/**
 * 暴露 StackAPI 的操作方法（包装为自动刷新版本）
 * @param {string|import('vue').Ref<string>} nodeId
 */
export function useStackActions(nodeId) {
  const getNodeId = typeof nodeId === 'object' && nodeId.value !== undefined
    ? () => nodeId.value
    : () => nodeId

  return {
    addLora: (loraPath, weight, clipWeight) =>
      StackAPI.addLora(getNodeId(), loraPath, weight, clipWeight),

    addGroup: (groupName, weight, clipWeight) =>
      StackAPI.addGroup(getNodeId(), groupName, weight, clipWeight),

    removeItem: (itemId) =>
      StackAPI.removeItem(getNodeId(), itemId),

    toggleEnabled: (itemId) =>
      StackAPI.toggleEnabled(getNodeId(), itemId),

    updateWeight: (itemId, weight, clipWeight) =>
      StackAPI.updateWeight(getNodeId(), itemId, weight, clipWeight),

    reorder: (fromIdx, toIdx) =>
      StackAPI.reorder(getNodeId(), fromIdx, toIdx),

    setSelectedGroup: (itemId, groupName) =>
      StackAPI.setSelectedGroup(getNodeId(), itemId, groupName),

    updateNote: (itemId, note) =>
      StackAPI.updateNote(getNodeId(), itemId, note),

    expandGroup: (groupName) =>
      StackAPI.expandGroupIntoStack(getNodeId(), groupName),

    serialize: () =>
      StackAPI.serialize(getNodeId()),

    restore: (widgetValue) =>
      StackAPI.restoreStack(getNodeId(), widgetValue),
  }
}

/**
 * 完整的栈管理 composable（数据 + 操作）
 */
export function useLoraStack(nodeId) {
  const { items, refresh } = useStack(nodeId)
  const actions = useStackActions(nodeId)

  return {
    items,
    refresh,
    ...actions,
  }
}
