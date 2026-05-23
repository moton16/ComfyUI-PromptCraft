/**
 * LoRA Group Manager — API 客户端层
 * 封装所有后端 API 调用
 */

import { api } from '../../../../scripts/api.js';

const API_PREFIX = '/moton_prompt_enhancer/api';

async function request(method, endpoint, body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const res = await api.fetchApi(`${API_PREFIX}${endpoint}`, options);
    const json = await res.json();
    if (!json.success) {
        throw new Error(json.error || 'API 请求失败');
    }
    return json.data;
}

// ==================== 群组 CRUD ====================

export async function getGroups() {
    return request('GET', '/lora_groups');
}

export async function getGroup(name) {
    return request('GET', `/lora_groups/${encodeURIComponent(name)}`);
}

export async function createGroup(name, description = '') {
    return request('POST', '/lora_groups/create', { name, description });
}

export async function renameGroup(oldName, newName) {
    return request('POST', '/lora_groups/rename', { old_name: oldName, new_name: newName });
}

export async function deleteGroup(name) {
    return request('POST', '/lora_groups/delete', { name });
}

// ==================== 群组内 LoRA 操作 ====================

export async function addLoraToGroup(group, lora, weight = 1.0, clipWeight = 1.0) {
    return request('POST', '/lora_groups/add_lora', {
        group, lora, weight, clip_weight: clipWeight,
    });
}

export async function removeLoraFromGroup(group, lora) {
    return request('POST', '/lora_groups/remove_lora', { group, lora });
}

export async function updateLoraInGroup(group, lora, updates) {
    return request('POST', '/lora_groups/update_lora', { group, lora, ...updates });
}

export async function reorderLoras(group, order) {
    return request('POST', '/lora_groups/reorder', { group, order });
}

// ==================== LoRA 扫描 ====================

export async function getLoraList() {
    return request('GET', '/lora_scan/list');
}

export async function getLoraFolders() {
    return request('GET', '/lora_scan/folders');
}

export async function searchLoras(query) {
    return request('GET', `/lora_scan/search?q=${encodeURIComponent(query)}`);
}

export async function getLoraMetadata(name) {
    return request('GET', `/lora_scan/metadata?name=${encodeURIComponent(name)}`);
}

export async function getLoraInfo(name) {
    return request('GET', `/lora_scan/info?name=${encodeURIComponent(name)}`);
}

// ==================== LoRA 收藏 ====================

export async function getLoraFavorites() {
    return request('GET', '/lora_favorites');
}

export async function toggleLoraFavorite(loraPath) {
    return request('POST', '/lora_favorites/toggle', { lora: loraPath });
}

// ==================== LoRA Prompt 管理 ====================

export async function getAllLoraPrompts() {
    return request('GET', '/lora_prompts');
}

export async function getLoraPrompts(loraPath) {
    return request('GET', `/lora_prompts/${encodeURIComponent(loraPath)}`);
}

export async function setLoraPrompts(loraPath, groups) {
    return request('POST', `/lora_prompts/${encodeURIComponent(loraPath)}`, { groups });
}

export async function addLoraPromptGroup(loraPath, name, prompts = [], negative = '') {
    return request('POST', `/lora_prompts/${encodeURIComponent(loraPath)}/add_group`, {
        name, prompts, negative,
    });
}

export async function updateLoraPromptGroup(loraPath, groupName, updates) {
    return request('POST', `/lora_prompts/${encodeURIComponent(loraPath)}/update_group`, {
        group_name: groupName, ...updates,
    });
}

export async function deleteLoraPromptGroup(loraPath, groupName) {
    return request('DELETE', `/lora_prompts/${encodeURIComponent(loraPath)}/group/${encodeURIComponent(groupName)}`);
}
