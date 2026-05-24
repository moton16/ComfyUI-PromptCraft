<p align="center">
  <img src="https://img.shields.io/badge/ComfyUI-节点-blueviolet?style=for-the-badge" alt="ComfyUI Node"/>
  <img src="https://img.shields.io/badge/版本-v1.1.2-brightgreen?style=for-the-badge" alt="Version 1.1.2"/>
  <img src="https://img.shields.io/badge/状态-正式发布-ff69b4?style=for-the-badge" alt="Stable"/>
  <img src="https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge" alt="Python 3.8+"/>
</p>

<h1 align="center">🎨 PromptCraft</h1>
<h3 align="center">— ComfyUI 全维度提示词增强节点 —</h3>

<p align="center">
  <b>告别提示词荒 · 12+ 维度标签分类 · 双库切换 · 权重控制 · LLM 大模型增强</b>
</p>

<p align="center">
  <i>将你从「不知道写什么 prompt」的迷茫中解放出来，一键生成专业级 Stable Diffusion 提示词</i>
</p>

---

## 📖 总览

**PromptCraft** 是一款功能丰富的 ComfyUI 自定义节点，旨在解决 AI 绘画中的「提示词荒」问题。它内置了覆盖 **12+ 维度**、**数百个中英文对照标签**的专业 Prompt 库，支持 **双库独立管理**、**权重精细化控制**、**LLM 大模型细节增强**，并提供 **ComfyUI 全局设置面板深度集成**。

> 无论是新手还是老手，PromptCraft 都能帮你稳定产出高质量、多样化的提示词，让每次生成都充满惊喜。

---

## ✨ 功能特性

### 🎯 核心能力

| 特性 | 说明 |
|------|------|
| **🎲 多模式随机填充** | 每分类支持「全量随机 / 仅 SFW 随机 / 仅 NSFW 随机 / 子组随机」四种模式 |
| **🏷️ 15+ 维度标签库** | 场景、动作、服饰、情绪、机位、镜头、光源、色调、风格、质量等，中英对照 |
| **⚖️ 独立权重控制** | 四大核心分类（场景/动作/服饰/情绪）可独立设置 0.0~2.0 权重，生成 SD 原生 `(tag:weight)` 语法 |
| **📦 预设配置** | 内置多套预设（古风仕女、都市时尚、科幻战士等），一键应用四维组合 |
| **🔄 缓存智能管理** | 文件变更自动检测，修改 Prompt 库后无需重启即可生效 |

### 🤖 LLM 大模型增强

- 支持 **OpenAI 兼容 API**（推荐使用deepseek-v4-flash大模型）
- 可配置 API URL、API Key、模型名称
- Temperature（温度/创造度）与 Max Tokens 可调
- **一键连接测试** — 设置面板内置测试按钮
- **双规则系统** — SFW 基础扩写 / NSFW 详细扩写，独立开关控制
- **大模型提示词输入框** — 可在节点内向 LLM 传入额外定制指令

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
| 🤖 大模型连接配置 | 文本/布尔/滑块输入 |
| 🧪 大模型 API 连接测试 | 按钮触发 |
| ⛔ 负面 Prompt 编辑器 | 按钮弹窗 |
| 📝 提示词规则管理器 | 按钮弹窗 |
| 📚 Prompt 库编辑器（SFW/NSFW） | 按钮弹窗 |
| 🔄 Prompt 库缓存重载 | 按钮触发 |
| 📋 版本信息 | 只读显示 |

### 🛡️ 安全与健壮性

- **API Key 掩码保护** — 设置面板中显示掩码，不会明文暴露
- **原子性写入** — 防止写入中断导致配置文件损坏
- **自动模板同步** — 内置模板更新时自动同步到用户配置
- **双库缓存隔离** — SFW/NSFW 独立缓存与失效检测

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

1. 重启 ComfyUI 后，在节点列表**prompt**栏下可找到，或搜索 **"PromptCraft"** 即可找到节点
2. **（可选）** 打开 ComfyUI 设置 → 找到 **PromptCraft** 配置区域
3. 填入 LLM API URL、API Key 和模型名称（如需要使用大模型增强）
4. 将节点拖入画布，选择标签或直接使用随机模式，点击生成

---

## 📖 使用指南

### 🔰 基础使用

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
   │   大模型提示词 · 负面提示词类型                             │
   └─────────────────────────────────────────────────────────┘
   ```

3. 节点输出三个值：
   - **正面提示词** — 拼接后的完整正向提示词
   - **负面提示词** — 根据选择模板生成的负面提示词
   - **完整信息** — 调试用摘要（包含长度、大模型状态、特殊内容状态）

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

### 🔞 特殊内容模式

1. 在节点中勾选「特殊内容」开关
2. 各分类下拉菜单将追加显示 NSFW 库中的标签
3. 可选择特定标签，或使用随机模式在 NSFW 库范围内抽取

### 📦 预设配置

1. 在 Prompt 库编辑器中创建预设组合（包含场景/动作/服饰/情绪设置）
2. 在节点中选择该预设，一键应用所有配置

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
├── llm_config.json           # LLM API 配置
├── llm_system_prompt.json    # System Prompt 规则配置
├── sfw_prompts.json          # SFW Prompt 库（用户可编辑）
├── nsfw_prompts.json         # NSFW Prompt 库（用户可编辑）
└── negative_prompt.json      # 自定义负面提示词
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
├── __init__.py               # 插件入口，节点注册
├── prompt_enhancer.py        # 核心节点（INPUT_TYPES、生成逻辑）
├── config_manager.py         # 配置管理器（单例，持久化 CRUD）
├── llm_client.py             # OpenAI 兼容 LLM 客户端
├── api_routes.py             # aiohttp API 路由（前端通信接口）
├── server.py                 # 已废弃（路由迁移至 api_routes.py）
├── CHANGELOG.md              # 更新日志
├── README.md                 # 本文档
├── js/
│   └── index.js              # 前端全部逻辑（LiteGraph 钩子、设置面板、弹窗）
├── data/                     # 内置模板数据
│   ├── sfw_prompts.json
│   ├── nsfw_prompts.json
│   ├── llm_config.json
│   ├── llm_system_prompt.json
│   └── default_prompts.json
└── skills/                   # Agent 技能存储
```

---

## 📊 代码统计

| 文件 | 行数 | 职责 |
|------|------|------|
| `js/index.js` | ~1,586 | 前端全部逻辑：LiteGraph 钩子、设置面板注册、弹窗 UI、按钮注入、回退面板 |
| `prompt_enhancer.py` | ~595 | ComfyUI 节点核心：INPUT_TYPES、生成逻辑、分类解析、权重控制 |
| `config_manager.py` | ~434 | 配置管理单例：CRUD、原子性写入、缓存管理、自动恢复 |
| `llm_client.py` | ~232 | LLM API 客户端：OpenAI 兼容、连接测试、自动路径补全 |
| `api_routes.py` | ~229 | API 路由：配置读写、库编辑、系统规则管理 |
| `__init__.py` | ~65 | 插件入口：节点注册、配置初始化、旧版迁移 |
| **总计** | **~3,141** | — |

---

## 📝 版本历史

### v1.1.2 (2026-05-16) — 当前版本

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

### v1.0.x Beta (2026-05-11)

内部测试版本，已合并到 v1.1.0 正式版。

完整更新日志请参阅 [CHANGELOG.md](./CHANGELOG.md)。

---

## ⚠️ 注意事项

1. **特殊内容库默认为空** — 特殊内容开关默认关闭，节点下拉菜单仅显示 SFW 标签
2. **API Key 安全** — 设置面板中 API Key 输入后显示掩码保护，不会明文暴露
3. **配置损坏保护** — 原子性写入机制防止配置写入中断导致文件损坏
4. **空库自动恢复** — 若用户库被误删为空，自动从内置模板恢复
5. **LLM 需要自备 Key** — 大模型增强功能需要自行配置 OpenAI 兼容的 API Key
6. **子组仅支持核心分类** — 子组随机功能目前仅对场景类型、动作姿态、服饰、情绪氛围四个核心分类生效

---

## ❓ 常见问题

<details>
<summary><b>Q: 节点下拉菜单中为什么看不到 特殊内容 标签？</b></summary>
需要在节点中勾选「特殊内容」开关，特殊内容 标签才会显示。
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
  <b>✨ PromptCraft — 让每次创作都不缺灵感 ✨</b>
  <br>
  <i>如果这个节点帮到了你，欢迎给项目点个 ⭐</i>
</p>