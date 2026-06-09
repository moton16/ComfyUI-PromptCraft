# **Moton's PromptCraft - 更新日志**

## **作者：Moton**

## **V1.3.6  (2026-06-09)**

### 🐛 Bug Fixes

* **修复 Windows 上 HTTPS API 调用报 `[Errno 2] No such file or directory`**
  - 根因：httpx 默认 SSL 上下文在 Windows 上找不到 CA 证书包，HTTPS 请求根本没发出去
  - 修复：引入 `certifi` 显式指定证书路径 `verify=certifi.where()`，未安装时回退 `verify=False`
  - 涉及 `_post()` 和 `chat_stream()` 两个方法的 `httpx.Client` 构造

### 🔧 调整

* 版本号统一更新至 V1.3.6，去除 Mod 后缀
* 修复 `control_panel.js` 版本号尾缀 X 问题

---

## **V1.3.5  (2026-06-08)**

### 🐛 Bug Fixes

* **修复旧工作流 "Value not in list" 错误**
  - 根因：V1.3.3 把 INPUT_TYPES 从中文标识符改成英文标识符后，旧工作流保存的中文显示值与新的英文选项列表不匹配
  - 修复：`js/index.js` 新增前端迁移映射，在 `onConfigure` 钩子中自动将旧值转为新值

* **修复全局随机填充会随机到 `random_all` 等标记**
  - 修复：候选值过滤增加 `!isRandomMarker(v)` 条件

* **修复随机按钮显示 `canvas.random_fill` 变量名**
  - 修复：在两个 i18n 文件中补充缺失的 key

---

## **V1.3.3  (2026-06-03)**

### 🌐 国际化

* **中文变量名 → 英文标识符改造**
  - INPUT_TYPES 25 个中文 key 全部改为英文（如 `场景类型` → `scene_type`）
  - 随机标记改为英文协议值，通过 `nodeDefs.json` 翻译回中文显示
  - 扩写模式值改为英文（`基础扩写` → `basic`）
  - `data/sfw_prompts.json`、`data/nsfw_prompts.json`、`data/default_prompts.json` category key + preset 内部 key 全部迁移
  - 新增 `_prepare_kwargs()` 旧 workflow 兼容迁移函数（幂等）
  - 测试从 194 个增加到 208 个

---

## **V1.3.1  (2026-06-02)**

### 🚀 新增

* **Vue 3 + Vite 前端重构**
  - 建立 Vue 3 + Vite 构建体系，创建 Vue 桥接模块 (vue_bridge.js)
  - 实现懒加载机制，批量迁移组件：服务配置、负面提示词编辑器、规则管理器、Prompt 库编辑器、历史记录、浮动面板、Toast
  - StackAPI 发布-订阅机制、Vue Composables (useStackApi, useDraggable)
  - CSS 设计 Token 系统 (variables.css)

* **全面测试套件（194 个测试用例）**
  - 覆盖 9 个 Python 模块：thinking_control、cache_utils、lora_utils、lora_group_manager、lora_prompt_manager、agent_prompt、config_manager、llm_client、prompt_enhancer
  - 公共 fixtures + ComfyUI 依赖 mock 基础设施

### 🔧 优化

* **LoRA 缓存线程安全 + 内存控制** — 共享缓存加 `threading.Lock`，`OrderedDict` LRU 驱逐
* **思维链自定义规则 mtime 缓存** — 文件不变则命中缓存
* **LLM 客户端代码去重** — 抽取 `_prepare_url()` / `_prepare_headers()` / `_post()` 公共方法
* **流式思维链过滤修复** — 同块 open+close 时 suffix 丢失

---

## **V1.2.5  (2026-05-28)**

### 🚀 新增

* **LoRA 备注功能**：为 LoRA 栈中的每个 LoRA 添加备注（📝 按钮、内联编辑器、Ctrl+Enter 保存）
* **三种扩写模式独立 API 配置**：基础扩写 / 详细扩写 / 普通扩写 可分别配置不同的 API 服务和模型
* **浮窗 Prompt 历史入口**：快捷面板新增"Prompt 历史"按钮
* **新增节点字段**：`时间设定`（清晨/上午/午后等）、`情绪表达`
* **浮窗右键关闭 + 设置面板开关**

### 🔧 调整

* **负面提示词纳入双库管理**：从独立编辑器改为通过 SFW/NSFW 双库的 `负面提示词` 分类管理
* **节点字段改名**：`服饰` → `服饰细节`、`情绪氛围` → `表情状态`
* **移除字段**：`角色类型`、`光源类型`

### 🐛 修复

* **i18n 翻译修复**：`getI18nBaseUrl()` 正则修正（ComfyUI `WEB_DIRECTORY` 映射去掉 `js/` 前缀）
* **画布节点翻译修复**：`locales/nodeDefs.json` outputs 从 RETURN_NAMES 索引改为数字索引
* **LLM 状态弹窗干扰 UI 修复**：移除节点 widget 操作，保留浮动 Toast 通知

---

## **V1.2.4  (2026-05-27)**

### 🌐 国际化

* **新增中英双语支持 (i18n)**
  - 前端 i18n 核心模块 (`js/i18n.js`)，零依赖 ES 模块
  - 翻译文件：`js/i18n/zh.json` + `js/i18n/en.json`（~310 keys）
  - ComfyUI 原生节点翻译：`locales/zh/nodeDefs.json` + `locales/en/nodeDefs.json`
  - 设置面板添加语言切换下拉框
  - 后端 `send_sync` 改用 `messageKey`，前端统一翻译

---

## **V1.2.3  (2026-05-26)**

### 🐛 修复

* **修复浮动快捷面板不显示的问题**
  - 增强 `ensureFallbackPanel()` 调试日志
  - 修复浮窗位置计算，确保在屏幕可见范围内
  - 提高 z-index 至 999999

* **修复了一些已知问题**

---

## **V1.2.2  (2026-05-26)**

### 🔧 调整

* **Prompt 库整合优化**：更新 Prompt 库，整合 V1.2.1 测试改进版的内容
* **修复了已知问题**：优化了整体使用稳定性

---

## **V1.2.1  (2026-05-24)**

### 🚀 新增

* **LLM 调用可中断**：`urllib` 替换为 `httpx`，线程轮询检测 ComfyUI 中断信号
* **画布 LLM 状态提示**：后端 WebSocket 推送 `promptcraft.llm_status` 事件，前端浮动 Toast 显示
* **大模型提示词记忆**：`llm_hint.json` 持久化存储，工作流重载后自动恢复

### 🔧 调整

* 移除"自定义前缀"与"自定义后缀"输入框
* 质量等级不随"随机填充"触发而改动
* LoRA Prompt Loader 底模加载逻辑修正

### 🐛 修复

* SFW 库"服饰"子类英文标签拼写错误修复

---

## **V1.2.0  (2026-05-23)**

### 🚀 新增

* **全新节点「Model & LoRA Group Loader」**：底模切换 + LoRA 群组一键加载
* **全新节点「CLIPTextEncodePro」**：双 CLIP 文本框
* **LoRA 栈模式**：画布内联显示 LoRA 列表，支持拖拽排序、独立开关
* **LoRA Prompt 组系统**：每个 LoRA 可存储多组 prompt，联动 PromptEnhancer 自动注入
* **统一 LoRA Hub 面板**：LoRA / 群组 / Agent 三 Tab 布局
* **AI Agent 模块**：自然语言驱动的 LoRA/模型智能管理
* **新增 18 个 API 端点**

### 🔧 调整

* 前端模块化重构：核心逻辑拆分为独立模块
* 节点后端重构：JSON 栈数据驱动
* VAE 输出修复

---

## **V1.1.2  (2026-05-16)**

### 🔧 调整

* 删除部分语义相对重叠的 Prompt 组
* 改动大模型 API 调用测试方式

### 🐛 修复

* 修复了已知问题

---

## **V1.1.1  (2026-05-13)**

### 🚀 新增

* 节点底部新增「大模型提示词」输入框
* 设置面板新增「Prompt → 负面提示词编辑」
* 新增动作姿态在特殊内容库中的分组

### 🔧 调整

* 基础 Prompt 拼接顺序调整：用户 Prompt 插入库标签之前
* 移除节点上的「自定义负面提示词」输入框，改用设置面板集中管理

### 🐛 修复

* 修复输入框高度异常问题

---

## **V1.1.0  (2026-05-12)**

* **正式版本首发**
* 15+ 维度标签分类，中英文对照
* 普通内容 / 特殊内容双库独立管理
* 四维预设配置（场景、动作、服饰、情绪）
* 可选 LLM 大模型增强（OpenAI 兼容 API）
* ComfyUI 设置面板深度集成

---

## **V1.0.1 Beta ~ V1.0.13 Beta  (2026-05-11)**

* 测试版本迭代，就这样吧 XD
