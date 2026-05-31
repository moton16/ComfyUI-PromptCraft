import { createApp } from 'vue'
import ServiceConfig from './components/ServiceConfig.vue'
import NegativePromptEditor from './components/dialogs/NegativePromptEditor.vue'
import RuleManager from './components/dialogs/RuleManager.vue'

// 导入设计 Token（构建后会打包到 CSS 文件中）
import './styles/variables.css'

// 挂载 Vue 组件到 ComfyUI DOM 容器的工具函数
export function mountVueWidget(container, component, props = {}) {
  const vueApp = createApp(component, props)
  const vm = vueApp.mount(container)
  return { vm, unmount: () => vueApp.unmount() }
}

// 通用模态框挂载函数
function createModalMounter(component, modalId) {
  let appInstance = null
  let container = null

  return {
    open(comfyApi) {
      // 先卸载已存在的实例
      this.close()

      // 创建容器
      container = document.createElement('div')
      container.id = modalId
      document.body.appendChild(container)

      // 挂载 Vue 组件
      const app = createApp(component, {
        comfyApi,
        onClose: () => this.close(),
      })

      appInstance = {
        unmount: () => {
          app.unmount()
          if (container) {
            container.remove()
            container = null
          }
        }
      }

      app.mount(container)
    },

    close() {
      if (appInstance) {
        appInstance.unmount()
        appInstance = null
      }
    }
  }
}

// 创建各组件的挂载器
export const serviceConfigModal = createModalMounter(ServiceConfig, 'promptcraft-service-config')
export const negativePromptModal = createModalMounter(NegativePromptEditor, 'promptcraft-negative-editor')
export const ruleManagerModal = createModalMounter(RuleManager, 'promptcraft-rule-manager')

// 导出便捷函数
export function openServiceConfigModal(comfyApi) {
  serviceConfigModal.open(comfyApi)
}

export function openNegativePromptEditor(comfyApi) {
  negativePromptModal.open(comfyApi)
}

export function openRuleManager(comfyApi) {
  ruleManagerModal.open(comfyApi)
}

// 导出组件
export { ServiceConfig, NegativePromptEditor, RuleManager }
