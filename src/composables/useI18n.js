// i18n composable
// 桥接现有的 i18n.js 模块

import { t as i18nT, getLang, setLang } from '../../js/i18n.js'

export function useI18n() {
  return {
    t: i18nT,
    getLang,
    setLang,
  }
}
