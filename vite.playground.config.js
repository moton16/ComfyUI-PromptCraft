/**
 * PromptCraft Playground — Vite 开发服务器配置
 *
 * 目的：脱离 ComfyUI 单独预览/调试 Vue 弹窗组件。
 *
 *   npm run playground           # live 模式，API 转发到真实 ComfyUI
 *   npm run playground:offline   # 默认离线 mock（页面内也可切换）
 *
 * 与 vite.config.js（生产构建）完全独立，互不影响。
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const COMFY_URL = process.env.PC_COMFY_URL || 'http://127.0.0.1:8188'
// 跨平台判定默认数据源（bash / pwsh / cmd 一致）：
//   npm run playground          -> npm_lifecycle_event = playground         -> live
//   npm run playground:offline  -> npm_lifecycle_event = playground:offline  -> offline
// 不用 `PC_OFFLINE=1 vite ...` 是因为 POSIX 前缀赋值在 cmd/pwsh 下不生效，
// 不用 `npm run playground --offline=1` 是因为 npm 会把 "1" 当位置参数塞给 vite。
const DEFAULT_OFFLINE =
  process.env.PC_OFFLINE === '1' || /offline/i.test(process.env.npm_lifecycle_event || '')

function readJson(...segs) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, ...segs), 'utf-8'))
  } catch {
    return null
  }
}

/**
 * 离线 mock 数据源
 * 初始值取自仓库真实模板 data/*.json，因此 UI 里看到的是真实结构的数据，
 * 而不是凭空编的假 JSON。写操作只改内存，重启 dev server 即还原。
 */
function createStore() {
  const services = readJson('data', 'llm_services.json') || { services: [], current: {} }
  const systemPrompt = readJson('data', 'llm_system_prompt.json') || {}
  const sfw = readJson('data', 'sfw_prompts.json') || { categories: {} }
  const nsfw = readJson('data', 'nsfw_prompts.json') || { categories: {} }
  const history = readJson('data', 'prompt_history.json') || { limit: 50, entries: [] }
  const negative = { content: 'low quality, worst quality, normal quality' }

  // 旧格式 current 只有 enhance/agent，组件按四类读取，这里补齐
  const cats = ['enhance_basic', 'enhance_detail', 'enhance_normal', 'agent']
  const current = {}
  for (const c of cats) {
    current[c] = services.current?.[c] || services.current?.enhance || { service_id: services.services?.[0]?.id || 'default', model: '' }
  }

  const store = {
    services: services.services || [],
    current,
    systemPrompt: {
      sfw_rules: systemPrompt.sfw_rules || '',
      nsfw_rules: systemPrompt.nsfw_rules || '',
      sfw_enabled: systemPrompt.sfw_enabled !== false,
      nsfw_enabled: systemPrompt.nsfw_enabled !== false,
    },
    libs: { sfw, nsfw },
    history: { limit: history.limit ?? 50, entries: history.entries || [] },
    negative,
  }

  let seq = 1000
  store.nextId = () => `svc-${++seq}`

  return store
}

function send(res, payload, status = 200) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

const ok = (res, data = {}) => send(res, { success: true, data })
const fail = (res, error, status = 400) => send(res, { success: false, error }, status)

function offlineApiMock() {
  const store = createStore()

  return {
    name: 'promptcraft-offline-api-mock',
    configureServer(server) {
      server.middlewares.use('/__mock__', async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        let p = url.pathname
        if (!p.startsWith('/moton_prompt_enhancer/api')) return next()
        p = p.slice('/moton_prompt_enhancer/api'.length)

        // 读 body
        let body = {}
        if (req.method !== 'GET') {
          const chunks = []
          for await (const c of req) chunks.push(c)
          if (chunks.length) {
            try {
              body = JSON.parse(Buffer.concat(chunks).toString('utf-8'))
            } catch {
              body = {}
            }
          }
        }

        const method = req.method

        // ---- 服务管理 ----
        if (p === '/services' && method === 'GET') {
          return ok(res, { services: store.services, current: store.current })
        }
        if (p === '/services' && method === 'POST') {
          const svc = { id: store.nextId(), name: body.name || '新服务', api_url: '', api_key: '', model: '', temperature: 0.7, max_tokens: 2000 }
          store.services.push(svc)
          return ok(res, { service: svc, services: store.services })
        }
        if (/^\/services\/[^/]+$/.test(p) && method === 'PUT') {
          const id = decodeURIComponent(p.split('/')[2])
          const svc = store.services.find((s) => s.id === id)
          if (!svc) return fail(res, '服务不存在', 404)
          Object.assign(svc, body)
          return ok(res, { service: svc })
        }
        if (/^\/services\/[^/]+$/.test(p) && method === 'DELETE') {
          const id = decodeURIComponent(p.split('/')[2])
          if (store.services.length <= 1) return fail(res, '至少保留一个服务')
          store.services = store.services.filter((s) => s.id !== id)
          return ok(res, { services: store.services })
        }
        if (p === '/services/current' && method === 'PUT') {
          const category = body.category
          if (!category) return fail(res, '缺少 category')
          store.current[category] = { service_id: body.service_id, model: body.model || '' }
          return ok(res, { current: store.current })
        }
        if (/^\/services\/[^/]+\/test$/.test(p) && method === 'POST') {
          // 离线模式不做真实网络请求，模拟一次 600ms 延迟后返回
          await new Promise((r) => setTimeout(r, 600))
          return ok(res, { message: '[离线 Mock] 连接成功（模拟）', model: body.model || 'mock-model' })
        }

        // ---- System Prompt / 规则 ----
        if (p === '/system_prompt' && method === 'GET') return ok(res, store.systemPrompt)
        if (p === '/system_prompt' && method === 'POST') {
          Object.assign(store.systemPrompt, body)
          return ok(res)
        }

        // ---- Prompt 库 ----
        let m = p.match(/^\/library\/(sfw|nsfw)$/)
        if (m && method === 'GET') return ok(res, store.libs[m[1]])
        if (m && method === 'POST') {
          store.libs[m[1]] = body
          return ok(res)
        }
        m = p.match(/^\/library\/(sfw|nsfw)_reload$/)
        if (m && method === 'POST') return ok(res)

        // ---- 负面 Prompt ----
        if (p === '/negative_prompt' && method === 'GET') return ok(res, store.negative)
        if (p === '/negative_prompt' && method === 'POST') {
          store.negative.content = body.content ?? ''
          return ok(res)
        }

        // ---- Prompt 历史 ----
        if (p === '/prompt_history' && method === 'GET') return ok(res, store.history)
        if (p === '/prompt_history' && method === 'POST') {
          store.history.entries.unshift({
            id: `h-${Date.now()}`,
            timestamp: new Date().toISOString(),
            positive_prompt: body.positive_prompt || '',
            negative_prompt: body.negative_prompt || '',
            extra: body.extra || {},
          })
          if (store.history.entries.length > store.history.limit) {
            store.history.entries.length = store.history.limit
          }
          return ok(res, { entries: store.history.entries })
        }
        if (p === '/prompt_history' && method === 'DELETE') {
          store.history.entries = []
          return ok(res)
        }
        if (p === '/prompt_history/limit' && method === 'PUT') {
          store.history.limit = Number(body.limit) || 50
          return ok(res, { limit: store.history.limit })
        }
        m = p.match(/^\/prompt_history\/([^/]+)$/)
        if (m && method === 'DELETE') {
          const id = decodeURIComponent(m[1])
          store.history.entries = store.history.entries.filter((e) => e.id !== id)
          return ok(res)
        }

        // ---- 节点定义 / 帮助（locales 不在 WEB_DIRECTORY，后端用 API 暴露）----
        if (p === '/nodedefs') {
          const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'zh'
          const defs = readJson('locales', lang, 'nodeDefs.json') || {}
          return ok(res, defs)
        }
        if (p === '/help') {
          const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'zh'
          try {
            const md = fs.readFileSync(path.join(ROOT, 'data', `usage_help_${lang}.md`), 'utf-8')
            return ok(res, { content: md })
          } catch {
            return ok(res, { content: '' })
          }
        }

        // ---- 兜底：写操作一律成功，读操作给空对象 ----
        if (method === 'GET') return ok(res, {})
        return ok(res)
      })
    },
  }
}

export default defineConfig({
  root: ROOT,
  plugins: [vue(), offlineApiMock()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
    __PC_DEFAULT_OFFLINE__: JSON.stringify(DEFAULT_OFFLINE),
  },
  resolve: {
    alias: [
      // 原生模块 import 的 ComfyUI api.js，重定向到 playground 替身
      { find: /^(?:\.\.\/){3,4}scripts\/api\.js$/, replacement: path.join(ROOT, 'dev/playground/shims/comfy-api.js') },
    ],
  },
  server: {
    port: 5178,
    strictPort: false,
    // 不自动打开浏览器，避免打扰（手动访问 /dev/playground/index.html）
    proxy: {
      '/moton_prompt_enhancer/api': {
        target: COMFY_URL,
        changeOrigin: true,
      },
    },
  },
})
