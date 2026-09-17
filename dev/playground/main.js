/**
 * PromptCraft Playground — 脱离 ComfyUI 预览 Vue 弹窗组件
 *
 * 复用 src/main.js 里真实的挂载器（createModalMounter），
 * 只把 comfyApi 换成可控数据源，因此组件行为与线上一致。
 *
 * 注意：侧边栏用原生 DOM（Vite 打包的 Vue 是 runtime-only，无模板编译器），
 * Vue 只用于业务弹窗组件本身。
 */

import { initI18n } from '/js/i18n.js'

import { mockApi, getMode, setMode, onModeChange, getComfyUrl } from './mock-api.js'
import { useToast } from '../../src/composables/useToast.js'
import { renderSettingsPanel } from './settings-panel.js'

import {
  serviceConfigModal,
  negativePromptModal,
  ruleManagerModal,
  libraryEditorModal,
  promptHistoryModal,
  mountToast,
} from '../../src/main.js'

// ---------------------------------------------------------------- i18n
// 复用真实 i18n 模块：initI18n() 会把 { t, getLang, setLang } 挂到
// window.__promptcraft_i18n，Vue 的 useI18n() 正是读它。
async function setupI18n() {
  await initI18n()

  // vite dev server 下若静态 json 未命中，兜底手工注入一份
  const g = window.__promptcraft_i18n
  if (g && (!g.translations || Object.keys(g.translations).length === 0)) {
    try {
      const res = await fetch('/js/i18n/zh.json')
      const json = await res.json()
      g.translations = json
    } catch (e) {
      console.warn('[Playground] i18n fallback failed:', e)
    }
  }
}

// ---------------------------------------------------------------- 侧边栏（原生 DOM）
const PANELS = [
  { key: 'settings', group: 'native', label: '设置面板', desc: 'control_panel.js', open: () => renderSettingsPanel(document.getElementById('pg-stage')) },
  { key: 'service', group: 'vue', label: '服务配置', desc: 'ServiceConfig', open: () => serviceConfigModal.open(mockApi) },
  { key: 'negative', group: 'vue', label: '负面 Prompt', desc: 'NegativePromptEditor', open: () => negativePromptModal.open(mockApi) },
  { key: 'rules', group: 'vue', label: '规则管理', desc: 'RuleManager', open: () => ruleManagerModal.open(mockApi) },
  { key: 'library', group: 'vue', label: 'Prompt 库', desc: 'LibraryEditor', open: () => libraryEditorModal.open(mockApi) },
  { key: 'history', group: 'vue', label: 'Prompt 历史', desc: 'PromptHistory', open: () => promptHistoryModal.open(mockApi) },
]

const GROUPS = [
  { key: 'native', title: '原生模块（渲染到右侧）' },
  { key: 'vue', title: 'Vue 弹窗' },
]

function panelListHtml(groupKey) {
  return PANELS.filter((p) => p.group === groupKey)
    .map((p) => `
      <button data-panel="${p.key}" style="${CSS.panelBtn}">
        <div style="font-size:13px">${p.label}</div>
        <div style="font-size:10px;color:#888">${p.desc}</div>
      </button>`)
    .join('')
}

const CSS = {
  root: 'display:flex;flex-direction:column;gap:16px;height:100%',
  title: 'font-size:15px;font-weight:600;color:#fff',
  sub: 'font-size:11px;color:#888;margin-top:2px',
  box: 'padding:10px;background:#1e1e1e;border:1px solid #3a3a3a;border-radius:6px',
  label: 'font-size:11px;color:#999;margin-bottom:6px',
  hint: 'font-size:10px;color:#777;margin-top:8px;line-height:1.5',
  row: 'display:flex;gap:6px',
  panelBtn: 'width:100%;text-align:left;padding:8px 10px;cursor:pointer;background:#1a1a1a;border:1px solid #3a3a3a;border-radius:6px;color:#ddd;line-height:1.4',
  footer: 'font-size:10px;color:#666;line-height:1.6',
}

function modeBtnHtml(mode, active) {
  const style = `flex:1;padding:6px 4px;cursor:pointer;font-size:12px;border-radius:4px;`
    + `border:1px solid ${active ? '#5a8fd6' : '#3a3a3a'};`
    + `background:${active ? '#2d4a6b' : '#1a1a1a'};color:${active ? '#fff' : '#bbb'}`
  const label = mode === 'live' ? '真机' : '离线 Mock'
  return `<button data-mode="${mode}" style="${style}">${label}</button>`
}

function hintHtml(mode) {
  if (mode === 'live') {
    return `转发到 <b style="color:#aaa">${getComfyUrl()}</b><br/>需 ComfyUI 已启动，数据真实`
  }
  return '本地假数据（取自 data/*.json）<br/>写操作仅存内存，重启还原'
}

function renderSidebar(el, onToast) {
  const mode = getMode()
  el.innerHTML = `
    <div style="${CSS.root}">
      <div>
        <div style="${CSS.title}">PromptCraft</div>
        <div style="${CSS.sub}">Playground · 免 ComfyUI 预览</div>
      </div>

      <div style="${CSS.box}">
        <div style="${CSS.label}">数据源</div>
        <div style="${CSS.row}">${modeBtnHtml('live', mode === 'live')}${modeBtnHtml('offline', mode === 'offline')}</div>
        <div style="${CSS.hint}" data-hint>${hintHtml(mode)}</div>
      </div>

      <div style="flex:1">
        ${GROUPS.map((g) => `
          <div style="margin-bottom:14px">
            <div style="${CSS.label}">${g.title}</div>
            <div style="display:flex;flex-direction:column;gap:6px">
              ${panelListHtml(g.key)}
            </div>
          </div>`).join('')}
      </div>

      <button data-toast style="${CSS.panelBtn};text-align:center">
        <div style="font-size:13px">触发 Toast</div>
      </button>

      <div style="${CSS.footer}">
        组件由 src/main.js 的真实挂载器打开，<br/>改 src/ 下源码即热更新。
      </div>
    </div>
  `

  el.querySelectorAll('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode))
  })
  el.querySelectorAll('[data-panel]').forEach((btn) => {
    const panel = PANELS.find((p) => p.key === btn.dataset.panel)
    if (panel) btn.addEventListener('click', () => panel.open())
  })
  const toastBtn = el.querySelector('[data-toast]')
  if (toastBtn) toastBtn.addEventListener('click', onToast)
}

onModeChange((m) => {
  const sidebar = document.getElementById('pg-sidebar')
  if (sidebar) renderSidebar(sidebar, triggerToast)
})

// ---------------------------------------------------------------- 启动
async function bootstrap() {
  // 先定数据源，再初始化 i18n（i18n 会请求 /nodedefs，走当前模式）
  if (typeof __PC_DEFAULT_OFFLINE__ !== 'undefined' && __PC_DEFAULT_OFFLINE__) {
    setMode('offline')
  }
  await setupI18n()
  mountToast()

  renderSidebar(document.getElementById('pg-sidebar'), triggerToast)

  const stage = document.getElementById('pg-stage')
  stage.innerHTML = `
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#555;font-size:13px;text-align:center;line-height:2">
      从左侧选择要预览的组件<br/>
      <span style="font-size:11px;color:#444">弹窗会挂载到这里，与 ComfyUI 内行为一致</span>
    </div>
  `

  // 支持 ?open=service|negative|rules|library|history 直达组件
  const autoOpen = new URLSearchParams(location.search).get('open')
  if (autoOpen) {
    const panel = PANELS.find((p) => p.key === autoOpen)
    if (panel) setTimeout(() => panel.open(), 50)
  }

  console.log('[Playground] ready, mode =', getMode())
}

function triggerToast() {
  useToast().info('Playground Toast 测试 ' + new Date().toLocaleTimeString())
}

bootstrap()
