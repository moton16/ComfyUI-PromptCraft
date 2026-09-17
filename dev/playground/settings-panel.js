/**
 * Playground — 原生设置面板（js/control_panel.js）集成
 *
 * 设置面板是原生 DOM 实现，不依赖 LiteGraph app，只依赖：
 *   - ../../../scripts/api.js  -> 由 vite alias 指向 shims/comfy-api.js
 *   - ./i18n.js                -> 真实模块，playground 启动时已初始化
 *
 * 面板里的按钮通过 window 自定义事件打开弹窗（在 ComfyUI 中由 index.js 监听），
 * 这里把同样的事件桥接到 src/main.js 的 Vue 挂载器，行为与线上一致。
 */

import '/js/lora_group/styles.css'
import { createSettingsContent } from '/js/control_panel.js'
import { mockApi } from './mock-api.js'
import { useToast } from '../../src/composables/useToast.js'
import {
  serviceConfigModal,
  negativePromptModal,
  ruleManagerModal,
  libraryEditorModal,
  promptHistoryModal,
} from '../../src/main.js'

let wired = false

/** 把面板派发的事件接到 Vue 弹窗上；只需执行一次 */
function wireEvents() {
  if (wired) return
  wired = true

  const bridge = {
    'promptcraft:open-services': () => serviceConfigModal.open(mockApi),
    'promptcraft:open-negative': () => negativePromptModal.open(mockApi),
    'promptcraft:open-rule-manager': () => ruleManagerModal.open(mockApi),
    'promptcraft:open-library-editor': () => libraryEditorModal.open(mockApi),
    'promptcraft:open-history': () => promptHistoryModal.open(mockApi),
  }

  Object.entries(bridge).forEach(([name, handler]) => {
    window.addEventListener(name, handler)
  })

  // 这两类依赖 LiteGraph / 浮动面板，playground 里没有对应实现
  const unsupported = {
    'promptcraft:open-hub': 'LoRA Hub 依赖 LiteGraph 画布',
    'promptcraft:toggle-panel': '浮动面板开关只对 ComfyUI 画布生效',
  }
  Object.entries(unsupported).forEach(([name, reason]) => {
    window.addEventListener(name, () => {
      useToast().warning(`${reason}，请在 ComfyUI 中查看`)
    })
  })
}

/**
 * 把设置面板渲染到指定容器
 * @param {HTMLElement} container
 */
export function renderSettingsPanel(container) {
  wireEvents()

  container.innerHTML = ''
  const wrap = document.createElement('div')
  wrap.style.cssText = `
    position:absolute; inset:0; overflow-y:auto;
    display:flex; justify-content:center;
    padding:24px 20px 60px;
  `

  const inner = document.createElement('div')
  inner.style.cssText = 'width:100%; max-width:680px;'
  inner.appendChild(createSettingsContent())

  wrap.appendChild(inner)
  container.appendChild(wrap)
}
