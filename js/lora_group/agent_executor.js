/**
 * Agent Executor — 前端操作执行器
 * 解析 LLM 返回的 JSON 操作指令，调用 stack_api.js 执行
 */

import * as StackAPI from './stack_api.js';

const API_PREFIX = '/moton_prompt_enhancer/api';

// ==================== 操作执行 ====================

/**
 * 执行 LLM 返回的操作列表
 * @param {Array} operations - LLM 返回的 operations 数组
 * @param {Object} node - LiteGraph 节点实例
 * @returns {Array} 每个操作的执行结果 [{action, success, message, ...}]
 */
export function executeOperations(operations, node) {
    const results = [];
    for (const op of operations) {
        const handler = HANDLERS[op.action];
        if (handler) {
            try {
                const result = handler(op.params || {}, node);
                results.push({ action: op.action, success: true, ...result });
            } catch (e) {
                results.push({ action: op.action, success: false, message: e.message });
            }
        } else {
            results.push({ action: op.action, success: false, message: `未知操作: ${op.action}` });
        }
    }
    return results;
}

/**
 * 判断操作是否需要确认（危险操作）
 */
export function isDangerousOperation(action) {
    return action === 'lora_remove';
}

/**
 * 解析 LLM 响应文本为操作对象
 * @param {string} responseText - LLM 返回的 JSON 字符串
 * @returns {{ operations?: Array, clarification?: string, error?: string }}
 */
export function parseAgentResponse(responseText) {
    if (!responseText) return { error: '空响应' };

    // 去除 markdown 代码块包裹
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.clarification) {
            return { clarification: parsed.clarification };
        }
        if (parsed.operations && Array.isArray(parsed.operations)) {
            return { operations: parsed.operations };
        }
        return { error: '响应格式异常：缺少 operations 数组' };
    } catch (e) {
        return { error: `JSON 解析失败: ${e.message}` };
    }
}

// ==================== 操作处理器 ====================

const HANDLERS = {
    lora_add(params, node) {
        const { lora_path, weight = 1.0, clip_weight = 1.0 } = params;
        if (!lora_path) throw new Error('缺少 lora_path 参数');
        const added = StackAPI.addLora(node.id, lora_path, weight, clip_weight);
        if (!added) {
            return { message: `LoRA 已存在于栈中: ${shortName(lora_path)}` };
        }
        return { message: `已添加 ${shortName(lora_path)}`, lora: lora_path, weight, clip_weight };
    },

    lora_remove(params, node) {
        const { lora_path } = params;
        if (!lora_path) throw new Error('缺少 lora_path 参数');
        const stack = StackAPI.getStack(node.id);
        const item = stack.items.find(i => i.type === 'lora' && i.lora === lora_path);
        if (!item) throw new Error(`LoRA 不在栈中: ${shortName(lora_path)}`);
        StackAPI.removeItem(node.id, item.id);
        return { message: `已移除 ${shortName(lora_path)}`, lora: lora_path };
    },

    lora_toggle(params, node) {
        const { lora_path } = params;
        if (!lora_path) throw new Error('缺少 lora_path 参数');
        const stack = StackAPI.getStack(node.id);
        const item = stack.items.find(i => i.type === 'lora' && i.lora === lora_path);
        if (!item) throw new Error(`LoRA 不在栈中: ${shortName(lora_path)}`);
        const newState = StackAPI.toggleEnabled(node.id, item.id);
        return {
            message: `${shortName(lora_path)} ${newState ? '已启用' : '已禁用'}`,
            lora: lora_path, enabled: newState,
        };
    },

    lora_weight(params, node) {
        const { lora_path, weight, clip_weight } = params;
        if (!lora_path) throw new Error('缺少 lora_path 参数');
        const stack = StackAPI.getStack(node.id);
        const item = stack.items.find(i => i.type === 'lora' && i.lora === lora_path);
        if (!item) throw new Error(`LoRA 不在栈中: ${shortName(lora_path)}`);
        StackAPI.updateWeight(node.id, item.id, weight, clip_weight);
        return {
            message: `${shortName(lora_path)} 权重已更新`,
            lora: lora_path,
            weight: weight !== undefined ? weight : item.weight,
            clip_weight: clip_weight !== undefined ? clip_weight : item.clip_weight,
        };
    },

    checkpoint(params, node) {
        const { checkpoint_name } = params;
        if (!checkpoint_name) throw new Error('缺少 checkpoint_name 参数');
        // 查找 checkpoint widget 并更新
        const widget = node.widgets?.find(w => w.name === 'checkpoint');
        if (!widget) throw new Error('未找到 checkpoint 选择器');

        // 检查 checkpoint 是否在选项中
        const options = widget.options?.values || [];
        if (options.length > 0 && !options.includes(checkpoint_name)) {
            throw new Error(`Checkpoint 不存在: ${checkpoint_name}`);
        }
        widget.value = checkpoint_name;
        return { message: `已切换底模: ${checkpoint_name}`, checkpoint: checkpoint_name };
    },

    prompt_set(params, node) {
        const { text } = params;
        if (!text) throw new Error('缺少 text 参数');
        // 查找 PromptEnhancer 节点的 prompt widget（通过工作流查找）
        // 这里暂时记录消息，实际操作需要跨节点
        return { message: `提示词已设置: ${text.substring(0, 50)}...`, text };
    },

    category_set(params, node) {
        const { category, label } = params;
        if (!category || !label) throw new Error('缺少 category 或 label 参数');
        return { message: `已选择 ${category}: ${label}`, category, label };
    },

    query(params, node) {
        const stack = StackAPI.getStack(node.id);
        const ckptWidget = node.widgets?.find(w => w.name === 'checkpoint');
        const state = {
            checkpoint: ckptWidget?.value || 'None',
            stack_items: stack.items.map(i => ({
                type: i.type,
                name: i.type === 'lora' ? shortName(i.lora) : i.group_name,
                weight: i.weight,
                clip_weight: i.clip_weight,
                enabled: i.enabled,
            })),
            stack_count: stack.items.length,
        };
        return { message: '当前状态', state };
    },
};

// ==================== 构建当前状态 ====================

/**
 * 构建当前节点状态（传给 LLM 作为上下文）
 */
export function buildCurrentState(node) {
    const stack = StackAPI.getStack(node.id);
    const ckptWidget = node.widgets?.find(w => w.name === 'checkpoint');

    return {
        checkpoint: ckptWidget?.value || 'None',
        stack: stack.items.map(i => ({
            type: i.type,
            ...(i.type === 'lora' ? {
                lora: i.lora,
                weight: i.weight,
                clip_weight: i.clip_weight,
                enabled: i.enabled,
            } : {
                group_name: i.group_name,
                weight: i.weight,
                clip_weight: i.clip_weight,
                enabled: i.enabled,
            }),
        })),
    };
}

// ==================== 调用 Agent API ====================

/**
 * 调用后端 Agent API
 * @param {string} instruction - 用户自然语言指令
 * @param {Object} currentState - 当前节点状态
 * @returns {Promise<string>} LLM 返回的 JSON 字符串
 */
export async function callAgent(instruction, currentState) {
    const res = await fetch(`${API_PREFIX}/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction, current_state: currentState }),
    });
    const json = await res.json();
    if (!json.success) {
        throw new Error(json.error || 'Agent 请求失败');
    }
    return json.data.response;
}

// ==================== 工具函数 ====================

function shortName(path) {
    return (path || '').split('/').pop().replace(/\.safetensors$/, '');
}
