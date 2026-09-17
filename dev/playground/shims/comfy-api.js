/**
 * ComfyUI `scripts/api.js` 的替身
 *
 * 原生模块（如 js/lora_group/stack_api.js -> api.js）会 import
 * '../../../../scripts/api.js'，在 playground 里该路径不存在。
 * 通过 vite alias 指向本文件，让原生模块也能在 playground 中加载。
 */

import { mockApi } from '../mock-api.js'

export const api = mockApi

export default api
