/**
 * PromptCraft — 多服务 API 配置面板
 * 使用 Vue 3 重构版本
 */

import { api } from '../../../../scripts/api.js';

let _vueModule = null;
let _isLoading = false;

async function loadVueModule() {
    if (_vueModule) return _vueModule;
    if (_isLoading) {
        // 等待加载完成
        return new Promise((resolve) => {
            const check = () => {
                if (_vueModule) resolve(_vueModule);
                else setTimeout(check, 50);
            };
            check();
        });
    }

    _isLoading = true;
    try {
        _vueModule = await import('./promptcraft-vue.js');
        return _vueModule;
    } catch (e) {
        console.error('[PromptCraft] Failed to load Vue module:', e);
        // 回退到原生实现
        return null;
    } finally {
        _isLoading = false;
    }
}

export async function openServiceConfigModal() {
    const vueModule = await loadVueModule();

    if (vueModule && vueModule.openServiceConfigModal) {
        // 使用 Vue 组件
        vueModule.openServiceConfigModal(api);
    } else {
        // 回退：使用原生实现（如果 Vue 加载失败）
        console.warn('[PromptCraft] Vue module not available, falling back to native implementation');
        openServiceConfigModalNative();
    }
}

// 原生实现作为回退
function openServiceConfigModalNative() {
    // 动态加载原生实现
    import('./service_config_native.js').then(module => {
        module.openServiceConfigModal();
    }).catch(e => {
        console.error('[PromptCraft] Failed to load native implementation:', e);
    });
}
