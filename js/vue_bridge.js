/**
 * PromptCraft — Vue 桥接模块
 * 负责加载 Vue 模块并提供给原生 JS 调用
 */

import { api } from '../../../scripts/api.js';

let _vueModule = null;
let _isLoading = false;
let _cssLoaded = false;

function loadVueCss() {
    if (_cssLoaded) return;
    _cssLoaded = true;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = new URL('./promptcraft-vue.css', import.meta.url).href;
    document.head.appendChild(link);
}

let _loadError = null;

async function loadVueModule() {
    if (_vueModule) return _vueModule;
    if (_isLoading) {
        // 等待正在进行的加载完成（成功或失败）
        return new Promise((resolve, reject) => {
            const check = () => {
                if (_vueModule) resolve(_vueModule);
                else if (_loadError) reject(_loadError);
                else setTimeout(check, 50);
            };
            check();
        });
    }

    // 如果上次加载失败，清除错误状态并重试
    if (_loadError) {
        _loadError = null;
    }

    _isLoading = true;
    try {
        // 加载 CSS
        loadVueCss();

        // 加载 JS 模块
        console.log('[PromptCraft DEBUG] Loading Vue module...');
        _vueModule = await import('./promptcraft-vue.js');
        console.log('[PromptCraft DEBUG] Vue module loaded:', _vueModule ? Object.keys(_vueModule).join(', ') : 'NULL');
        return _vueModule;
    } catch (e) {
        console.error('[PromptCraft] Failed to load Vue module:', e);
        _loadError = e;
        return null;
    } finally {
        _isLoading = false;
    }
}

export async function openNegativePromptEditorVue() {
    const vueModule = await loadVueModule();
    if (vueModule && vueModule.openNegativePromptEditor) {
        vueModule.openNegativePromptEditor(api);
    } else {
        console.warn('[PromptCraft] Vue module not available');
    }
}

export async function openRuleManagerVue() {
    console.log('[PromptCraft DEBUG] openRuleManagerVue called');
    const vueModule = await loadVueModule();
    console.log('[PromptCraft DEBUG] Vue module:', vueModule ? 'loaded' : 'NULL', vueModule?.openRuleManager ? 'has openRuleManager' : 'MISSING openRuleManager');
    if (vueModule && vueModule.openRuleManager) {
        vueModule.openRuleManager(api);
    } else {
        console.warn('[PromptCraft] Vue module not available');
    }
}

export async function openServiceConfigModalVue() {
    const vueModule = await loadVueModule();
    if (vueModule && vueModule.openServiceConfigModal) {
        vueModule.openServiceConfigModal(api);
    } else {
        console.warn('[PromptCraft] Vue module not available');
    }
}

export async function openLibraryEditorVue() {
    const vueModule = await loadVueModule();
    if (vueModule && vueModule.openLibraryEditor) {
        vueModule.openLibraryEditor(api);
    } else {
        console.warn('[PromptCraft] Vue module not available');
    }
}

export async function openPromptHistoryVue() {
    const vueModule = await loadVueModule();
    if (vueModule && vueModule.openPromptHistory) {
        vueModule.openPromptHistory(api);
    } else {
        console.warn('[PromptCraft] Vue module not available');
    }
}

export async function mountToastVue() {
    const vueModule = await loadVueModule();
    if (vueModule && vueModule.mountToast) {
        vueModule.mountToast();
    } else {
        console.warn('[PromptCraft] Vue module not available, toast system not mounted');
    }
}
