// i18n composable
// 从 window.__promptcraft_i18n 读取 i18n 实例（由 js/i18n.js 的 initI18n() 设置）
// 避免 Vite 打包 i18n.js 导致双重实例，Vue 组件的 t() 读取空翻译对象

export function useI18n() {
  // 优先从全局对象读取（运行时由 initI18n() 设置）
  const global = window.__promptcraft_i18n
  if (global) {
    return {
      t: global.t,
      getLang: global.getLang,
      setLang: global.setLang,
    }
  }

  // 回退：全局对象尚未初始化时（理论上不应发生，因为 initI18n 在模块加载时调用）
  console.warn('[PromptCraft] i18n not initialized yet, using fallback')
  return {
    t: (key) => key,
    getLang: () => 'zh',
    setLang: () => {},
  }
}
