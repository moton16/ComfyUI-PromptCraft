// i18n composable
// 从 window.__promptcraft_i18n 读取 i18n 实例（由 js/i18n.js 的 initI18n() 设置）
// 避免 Vite 打包 i18n.js 导致双重实例，Vue 组件的 t() 读取空翻译对象
//
// initI18n() 是异步的：若组件在 fetch 完成前创建，一次性缓存全局实例会永远拿到 null。
// 因此这里不缓存实例，每次调用实时读取 window.__promptcraft_i18n——
// 初始化完成后，新建的组件 / 重开的弹窗自然读到翻译（非响应式，但无需改动任何调用方）。

let warnedOnce = false

function getGlobalI18n() {
  return window.__promptcraft_i18n
}

export function useI18n() {
  if (!getGlobalI18n() && !warnedOnce) {
    warnedOnce = true
    console.warn('[PromptCraft] i18n not initialized yet, using fallback until ready')
  }

  return {
    t: (key, params) => {
      const global = getGlobalI18n()
      return global ? global.t(key, params) : key
    },
    getLang: () => {
      const global = getGlobalI18n()
      return global ? global.getLang() : 'zh'
    },
    setLang: (lang) => {
      const global = getGlobalI18n()
      if (global) global.setLang(lang)
    },
  }
}
