# PromptCraft 更新日志

---

## V1.2.1 Mod1 (2026-05-24)

### Bug Fixes

- **修复 SFW 库"服饰"子类数据错误**
  - "连体工装裤，腰带束紧，戒指/指环"的英文标签拼写错误修复（belt_belt → belt）

- **LLM API 调用现在可以中断**
  - 使用 httpx 替换 urllib，支持更精细的超时控制
  - 添加线程轮询中断检测，ComfyUI 的"中断"按钮可立即停止 LLM 调用
  - 中断后返回当前已有的 prompt，不等待 API 响应

- **画布上添加 API 调用状态提示**
  - 后端通过 WebSocket 发送 `promptcraft.llm_status` 事件
  - 前端显示浮动 Toast 提示（成功/失败/中断）
  - 节点内显示临时状态 widget（3-5秒后自动移除）

- **大模型提示词输入框现在有记忆**
  - 自动保存到 `llm_hint.json` 持久化存储
  - 加载工作流时自动恢复上次保存的内容

### Improvements

- **移除"自定义前缀"和"自定义后缀"输入框**
  - 减少节点复杂度，正面提示词拼接顺序更清晰

- **质量等级不随"随机填充"触发而改动**
  - "随机填充"按钮不再改动"质量等级"下拉框
  - 选择随机标记时，"质量等级"不参与随机判断

### Files Changed

| File | Change |
|------|--------|
| `data/sfw_prompts.json` | 修复连体工装裤英文标签拼写 |
| `prompt_enhancer.py` | 移除前缀/后缀、中断检测、状态提示、提示词记忆 |
| `llm_client.py` | httpx 替换 urllib |
| `config_manager.py` | 添加 llm_hint.json 存储 |
| `js/index.js` | 画布状态提示、质量等级跳过随机填充 |
| `js/control_panel.js` | 版本号更新 |
| `__init__.py` | 版本号更新 |

---

## V1.2.1 Mod0 (2026-05-24)

### Bug Fixes

- **修复 API 连接测试始终使用旧配置的问题**
  - 服务配置面板点击"测试连接"时，现在正确使用当前选中的多服务配置
  - 修复测试时 masked API key (`****`) 被当作真实 key 发送的问题

- **修复切换服务后 PromptEnhancer 不生效的问题**
  - PromptEnhancer 节点现在使用 `LLMClient.for_category()` 读取多服务配置
  - 之前错误地使用旧版单服务 `llm_config.json`

- **修复服务配置面板保存时覆盖 API Key 的问题**
  - API Key 输入框默认显示 masked 值（`****`）
  - 只有用户实际修改了 key 才会发送到后端保存
  - 未修改时保留原值不变

### New Features

- **思维链控制（Thinking Control）**
  - 新增 `thinking_control.py` 模块，支持自动关闭推理模型的思维链
  - 支持的模型：DeepSeek V3/V4/R1、Qwen3、智谱 GLM4、Gemini 2/3、Grok 3 Mini
  - 三层防御：发送关闭参数 → 过滤输出标签 → 回退读取 reasoning_content
  - 每个服务独立配置，默认开启

- **Prompt 历史记录**
  - PromptEnhancer 执行后自动保存 prompt 到历史
  - 设置面板中可查看、复制、删除历史记录
  - 支持配置保存上限：10/20/50/100/不限/自定义
  - 默认保存最近 50 条

- **LoRA 收藏夹**
  - 在 LoRA Hub 和画布 "+" 菜单中可收藏 LoRA
  - 收藏的 LoRA 自动置顶显示（保持字母序）
  - 收藏状态持久化，跨会话保持

- **LoRA 标记保护（LLM 防改写）**
  - LoRA 触发词用 `///` 标记包裹后发送给 LLM
  - System prompt 注入保护指令，要求 LLM 不得修改标记内容
  - LLM 返回后自动验证：标签丢失时自动补回
  - 兼容老用户自定义 system prompt（动态注入保护指令）

### Improvements

- 服务配置面板新增两个 per-service 开关：
  - **关闭思维链**（`disable_thinking`）— 默认 ON，发送模型特定的关闭参数
  - **过滤思维链输出**（`filter_thinking_output`）— 默认 ON，移除输出中的 `<think>` 等标签
- `reasoning_content` 字段作为 content 为空时的保底回退
- 默认 SFW/NSFW system prompt 更新，内置 `///` 标记保护指令

### Files Changed

| File | Change |
|------|--------|
| `thinking_control.py` | New — 思维链控制模块 |
| `config_manager.py` | 服务 schema 新增字段 + 默认 prompt 更新 |
| `llm_client.py` | 思维链控制 + LoRA 标记保护 |
| `prompt_enhancer.py` | LoRA 标记包裹 + 后验证 |
| `js/lora_group/service_config.js` | 开关 UI + 数据收集 |
| `js/lora_group/styles.css` | Toggle switch 样式 |
| `__init__.py` | 版本号 V1.2.1 Mod0 |

---

## V1.2.0 Mod1 (2026-05-22)

- 多服务 API 配置系统
- 提示词增强 SFW/NSFW 双库
- LoRA 分组管理器
- AI Agent 模式
- 设置面板前端

---

## V1.1.0 (2026-05-20)

- 初始版本
- 基础 PromptEnhancer 节点
- LoRA Prompt Loader
- CLIP Text Encode Pro
