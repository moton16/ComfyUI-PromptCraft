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
        _vueModule = await import('./promptcraft-vue.js');
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

export async function mountToastVue() {
    const vueModule = await loadVueModule();
    if (vueModule && vueModule.mountToast) {
        vueModule.mountToast();
    } else {
        console.warn('[PromptCraft] Vue module not available, toast system not mounted');
    }
}

export async function createSettingsContentVue() {
    const vueModule = await loadVueModule();
    if (vueModule && vueModule.createSettingsContent) {
        const container = vueModule.createSettingsContent(api);
        return container;
    } else {
        console.warn('[PromptCraft] Vue module not available');
        return null;
    }
}

export async function createAgentPanelVue(container, node, options = {}) {
    const vueModule = await loadVueModule();
    if (vueModule && vueModule.createAgentPanel) {
        return vueModule.createAgentPanel(container, node, options);
    } else {
        console.warn('[PromptCraft] Vue module not available');
        return null;
    }
}

export async function openAgentFloatingVue(node) {
    const vueModule = await loadVueModule();
    if (vueModule && vueModule.openAgentFloating) {
        vueModule.openAgentFloating(node);
    } else {
        console.warn('[PromptCraft] Vue module not available');
    }
}

export async function openHubPanelVue(node, options = {}) {
    const vueModule = await loadVueModule();
    if (vueModule && vueModule.openHubPanel) {
        vueModule.openHubPanel(node, { ...options, comfyApi: api });
    } else {
        console.warn('[PromptCraft] Vue module not available');
    }
}

export function closeHubPanelVue() {
    if (_vueModule && _vueModule.closeHubPanel) {
        _vueModule.closeHubPanel();
    }
}
