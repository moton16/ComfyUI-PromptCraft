/**
 * PromptCraft i18n 模块
 * 零依赖 ES 模块，提供前端 UI 多语言支持
 */

const STORAGE_KEY = 'promptcraft-lang';
let currentLang = 'zh';
let translations = {};
let _listeners = [];

/**
 * 初始化 i18n：检测语言并加载翻译文件
 */
export async function initI18n() {
    currentLang = detectLang();
    try {
        const resp = await fetch(`./extensions/ComfyUI-PromptCraft/i18n/${currentLang}.json`);
        if (resp.ok) {
            translations = await resp.json();
        } else {
            console.warn(`[i18n] Failed to load ${currentLang}.json, status: ${resp.status}`);
            if (currentLang !== 'zh') {
                const fallback = await fetch('./extensions/ComfyUI-PromptCraft/i18n/zh.json');
                if (fallback.ok) translations = await fallback.json();
            }
        }
    } catch (e) {
        console.warn('[i18n] Load error:', e);
    }
}

/**
 * 翻译函数
 * @param {string} key - 翻译 key（如 'common.save'）
 * @param {Object} [params] - 插值参数（如 { error: 'timeout' }）
 * @returns {string}
 */
export function t(key, params) {
    let val = translations[key];
    if (val === undefined) {
        // key 未找到时返回 key 本身，便于排查
        return key;
    }
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            val = val.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
        }
    }
    return val;
}

/**
 * 获取当前语言
 * @returns {'zh' | 'en'}
 */
export function getLang() {
    return currentLang;
}

/**
 * 切换语言并刷新页面
 * @param {'zh' | 'en'} lang
 */
export function setLang(lang) {
    if (lang !== 'zh' && lang !== 'en') return;
    localStorage.setItem(STORAGE_KEY, lang);
    window.dispatchEvent(new CustomEvent('promptcraft:lang-changed', { detail: { lang } }));
    location.reload();
}

/**
 * 注册语言切换回调（用于非页面刷新场景的细粒度更新）
 * @param {Function} callback
 * @returns {Function} 取消注册函数
 */
export function onLangChange(callback) {
    _listeners.push(callback);
    return () => {
        _listeners = _listeners.filter(fn => fn !== callback);
    };
}

/**
 * 检测语言偏好
 * 优先级: localStorage → navigator.language → 默认 'zh'
 */
function detectLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'zh' || stored === 'en') return stored;

    const nav = navigator.language || navigator.userLanguage || '';
    if (nav.startsWith('zh')) return 'zh';
    return 'zh'; // 默认中文，保持向后兼容
}
