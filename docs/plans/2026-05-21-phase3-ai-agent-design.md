# Phase 3 — AI Agent 模块设计

**日期:** 2026-05-21
**状态:** 待审批
**版本:** V1.2.0 Mod2 → V1.3.0（Phase 3 完成后）

---

## 需求总结

用户通过自然语言指令控制 PromptCraft 节点系统，LLM 解析为结构化操作并在前端执行。

### 核心决策

| 决策 | 结果 |
|------|------|
| Agent 入口 | LoRA Hub 右侧 Agent Tab + 独立浮动对话框 |
| 操作执行 | 直接执行，仅危险操作（删除 LoRA）需确认 |
| 现有聊天 | 替换为 Agent，AIChat 节点改为 Agent 入口 |
| VAE 修复 | Phase 3 一起修 |

---

## 架构总览

```
用户输入自然语言
    ↓
POST /api/agent (新端点)
    ↓
LLMClient.agent_call(current_state, instruction)
    ↓
LLM 返回 JSON: {"operations": [...]}
    ↓
前端 AgentExecutor.apply(operations)
    ↓
调用 stack_api.js / api.js 执行操作
    ↓
刷新画布 widget + Hub 面板
```

### 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `api_routes.py` | 修改 | 新增 `POST /agent` 端点 |
| `agent_executor.js` | **新建** | 前端操作执行器 |
| `agent_panel.js` | **新建** | Agent 对话 UI 组件（复用于 Hub Tab + 浮动框） |
| `hub_panel.js` | 修改 | 右侧面板新增 Agent Tab |
| `chat_panel.js` | **重写** | 改为 Agent 浮动对话框 |
| `ai_chat.py` | 修改 | 节点改为 Agent 入口 |
| `model_lora_loader.py` | 修改 | 新增 VAE 输出 |
| `styles.css` | 修改 | 新增 agent-* 样式 |
| `__init__.py` | 可能修改 | 节点注册无变化（AIChat 名不变） |
| `agent_prompt.py` | 可能微调 | 扩充 system prompt |

---

## 详细设计

### 1. 后端 API — `POST /agent`

**文件:** `api_routes.py`

```python
@PromptServer.instance.routes.post(f"{API_PREFIX}/agent")
async def agent_endpoint(request):
    data = await request.json()
    instruction = data.get("instruction", "")
    current_state = data.get("current_state", {})

    client = LLMClient(config_manager)
    result = client.agent_call(current_state, instruction)

    if result is None:
        return web.json_response(
            get_result_json(False, error="Agent 调用失败"), status=500
        )

    return web.json_response(get_result_json(True, {"response": result}))
```

- 输入：`{ instruction: string, current_state: object }`
- 输出：`{ success: true, data: { response: string } }`
- `response` 是 LLM 返回的 JSON 字符串，前端解析后执行

### 2. 前端操作执行器 — `agent_executor.js`

**新文件:** `js/lora_group/agent_executor.js`

负责解析 LLM 的 JSON 响应并调用现有 API 执行操作。

```javascript
// 支持的操作类型
const HANDLERS = {
    lora_add:     (params, ctx) => StackAPI.addLora(ctx.nodeId, params.lora_path, params.weight, params.clip_weight),
    lora_remove:  (params, ctx) => { /* find and remove by lora_path */ },
    lora_toggle:  (params, ctx) => { /* find and toggle by lora_path */ },
    lora_weight:  (params, ctx) => { /* find and update weight */ },
    checkpoint:   (params, ctx) => { /* update checkpoint widget value */ },
    prompt_set:   (params, ctx) => { /* update prompt widget value */ },
    category_set: (params, ctx) => { /* update category widget */ },
    query:        (params, ctx) => { /* return current state, no modification */ },
};

// 执行操作列表
export function executeOperations(operations, node) {
    const results = [];
    for (const op of operations) {
        const handler = HANDLERS[op.action];
        if (handler) {
            const result = handler(op.params, { nodeId: node.id, node });
            results.push({ action: op.action, success: true, result });
        } else {
            results.push({ action: op.action, success: false, error: "未知操作" });
        }
    }
    return results;
}

// 构建当前状态（传给 LLM）
export function buildCurrentState(node) {
    const stack = StackAPI.getStack(node.id);
    // 获取 checkpoint widget 值、LoRA 列表等
    return { stack, checkpoint, available_loras, ... };
}
```

### 3. Agent 对话 UI — `agent_panel.js`

**新文件:** `js/lora_group/agent_panel.js`

核心 UI 组件，同时支持两种复用模式：
- **Hub Tab 模式**: 渲染到 Hub 右侧面板的容器 div 中
- **浮动窗口模式**: 创建全屏 overlay 面板（复用 chat_panel.js 的结构）

#### UI 结构

```
┌─────────────────────────────────────────────┐
│  Agent 对话                                  │
├─────────────────────────────────────────────┤
│                                             │
│  [用户消息气泡]                               │
│  "帮我加一个赛博朋克风格的LoRA"                │
│                                             │
│  [AI 消息]                                   │
│  "已添加 cyberpunk_neon.safetensors"        │
│                                             │
│  [操作结果卡片]                               │
│  ┌─────────────────────────────────────┐    │
│  │ ✓ lora_add                          │    │
│  │   style/cyberpunk_neon.safetensors  │    │
│  │   模型权重: 0.8  CLIP权重: 0.8      │    │
│  └─────────────────────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│  [输入框: 输入指令...]           [发送]       │
│  快捷: "清空栈" "随机LoRA" "当前状态"        │
└─────────────────────────────────────────────┘
```

#### 组件 API

```javascript
// 创建 Agent 面板
export function createAgentPanel(container, node, options)

// container: 渲染目标 div
// node: LiteGraph 节点实例
// options: { mode: 'hub' | 'floating', compact: boolean }
```

#### 操作结果卡片

每个 LLM 返回的操作执行后，显示为一张结果卡片：

- **成功**: 绿色边框，显示操作类型 + 参数
- **失败**: 红色边框，显示错误信息
- **危险操作确认**: 黄色边框，显示"确认执行？"按钮（仅 lora_remove）

#### 快捷指令

底部显示快捷按钮：
- "清空栈" → 直接清空当前节点的 LoRA 栈
- "随机 LoRA" → 随机添加几个 LoRA
- "当前状态" → query 操作，显示当前配置
- "帮助" → 显示支持的指令类型

### 4. LoRA Hub 集成

**文件:** `hub_panel.js` 修改

在右侧面板的 LoRA 详情/群组详情上方，新增一个 Agent Tab 栏：

```
┌──────────────┬──────────────────────────────────────┐
│              │ [详情] [群组] [Agent] ← 新 Tab       │
│  左侧        ├──────────────────────────────────────┤
│  浏览器      │                                      │
│              │  Agent 对话区域                       │
│              │  (渲染 agent_panel)                  │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

右侧面板从当前的直接显示详情，改为：
- 默认显示 LoRA 详情（当选中 LoRA 时）
- 有 "Agent" Tab 可切换到 Agent 面板
- Agent 面板内可以直接操作当前节点

### 5. 浮动对话框

**文件:** `chat_panel.js` 重写

保留原有 chat_panel.js 的浮动窗口结构（全屏 overlay + 居中面板），但：
- 标题改为 "PromptCraft Agent"
- 内部渲染 `createAgentPanel()` 组件
- AIChat 节点按钮文字改为 "AI Agent"
- 共享同一个 `createAgentPanel` 实例

### 6. AIChat 节点改造

**文件:** `ai_chat.py`

节点本身不变（仍是空节点，仅用于承载按钮），但：
- 前端按钮文字从 " 打开聊天" 改为 " AI Agent"
- 点击后打开 Agent 浮动面板（而非旧聊天面板）

### 7. VAE 输出修复

**文件:** `model_lora_loader.py`

```python
# 修改前
RETURN_TYPES = ("MODEL", "CLIP", "STRING")
RETURN_NAMES = ("model", "clip", "lora_prompt_data")

# 修改后
RETURN_TYPES = ("MODEL", "CLIP", "VAE", "STRING")
RETURN_NAMES = ("model", "clip", "vae", "lora_prompt_data")
```

执行逻辑修改：
```python
if checkpoint != "None":
    out = comfy.sd.load_checkpoint_guess_config(ckpt_path, output_vae=True, output_clip=True, ...)
    model = out[0]
    clip = out[1]
    vae = out[2]
else:
    # VAE 可能从上游传入
    pass

# ... LoRA 处理不变 ...

return (model, clip, vae, prompt_json)
```

新增可选输入：
```python
"optional": {
    "model": ("MODEL",),
    "clip": ("CLIP",),
    "vae": ("VAE",),   # 新增
}
```

### 8. agent_prompt.py 增强

扩充 system prompt：
- 加入 lora_search 操作（搜索磁盘上的 LoRA）
- 加入 group_add 操作（创建群组并添加 LoRA）
- 加入 lora_prompt_edit 操作（编辑 LoRA 的 prompt 组）
- 更好的示例和错误处理指引

---

## 实施步骤

### Step 1: 后端 API + VAE 修复
1. api_routes.py 新增 `POST /agent` 端点
2. model_lora_loader.py 新增 VAE 输出
3. 测试 API 和 VAE 输出

### Step 2: 前端操作执行器
1. 新建 agent_executor.js
2. 实现所有操作的 handler
3. 实现 buildCurrentState()
4. 集成 stack_api.js

### Step 3: Agent 对话 UI
1. 新建 agent_panel.js — 核心 UI 组件
2. 实现消息气泡、操作卡片、快捷指令
3. 集成 agent_executor.js

### Step 4: LoRA Hub 集成
1. hub_panel.js 右侧面板加 Agent Tab
2. Agent Tab 内渲染 agent_panel

### Step 5: 浮动对话框 + AIChat 改造
1. 重写 chat_panel.js → agent 浮动面板
2. AIChat 节点按钮文字和行为更新

### Step 6: CSS 样式
1. styles.css 新增 agent-* 样式
2. 与现有 lhub-* 样式统一风格

### Step 7: 测试 + 收尾
1. 全面测试所有操作类型
2. 测试 Hub Tab 和浮动框两种模式
3. 测试 VAE 输出

---

## 数据流

```
[用户] → 输入自然语言指令
           ↓
[agent_panel.js] → POST /api/agent { instruction, current_state }
           ↓
[api_routes.py] → LLMClient.agent_call()
           ↓
[LLM] → 返回 JSON: { "operations": [{ action, target, params }] }
           ↓
[agent_panel.js] → 解析 JSON → executeOperations()
           ↓
[agent_executor.js] → 调用 stack_api.js / widget 操作
           ↓
[canvas_widget.js] → renderStack() 刷新画布
[hub_panel.js] → 刷新 Hub 内容
```

## 与现有 chat_panel.js 的差异

| 维度 | 旧 chat_panel.js | 新 agent_panel.js |
|------|-------------------|-------------------|
| 目标 | 通用聊天 | 操作执行 |
| API | POST /chat (SSE 流式) | POST /agent (非流式 JSON) |
| 回复 | 纯文本气泡 | 文本 + 操作结果卡片 |
| 执行 | 无 | 调用 agent_executor 修改节点 |
| 状态 | 独立 chatMessages | 共享 node 状态 |
| 入口 | AIChat 节点按钮 | AIChat 按钮 + Hub Agent Tab |
