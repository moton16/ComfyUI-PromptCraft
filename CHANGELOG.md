# **Moton's PromptCraft - 更新日志**

## **作者：Moton**

# v1.2.0 Mod5 (2026-05-21)

### 🚀 新增

* **AI Agent 模块**——自然语言驱动的 LoRA/模型智能管理
  * 新增 `agent_executor.js`：前端操作执行器，支持 8 种结构化操作（`lora_add`/`lora_remove`/`lora_toggle`/`lora_weight`/`checkpoint`/`prompt_set`/`category_set`/`query`）
  * 新增 `agent_panel.js`：Agent 对话 UI（消息气泡 + 操作结果卡片 + 快捷指令按钮）
  * LoRA Hub 侧栏新增 **Agent Tab**，LoRA / 群组 / Agent 三 Tab 布局
  * `chat_panel.js` 重写为 Agent 浮动对话框入口，节点画布一键唤起
  * `api_routes.py` 新增 `POST /agent` 端点，转发自然语言指令至 LLM 并返回结构化 JSON
* **Agent 对话交互**
  * 支持消息气泡区分用户/Agent 角色，Agent 回复附带操作结果卡片（成功/失败/跳过）
  * 快捷指令按钮：常用操作一键触发，无需手打命令

### 🔧 调整

* **ModelLoraGroupLoader VAE 输出修复**：`RETURN_TYPES` 增加 `"VAE"`，`execute()` 捕获 `load_checkpoint_guess_config` 返回的第三个值，与标准管线完整对接
* **前端模块依赖调整**：`agent_panel.js` 引入 callback 注册模式解决与 `canvas_widget.js` 的循环依赖（`hub_panel.js` 中 `setHubRefreshCallback` 必须在 `import agent_panel` 之前定义）

### 📐 架构备注

* Agent 执行器不直接操作 ComfyUI 节点状态，而是通过 `stack_api.js` 间接修改栈数据，保持数据流单向
* Agent system prompt 在 `agent_prompt.py` 中硬编码，前端不可编辑，确保 LLM 行为一致性
* `agentMessages` 为模块级变量，Hub Agent Tab 与浮动对话框共享状态但不会同时打开

---

## v1.2.0 Mod4 (2026-05-21)

### 🚀 新增

* **统一 LoRA Hub 面板**——替代分散的群组面板和 LoRA 浏览器
  * 新增 `hub_panel.js`，替代已删除的 `group_panel.js` + `lora_browser.js`
  * 左侧：LoRA/群组双 Tab 浏览器 + 文件夹树导航
  * 右侧：LoRA 详情（内联 prompt 编辑）、群组详情
  * 面板内支持 LoRA 搜索、磁盘文件夹导航、群组 CRUD 操作

### 🔧 调整

* **前端模块重构**：删除 `group_panel.js` 和 `lora_browser.js`，功能合并至 `hub_panel.js`
* **CSS 命名空间新增 `lhub-` 前缀**：Hub 面板样式独立管理，避免与画布栈样式 `lsw-` 冲突
* **循环依赖解决方案落地**：采用 callback 注册模式（`setHubRefreshCallback`）打断 `canvas_widget ↔ hub_panel ↔ agent_panel` 循环链

### 📐 架构备注

* `hub_panel.js` 是前端模块依赖的核心枢纽，必须确保 callback setter 在 import 下游模块之前定义
* Hub 面板通过 `openHubPanel()` 函数打开，接收 `initialTab` 参数决定默认 Tab

---

## v1.2.0 Mod3 (2026-05-22)

### 🚀 新增

* **新节点「LoRA Prompt Loader」**——底模切换 + LoRA 栈 + 文本合并，一个节点输出纯文本
  * 复用 `canvas_widget.js` 的 LoRA 栈 UI，交互体验与 ModelLoraGroupLoader 一致
  * 支持从下拉框选择 Checkpoint 底模，或选择「None」仅管理 LoRA 栈
  * 输出 `positive_text` / `negative_text`（STRING 类型），可直接连接 CLIPTextEncodePro 或其他文本输入
  * 新增 `lora_prompt_loader.py` 后端 + `js/lora_prompt_loader/index.js` 前端注册
* **新节点「CLIP Text Encode Pro」**——官方 CLIPTextEncode + lora_text 合并编码
  * 纯后端节点，无前端扩展
  * 新增 optional STRING 输入 `lora_text`，与 `text` 字段合并后送入 CLIP 编码
  * 工作流：`LoraPromptLoader → positive_text → CLIPTextEncodePro.lora_text → KSampler`
  * 新增 `clip_text_encode_pro.py`

### 🐛 修复

* **底模加载问题**：Checkpoint 下拉选择逻辑修正
* **LoRA 应用问题**：隐藏 widget 传递改为 optional input 方式，避免 ComfyUI 序列化时丢失
* **Prompt 组过滤问题**：`serializeValue` 和 `lora_paths` 逻辑修正，确保群组引用正确展开

### 🔧 调整

* `__init__.py` 注册两个新节点（LoraPromptLoader、CLIPTextEncodePro）
* `js/index.js` import 新增 `lora_prompt_loader` 前端模块
* **推荐工作流变更**：标准 CheckpointLoader 负责底模 → LoraPromptLoader 管理 LoRA 栈 + 输出文本 → CLIPTextEncodePro 合并编码

### 📐 架构备注

* LoraPromptLoader 和 CLIPTextEncodePro 是互补组合：前者管「LoRA 加载 + prompt 拼接」，后者管「CLIP 编码」，职责正交
* LoraPromptLoader 的 checkpoint 选 "None" 时，仅作为 LoRA 栈 + 文本工具使用，底模由上游 CheckpointLoader 负责

## v1.2.0 Mod2 (2026-05-21)

### 🚀 新增

* **LoRA Prompt 组系统**——每个 LoRA 可存储多组 prompt，直接注入到 PromptEnhancer
  * 新增 `lora_prompt_manager.py`：LoRA prompt 组的 CRUD 管理器，存储在 `lora_prompts.json`
  * 画布栈上每个 LoRA 条目新增 ✎ 按钮，点击弹出 prompt 编辑浮窗
  * 支持为每个 LoRA 创建多个命名 prompt 组，每组含正面提示词 + 可选负面提示词
* **节点联动：ModelLoraGroupLoader → PromptEnhancer**
  * ModelLoraGroupLoader 新增第三个 STRING 输出 `lora_prompt_data`（JSON 格式）
  * PromptEnhancer 新增 optional STRING 输入 `lora_prompt_data`（通过连线接收）
  * LoRA prompt 在 PromptEnhancer **最前端**注入，LLM 扩写不碰这些 prompt
  * LoRA 负面提示词自动追加到最终负面提示词末尾
* **Agent 内置 System Prompt**
  * 新增 `agent_prompt.py`：独立 Python 文件存储 Agent 系统 prompt，前端不可编辑
  * LLM 客户端新增 `agent_call()` 方法：接收当前状态 + 自然语言指令，返回结构化操作 JSON
* **LoRA Prompt API**（4 个新端点）
  * GET `/lora_prompts` — 全部配置
  * GET/POST `/lora_prompts/<lora>` — 单个 LoRA 的 prompt 组读写
  * POST `/lora_prompts/<lora>/add_group` — 添加 prompt 组
  * DELETE `/lora_prompts/<lora>/group/<name>` — 删除 prompt 组

### 📐 架构备注

* LoRA prompt 注入位置在自定义前缀之前，确保 LLM 扩写不会修改 LoRA 专用提示词
* `lora_stack_data` 用于控制节点行为（哪些 LoRA 加载到模型），`lora_prompt_data` 用于传递 LoRA 的 prompt 数据给 PromptEnhancer，两者职责分离
* Agent system prompt 存储在 `agent_prompt.py`，Phase 3 的 AI Agent 模块将直接调用 `llm_client.agent_call()`

## v1.2.0 Mod1 (2026-05-21)

### 🚀 新增

* **LoRA 栈模式**——节点画布直接内联显示 LoRA 列表，类似 weilin LoRA Stack 的紧凑体验
  * 支持**个体 LoRA 直接调用**：点击 + 按钮从磁盘搜索并添加
  * 支持**群组引用**：添加已保存的群组到栈，后端执行时自动展开
  * 个体 LoRA 和群组引用可以**混合排列**，拖拽排序
  * 每条目独立开关（启用/禁用）+ Model/CLIP 双权重输入
  * 群组引用以紫色名称 + 四格图标标识，与个体 LoRA 视觉区分
* **栈状态自动持久化**：通过隐藏 JSON widget 保存到工作流，加载即恢复

### 🔧 调整

* **节点后端重构**：从「群组名输入」改为「JSON 栈数据隐藏输入」，后端执行时解析
  * 群组引用在执行时实时解析（而非前端展开），确保始终使用最新群组配置
  * LoRA 文件缓存升级为字典缓存（支持多条目高效加载）
* **移除导入功能**：LoRA 文件直接从 `ComfyUI\models\loras` 读取，无需导入步骤
* **管理面板精简**：移除导入按钮，保留导出功能
* **模块化前端**：新增 `stack_api.js` 栈状态管理模块，`canvas_widget.js` 完全重写

### 📐 设计差异化

* 与 weilin LoRA Stack 的区别：
  * 群组引用能力（weilin 无此功能）
  * 后端实时解析群组（weilin 依赖全局状态同步）
  * 无 Vue 弹窗依赖，全部内联管理
  * 紫色系群组视觉标识，独立于蓝色系个体 LoRA

## v1.2.0 (2026-05-21)

### 🚀 新增

* **全新节点「Model & LoRA Group Loader」**——底模切换 + LoRA 群组一键加载，一个节点搞定模型管线
  * 支持从下拉框选择 Checkpoint 底模，或选择「None」透传上游 MODEL
  * 支持输入 LoRA 群组名称（STRING 类型，为后续 AI Agent 动态指定预留接口）
  * 统一倍率滑块（0.0\~2.0×），群组内所有 LoRA 权重一键缩放
  * 节点画布实时显示群组状态灯（绿/红/灰）、LoRA 迷你列表、可折叠展开
  * 群组中缺失的 LoRA 文件自动跳过并打印警告，不会中断执行
* **LoRA 群组管理面板**——点击节点上的「⚙ 管理群组」按钮打开全屏弹窗
  * 左侧群组列表：新建/重命名/删除/搜索
  * 右侧 LoRA 编辑：启用/禁用开关、Model/CLIP 独立权重输入、拖拽排序、移除
  * 底部磁盘浏览器：文件夹导航 + 模糊搜索 + chip 式一键添加
  * 支持群组配置导入/导出（JSON 文件）
* **14 个新 API 端点**，群组 CRUD + 群组内 LoRA 操作 + 磁盘 LoRA 扫描/搜索/元数据读取

### 🔧 调整

* **前端模块化重构**——LoRA Group 相关前端代码拆分为 6 个独立文件（api / canvas_widget / group_panel / lora_browser / styles / index），不再塞在一个 JS 文件里
* **版本号统一升级至 V1.2.0**（前端 + 后端）
* **新增设计文档**（`design/` 目录），包含节点画布 Widget 原型和管理面板原型的 HTML/CSS 可视化设计

### 📐 架构备注

* LoRA 加载直接调用 ComfyUI 内置 `comfy.sd.load_lora_for_models()`，与官方 LoraLoader 行为一致
* 群组配置存储在 `lora_groups.json`，复用现有 ConfigManager 的用户配置目录
* 群组名使用 STRING 输入（非静态下拉），Phase 3 的 AI Agent 可通过自然语言直接指定群组

## v1.1.2 (2026-05-16)

### 🔧 调整

* **删除了部分语义相对重叠的Prompt组，简洁ui**
* **改动大模型API调用测试的方式**

### 🐛 修复

* **修复了已知问题**

## v1.1.1 (2026-05-13)

### 🚀 新增

* **节点底部新增「大模型提示词」输入框**，可向 LLM 传入额外指令（仅在启用语言大模型时生效）
* **设置面板新增「Prompt → 负面提示词编辑」**，点击按钮即可编辑负面提示词内容，与库编辑器/规则管理器交互方式一致
* \*\*新增动作姿态在特殊内容库中的分组，便于创作

### 🔧 调整

* **基础 Prompt 拼接顺序调整**：用户 Prompt 现在插入在库标签之前，而非标签之后，更符合逻辑
* **移除节点上的「自定义负面提示词」输入框**，改用设置面板集中管理，减少节点界面冗余

### 🐛 修复

* **修复输入框高度异常问题**：文本输入框在使用画布渲染的经典模式下 UI 冲突导致遮挡其他控件。已统一 textarea 尺寸逻辑

## v1.1.0 (2026-05-12)

\-**介绍：此为第一个正式版本，可喜可贺！！！**
-**PromptCraft** — 为了大伙提示词荒而深度定制的节点。

## 核心功能

* **15+ 维度标签分类**，中英文对照，支持独立权重调节（0.0\~2.0）
* **普通内容 / 特殊内容双库独立管理**，节点内一键切换
* **权重语法原生兼容** Stable Diffusion ComfyUI
* **四维预设配置**（场景、动作、服饰、情绪），一键加载复用
* **可选 LLM 大模型增强**（OpenAI 兼容 API 接入）
* **节点内「特殊内容」开关** + 一键「🎲 随机填充」
* **ComfyUI 设置面板深度集成**，配置实时保存
* \*\*库内容，大模型规则支持自定义任意修改

### 兼容性

* ComfyUI 新版本理论均适用，作者开发调试的为Comfyui-aki-v3整合版
* LLM 功能需自行配置 OpenAI 兼容 API Key

## V1.0.1 Beta - V1.0.13 Beta (2026-05-11)

* 全部删掉了，懒得写更新日志，反正是测试版，就这样吧XD

