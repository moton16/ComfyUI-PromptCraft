/**
 * PromptCraft — 多服务 API 配置面板
 * 委托给 vue_bridge.js 统一管理 Vue 模块加载
 */

import { openServiceConfigModalVue } from '../vue_bridge.js';

export async function openServiceConfigModal() {
    await openServiceConfigModalVue();
}
