/**
 * LoRA Stack API — 前端栈状态管理层
 * 管理节点的 LoRA 栈（个体 + 群组混合），序列化到隐藏 widget
 */

import * as GroupAPI from './api.js';

// 节点栈状态缓存 { nodeId: { items: [...] } }
const stacks = {};

/**
 * 生成唯一 ID
 */
function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * 获取或初始化节点的栈
 */
export function getStack(nodeId) {
    if (!stacks[nodeId]) {
        stacks[nodeId] = { items: [] };
    }
    return stacks[nodeId];
}

/**
 * 从隐藏 widget 值恢复栈
 */
export function restoreStack(nodeId, widgetValue) {
    try {
        const data = typeof widgetValue === 'string' ? JSON.parse(widgetValue) : widgetValue;
        stacks[nodeId] = { items: data.items || [] };
    } catch {
        stacks[nodeId] = { items: [] };
    }
    return stacks[nodeId];
}

/**
 * 添加个体 LoRA 到栈
 */
export function addLora(nodeId, loraPath, weight = 1.0, clipWeight = 1.0) {
    const stack = getStack(nodeId);
    // 避免重复
    if (stack.items.some(i => i.type === 'lora' && i.lora === loraPath)) {
        return false;
    }
    stack.items.push({
        id: uid(),
        type: 'lora',
        lora: loraPath,
        weight,
        clip_weight: clipWeight,
        enabled: true,
        selected_group: null,
        note: '',
    });
    return true;
}

/**
 * 添加群组引用到栈
 */
export function addGroup(nodeId, groupName, weight = 1.0, clipWeight = 1.0) {
    const stack = getStack(nodeId);
    if (stack.items.some(i => i.type === 'group' && i.group_name === groupName)) {
        return false;
    }
    stack.items.push({
        id: uid(),
        type: 'group',
        group_name: groupName,
        weight,
        clip_weight: clipWeight,
        enabled: true,
        expanded: false,
    });
    return true;
}

/**
 * 移除栈条目
 */
export function removeItem(nodeId, itemId) {
    const stack = getStack(nodeId);
    stack.items = stack.items.filter(i => i.id !== itemId);
}

/**
 * 切换启用状态
 */
export function toggleEnabled(nodeId, itemId) {
    const stack = getStack(nodeId);
    const item = stack.items.find(i => i.id === itemId);
    if (item) {
        item.enabled = !item.enabled;
        return item.enabled;
    }
    return null;
}

/**
 * 更新权重
 */
export function updateWeight(nodeId, itemId, weight, clipWeight) {
    const stack = getStack(nodeId);
    const item = stack.items.find(i => i.id === itemId);
    if (item) {
        if (weight !== undefined) item.weight = weight;
        if (clipWeight !== undefined) item.clip_weight = clipWeight;
    }
}

/**
 * 重排序
 */
export function reorder(nodeId, fromIdx, toIdx) {
    const stack = getStack(nodeId);
    const [item] = stack.items.splice(fromIdx, 1);
    stack.items.splice(toIdx, 0, item);
}

/**
 * 设置 LoRA 选中的 prompt 组
 */
export function setSelectedGroup(nodeId, itemId, groupName) {
    const stack = getStack(nodeId);
    const item = stack.items.find(i => i.id === itemId);
    if (item) {
        item.selected_group = (groupName === '' ? null : groupName);
    }
}

/**
 * 更新备注
 */
export function updateNote(nodeId, itemId, note) {
    const stack = getStack(nodeId);
    const item = stack.items.find(i => i.id === itemId);
    if (item) {
        item.note = note;
    }
}

/**
 * 获取显示名称：优先使用备注名，没有备注则使用原文件名
 */
export function getDisplayName(nodeId, itemId) {
    const stack = getStack(nodeId);
    const item = stack.items.find(i => i.id === itemId);
    if (!item) return '';

    if (item.type === 'group') {
        return item.group_name;
    }

    if (item.note && item.note.trim()) {
        return item.note.trim();
    }

    return item.lora.split('/').pop().replace(/\.safetensors$/, '');
}

/**
 * 获取显示名称（直接从item对象）
 */
export function getDisplayNameFromItem(item) {
    if (!item) return '';

    if (item.type === 'group') {
        return item.group_name;
    }

    if (item.note && item.note.trim()) {
        return item.note.trim();
    }

    return item.lora.split('/').pop().replace(/\.safetensors$/, '');
}

/**
 * 序列化栈为 JSON 字符串（写入隐藏 widget）
 */
export function serialize(nodeId) {
    const stack = getStack(nodeId);
    return JSON.stringify(stack);
}

/**
 * 将群组展开为个体 LoRA 并加入栈
 */
export async function expandGroupIntoStack(nodeId, groupName) {
    try {
        const group = await GroupAPI.getGroup(groupName);
        const loras = group.loras || [];
        for (const lora of loras) {
            addLora(nodeId, lora.lora, lora.weight, lora.clip_weight);
            if (lora.enabled === false) {
                // 找到刚添加的条目并禁用
                const stack = getStack(nodeId);
                const last = stack.items[stack.items.length - 1];
                last.enabled = false;
            }
        }
        return true;
    } catch (e) {
        console.error('[PromptCraft] 展开群组失败:', e);
        return false;
    }
}

/**
 * 获取群组列表（供添加菜单使用）
 */
export async function getAvailableGroups() {
    try {
        return await GroupAPI.getGroups();
    } catch {
        return {};
    }
}
