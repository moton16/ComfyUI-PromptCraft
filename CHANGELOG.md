# **Moton's PromptCraft - 更新日志**

## **作者：Moton**

## **V1.4.1 (2026-08-26)**

> 分发链修复版本：确保所有渠道获取到的包都包含编译后的 Vue 产物。

### 📦 分发

* **Vue 构建产物入库**：`js/promptcraft-vue.js` / `.css` 取消 gitignore 并提交，Comfy Registry / ComfyUI Manager / git clone 安装后不再因缺失产物导致 Vue 弹窗不可用（`.gitignore`）
* **`.comfyignore` 修正**：不再排除构建产物，否则 Registry 发布包会缺失运行时必备文件
* **Registry 发布工作流**：增加 pytest 门禁与发布前重新编译（`publish_action.yml`），保证发出的包一定包含与 `src/` 一致的最新构建产物；`release.yml` 同步更新说明注释
* **本地打包**：新增 `pack_release.py` / `make pack`，产出与 GitHub Release zip 完全一致的纯净运行包（`dist/ComfyUI-PromptCraft/`），用于在与其他用户相同的环境中测试；`dist/` 已加入 `.gitignore`

### 🐛 UI 修复

* **LoRA 栈随节点缩放**：模型与 LoRA 栈加载器节点的栈 widget 高度随节点拖动缩放同步，拉大时撑满剩余空间并内部滚动，缩小后恢复内容自适应高度（`canvas_widget.js` / `styles.css`）
* **添加 LoRA 下拉可关闭**：新增 × 关闭按钮，支持 Esc 与点击外部关闭（捕获阶段，含点击节点自身区域）；添加群组、Prompt 组选择菜单统一相同关闭机制，关闭时同步清理 document 监听器；修复加载失败分支无法关闭菜单的问题

---

## **V1.4.0 补充修复 (2026-08-01)**

> 全面代码审查（52 文件）后的一轮集中修复：5 项数据安全 / 8 项核心功能 / 前端与测试补强。

### 🐛 数据安全

* **Windows 原子写**：`config_manager._atomic_write_json` 用 `shutil.move` → `os.replace`（+fsync），避免崩溃/断电时配置 JSON 留下半截内容
* **迁移工具保护 SD 语法**：`[a|b]`（交替采样）/ `[from:to:steps]`（prompt editing）不再被误迁移为无效语法（`migrate_legacy_prompts.py`）
* **缓存引用隔离**：`cache_utils._load_json_with_cache` 返回深拷贝；ConfigManager 缓存读写加 `RLock`；`toggle_lora_favorite` 复制后再修改——写盘失败不再污染内存缓存
* **掩码 api_key 防护**：前端回传 GET 掩码串不再覆盖真实 key；`temperature`/`max_tokens` 数值字段类型与范围校验（`api_routes.py` / `config_manager.update_service`）
* **LoRA 权重缓存失效**：`lora_utils.load_single_lora` 校验文件 mtime，替换 LoRA 文件后不再使用旧权重

### 🐛 功能修复

* **SSE 流式解析**（`llm_client.chat_stream`）：按传输 chunk 自行切行，修复多事件拼块被整体丢弃、单事件拆块解析失败导致的随机丢字
* **思维链过滤统一**：新增 `strip_thinking_chunk` 按标签位置切分（只丢标签区间、支持带属性标签、跨 chunk 状态），修复混合 chunk 误丢正文
* **用户中断生效**：捕获 `InterruptProcessingException`（原仅捕获 `KeyboardInterrupt`，ComfyUI Cancel 后 LLM 请求继续跑满超时）
* **LoRA 标签补回**：只补缺失标签，避免已保留标签重复注入
* **RANDOM_NSFW**：特殊内容开关未开启时不再注入 NSFW 标签（与文档一致）
* **中断负面提示**：LLM 中断时生成默认负面提示词而非空串
* **thinking_control 规则**：siliconflow 大写 pattern 改小写（原永不可匹配）；孤立标签规则不再误删正常正文

### 🖥️ 前端

* **Agent 请求走 `api.fetchApi`**（原裸 fetch 缺 CSRF/认证头）；无节点时空状态兜底
* **Vue**：LibraryEditor 保存保留中文分类 label；i18n 初始化竞态（实时读取）；API Key 可清空；测试连接复用 JSON 解析；构建产物 `js/promptcraft-vue.js` 已重新生成
* **JS**：浮动面板监听器泄漏、API 错误消息透传、i18n 补 3 个缺失 key、Hub 异步竞态守卫 + 防抖、切 Tab 保留 Agent 对话历史、新建节点 500ms 配置丢失

### 🧪 测试

* 新增 SSE 拼块/拆块、思维链混合 chunk、`strip_thinking_chunk` 单元测试（409 个测试全绿，mypy/ruff 通过）

---

## **V1.4.0  (2026-07-28)**

### 🏗️ 架构整改

V1.4.0 是一次架构性大版本，整合了 91 项审查问题（29 严重 / 46 重要 / 49 次要 / 13 技术债），聚焦数据安全、异步架构、版本一致性。

#### 破坏性变更

* **Prompt 权重语法统一为 SD 标准**：`(tag:weight)` 冒号语法，删除多层括号 `(((tag:1.5)))` 和中括号 `[[tag]]` 旧语法。启动时自动迁移历史记录并备份为 `*.prompt.bak`（`migrate_legacy_prompts.py`）
* **API 路由重命名**：`/agent_endpoint` → `/agent`，`/chat_endpoint` → `/chat`，前端 fetch URL 已同步
* **LLMClient 全异步化**：用 `aiohttp.ClientSession` 替换 `httpx.Client`，所有方法改为 `async def`，API 路由直接 `await`

#### 🐛 严重修复

* **单例线程安全**：删除 `__new__` 实现，改用 `threading.Lock` + `_initialized` 标志，异常时不设标志允许重试
* **模板同步机制**：基于 `_template_version` 字段比较替代 mtime，覆盖前备份为 `*.bak`，启动时日志提示备份文件
* **数据安全**：`reorder_loras` 未在 order 中的 LoRA 追加末尾（不静默丢弃）；`_load_json_cached` 加载失败不缓存允许重试；`set_current_service` 校验 service_id 存在；`_save_json_and_update_cache` 检查写入返回值
* **XSS 防护**：Agent 面板 actionLabel 转义；`renderMarkdown` URL 协议白名单（只允许 http/https）
* **SSRF 防护**：阻止云元数据地址 `169.254.169.254`
* **异常信息脱敏**：API 异常返回通用消息，详细错误仅 print 到日志
* **LoRA 元数据**：`get_metadata` 改用轻量 header 读取（不加载权重），正确解析 `ss_tag_frequency`

#### 🔧 优化

* **前端**：`setupDragDrop` 单次注册避免监听器堆积；`agentMessages` 改实例属性；request 函数 30s 超时；Agent 调用 60s 超时；失败气泡 retry 按钮；partial/timeout 状态卡片；焦点环可访问性
* **Vue 死代码清理**：删除 4 个未使用的 Vue 面板组件（FloatingPanel/HubPanel/AgentPanel/SettingsPanel.vue）
* **依赖声明**：`pyproject.toml` 新增 `aiohttp>=3.8.0`
* **CI/CD**：新增 GitHub Actions（lint/typecheck/test/i18n-check）、pre-commit、Makefile
* **文档**：新增 MIGRATION.md、DEVELOPMENT.md

---

## **V1.3.7  (2026-06-11)**

### 🔧 调整

* **优化代码结构**
  - `api_routes.py`：将 3 个文件底部散落的 import 移至顶部，符合 PEP8 规范
  - `config_manager.py`：提取 `_load_json_cached()` 通用方法，消除 3 处重复的 JSON 缓存加载模式
  - `config_manager.py`：将 `_svc_cache`、`_history_cache`、`_llm_hint_cache`、`_favorites_cache` 统一在 `__init__` 中初始化，消除 `hasattr` 防御检查
  - `config_manager.py`：删除冗余的 `_services_cache()` 包装方法，直接使用 `_svc_cache` 属性
  - 测试 fixture 同步更新缓存属性初始化

---

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
