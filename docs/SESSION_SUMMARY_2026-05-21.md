# 开发会话总结 — 2026-05-21

**会话范围:** Phase 1 → Phase 3 全量实现 + UI 重设计
**项目:** Moton's PromptCraft (ComfyUI 自定义节点)

---

## 一、已完成的工作

### Phase 1 — Model & LoRA Group Loader (V1.2.0 Mod1)

LoRA 栈模式实现，核心产出：

- `model_lora_loader.py` — 节点后端：JSON 栈数据解析 + LoRA 逐个加载
- `stack_api.js` — 前端栈状态管理（addLora, addGroup, removeItem, toggleEnabled, updateWeight, serialize）
- `canvas_widget.js` — 画布内联栈 UI（拖拽排序、开关、权重输入、群组引用）
- `lora_group_manager.py` — LoRA 群组 CRUD 单例
- `api_routes.py` — 14 个群组 CRUD + LoRA 扫描 API 端点
- 隐藏 STRING widget (`lora_stack_data`) 实现前端→后端数据传递

### Phase 2 — LoRA Prompt 系统 + 节点联动 (V1.2.0 Mod2)

- `lora_prompt_manager.py` — LoRA prompt 组 CRUD，存储在 `lora_prompts.json`
- ModelLoraGroupLoader 新增第三个输出 `lora_prompt_data`（STRING JSON）
- PromptEnhancer 新增 optional 输入接收 LoRA prompt 数据
- `agent_prompt.py` — Agent 系统 prompt 独立文件
- `llm_client.py` — 新增 `agent_call()` 方法

### UI 重设计 — 统一 LoRA Hub

- `hub_panel.js` — 替代 group_panel.js + lora_browser.js，统一管理面板
- 左侧：LoRA/群组双 Tab 浏览器 + 文件夹树导航
- 右侧：LoRA 详情（内联 prompt 编辑）、群组详情
- `group_panel.js` 和 `lora_browser.js` 删除

### Phase 3 — AI Agent 模块 (V1.3.0)

- `agent_executor.js` — 前端操作执行器（8 种操作：lora_add/remove/toggle/weight, checkpoint, prompt_set, category_set, query）
- `agent_panel.js` — Agent 对话 UI（消息气泡 + 操作结果卡片 + 快捷指令）
- Hub 侧栏新增 Agent Tab（LoRA / 群组 / **Agent** 三 Tab）
- `chat_panel.js` 重写为 Agent 浮动对话框入口
- `api_routes.py` 新增 `POST /agent` 端点
- `model_lora_loader.py` 修复 VAE 输出（RETURN_TYPES 增加 VAE）

---

## 二、关键架构模式

### 1. 前端→后端数据流：隐藏 STRING Widget

```
前端 JS 修改栈状态 → 序列化 JSON → 写入隐藏 widget.value
→ ComfyUI 执行时自动传递 → Python 节点 execute() 读取
```

隐藏 widget 定义方式：
```python
"hidden": {"lora_stack_data": "UNIQUE_ID"},
```
前端通过 `node.widgets.find(w => w.name === 'lora_stack_data')` 读写。

### 2. 循环依赖解决：Callback 注册模式

```
canvas_widget.js → hub_panel.js → agent_panel.js → canvas_widget.js
```

不直接 import，而是用 callback：
```javascript
// hub_panel.js 导出 setter
let _onRefreshStack = null;
export function setHubRefreshCallback(fn) { _onRefreshStack = fn; }

// canvas_widget.js 注册
import { setHubRefreshCallback } from './hub_panel.js';
setHubRefreshCallback((node) => renderStack(node));
```

**经验:** hub_panel.js 必须在 import agent_panel.js 之前定义 callback setter，否则模块初始化时 callback 还是 null。

### 3. ComfyUI 前端扩展注册模式

```javascript
app.registerExtension({
    name: 'Moton.PromptCraft.XXX',
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== 'TargetNode') return;
        const onCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const r = onCreated?.apply(this, arguments);
            // 自定义初始化
            return r;
        };
    },
});
```

### 4. API 端点统一模式

```python
API_PREFIX = "/moton_prompt_enhancer/api"

@PromptServer.instance.routes.get(f"{API_PREFIX}/xxx")
@PromptServer.instance.routes.post(f"{API_PREFIX}/xxx")
```

前端调用：
```javascript
const API_PREFIX = '/moton_prompt_enhancer/api';
await fetch(`${API_PREFIX}/endpoint`, { method, headers, body });
```

### 5. CSS 命名约定

| 前缀 | 用途 | 文件 |
|------|------|------|
| `lsw-` | LoRA Stack Widget（画布内联） | styles.css |
| `lhub-` | LoRA Hub 面板 | styles.css |
| `pc-agent-` | Agent 对话面板 | styles.css |

### 6. 节点间通信

- MODEL/CLIP/VAE → 通过 ComfyUI 管线连接（标准类型端口）
- 自定义数据（LoRA 栈、prompt 数据）→ 通过隐藏 STRING widget（JSON 序列化）
- 节点间联动：上游输出 STRING → 下游 optional STRING 输入

---

## 三、踩坑记录与解决方案

### 坑 1: LiteGraph 画布 DOM Widget 的 pointer-events

**现象:** 画布上的 DOM widget（输入框、按钮）无法点击/输入
**原因:** LiteGraph 画布默认拦截所有事件，DOM widget 的 pointer-events 被覆盖
**解决:** CSS 中为 widget 元素设置 `pointer-events: auto !important`，画布缩放时需同步更新 DOM 元素的 position/scale

### 坑 2: 循环 import 导致模块初始化失败

**现象:** `Cannot access 'X' before initialization`
**原因:** A import B, B import C, C import A — 模块初始化顺序问题
**解决:** 使用 callback 注册模式打断循环链，确保 callback setter 在 import 上游模块之前定义

### 坑 3: Edit tool 精确匹配失败

**现象:** Edit 工具提示字符串不匹配
**原因:** old_string 缩进或空格与文件实际内容不一致
**解决:** 先 Read 获取精确行内容，再用完全一致的字符串做 Edit

### 坑 4: VAE 输出被丢弃

**现象:** ModelLoraGroupLoader 没有 VAE 输出口
**原因:** `load_checkpoint_guess_config` 返回 `(model, clip, vae)` 三元组，但节点只取了前两个
**解决:** RETURN_TYPES 增加 "VAE"，execute() 捕获 `out[2]` 并返回

### 坑 5: 群组实时解析 vs 前端展开

**决策:** 采用后端实时解析
**原因:** 前端展开会导致群组配置变更后已添加的引用不更新；后端执行时实时读取 `lora_groups.json` 保证始终最新

### 坑 6: mtime 缓存失效

**问题:** JSON 配置文件修改后缓存不更新
**解决:** ConfigManager 和 LoraGroupManager 使用文件 mtime 比对，读取时检查文件修改时间

---

## 四、文件结构参考

```
moton-promptcraft/
├── __init__.py                  # 节点注册入口
├── model_lora_loader.py         # ModelLoraGroupLoader 节点（Phase 1/3）
├── prompt_enhancer.py           # PromptEnhancer 节点
├── ai_chat.py                   # AIChat 节点（Agent 入口）
├── api_routes.py                # API 路由（14+ 群组 CRUD + chat + agent）
├── lora_group_manager.py        # LoRA 群组 CRUD 单例
├── lora_prompt_manager.py       # LoRA prompt 组 CRUD 单例
├── lora_scanner.py              # 磁盘 LoRA 扫描
├── config_manager.py            # 配置管理（JSON + mtime 缓存）
├── llm_client.py                # LLM 客户端（多 Provider、chat_call + agent_call）
├── agent_prompt.py              # Agent 系统 prompt（前端不可编辑）
├── server.py                    # PromptServer 扩展
├── data/                        # 配置 JSON 文件
│   ├── lora_groups.json
│   ├── lora_prompts.json
│   └── config.json
├── js/
│   ├── chat_panel.js            # Agent 浮动对话框入口
│   └── lora_group/
│       ├── index.js             # 前端扩展注册 + 初始化
│       ├── canvas_widget.js     # 画布内联栈 UI
│       ├── hub_panel.js         # 统一 LoRA Hub 面板
│       ├── agent_panel.js       # Agent 对话 UI 组件
│       ├── agent_executor.js    # Agent 操作执行器
│       ├── stack_api.js         # 栈状态管理
│       ├── api.js               # API 客户端层
│       └── styles.css           # 全部样式（lsw- + lhub- + pc-agent-）
├── design/                      # 可视化设计文档
└── docs/plans/                  # 设计文档
```

---

## 五、前端模块依赖关系

```
index.js
  ├── canvas_widget.js
  │     ├── hub_panel.js (import openHubPanel, setHubRefreshCallback)
  │     │     ├── agent_panel.js (import createAgentPanel)
  │     │     │     ├── agent_executor.js
  │     │     │     │     └── stack_api.js
  │     │     │     └── canvas_widget.js (import renderStack) ← 循环，靠 callback 解决
  │     │     └── api.js
  │     └── stack_api.js
  └── hub_panel.js

chat_panel.js (独立入口)
  └── agent_panel.js → 同上
```

**关键约束:**
- hub_panel.js 中 `setHubRefreshCallback` 必须在 `import { createAgentPanel } from './agent_panel.js'` 之前定义
- agent_panel.js 从 canvas_widget.js import `renderStack`，但 canvas_widget.js 不 import agent_panel.js（通过 hub_panel.js 中转）

---

## 六、经验总结

### 设计决策

1. **一个节点 = 一个职责**: ModelLoraGroupLoader 只管模型+LoRA+VAE，prompt 数据通过 STRING 传递给 PromptEnhancer
2. **JSON 序列化是前端↔后端的桥梁**: 栈数据、prompt 数据都走隐藏 widget 的 JSON
3. **后端实时解析 > 前端展开**: 群组引用在执行时解析，保证配置变更后引用自动更新
4. **Agent 系统 prompt 独立文件**: `agent_prompt.py` 前端不可编辑，保证 LLM 行为一致性
5. **CSS 前缀命名空间隔离**: `lsw-` / `lhub-` / `pc-agent-` 避免样式冲突

### 开发流程

1. **先设计后实现**: 每个 Phase 都先写设计文档（`docs/plans/`），再动手
2. **前端→后端→前端闭环验证**: API 端点写好后先用 curl/Postman 测试，再连前端
3. **循环依赖用 callback 打断**: 不要用 import 解决，用 setter/getter 模式
4. **ComfyUI 节点修改注意序列化**: widget 值变化必须触发序列化，否则保存工作流时不更新

### 待改进

- `agent_prompt.py` 中的 lora_search / group_add / lora_prompt_edit 操作尚未在前端实现 handler
- Agent 浮动面板和 Hub Agent Tab 共享 `agentMessages` 状态（模块级变量），但两个面板不会同时打开
- `prompt_set` 和 `category_set` 的 handler 是 stub 实现，需要跨节点查找 widget
