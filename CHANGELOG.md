# **Moton's PromptCraft - 更新日志**

## **作者：Moton**

## **v1.3.3  (2026-06-03)**

### 🌐 国际化

* **中文变量名 → 英文标识符改造**
  - `prompt_enhancer.py` INPUT_TYPES 25 个中文 key 全部改为英文（如 `场景类型` → `scene_type`）
  - 随机标记改为英文协议值（`🎲 随机选择` → `random_all`），通过 `nodeDefs.json` options 翻译回中文显示
  - 扩写模式值改为英文（`基础扩写` → `basic`）
  - RETURN_NAMES 改为英文（`正面提示词` → `positive_prompt`）
  - `js/index.js` widget name 匹配全部改为英文
  - `locales/en/nodeDefs.json` + `locales/zh/nodeDefs.json` 全面更新，支持 COMBO 选项翻译
  - `data/sfw_prompts.json`、`data/nsfw_prompts.json`、`data/default_prompts.json` category key + preset 内部 key 全部迁移
  - 新增 `_prepare_kwargs()` 旧 workflow 兼容迁移函数（幂等，自动迁移中文 key）
  - 新增 6 个迁移映射常量（`LEGACY_KEY_MAP`、`LEGACY_RANDOM_MAP` 等）
  - 测试从 194 个增加到 208 个（含迁移测试 + 集成测试）

## **v1.3.2  (2026-06-02)**

### 🔧 优化

* **LoRA 缓存线程安全 + 内存控制**
  - `lora_utils.py` 共享缓存加 `threading.Lock`，防止多线程并发写入
  - 替换裸 dict 为 `OrderedDict` LRU 驱逐（max 8），长时间运行不再 OOM
  - 加载 I/O 在锁外执行，不阻塞其他线程

* **思维链自定义规则 mtime 缓存**
  - `thinking_control.py` 的 `_load_custom_rules()` / `_load_custom_params()` 不再每次 LLM 调用都读盘
  - 文件不变则命中缓存，变更后自动失效

* **LLM 客户端代码去重**
  - 抽取 `_prepare_url()` / `_prepare_headers()` / `_post()` 公共方法
  - 消除 4 处重复的 URL 补全和 httpx 错误处理

* **流式思维链过滤修复**
  - 修复 `filter_thinking_stream()` 同块 open+close 时 suffix 丢失的 bug

* **版本号统一更新至 V1.3.2**

## **v1.3.1  (2026-06-02)**

### 🔧 重构

* **前端架构重构**
  - 将前端架构重构为 Vue 3 + Vite
  - 完善 Vue 组件体系和构建流程

* **测试机制更新**
  - 新增 194 个测试用例
  - 完善 pytest 测试基础设施

## **v1.3.0_Beta2  (2026-06-02)**

### 🚀 新增

* **全面测试套件（194 个测试用例）**
  - `test_thinking_control.py` — 思维链控制模块（模型匹配/内容过滤/流式过滤/规则验证）
  - `test_cache_utils.py` — MtimeCacheMixin 缓存工具
  - `test_lora_utils.py` — LoRA 工具函数（栈展平/群组展开/权重计算）
  - `test_lora_group_manager.py` — LoRA 群组 CRUD 管理器
  - `test_lora_prompt_manager.py` — LoRA Prompt CRUD + 批量查询 + 注入数据
  - `test_agent_prompt.py` — Agent System Prompt 构建
  - `test_config_manager.py` — 配置管理器（原子写入/模板复制/库管理/服务配置）
  - `test_llm_client.py` — LLM 客户端（初始化/配置/思维链参数/工厂方法）
  - `test_prompt_enhancer.py` — 核心节点（选项构建/子组收集/随机选择）
  - `tests/conftest.py` — 公共 fixtures + ComfyUI 依赖 mock 基础设施

* **批量组件迁移**
  - Prompt 库编辑器 → Vue 3 (LibraryEditor.vue)
  - 历史记录管理器 → Vue 3 (PromptHistory.vue)
  - 浮动快捷面板 → Vue 3 (FloatingPanel.vue)
  - Toast 通知组件 → Vue 3 (Toast.vue)

* **基础设施增强**
  - Vue 桥接模块扩展 (支持 FloatingPanel 和 Toast)
  - Toast 通知系统 composable
  - 浮动面板拖拽 composable

### 🔧 优化

* **代码质量**
  - 进一步减少原生 JS 代码量
  - 统一 Vue 组件生命周期管理
  - 响应式数据绑定优化

## **v1.3.0_Beta1  (2026-05-31)**

### 🚀 新增

* **Vue 3 + Vite 前端重构**
  - 建立 Vue 3 + Vite 构建体系
  - 创建 Vue 桥接模块 (vue_bridge.js)
  - 实现懒加载机制

* **基础设施**
  - StackAPI 发布-订阅机制
  - Vue Composables (useStackApi, useDraggable)
  - CSS 设计 Token 系统 (variables.css)

* **组件迁移**
  - 服务配置面板 → Vue 3
  - 负面提示词编辑器 → Vue 3
  - 规则管理器 → Vue 3
  - 基础 UI 组件 (BaseDialog, BaseToggle, BaseDropdown)

### 🔧 优化

* **代码质量**
  - 统一错误处理和加载状态管理
  - 响应式数据绑定
  - 组件化架构

## **v1.2.5 Mod3  (2026-05-28)**

### 🚀 新增

* **LoRA 备注功能**：为 LoRA 栈中的每个 LoRA 添加备注功能
  - 在 LoRA 行右侧添加 📝 备注按钮
  - 有备注时显示预览（最多 20 字符）
  - 点击展开内联编辑器，支持多行输入
  - Ctrl+Enter 快捷保存，Escape 取消
  - 备注数据随工作流自动保存和加载
  - 支持中英双语国际化

## **v1.2.5 Mod2  (2026-05-27)**

### 🚀 新增

* **更新了英语版本**



## **v1.2.3  (2026-05-26)**

### 🐛 修复

* **每次写更新日志都很苦恼，不知道该怎么写，直到看到了国民级应用的日志后灵感乍现**
* **修复了一些已知问题**

\---

## **v1.2.2  (2026-05-26)**

### 🔧 调整

* **Prompt库整合优化**：更新Prompt库，整合V1.2.1测试改进版的内容
* **修复了已知问题**：优化了整体使用稳定性

\---

## **v1.2.1  (2026-05-24)**

### 🔧 调整

* LoRA Prompt Loader 底模加载逻辑修正
* LoRA 应用问题修复，隐藏 widget 改为 optional input 方式
* Prompt 组过滤与群组引用展开逻辑修正

\---

## **v1.2.0  (2026-05-23)**

\---

### 🚀 新增

* **全新节点「Model \& LoRA Group Loader」**：底模切换 + LoRA 群组一键加载，统一倍率缩放，画布实时显示群组状态
* **全新节点「CLIPTextEncodePro」**：双CLIP文本框，适用于不使用PromptCraft时Lora节点的连接
* **LoRA 栈模式**：画布内联显示 LoRA 列表，个体 LoRA 与群组引用混合排列，支持拖拽排序、独立开关、Model/CLIP 双权重
* **LoRA Prompt 组系统**：每个 LoRA 可存储多组 prompt，联动 PromptEnhancer 自动注入，正面/负面提示词分离管理
* **统一 LoRA Hub 面板**：LoRA / 群组 / Agent 三 Tab 布局，整合搜索、文件夹导航、群组 CRUD、内联 prompt 编辑
* **AI Agent 模块**：自然语言驱动的 LoRA/模型智能管理，支持 8 种结构化操作，Hub Agent Tab + 画布浮动对话框双入口
* **新增 18 个 API 端点**：覆盖群组 CRUD、LoRA Prompt 读写、Agent 指令转发

### 🔧 调整

* **前端模块化重构**：核心逻辑拆分为独立模块（`hub\\\\\\\_panel` / `canvas\\\\\\\_widget` / `agent\\\\\\\_panel` / `stack\\\\\\\_api`），callback 注册模式解决循环依赖
* **节点后端重构**：从群组名输入改为 JSON 栈数据驱动，群组引用运行时实时解析，LoRA 文件缓存升级为字典缓存
* **VAE 输出修复**：`RETURN\\\\\\\_TYPES` 增加 `"VAE"`，与标准管线完整对接
* **推荐工作流变更**：CheckpointLoader 负责底模 → LoraPromptLoader 管理 LoRA 栈 + 输出文本 → CLIPTextEncodePro 合并编码

### 🐛 修复

* 底模加载与 LoRA 应用逻辑修正，隐藏 widget 改为 optional input 避免序列化丢失
* Prompt 组过滤与序列化逻辑修正，确保群组引用正确展开
* LoRA 文件缺失时自动跳过并警告，不中断执行

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

