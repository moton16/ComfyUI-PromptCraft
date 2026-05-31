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

async function loadVueModule() {
    if (_vueModule) return _vueModule;
    if (_isLoading) {
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
        // 加载 CSS
        loadVueCss();

        // 加载 JS 模块
        _vueModule = await import('./promptcraft-vue.js');
        return _vueModule;
    } catch (e) {
        console.error('[PromptCraft] Failed to load Vue module:', e);
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
    const vueModule = await loadVueModule();
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

export async function mountFloatingPanelVue(callbacks = {}) {
    const vueModule = await loadVueModule();
    if (vueModule && vueModule.mountFloatingPanel) {
        vueModule.mountFloatingPanel(api, callbacks);
    } else {
        console.warn('[PromptCraft] Vue module not available');
    }
}

export function unmountFloatingPanelVue() {
    if (_vueModule && _vueModule.unmountFloatingPanel) {
        _vueModule.unmountFloatingPanel();
    }
}

export function mountToastVue() {
    loadVueModule().then(vueModule => {
        if (vueModule && vueModule.mountToast) {
            vueModule.mountToast();
        }
    });
}
