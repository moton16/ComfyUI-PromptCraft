/**
 * PromptCraft Playground — 数据源层
 *
 * 两种模式，运行时可切换，无需重启 dev server：
 *
 *   1. live    —— fetch 原路径，由 vite proxy 转发到真实 ComfyUI（默认 127.0.0.1:8188）
 *                 数据真实，但要求 ComfyUI 正在运行
 *   2. offline —— fetch `/__mock__` 前缀路径，由 vite 中间件返回假数据
 *                 完全脱离 ComfyUI，改 UI 时秒级反馈
 *
 * 之所以不直接 mock 数据而是保留 fetch，是因为组件真实走一遍
 * HTTP + JSON 解析 + success/data 解包的链路，能暴露协议层问题。
 */

const MODES = ['live', 'offline']

let currentMode = 'live'

const listeners = new Set()

export function getMode() {
  return currentMode
}

export function setMode(mode) {
  if (!MODES.includes(mode)) return
  currentMode = mode
  listeners.forEach((fn) => fn(mode))
}

export function onModeChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getComfyUrl() {
  return window.__PC_COMFY_URL__ || 'http://127.0.0.1:8188'
}

/**
 * 模拟 ComfyUI 的 api.fetchApi(path, options)
 * 与原版唯一区别：offline 模式下给路径加 /__mock__ 前缀
 */
async function fetchApi(path, options) {
  const target = currentMode === 'offline' ? `/__mock__${path}` : path
  return fetch(target, options)
}

/**
 * 全局拦截：offline 模式下，插件的所有 /moton_prompt_enhancer/api 请求
 * （包括 i18n.js 等直接用原生 fetch 的模块）统一转到本地 mock 中间件。
 * 只劫持插件前缀，不碰 vite HMR 等其它请求。
 */
const _origFetch = window.fetch.bind(window)
window.fetch = (input, init) => {
  const url = typeof input === 'string' ? input : input?.url || ''
  if (currentMode === 'offline' && url.startsWith('/moton_prompt_enhancer/api')) {
    return _origFetch(`/__mock__${url}`, init)
  }
  return _origFetch(input, init)
}

export const mockApi = {
  fetchApi,
  // ComfyUI api 对象上常用的其它成员，避免原生模块取值时报错
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {},
  getSetting: (key, fallback) => fallback,
  storeSetting: async () => {},
}
