/**
 * PromptCraft i18n 模块
 * 零依赖 ES 模块，提供前端 UI 多语言支持
 */

const STORAGE_KEY = 'promptcraft-lang';
let currentLang = 'zh';
let translations = {};
let _listeners = [];

/**
 * 推导 i18n JSON 的基础 URL
 * 策略：遍历所有 <script> 标签，找到加载 i18n.js 的那个，取其 src 推导
 */
function getI18nBaseUrl() {
    // 方法1：从 import.meta.url 推导（标准 ES 模块）
    // ComfyUI WEB_DIRECTORY 把 js/ 下的文件映射到 /extensions/<dir>/ 下
    // 所以 import.meta.url = .../extensions/<dir>/i18n.js（无 js/ 前缀）
    try {
        const u = new URL(import.meta.url);
        if (u.protocol === 'http:' || u.protocol === 'https:') {
            const base = u.pathname.replace(/\/i18n\.js.*$/, '');
            return `${u.origin}${base}/i18n`;
        }
    } catch (_) {}

    // 方法2：遍历 <link>/<script> 标签找 i18n.js 或 index.js
    for (const el of document.querySelectorAll('[src*="i18n"], [href*="i18n"], [src*="moton-promptcraft"], [href*="moton-promptcraft"]')) {
        const url = el.src || el.href || '';
        const m = url.match(/(.*\/extensions\/[^/]+)\//);
        if (m) return `${m[1]}/i18n`;
    }

    console.warn('[i18n] Cannot detect extension base URL');
    return './i18n';
}

/**
 * 初始化 i18n：检测语言并加载翻译文件
 * 同时暴露到 window.__promptcraft_i18n 供 Vue 组件使用（避免 Vite 打包导致双重实例）
 */
export async function initI18n() {
    currentLang = detectLang();
    const baseUrl = getI18nBaseUrl();
    console.log(`[i18n] lang=${currentLang}, baseUrl=${baseUrl}`);
    try {
        const url = `${baseUrl}/${currentLang}.json`;
        console.log(`[i18n] Fetching: ${url}`);
        const resp = await fetch(url);
        if (resp.ok) {
            translations = await resp.json();
            console.log(`[i18n] Loaded ${Object.keys(translations).length} keys`);
        } else {
            console.warn(`[i18n] Failed: ${resp.status} ${resp.statusText}`);
            if (currentLang !== 'zh') {
                const fallback = await fetch(`${baseUrl}/zh.json`);
                if (fallback.ok) translations = await fallback.json();
            }
        }
    } catch (e) {
        console.warn('[i18n] Load error:', e);
    }

    // 暴露到全局，供 Vue 打包产物中的 t() 使用
    window.__promptcraft_i18n = { t, getLang, setLang, translations };
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
 * 优先级: PromptCraft 设置 → ComfyUI 设置 → navigator.language → 默认 'zh'
 */
function detectLang() {
    // 1. 优先读 PromptCraft 自己的语言设置
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'zh' || stored === 'en') return stored;

    // 2. 读 ComfyUI 全局语言设置
    const comfyLang = localStorage.getItem('Comfy.LocaleId') ||
                      localStorage.getItem('comfy-locale') ||
                      localStorage.getItem('AG.Lang');
    if (comfyLang) {
        if (comfyLang.startsWith('zh')) return 'zh';
        if (comfyLang.startsWith('en')) return 'en';
    }

    // 3. 浏览器语言
    const nav = navigator.language || navigator.userLanguage || '';
    if (nav.startsWith('zh')) return 'zh';

    // 4. 默认中文，保持向后兼容
    return 'zh';
}
