// API 请求 composable
// 封装 ComfyUI 的 api.fetchApi，统一错误处理

const API_PREFIX = '/moton_prompt_enhancer/api'

export function useApi(api) {
  async function request(method, endpoint, body = null) {
    const options = { method }
    if (body) {
      options.headers = { 'Content-Type': 'application/json' }
      options.body = JSON.stringify(body)
    }

    const res = await api.fetchApi(`${API_PREFIX}${endpoint}`, options)
    const json = await res.json()

    if (!json.success) {
      throw new Error(json.error || 'API request failed')
    }
    return json.data
  }

  return {
    get: (endpoint) => request('GET', endpoint),
    post: (endpoint, body) => request('POST', endpoint, body),
    put: (endpoint, body) => request('PUT', endpoint, body),
    del: (endpoint) => request('DELETE', endpoint),
  }
}
