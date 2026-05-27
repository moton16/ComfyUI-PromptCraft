<p align="center">
  <img src="https://img.shields.io/badge/ComfyUI-Node-blueviolet?style=for-the-badge" alt="ComfyUI Node"/>
  <img src="https://img.shields.io/badge/版本-v1.2.3-brightgreen?style=for-the-badge" alt="Version 1.2.3"/>
  <img src="https://img.shields.io/badge/状态-正式发布-ff69b4?style=for-the-badge" alt="Stable"/>
  <img src="https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge" alt="Python 3.8+"/>
</p>

<h1 align="center">🎨 PromptCraft</h1>
<h3 align="center">— ComfyUI 全维度提示词增强 · LoRA 群组管理 · AI Agent —</h3>

<p align="center">
  <b>提示词荒终结者 · 15+ 维度标签 · 双库切换 · 权重控制 · LLM 增强 · LoRA 全栈管理 · AI Agent 自然语言操控</b>
</p>

<p align="center">
  <i>从提示词生成到 LoRA 编排，从大模型增强到自然语言驱动，一个插件覆盖 AI 绘画全链路</i>
</p>

<p align="center">
  <a href="./README.md">🌐 中文</a> | <a href="./README_en.md">English</a>
</p>

---

## 📖 总览

**PromptCraft** 是一款功能丰富的 ComfyUI 自定义节点插件，从解决「提示词荒」出发，逐步演进为覆盖提示词生成、LoRA 管理、大模型集成、AI Agent 的全链路工具。

核心能力包括：内置 **15+ 维度**、**数百个中英文对照标签**的专业 Prompt 库，**LoRA 群组管理 + 画布内联栈**，**多服务 LLM 接入与智能思维链控制**，以及 **AI Agent 自然语言驱动工作流操控**。

> 无论是提示词创作、LoRA 编排，还是用自然语言管理整个工作流，PromptCraft 都能帮你高效完成。

---

## ✨ 功能特性

### 🎯 提示词核心

| 特性 | 说明 |
|------|------|
| **🎲 多模式随机填充** | 每分类支持「全量随机 / 仅 SFW 随机 / 仅 NSFW 随机 / 子组随机」四种模式 |
| **🏷️ 15+ 维度标签库** | 场景、动作、服饰、情绪、机位、镜头、光源、色调、风格、质量等，中英对照 |
| **⚖️ 独立权重控制** | 四大核心分类（场景/动作/服饰/情绪）可独立设置 0.0~2.0 权重，生成 SD 原生 `(tag:weight)` 语法 |
| **📦 预设配置** | 内置多套预设（古风仕女、都市时尚、科幻战士等），一键应用四维组合 |
| **🔄 缓存智能管理** | 文件变更自动检测，修改 Prompt 库后无需重启即可生效 |
| **📝 LoRA Prompt 注入** | 每个 LoRA 可携带专属 prompt 组，在 PromptEnhancer 中最前端注入，LLM 不覆盖 |

### 🎛️ LoRA 全栈管理

- **Model & LoRA Group Loader** — 底模切换 + LoRA 群组一键加载
  - 支持 Checkpoint 下拉选择，或选「None」透传上游 MODEL
  - LoRA 栈画布内联显示，个体 LoRA + 群组引用混合排列、拖拽排序
  - 每条目独立开关 + Model/CLIP 双权重输入
  - 群组引用实时解析（后端执行时展开），始终使用最新群组配置
  - 统一倍率滑块（0.0~2.0×），群组内所有 LoRA 权重一键缩放
  - 群组缺失 LoRA 自动跳过并警告，不中断执行
- **LoRA Hub 统一管理面板** — 浏览、群组、Agent 三 Tab 布局
  - LoRA Tab：文件夹树导航 + 模糊搜索 + 收藏 + 详情查看
  - 群组 Tab：新建/重命名/删除/搜索 + LoRA 拖拽添加/排序/权重编辑
  - 支持 LoRA 配置导入/导出（JSON 文件）
- **LoRA Prompt Loader** — 底模切换 + LoRA 栈 + 文本合并，输出纯文本
  - 可连接 CLIP Text Encode Pro 合并编码，与标准 CheckpointLoader 管线兼容

### 🤖 LLM 大模型增强

- 支持 **OpenAI 兼容 API**（推荐 DeepSeek / GLM / Qwen 等大模型）
- **多服务配置** — 可配置多个 API 服务，独立管理 URL / Key / 模型
- Temperature（温度/创造度）与 Max Tokens 可调
- **一键连接测试** — 设置面板内置测试按钮
- **双规则系统** — SFW 基础扩写 / NSFW 详细扩写，独立开关控制
- **智能思维链控制** — 根据模型名称自动发送思维链关闭参数（支持 GLM / Qwen / DeepSeek / Gemini / Grok 等），过滤响应中的思维链输出
- **大模型提示词输入框** — 可在节点内向 LLM 传入额外定制指令

### 🤖 AI Agent

- **自然语言驱动** — 用中文描述需求，Agent 自动翻译为结构化操作
- **8 种操作类型** — `lora_add` / `lora_remove` / `lora_toggle` / `lora_weight` / `checkpoint` / `prompt_set` / `category_set` / `query`
- **双入口** — LoRA Hub 侧栏 Agent Tab + 画布浮动对话框
- **消息气泡交互** — 区分用户/Agent 角色，操作结果卡片实时反馈（成功/失败/跳过）
- **快捷指令按钮** — 常用操作一键触发，无需手打命令
- **System Prompt 硬编码** — 前端不可编辑，确保 LLM 行为一致性

### 📚 双 Prompt 库管理

- **普通内容库 (SFW)** — 内置场景、动作、服饰等全分类标签
- **特殊内容库 (NSFW)** — 独立管理，启用后与 SFW 库合并显示
- **可视化库编辑器** — 弹窗式表格编辑，支持新增/删除/修改分类和标签
- **子组 (Subgroup) 支持** — 标签可按子组归类，支持子组级随机选择
- **空库自动恢复** — 用户库意外清空时自动从内置模板恢复

### ⚙️ ComfyUI 全局设置集成

在 ComfyUI 设置面板中提供一站式管理入口：

| 功能 | 类型 |
|------|------|
| 🤖 多服务 API 配置 | 文本/布尔/滑块输入 |
| 🧪 大模型 API 连接测试 | 按钮触发 |
| ⛔ 负面 Prompt 编辑器 | 按钮弹窗 |
| 📝 提示词规则管理器 | 按钮弹窗 |
| 📚 Prompt 库编辑器（SFW/NSFW） | 按钮弹窗 |
| 🔄 Prompt 库缓存重载 | 按钮触发 |
| 📋 版本信息 | 只读显示 |

### 🛡️ 安全与健壮性

- **API Key 掩码保护** — 设置面板中显示掩码，不会明文暴露
- **原子性写入** — 临时文件 + rename，防止写入中断导致配置文件损坏
- **自动模板同步** — 内置模板更新时自动同步到用户配置
- **双库缓存隔离** — SFW/NSFW 独立缓存与 mtime 失效检测
- **LoRA Sidecar 缓存** — `.pc-info-info.json` 缓存计算结果，带版本号强制刷新

---

## 🚀 安装方法

### 环境要求

- [ComfyUI](https://github.com/comfyanonymous/ComfyUI)（推荐使用最新版本或 ComfyUI-aki 分支）
- Python 3.8+
- `aiohttp`（API 路由依赖）

### 安装步骤

#### 方式一：Git 克隆（推荐）

```bash
cd <ComfyUI根目录>/custom_nodes
git clone https://github.com/your-repo/moton-promptcraft.git
```

#### 方式二：手动解压

1. 下载最新版 ZIP 包
2. 解压到 `<ComfyUI根目录>/custom_nodes/moton-promptcraft/`
3. 启动/重启 ComfyUI

### 首次配置

1. 重启 ComfyUI 后，在节点列表搜索 **"PromptCraft"** 即可找到全部节点
2. **（可选）** 打开 ComfyUI 设置 → 找到 **PromptCraft** 配置区域
3. 填入 LLM API URL、API Key 和模型名称（如需要使用大模型增强）
4. 将节点拖入画布，选择标签或直接使用随机模式，点击生成

---

## 📖 使用指南

### 🔰 节点一览

PromptCraft 提供 5 个 ComfyUI 节点：

| 节点 | 类型 | 说明 |
|------|------|------|
| **PromptCraft** | 提示词 | 核心提示词生成节点，15+ 维度标签 + 权重控制 + LLM 增强 |
| **Model & LoRA Group Loader** | 模型加载 | 底模切换 + LoRA 群组/栈管理，输出 MODEL + CLIP + VAE + lora_prompt_data |
| **LoRA Prompt Loader** | 文本工具 | LoRA 栈管理 + 底模切换，输出纯文本（positive_text / negative_text） |
| **CLIP Text Encode Pro** | 编码器 | 官方 CLIPTextEncode 升级版，额外支持 text2 输入合并编码 |
| **AI Chat** | 对话 | 点击按钮打开 Agent 聊天面板，自然语言驱动 LoRA/模型操作 |

### 🎨 PromptCraft 核心节点

1. 在 ComfyUI 画布右键 → **Add Node** → 搜索 `PromptCraft`
2. 节点输入区包含以下模块：

   ```
   ┌─────────────────────────────────────────────────────────┐
   │ 📝 用户输入                                              │
   │   自定义前缀 · 用户 Prompt · 自定义后缀                    │
   │                                                          │
   │ 👤 主体设定                                              │
   │   主体人数 · 角色类型                                     │
   │                                                          │
   │ 🎯 核心内容（可设权重）                                    │
   │   场景类型 · 动作姿态 · 服饰 · 情绪氛围                     │
   │   权重: [0.0~2.0] 每项独立调节                             │
   │                                                          │
   │ 🎬 拍摄与镜头                                            │
   │   机位角度 · 镜头类型 · 特效镜头 · 镜头滤镜                 │
   │                                                          │
   │ 💡 光影与色彩                                            │
   │   光源类型 · 光线类型                                     │
   │                                                          │
   │ 🎨 风格与质量                                            │
   │   视觉风格 · 质量等级                                     │
   │                                                          │
   │ ⚙️ 控制                                                  │
   │   预设配置 · 特殊内容开关 · 语言大模型接入 · 扩写模式       │
   │   大模型提示词 · 负面提示词类型 · lora_prompt_data 输入     │
   └─────────────────────────────────────────────────────────┘
   ```

3. 节点输出三个值：
   - **正面提示词** — 拼接后的完整正向提示词
   - **负面提示词** — 根据选择模板生成的负面提示词
   - **完整信息** — 调试用摘要（包含长度、大模型状态、特殊内容状态）

### 🎛️ LoRA 管理工作流

**推荐管线 A — 模型加载型：**

```
CheckpointLoader → ModelLoraGroupLoader → KSampler
                          ↓
                    PromptCraft (lora_prompt_data 输入)
```

ModelLoraGroupLoader 同时输出 MODEL/CLIP/VAE 和 lora_prompt_data，一条线搞定模型加载和 prompt 注入。

**推荐管线 B — 纯文本型：**

```
CheckpointLoader → LoraPromptLoader → CLIPTextEncodePro → KSampler
                          ↓
                    PromptCraft (lora_prompt_data 输入)
```

LoraPromptLoader 输出纯文本，通过 CLIPTextEncodePro 合并编码，更灵活。

### 🎲 随机模式详解

每个分类下拉菜单提供四种随机模式：

| 选项 | 行为 |
|------|------|
| `🎲 随机选择` | 跟随全局「特殊内容」开关决定从哪个库随机 |
| `🎲 仅在普通内容库随机` | 强制只从 SFW 库抽取 |
| `🎲 仅在特殊内容库随机` | 强制只从 NSFW 库抽取（需开启特殊内容） |
| `🎲 随机·<子组名>` | 仅在该子组范围内随机 |

> 每次运行只要包含任意随机标记，节点都会自动生成不同结果，确保每张图的 prompt 独一无二。

### 🤖 LLM 增强

1. 在 ComfyUI 设置面板中填入 LLM 的 API URL、API Key 和模型名称
2. 在节点中勾选「语言大模型接入」开关
3. 选择扩写模式：「基础扩写」或「详细扩写」
4. （可选）在「大模型提示词」输入框中填写对 LLM 的特殊要求
5. 运行时系统将先拼接库标签，再发送给 LLM 进行细节增强
6. 思维链自动控制 — 系统根据模型名称自动关闭思维链输出（支持 GLM-4.x / Qwen3 / DeepSeek / Gemini / Grok 等）

### 🤖 AI Agent 使用

1. 在 LoRA Hub 面板切换到 **Agent Tab**，或在画布点击 AI Chat 节点的按钮
2. 用自然语言描述需求，例如：
   - "帮我换成赛博朋克风格的 LoRA，权重 0.8"
   - "把所有 LoRA 权重降到 0.5"
   - "当前工作流状态是什么？"
3. Agent 自动解析为结构化操作，执行后返回结果卡片

---

## 🔢 权重语法

节点输出的权重遵循 Stable Diffusion 原生语法：

| 权重值 | 输出语法 | 效果 |
|--------|----------|------|
| `1.0`（默认） | `tag` | 正常权重 |
| `> 1.0` | `(tag:1.5)` | 增强权重 |
| `< 1.0` | `[tag]` | 削弱权重 |
| `0.0` | （不输出） | 跳过该标签 |

---

## 📁 数据存储

### 用户配置目录（可编辑）

```
<ComfyUI用户目录>/default/prompt_enhancer/
├── llm_config.json           # LLM API 配置（多服务）
├── llm_system_prompt.json    # System Prompt 规则配置
├── sfw_prompts.json          # SFW Prompt 库（用户可编辑）
├── nsfw_prompts.json         # NSFW Prompt 库（用户可编辑）
├── negative_prompt.json      # 自定义负面提示词
├── lora_groups.json          # LoRA 群组配置
├── lora_prompts.json         # LoRA Prompt 组配置
└── service_config.json       # 多服务 API 配置
```

### 内置模板目录（只读参考）

```
<moton-promptcraft>/data/
├── sfw_prompts.json          # SFW 内置模板
├── nsfw_prompts.json         # NSFW 内置模板
├── llm_config.json           # LLM 默认配置
├── llm_system_prompt.json    # System Prompt 默认模板
└── default_prompts.json      # 旧版兼容文件（已迁移）
```

> 当内置模板更新时，系统会自动同步到用户目录，确保下拉框始终反映最新标签。

---

## 🗂️ 项目结构

```
moton-promptcraft/
├── __init__.py                   # 插件入口，节点注册 + 配置初始化
├── prompt_enhancer.py            # 核心节点（INPUT_TYPES、生成逻辑、权重控制）
├── model_lora_loader.py          # Model & LoRA Group Loader 节点
├── lora_prompt_loader.py         # LoRA Prompt Loader 节点
├── clip_text_encode_pro.py       # CLIP Text Encode Pro 节点
├── ai_chat.py                    # AI Chat 节点
├── config_manager.py             # 配置管理器（单例，持久化 CRUD）
├── llm_client.py                 # OpenAI 兼容 LLM 客户端 + 思维链控制
├── api_routes.py                 # aiohttp API 路由（前端通信接口）
├── lora_group_manager.py         # LoRA 群组管理器（CRUD + 磁盘扫描）
├── lora_prompt_manager.py        # LoRA Prompt 组管理器
├── lora_scanner.py               # LoRA 磁盘扫描 + sidecar 缓存
├── thinking_control.py           # 思维链自动控制（按模型匹配规则）
├── agent_prompt.py               # Agent System Prompt 定义
├── CHANGELOG.md                  # 更新日志
├── README.md                     # 本文档
├── js/
│   ├── index.js                  # 前端主入口（LiteGraph 钩子、设置面板）
│   ├── chat_panel.js             # AI Agent 浮动对话框
│   ├── control_panel.js          # 设置面板内容生成器
│   ├── lora_group/
│   │   ├── index.js              # LoRA Group 前端注册入口
│   │   ├── api.js                # LoRA/群组 API 调用封装
│   │   ├── stack_api.js          # 栈状态管理模块
│   │   ├── canvas_widget.js      # 画布内联 LoRA 栈 Widget
│   │   ├── hub_panel.js          # LoRA Hub 统一管理面板
│   │   ├── agent_panel.js        # Agent 对话面板
│   │   ├── agent_executor.js     # Agent 操作执行器
│   │   ├── service_config.js     # 多服务 API 配置面板
│   │   └── styles.css            # Hub 面板样式
│   └── lora_prompt_loader/
│       └── index.js              # LoRA Prompt Loader 前端注册
├── data/                         # 内置模板数据
│   ├── sfw_prompts.json
│   ├── nsfw_prompts.json
│   ├── llm_config.json
│   ├── llm_system_prompt.json
│   └── default_prompts.json
└── design/                       # 设计文档与原型
```

---

## 📊 代码统计

| 类别 | 行数 | 文件数 |
|------|------|--------|
| Python 后端 | ~4,100 | 15 |
| JavaScript 前端 | ~4,850 | 12 |
| CSS 样式 | ~2,850 | 1 |
| **总计** | **~11,800** | **28** |

---

## 📝 版本历史

### v1.2.3 (2026-05-26) — 当前版本

- 🔧 **更新**：Prompt库整合优化，整合V1.2.1测试改进版内容
- 🔧 **优化**：提升使用稳定性

### v1.2.1 (2026-05-24)

- 🔧 **调整**：LoRA Prompt Loader 底模加载逻辑修正
- 🔧 **调整**：LoRA 应用问题修复，隐藏 widget 改为 optional input 方式
- 🐛 **修复**：Prompt 组过滤与群组引用展开逻辑修正

### v1.2.0 (2026-05-21) — 大版本更新

- 🚀 **新增**：Model & LoRA Group Loader 节点 — 底模切换 + LoRA 群组一键加载
- 🚀 **新增**：LoRA 栈模式 — 画布内联 LoRA 列表，个体 + 群组混合排列
- 🚀 **新增**：LoRA Hub 统一管理面板 — 浏览/群组/Agent 三 Tab
- 🚀 **新增**：LoRA Prompt 组系统 — 每个 LoRA 可携带专属 prompt
- 🚀 **新增**：AI Agent 模块 — 自然语言驱动 LoRA/模型操作
- 🚀 **新增**：LoRA Prompt Loader + CLIP Text Encode Pro 节点
- 🚀 **新增**：AI Chat 节点
- 🚀 **新增**：智能思维链控制 — 根据模型自动关闭思维链
- 🚀 **新增**：多服务 API 配置
- 🚀 **新增**：14+ API 端点（群组 CRUD / LoRA 扫描 / Agent 等）
- 🔧 **调整**：前端模块化重构，LoRA 相关代码拆分为独立文件
- 🔧 **调整**：版本号统一升级至 v1.2.0

### v1.1.2 (2026-05-16)

- 🔧 **调整**：删除了部分语义重叠的 Prompt 组，精简 UI
- 🔧 **调整**：改进大模型 API 调用测试方式
- 🐛 **修复**：修复了已知问题

### v1.1.1 (2026-05-13)

- 🚀 **新增**：节点底部新增「大模型提示词」输入框
- 🚀 **新增**：设置面板新增「负面 Prompt 编辑器」
- 🚀 **新增**：动作姿态新增 NSFW 子组
- 🔧 **调整**：用户 Prompt 拼接顺序调整到库标签之前
- 🔧 **调整**：移除节点上的自定义负面提示词输入框，集中到设置面板管理
- 🐛 **修复**：修复输入框高度异常导致的 UI 遮挡问题

### v1.1.0 (2026-05-12) — 首个正式版本

- 15+ 维度标签分类，中英文对照
- 普通内容 / 特殊内容双库独立管理
- 权重语法原生兼容 SD
- 四维预设配置（场景、动作、服饰、情绪）
- 可选 LLM 大模型增强
- ComfyUI 设置面板深度集成
- 库内容、大模型规则支持自定义修改

完整更新日志请参阅 [CHANGELOG.md](./CHANGELOG.md)。

---

## ⚠️ 注意事项

1. **特殊内容库默认为空** — 特殊内容开关默认关闭，节点下拉菜单仅显示 SFW 标签
2. **API Key 安全** — 设置面板中 API Key 输入后显示掩码保护，不会明文暴露
3. **配置损坏保护** — 原子性写入机制防止配置写入中断导致文件损坏
4. **空库自动恢复** — 若用户库被误删为空，自动从内置模板恢复
5. **LLM 需要自备 Key** — 大模型增强功能需要自行配置 OpenAI 兼容的 API Key
6. **子组仅支持核心分类** — 子组随机功能目前仅对场景类型、动作姿态、服饰、情绪氛围四个核心分类生效
7. **LoRA 文件位置** — LoRA 扫描从 `ComfyUI\models\loras` 读取，无需手动导入
8. **Agent 操作范围** — AI Agent 目前仅支持 LoRA 栈和底模操作，暂不支持画布节点连线

---

## ❓ 常见问题

<details>
<summary><b>Q: 节点下拉菜单中为什么看不到特殊内容标签？</b></summary>
需要在节点中勾选「特殊内容」开关，特殊内容标签才会显示。
</details>

<details>
<summary><b>Q: 修改了 Prompt 库，为什么节点下拉没有更新？</b></summary>
保存 Prompt 库后系统会自动重载缓存。如果仍未更新，可手动点击设置面板中的「重载 Prompt 库缓存」按钮。
</details>

<details>
<summary><b>Q: 如何自定义负面提示词？</b></summary>
打开 ComfyUI 设置 → PromptCraft → 点击「负面 Prompt 编辑器」按钮，在弹窗中编辑保存即可。然后在节点中选择「负面提示词类型 → 自定义」。
</details>

<details>
<summary><b>Q: LLM 增强不生效怎么办？</b></summary>
请检查：① 设置面板中是否已启用大模型 ② API URL、API Key、模型是否填写正确 ③ 节点中是否勾选了「语言大模型接入」④ 可使用设置面板中的「测试 API 连接」按钮验证配置。
</details>

<details>
<summary><b>Q: ModelLoraGroupLoader 和 LoraPromptLoader 有什么区别？</b></summary>
建议使用ModelLoraGroupLoader，LoraPromptLoader是此前设计的旧节点，不再进行维护
</details>

<details>
<summary><b>Q: AI Agent 支持哪些操作？</b></summary>
目前支持 8 种操作：添加/移除/切换/调权 LoRA、切换底模、设置提示词、设置分类选择、查询当前状态。暂不支持操作画布连线，未来会进行进一步优化。
</details>

<details>
<summary><b>Q: 群组引用和个体 LoRA 有什么区别？</b></summary>
群组引用是已保存的 LoRA 集合，后端执行时实时展开为具体 LoRA 列表；个体 LoRA 是直接添加的单个 LoRA。两者可在栈中混合排列，群组引用以紫色名称标识。
</details>

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

- 🐛 **报告 Bug**：请提交 [GitHub Issue]
- 💡 **功能建议**：在 Issue 中描述你的想法
- 📦 **扩展 Prompt 库**：欢迎提交更多高质量标签

## 📬 联系

- **作者**：Moton
- **邮箱**：Moton16@163.com

---

## 📄 许可证

本项目遵循原开源许可证协议。详见项目根目录许可证文件。

---

<p align="center">
  <b>✨ PromptCraft — 从提示词到工作流，让每次创作都不缺灵感 ✨</b>
  <br>
  <i>如果这个插件帮到了你，欢迎给项目点个 ⭐</i>
</p>
