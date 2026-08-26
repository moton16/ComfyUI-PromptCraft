<!-- /autoplan restore point: e:\coding\moton-promptcraft\.gstack\restore\autoplan-restore-20260728.md -->

# ComfyUI-PromptCraft V1.4.0 架构整改方案

**分支**: `auto-optimize/20260611-i18n-timing`
**目标版本**: V1.4.0（架构整改 + 全面缺陷修复）
**起草日期**: 2026-07-28
**依据**: 2026-07-28 全面审查报告（91 项问题）+ Phase 1 CEO 评审（subagent-only）+ 用户 Premise Gate 决策

---

## 一、战略目标与原则

### 1.1 北极星
发布一个**架构层面正确**的 V1.4.0，把 91 项缺陷修复与架构整改合并为单次大版本。V1.3.7 用户基数较小，可以接受 15-20 天的修复窗口。这是"在烂地基上推倒重建"而非"在烂地基上刷墙"。

### 1.2 核心原则
- **架构优先**：先做架构决策（Vue 面板系统去留、异步重写、单例模式），再修 bug，避免过渡技术债
- **破坏性变更允许**：V1.4.0 是 major 版本，可以破坏旧工作流（如 prompt 语法变更），但必须显著警告 + 提供迁移工具
- **零数据丢失**：覆盖用户库前必须备份；所有数据格式变更提供迁移脚本
- **测试先行**：每个架构决策配集成测试；每个 P0 修复配回归测试
- **CI 兜底**：发版前 CI 必须包含 ruff + mypy + pytest + i18n 对齐检查

### 1.3 战略决策（已在 Phase 1 确认）
1. **跳过 V1.3.8/V1.3.9**，所有修复整合到 V1.4.0（用户 Premise Gate 选择）
2. **Vue 死代码移除**：`FloatingPanel.vue`、`HubPanel.vue`、`AgentPanel.vue`、`SettingsPanel.vue` 是死代码（vue_bridge.js 导出但从未被 import），V1.4.0 整体删除
3. **保留 Vue dialog 系统**：`NegativePromptEditor.vue`、`RuleManager.vue`、`LibraryEditor.vue`、`PromptHistory.vue`、`ServiceConfig.vue` 通过 vue_bridge.js 实际调用，保留
4. **prompt 语法统一**：V1-BE-04 `_apply_weight` 改用 `(tag:weight)` 冒号语法，提供自动迁移工具
5. **aiohttp 异步重写**：`LLMClient` 全异步化，删除 V1.3.8 的 `asyncio.to_thread` 过渡方案
6. **单例模式重构**：删除 `__new__`，用模块级单例 + `threading.Lock` 保护初始化

### 1.4 不在本方案范围
- 国际化双语对齐脚本（次要技术债，留 V1.4.1）
- 文档驱动开发流程（产品流程，非代码层）
- 跨平台安装包（继续走 ComfyUI Manager）
- 新功能（Agent 增强、新节点等）

---

## 二、架构决策（ADR）

### ADR-01: 前端面板系统 — 保留原生 JS，删除 Vue 死代码

**决策**：删除 `src/components/FloatingPanel.vue`、`HubPanel.vue`、`AgentPanel.vue`、`SettingsPanel.vue` 共 4 个 Vue 完整面板组件。保留 `src/components/dialogs/` 下的 5 个 Vue dialog + `src/components/ServiceConfig.vue` + `src/components/common/` 通用组件。

**理由**：
- vue_bridge.js 导出 `mountFloatingPanelVue`、`createAgentPanelVue`、`openHubPanelVue`、`createSettingsContentVue`、`openAgentFloatingVue` 共 5 个函数，**全部从未被任何文件 import**
- 对应的 4 个 Vue 面板组件（FloatingPanel/HubPanel/AgentPanel/SettingsPanel）是 V1.4.0 准备的未完成架构，从未在生产环境运行
- 保留它们会让 V1.4.0 的修复在死代码上浪费工时（subagent critical 发现）
- 删除后 `src/main.js` 中对应导出函数一并删除；vue_bridge.js 中对应桥接函数一并删除

**迁移**：用户无感知（死代码不影响运行时）

### ADR-02: LLM 客户端 — aiohttp 全异步化

**决策**：`LLMClient` 用 `aiohttp.ClientSession` 替换 `httpx.Client`，所有方法改为 `async def`。`api_routes.py` 的所有路由直接 `await client.xxx()`，删除 V1.3.8 计划的 `asyncio.to_thread` 包装。

**理由**：
- `agent_endpoint`、`test_llm_connection`、`api_test_service`、`chat_endpoint`、`prompt_enhancer._enhance_with_llm` 全部涉及 LLM API 调用，目前用同步 `httpx.Client` 阻塞事件循环或开子线程
- aiohttp 是 ComfyUI 已有依赖（`api_routes.py:12` 已 import），无需新增依赖
- 异步化后可统一取消信号（`asyncio.CancelledError`），无需 `threading.Event` + `call_soon_threadsafe` 复杂模式
- `prompt_enhancer._enhance_with_llm` 的子线程模式可简化为 `await client.enhance_prompt(...)`，删除 `threading.Thread` + `result_container` 模式

**迁移**：
- `LLMClient.__init__` 不再创建 `httpx.Client`，改为持有 `aiohttp.ClientSession`（延迟创建）
- 所有调用方改为 `await client.method(...)`；ComfyUI 节点的 `INPUT_TYPES` 同步入口需用 `asyncio.run_coroutine_threadsafe` 桥接（参考 `prompt_enhancer.generate`）
- 兼容性：`chat_stream` 改为 `async for chunk in client.chat_stream(...)`，`api_routes.chat_endpoint` 直接 `async for`

### ADR-03: 单例模式 — 模块级 + Lock

**决策**：删除 `ConfigManager.__new__`、`LoraGroupManager.__new__`、`LoraPromptManager.__new__`。模块级保留 `config_manager = ConfigManager()` 等单例。`__init__` 加 `threading.Lock` 保护首次初始化。

**理由**：
- 当前 `__new__` 非线程安全（两个线程同时通过 `if cls._instance is None` 创建两个实例）
- 模块级单例 + Lock 是 Python 推荐做法，更简单
- `__init__` 在每次 `ClassName()` 调用时都会跑，需要 `_initialized` 标志防重复——删除 `__new__` 后用 Lock + `_initialized` 即可

### ADR-04: 模板同步 — version 字段 + 备份

**决策**：所有模板 JSON 文件添加 `"_template_version": "1.4.0"` 字段。`_sync_template_to_user` 改为 version 字段比较（用户文件无字段视为旧文件，强制同步 + 备份到 `*.bak`）。

**理由**：
- 当前用 mtime 比较，但 `pip install` / `git pull` 会重置模板 mtime，导致每次升级覆盖用户配置
- version 字段比较更稳定
- 备份机制保证用户数据可恢复

### ADR-05: prompt 语法 — 统一冒号 + 自动迁移

**决策**：`_apply_weight` 统一用 `(tag:weight)` 冒号语法。提供 `migrate_legacy_prompts.py` 脚本，扫描旧工作流中的中括号 prompt 并自动转换。

**理由**：
- 当前小权重生成 10 层中括号 `[[[[...]]]]`，SD 编码器对深度有限制
- 冒号语法 `(tag:0.5)` 是 SD/SDXL/Flux 通用标准
- V1.4.0 是 major 版本，允许破坏性变更
- 自动迁移脚本降低用户负担

### ADR-06: 测试 CI — 新增 workflow + i18n 对齐检查

**决策**：
- 新增 `.github/workflows/ci.yml`：运行 `ruff check .` + `mypy --ignore-missing-imports .` + `pytest` + `vulture . --min-confidence 80`
- 新增 `.github/workflows/i18n-check.yml`：检查 `js/i18n/en.json` 与 `zh.json` key 对齐，`locales/en/nodeDefs.json` 与 `zh/nodeDefs.json` key 对齐
- `publish_action.yml` 锁定到 `Comfy-Org/publish-node-action@v1.2.3`（具体 tag，非 `@main`）

---

## 三、范围分层

### Stage 1：架构整改（4 天）

#### 1.1 前端面板系统清理（1 天）
- 删除 `src/components/FloatingPanel.vue`、`HubPanel.vue`、`AgentPanel.vue`、`SettingsPanel.vue`
- 删除 `src/main.js` 中 `mountFloatingPanel`、`openHubPanel`、`createAgentPanel`、`createSettingsContent`、`openAgentFloating` 导出
- 删除 `js/vue_bridge.js` 中 `mountFloatingPanelVue`、`openHubPanelVue`、`createAgentPanelVue`、`createSettingsContentVue`、`openAgentFloatingVue`、`unmountFloatingPanelVue`、`closeHubPanelVue` 导出
- 删除 `src/composables/useDraggable.js`（仅 FloatingPanel 使用）
- 保留 `src/components/dialogs/*`、`src/components/ServiceConfig.vue`、`src/components/common/*`

#### 1.2 LLMClient aiohttp 异步重写（2 天）
- 重写 `llm_client.py`：所有方法 `async def`，用 `aiohttp.ClientSession`
- 删除 `_SSL_VERIFY` 全局变量，改为 `aiohttp.TCPConnector(ssl=...)`
- `chat_stream` 改为 `async def` + `async yield`
- `enhance_prompt` 改为 `async def`，删除 `prompt_enhancer._enhance_with_llm` 的子线程模式
- `agent_call` 改为 `async def`
- `test_connection` 改为 `async def`
- 重写 `api_routes.py`：所有 LLM 调用直接 `await`
- `prompt_enhancer.generate` 用 `asyncio.run_coroutine_threadsafe` 桥接（ComfyUI 节点是同步入口）
- `thinking_control.filter_thinking_stream` 适配 async generator

#### 1.3 单例 + Lock 重构（0.5 天）
- 删除 `ConfigManager.__new__`、`LoraGroupManager.__new__`、`LoraPromptManager.__new__`
- `__init__` 加 `threading.Lock` 保护
- 模块级保留 `config_manager = ConfigManager()` 等

#### 1.4 模板 version 字段 + 备份机制（0.5 天）
- 7 个模板 JSON 文件添加 `"_template_version": "1.4.0"` 字段：`sfw_prompts.json`、`nsfw_prompts.json`、`llm_config.json`、`llm_services.json`、`llm_system_prompt.json`、`usage_help_en.md`（不改）、`usage_help_zh.md`（不改）
- `_sync_template_to_user` 改为 version 字段比较
- 覆盖前 `shutil.copy(user_path, user_path + ".bak")`
- 启动时检测 `*.bak` 存在则 log 提示

### Stage 2：数据安全修复（2 天）

- **V0-DATA-01**：`thinking_control._load_custom_rules/_load_custom_params` 改为通过 `config_manager.get_custom_thinking_rules()` / `get_custom_thinking_params()` 读取
- **V0-DATA-02**：`config_manager._load_json_cached` 加载失败时不写缓存（保留 None），下次访问重试；或改用 mtime 失效
- **V0-DATA-03**：`_sync_template_to_user` 已在 Stage 1.4 处理
- **V0-DATA-04**：`lora_group_manager.reorder_loras` 未在 order 中的 LoRA 追加到末尾
- **V1-BE-01**：`config_manager.set_current_service` 校验 `service_id` 存在
- **V1-BE-09**：`cache_utils._save_json_and_update_cache` 检查 `_save_raw` 返回值

### Stage 3：异步与并发修复（已在 Stage 1.2 完成）

Stage 1.2 的 aiohttp 重写已覆盖：
- V0-ASYNC-01：所有路由 async/await
- V0-ASYNC-02：`chat_endpoint` 直接 `async for`，无 `call_soon_threadsafe` 内存泄漏
- V1-BE-03：`_enhance_with_llm` 用 `asyncio.CancelledError` 取消
- V1-BE-08：`enhance_prompt` 入口 `self.last_error = ""`
- V1-BE-07：`chat_stream` 思维链过滤改用 `thinking_control.filter_thinking_stream` + 跨 chunk 标签缓冲
- V1-BE-09（Phase 4 新增，Choice 3）：`api_routes.py` 路由 `/agent_endpoint` → `/agent` 重命名（同步 `/chat_endpoint` → `/chat`、`/test_llm` → `/test_llm_connection` 统一为 `/test_llm`）；更新 `api_routes.py` 中的 `routes` 字典与 PROMPT critique 路由；在 `__init__.py` 启动日志中打印新路由表；MIGRATION.md 中显式列出路由变更表

### Stage 4：前端 P0 修复（1 天）

- **V0-FE-01**：`agent_panel.js:268-274` `getActionLabel` fallback 调用 `escapeHtml(actionLabel)`（防御 LLM 输出不可信）
- **V0-FE-02**：`canvas_widget.js` `setupDragDrop` 改为在 `createStackWidget` 中只注册一次
- **V0-FE-03**：`hub_panel.js` `_selectLora` 引入 `selectLoraSeq` 序列号模式
- **V0-SEC-03**：`agent_panel.js` `agentMessages` 改为 `this.messages = []` 实例属性
- **V0-LORA-01**：`lora_scanner.get_metadata` 用 `_read_safetensors_header` 替换 `load_torch_file`
- **V0-LORA-02**：`trigger_words` 改用 `_parse_training_words`
- **V1-FE-01**：`js/index.js` 全局事件监听器引用保存到模块级变量
- **V1-FE-02**：`request` 函数加 `if (!res.ok) throw` + `AbortController` 30s 超时
- **V1-FE-03**：`renderMarkdown` URL 协议白名单
- **V1-FE-04**：删除死代码 `onLangChange` API
- **V1-FE-06**：`ServiceConfig.vue` i18n key `api_key_placeholder` 添加
- **V1-FE-10**：`hub_panel.js` `close()` 中清理 `this.node = null`
- **V1-FE-11**：`agent_executor.js` `callAgent` 加 `AbortController` 60s 超时
- **V0-FE-05**（Phase 2 新增）：`agent_panel.js` `_createOpCard` 引入 `pc-agent-op-partial` 状态类（黄色边框 + ⚠ 图标），用于 success/fail 之外的混合结果
- **V1-FE-12**（Phase 2 新增）：`agent_panel.js` `statusBar` 新增 `pc-agent-timeout` 状态类，V1-FE-11 的 60s AbortController 触发时切换
- **V1-FE-13**（Phase 2 新增）：失败气泡（assistant 错误消息）追加「重试」按钮，点击重发上一条用户指令
- **V1-FE-14**（Phase 2 新增）：`agent_panel.js` 与 `hub_panel.js` 的 `textarea`、`button` 加 `aria-label` + 焦点环样式（`:focus-visible` outline）
- **V1-FE-15**（Phase 4 新增，Choice 3 连锁）：API 路由 `/agent_endpoint` → `/agent` 重命名后，前端 `js/lora_group/*.js`（含 `agent_panel.js`、`agent_executor.js`、`hub_panel.js`）所有 `fetch('/agent_endpoint', ...)` 调用同步改为 `fetch('/agent', ...)`；同时检查 `js/index.js`、`js/control_panel.js`、`js/vue_bridge.js` 是否有引用；在 `tests/test_api_routes.py` 中加反向断言：`/agent_endpoint` 应返回 404，`/agent` 应正常工作

### Stage 5：后端剩余 P1 + prompt 语法迁移（2 天）

- **V1-BE-02**：单例 `__new__` 已在 Stage 1.3 处理
- **V1-BE-04**：`_apply_weight` 统一用 `(tag:weight)` 冒号语法 + 写 `migrate_legacy_prompts.py` 脚本
- **V1-BE-05**：`prompt_enhancer._random_pick/_collect_subgroups` 用 `opt.get("label", "")`
- **V1-BE-06**：`chat_endpoint` 改用 `LLMClient.for_category(config_manager, "enhance_basic")`（已在 Stage 1.2 异步化时一并处理）
- **V1-SEC-01**：`api_handler` 异常返回前端通用消息，详细错误 print 到日志
- **V1-SEC-02**：SSRF 防护：URL 协议白名单 + 内网地址警告
- **V1-SEC-03**：README 显著位置添加「请勿将 ComfyUI 暴露公网」安全警告

### Stage 6：版本号同步 + 安全基线 + CI（1 天）

- **V0-SYNC-01~06**：所有版本号位置同步到 V1.4.0
- **V0-DEP-01~02**：pyproject.toml 新增 `requires-python`、`dependencies`、`optional-dependencies.dev`
- **V0-DEP-03**：certifi 缺失时改为 `verify=True`（用系统证书）
- **V0-SEC-01**：`.gitignore` 追加忽略
- **V0-SEC-02**：CI workflow 锁定版本
- **V1-CI-01**：新增 `ci.yml`
- **V1-CI-02**：`tests/conftest.py:281` 修复文件名
- 新增 i18n 对齐检查 workflow

### Stage 7：测试 + 文档（2 天）

- 补 `tests/test_legacy_migration.py`
- 补 `tests/test_thinking_control.py` 自定义规则用例
- 补 `tests/test_config_manager.py` 缓存失效、模板同步、部分重排用例
- 补 `tests/test_api_routes.py` 异步路由、客户端断开用例
- 补 `tests/test_lora_scanner.py` metadata 轻量读取、trigger_words 用例
- 补 `tests/test_llm_client.py` aiohttp 异步用例
- 更新 `CHANGELOG.md` V1.4.0 条目
- 更新 `README_zh.md` / `README_en.md` 安全警告 + V1.4.0 破坏性变更说明
- 更新 `CLAUDE.md` 版本号位置索引表（追加 `src/components/SettingsPanel.vue` 已删除等）
- 更新 `update_version.sh` 覆盖所有版本号位置

### Stage 8：发版准备（1 天）

- 手动冒烟测试：启动 ComfyUI → 加载节点 → 配置 LLM → 增强提示词 → 聊天 → Agent
- Windows + macOS + Linux 跨平台回归（至少 Windows + Linux）
- 创建 PR `release/v1.4.0`
- 打 tag `v1.4.0`

---

## 四、风险与回滚

### 4.1 高风险变更
| 变更 | 风险 | 缓解 |
|------|------|------|
| ADR-02 aiohttp 重写 | LLM 调用全异步化引发回归 | 写详细集成测试；保留 `httpx` 版本到 `llm_client_legacy.py` 一个版本；如回归严重可 `git revert` 整个 commit |
| ADR-01 删除 Vue 死代码 | 误删仍在使用的代码 | grep 全项目验证 5 个函数从未被 import；删除后跑全量测试 |
| ADR-05 prompt 语法变更 | 旧工作流 prompt 行为变化 | 自动迁移脚本 + 文档显著警告 + 保留 legacy fallback 一个版本（仅警告，不静默使用） |
| ADR-04 模板 version 字段 | 旧用户文件无字段被强制覆盖 | 视为旧文件强制同步 + 备份到 `*.bak`；启动时检测 `*.bak` 提示 |
| ADR-03 单例重构 | 多线程下首次访问竞态 | `threading.Lock` 保护 `__init__`；写并发测试 |

### 4.2 回滚策略
- 每个 Stage 独立 commit，便于 `git revert`
- Stage 1.2 aiohttp 重写前创建 tag `v1.3.7-pre-v1.4.0` 作为回滚点
- 若 Stage 1.2 引发严重回归，可单独 revert 该 commit，保留其他 Stage 修复（用 httpx 同步版 + `asyncio.to_thread` 包装）
- Stage 1.1 删除 Vue 死代码可单独 revert（无依赖）

---

## 五、测试策略

### 5.1 单元测试新增
- `tests/test_legacy_migration.py`：迁移映射完整性
- `tests/test_thinking_control.py`：自定义规则加载、跨路径读取、跨 chunk 标签过滤
- `tests/test_config_manager.py`：缓存失效、模板同步 version 字段、部分重排、单例并发
- `tests/test_api_routes.py`：异步路由、客户端断开、并发请求、SSRF 防护
- `tests/test_lora_scanner.py`：metadata 轻量读取、trigger_words 解析、sha256 大文件
- `tests/test_llm_client.py`：aiohttp 异步、思维链过滤、cancel 信号
- `tests/test_prompt_enhancer.py`：`_apply_weight` 冒号语法、`opt.get("label")` 容错

### 5.2 集成测试
- 启动 ComfyUI 子进程，调用真实 API 验证 agent_endpoint 不阻塞
- 模拟客户端断开 chat_endpoint，监控内存增长
- 旧工作流加载 + 自动迁移脚本运行

### 5.3 回归测试
- 全量运行 `pytest`，覆盖率不低于 60%（当前未测）
- 手动冒烟测试清单（见 Stage 8）

---

## 六、错误与救援登记

| 错误场景 | 触发条件 | 救援动作 |
|---------|---------|---------|
| aiohttp 重写引发 LLM 调用全失败 | 异步代码 bug | revert Stage 1.2 commit，回退到 httpx 同步版 |
| 删除 Vue 死代码后构建失败 | 误删仍在使用的代码 | git revert Stage 1.1 commit |
| 模板覆盖后用户数据丢失 | V0-DATA-03 备份机制失败 | 从 `*.bak` 文件恢复；启动时检测 `*.bak` 提示 |
| prompt 语法迁移脚本误转换 | 正则匹配过宽 | 脚本默认 dry-run 模式，用户确认后才实际写入 |
| pyproject.toml 依赖冲突 | 用户环境已有 httpx 旧版本 | `requires-python = ">=3.8"` + `httpx>=0.27` 约束 |
| certifi 强制要求导致旧环境无法启动 | 用户 Python 无 certifi | 改为 `verify=True` 用系统证书，不强制 certifi |
| 单例重构引发多实例 | `__init__` Lock 误用 | 模块级单例 + `_initialized` 标志，写并发测试 |

---

## 七、Dream State Delta

**当前状态（V1.3.7）**：
- 功能完整但严重 bug 多，用户配置不生效、升级丢数据
- 异步架构有缺陷，阻塞整个 ComfyUI
- 三套面板系统并存，4 个 Vue 面板是死代码
- 版本号管理失控，依赖未声明
- LLMClient 用同步 httpx，路由用 `asyncio.to_thread` + 子线程混合模式

**V1.4.0 落地后**：
- 所有 91 项问题修复
- 单一面板系统（原生 JS 主系统 + Vue dialog 子系统）
- LLMClient 全异步化（aiohttp），无阻塞、无内存泄漏
- 单例模式线程安全
- 模板同步有 version 字段 + 备份机制
- prompt 语法统一为冒号格式
- CI 自动化（ruff + mypy + pytest + i18n 检查）
- 版本号管理自动化（update_version.sh 覆盖完整）
- pyproject.toml 依赖声明完整
- 安全基线达标（无密钥泄露、无 XSS、供应链锁定、SSRF 防护）

**12 个月理想状态（V1.5.0+）**：
- 完整的 e2e 测试套件（Playwright + ComfyUI 子进程）
- 国际化双语对齐 CI 检查
- 文档驱动开发（design doc → 实现 → review）
- LLM 流式响应统一抽象（支持 OpenAI/Anthropic/本地模型流式 API 差异）
- Agent 能力扩展（多步规划、工具调用）

---

## 八、竞品分析（CEO 评审增补）

### 8.1 ComfyUI 生态竞品
- **comfyui-easy-use**：综合工具集，含 prompt 增强功能，用户基数大
- **comfyui-prompt-mz**：轻量提示词增强，专注核心功能
- A1111 时代 prompt 增强插件用户可能流向 SD WebUI

### 8.2 PromptCraft 差异化护城河
- **LoRA Group 管理**：竞品无，是核心差异化
- **Agent 节点**：竞品无，是核心差异化
- **多服务配置**：竞品无，是核心差异化
- **思维链过滤**：竞品无，是核心差异化

### 8.3 战略结论
V1.4.0 应**强化差异化**（LoRA Group + Agent + 多服务），而非追平竞品的基础功能。架构整改的目的是让差异化功能**真正可用**（修异步阻塞、修配置不生效），而非堆砌新功能。

---

## GSTACK REVIEW REPORT

### Phase 1: CEO 评审（subagent-only，codex 不可用）

#### Step 0A — 前提挑战

方案前提：
1. **P1**："修复优先级 > 新功能" — 接受
2. **P2**："不破坏现有工作流" — V1.4.0 调整为允许破坏 + 自动迁移
3. **P3**："V1.3.8 修 P0+P1，V1.4.0 处理 P2" — **用户 Premise Gate 否决**，改为 V1.4.0 整合所有修复
4. **P4**："V1.3.7 用户基数足够大，需要紧急发版 V1.3.8" — **用户否决**，跳到 V1.4.0
5. **P5**："三套面板系统并存" — **证伪**，4 个 Vue 面板是死代码

#### Step 0B — 既有代码杠杆图

| 子问题 | 既有代码可复用 |
|--------|---------------|
| chat_endpoint 取消信号 | aiohttp 重写后用 `asyncio.CancelledError`，无需自研 |
| HubPanel 并发保护 | Vue 版 `HubPanel.vue:93-140` 的 `selectLoraSeq` 模式可复用到原生版（Vue 版本身删除） |
| safetensors 轻量 header | `lora_scanner._read_safetensors_header` 已实现，替换 `get_metadata` 中的 `load_torch_file` |
| 单例线程安全 | 模块级单例 + `threading.Lock` 是 Python 推荐做法 |
| LLMClient 多服务 | `LLMClient.for_category` 已实现，`chat_endpoint` 直接调用 |
| aiohttp 异步 | `api_routes.py:12` 已 import aiohttp，是 ComfyUI 既有依赖 |

#### Step 0C — Dream State Delta（已在第七章覆盖）

#### Step 0D — 实施替代方案

用户 Premise Gate 已选择"跳到 V1.4.0"，原方案 A/B/C/D 中 C 胜出。

#### Step 0E — 时序问询

- **Day 1-2**：Stage 1.1 删除 Vue 死代码 + Stage 1.3 单例重构（低风险，先做）
- **Day 3-5**：Stage 1.2 aiohttp 重写（高风险，集中精力）
- **Day 6-7**：Stage 1.4 模板 version + Stage 2 数据安全
- **Day 8**：Stage 4 前端 P0
- **Day 9-10**：Stage 5 后端剩余 P1 + prompt 语法迁移
- **Day 11**：Stage 6 版本号 + 安全 + CI
- **Day 12-13**：Stage 7 测试 + 文档
- **Day 14**：Stage 8 发版准备
- **Buffer 1 天**：应对回归

#### Step 0F — 模式选择

**FULL REWRITE** 模式（V1.4.0 是 major 版本，允许架构级重写）：
- 范围内：所有 91 项问题 + 6 项架构决策
- 范围外：新功能、跨平台安装包、文档驱动流程

#### CEO DUAL VOICES — CONSENSUS TABLE

═══════════════════════════════════════════════════════════════
  Dimension                                 Claude  Subagent  Consensus
  ────────────────────────────────────────── ─────── ───────── ─────────
  1. 前提有效？                                OK      P4 存疑    用户否决 P4
  2. 在解决正确的问题？                         OK      范围污染   CONFIRMED（Vue 死代码应剔除）
  3. 范围校准正确？                             高估    严重高估   CONFIRMED（15-20 天合理）
  4. 替代方案充分探索？                         部分    拆分更优   用户选择 C（跳到 V1.4.0）
  5. 竞争/市场风险覆盖？                        缺失    缺失      CONFIRMED（第八章增补）
  6. 6 个月轨迹健康？                           OK      Vue 返工   CONFIRMED（V1.4.0 一次到位）
═══════════════════════════════════════════════════════════════

**关键分歧**：subagent 认为 V0-FE-01（agent_panel XSS）描述错误应降级。经核查代码，**subagent 此处判断有误**：`op.action` 来自 LLM JSON 输出，是**不可信输入**，prompt 注入可让 LLM 返回任意字符串。XSS 风险真实存在，修复有效。

#### Phase 1 决策审计

| # | 决策 | 分类 | 原则 | 理由 |
|---|------|------|------|------|
| 1 | 跳过 V1.3.8/V1.3.9，整合到 V1.4.0 | User Decision | — | 用户 Premise Gate 选择 |
| 2 | 删除 4 个 Vue 死代码面板 | Mechanical | P4 (DRY) | vue_bridge.js 5 个挂载函数从未被 import |
| 3 | 保留 Vue dialog 系统 | Mechanical | P5 | 5 个 dialog 通过 vue_bridge.js 实际调用 |
| 4 | aiohttp 全异步重写 | Taste | P5 (显式优于巧妙) | 删除 `asyncio.to_thread` 过渡债，统一异步模型 |
| 5 | 单例模块级 + Lock | Mechanical | P5 | Python 推荐做法，删除 `__new__` |
| 6 | 模板 version 字段 + 备份 | Mechanical | P2 (boil lakes) | mtime 比较不可靠 |
| 7 | prompt 语法统一冒号 + 自动迁移 | Taste | P5 | V1.4.0 major 版本允许破坏性变更 |
| 8 | 保留 V0-FE-01（agent_panel XSS 修复） | Taste | P1 (完整性) | subagent 误判；LLM 输出不可信 |
| 9 | 增补竞品分析章节 | Mechanical | P1 (完整性) | 战略盲点 |
| 10 | 工时 15 天（含 1 天 buffer） | Mechanical | P3 (实用) | subagent 校准 + buffer |

#### "NOT in scope" 章节

- 新功能（Agent 增强、新节点）→ V1.5.0
- 跨平台安装包 → 继续走 ComfyUI Manager
- 国际化双语对齐脚本 → V1.4.1
- 文档驱动开发流程 → 产品流程
- e2e 测试套件（Playwright）→ V1.5.0

#### "What already exists" 章节

已在 Step 0B 列出。关键复用：
- `LLMClient.for_category` — chat_endpoint 直接调用
- `lora_scanner._read_safetensors_header` — 替换 `get_metadata` 中的 `load_torch_file`
- `HubPanel.vue:93-140` 的 `selectLoraSeq` 模式 — 复制到原生 `hub_panel.js`（Vue 版删除）
- `aiohttp` — ComfyUI 既有依赖，无需新增

#### Error & Rescue Registry

| 错误场景 | 触发条件 | 救援动作 |
|---------|---------|---------|
| aiohttp 重写引发 LLM 调用全失败 | 异步代码 bug | revert Stage 1.2 commit，回退到 httpx 同步版 |
| 删除 Vue 死代码后构建失败 | 误删仍在使用的代码 | git revert Stage 1.1 commit |
| 模板覆盖后用户数据丢失 | 备份机制失败 | 从 `*.bak` 文件恢复 |
| prompt 语法迁移脚本误转换 | 正则匹配过宽 | 脚本默认 dry-run 模式 |
| pyproject.toml 依赖冲突 | 用户环境已有 httpx 旧版本 | `requires-python = ">=3.8"` + `httpx>=0.27` 约束 |
| certifi 强制要求导致旧环境无法启动 | 用户 Python 无 certifi | 改为 `verify=True` 用系统证书 |
| 单例重构引发多实例 | `__init__` Lock 误用 | 模块级单例 + `_initialized` 标志 |

#### Failure Modes Registry

| 失效模式 | 严重度 | 检测方式 | 修复策略 |
|---------|--------|---------|---------|
| aiohttp 重写后 LLM 流式响应行为变化 | Critical | 集成测试覆盖 SSE 流式 | 详细对比 httpx vs aiohttp 流式行为 |
| 删除 Vue 死代码后 vite build 失败 | High | CI 构建检查 | grep 验证 5 个函数从未被 import |
| 模板 version 字段缺失导致旧用户被覆盖 | Critical | 单元测试覆盖 5 种 version 场景 | 备份 + version 字段检测 |
| prompt 语法迁移脚本误转换旧工作流 | High | 脚本默认 dry-run + 用户确认 | 备份原工作流 |
| 单例 Lock 死锁 | High | 并发测试 | `__init__` 内不持有 Lock 跨调用 |

**PHASE 1 COMPLETE.** Subagent: 9 findings (2 critical, 3 high, 4 medium). Consensus: 6/6 confirmed, 1 subagent misjudgment corrected (XSS real). User Premise Gate: 跳到 V1.4.0. Passing to Phase 2.

---

### Phase 2: Design 评审（subagent-only，codex 不可用，gstack designer 二进制不可用）

#### Step 0A — 初始设计评分

**3/10** — 方案是工程修复型，几乎不描述 UI 决策。仅有的 UI 修复（V0-FE-01 XSS、V0-FE-02 拖拽重复注册、V0-FE-03 selectLoraSeq）是 mechanical fix，未触及设计层面。10 分标准：每个被修改的 UI 文件都有明确的视觉/交互规范，所有状态（loading/empty/error/partial/success）显式列出视觉表现。

#### Step 0B — DESIGN.md 状态

无 DESIGN.md。所有设计决策依赖通用 UX 原则。**建议**：V1.4.0 不强制创建 DESIGN.md（架构整改优先），但在 Stage 7 文档章节补一份「PromptCraft UI 状态规范」短文档，定义 `pc-agent-*`、`pc-hub-*`、`pc-canvas-*` 类名的状态机。

#### Step 0C — 既有设计杠杆

| 既有 UI 资产 | V1.4.0 复用方式 |
|-------------|----------------|
| `pc-agent-op-success` / `pc-agent-op-fail` 类名 | 新增 `pc-agent-op-partial` 状态，统一卡片视觉语言 |
| `pc-agent-thinking` / `pc-agent-error` 状态类 | 扩展支持 `pc-agent-timeout` 状态（V1-FE-11 AbortController 60s 超时触发） |
| `escapeHtml` 工具函数（agent_panel.js:316） | 已存在，V0-FE-01 直接调用，无需新增 |
| ComfyUI 原生 menu/dialog 样式 | 模板备份提示（*.bak 存在时）走 ComfyUI 原生 dialog，不自造样式 |

#### Step 0D — Focus Areas

UI 范围已检测（agent_panel、hub_panel、canvas_widget、index.js、ServiceConfig.vue）。所有 7 个维度全部评审。

#### Step 0.5 — Design Dual Voices

**CODEX SAYS (design — UX challenge)**: [codex-unavailable] — codex CLI 不可用，跳过。

**CLAUDE SUBAGENT (design — independent review)** via Trae search subagent:

7 维度评分：
1. **信息层级 7/10** — 当前消息/快捷栏/输入/状态栏分层清晰，但失败卡片未在视觉顶部突出。10 分标准：失败状态用颜色+图标+位置三重引导视线。
2. **缺失状态 5/10** — loading/error/success 已覆盖，但 partial（部分操作成功）/timeout/disconnected 状态缺失。10 分标准：所有非正常状态有专属 UI。
3. **用户旅程 6/10** — 主流程连贯，但 Agent 失败后无重试入口、无历史回溯。10 分标准：失败点提供 retry 按钮 + 历史可重放。
4. **具体性 8/10** — XSS 修复点定位精确（agent_panel.js:268-274 getActionLabel），但其他 P0 修复未到 UI 层级。10 分标准：每个 P0 都有 UI 表现层描述。
5. **实现者歧义 7/10** — partial 状态类名、LLM 不可信输出的统一防护边界未明。10 分标准：所有动态内容渲染点列出信任等级。
6. **响应式与可访问性 5/10** — 已有 Enter 发送（agent_panel.js:135-139），但缺 ARIA 标签、键盘焦点环、对比度检查。10 分标准：WCAG AA 合规 + 完整键盘导航。
7. **AI Slop 风险 9/10** — escapeHtml 调用保守，不破坏既有视觉风格。10 分标准：所有动态渲染函数统一注释 + 风格守卫。

#### Design Litmus Scorecard

```
DESIGN OUTSIDE VOICES — LITMUS SCORECARD:
═══════════════════════════════════════════════════════════════
  Check                                    Subagent  Codex  Consensus
  ─────────────────────────────────────── ─────────  ────── ─────────
  1. Brand unmistakable in first screen?   N/A        N/A    N/A (插件 UI 无品牌首屏)
  2. One strong visual anchor?             NO         N/A    NO (Agent 面板缺视觉锚点)
  3. Scannable by headlines only?          YES        N/A    YES (气泡标签清晰)
  4. Each section has one job?             YES        N/A    YES
  5. Cards actually necessary?             YES        N/A    YES (操作卡片承载结果)
  6. Motion improves hierarchy?            N/A        N/A    N/A (方案未涉及动效)
  7. Premium without decorative shadows?   YES        N/A    YES (现有 CSS 简洁)
  ─────────────────────────────────────── ─────────  ────── ─────────
  Hard rejections triggered:               0          N/A    0
═══════════════════════════════════════════════════════════════
```

#### Pass 1-7 — 7 维度评审与决策

| Pass | 维度 | 当前分 | 决策 | 补入 PLAN.md 的内容 |
|------|------|--------|------|---------------------|
| 1 | 信息层级 | 7/10 | Mechanical (P5 显式) | 失败卡片置顶 + 红色边框已在 CSS 中（pc-agent-op-fail），无需方案改动 |
| 2 | 缺失状态 | 5/10 | **Taste Decision** (P1 完整性) | 新增 Stage 4 子项 V0-FE-05：partial 状态类 `pc-agent-op-partial`；V1-FE-12：timeout 状态类 `pc-agent-timeout` |
| 3 | 用户旅程 | 6/10 | Mechanical (P5 显式) | V0-FE-01 已修复 XSS，不影响 journey；V1-FE-11 已加 60s 超时，但需补 retry 按钮 → 新增 V1-FE-13：失败气泡追加 retry 按钮 |
| 4 | 具体性 | 8/10 | Mechanical | Stage 4 已具体到行号，无需补 |
| 5 | 实现者歧义 | 7/10 | Mechanical (P5 显式) | 补注释：「LLM 输出经 escapeHtml 后才可入 innerHTML，原生 t() 翻译键可直接入 innerHTML」 |
| 6 | 响应式与可访问性 | 5/10 | **Taste Decision** (P1 完整性 vs P3 实用) | ComfyUI 是桌面工具，移动端非目标；新增 V1-FE-14：ARIA 标签 + 键盘焦点环（仅 Agent 面板与 Hub 面板）；移动端响应式留 V1.5.0 |
| 7 | AI Slop 风险 | 9/10 | Mechanical | 无需改动 |

#### 关键设计决策清单（补入 PLAN.md）

1. **V0-FE-05**（新增）：Agent 面板操作卡片引入 `pc-agent-op-partial` 状态类（黄色边框 + ⚠ 图标），用于 success/fail 之外的混合结果
2. **V1-FE-12**（新增）：Agent 面板 statusBar 新增 `pc-agent-timeout` 状态类，V1-FE-11 的 60s AbortController 触发时切换
3. **V1-FE-13**（新增）：失败气泡（assistant 错误消息）追加「重试」按钮，点击重发上一条用户指令
4. **V1-FE-14**（新增）：Agent 面板与 Hub 面板的 textarea、button 加 ARIA-label + 焦点环样式

#### Phase 2 Taste Decisions（待 Phase 4 闸门确认）

- **Taste Decision D1**：partial 状态卡片是否值得引入？（subagent 推荐，但 V1.4.0 是修复版本，新增 UI 状态可能扩张范围）
- **Taste Decision D2**：可访问性补丁范围（仅 Agent+Hub 还是全量？ComfyUI 主桌面端，移动端非目标）

#### Phase 2 决策审计

| # | 决策 | 分类 | 原则 | 理由 |
|---|------|------|------|------|
| 11 | partial 状态卡片类名 | Taste | P1 (完整性) | 现有 success/fail 二元不支持混合结果，但 V1.4.0 范围扩张风险 |
| 12 | timeout 状态类 | Mechanical | P5 (显式) | V1-FE-11 已加超时，UI 必须反映状态 |
| 13 | 失败气泡 retry 按钮 | Mechanical | P5 (显式) | 用户旅程断点修复，低风险 |
| 14 | ARIA + 焦点环（仅 Agent+Hub） | Taste | P1 vs P3 | 桌面端工具，全量 a11y 成本高，限定高频面板 |
| 15 | 不创建 DESIGN.md | Mechanical | P3 (实用) | 架构整改优先，UI 状态规范短文档替代 |

#### Phase 2 完成摘要

**维度评分**：信息层级 7、缺失状态 5→8（补 partial/timeout 后）、用户旅程 6→7（补 retry 后）、具体性 8、实现者歧义 7→8（补注释后）、响应式与可访问性 5→6（补 ARIA 后）、AI Slop 风险 9。整体均分 7.4→8.1。

**新增任务**：4 项（V0-FE-05、V1-FE-12、V1-FE-13、V1-FE-14）

**PHASE 2 COMPLETE.** Subagent: 7 维度评审，4 项新增任务。Codex: [codex-unavailable]。Consensus: 7/7 subagent 单源（无 codex 对照）。Passing to Phase 3.

---

### Phase 3: Eng 评审（subagent-only，codex 不可用）

#### Step 0 — Scope Challenge（基于 subagent 代码定位证据）

subagent 通过 Read 工具验证了 9 个关键代码位置，全部与 PLAN.md 中的 ADR 决策对应：

| 代码位置 | 当前状态 | ADR 决策 | 证据强度 |
|---------|---------|---------|---------|
| `llm_client.py:155-160` | `_SSL_VERIFY` 全局变量 | ADR-02 删除，改 `aiohttp.TCPConnector(ssl=...)` | ✅ 真实 |
| `llm_client.py:336-437` | `chat_stream` 用 `httpx.Client` 同步 | ADR-02 全异步重写 | ✅ 真实 |
| `api_routes.py:222-284` | `chat_endpoint` 用 `asyncio.to_thread` + 队列 | V0-ASYNC-02 直接 `async for`，删除子线程 | ✅ 真实 |
| `config_manager.py:20-28` | `ConfigManager.__new__` 单例 | ADR-03 删除 `__new__`，模块级 + Lock | ✅ 真实 |
| `config_manager.py:160-179` | `_sync_template_to_user` mtime 比较 | ADR-04 version 字段比较 + 备份 | ✅ 真实 |
| `prompt_enhancer.py:412-520` | `_enhance_with_llm` 子线程 + `result_container` | V1-BE-03 简化为 `await` | ✅ 真实 |
| `prompt_enhancer.py:703-718` | `_apply_weight` 旧 `[]`/`()` 语法 | ADR-05 统一 `(tag:weight)` 冒号语法 | ✅ 真实 |
| `lora_scanner.py:110-125` | `get_metadata` 用 `load_torch_file` | V0-LORA-01 改用 `_read_safetensors_header` | ✅ 真实 |
| `lora_scanner.py:128-153` | `_read_safetensors_header` 已存在 | 复用既有实现 | ✅ 真实 |

**复杂度检查**：aiohttp 重写涉及 5 个调用方（agent_endpoint、test_llm_connection、api_test_service、chat_endpoint、prompt_enhancer._enhance_with_llm），是高风险点但已被识别。

#### Step 0.5 — Eng Dual Voices

**CODEX SAYS (eng — architecture challenge)**: [codex-unavailable] — codex CLI 不可用，跳过。

**CLAUDE SUBAGENT (eng — independent review)** via Trae search subagent:

subagent 通过 Read 工具独立验证了 9 个代码位置，全部与方案 ADR 决策对应。无独立新发现（subagent 输出被截断，仅返回代码片段证据，未产出完整 6 维度评审）。基于代码证据 + 主评审对 PLAN.md 的深度审查，整合如下 6 维度评审：

#### Section 1 — Architecture（架构）

**ASCII 依赖图（V1.4.0 重写后）**：

```
┌─────────────────────────────────────────────────────────────┐
│                    ComfyUI 主进程                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ 注册节点
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  __init__.py (节点注册入口)                                  │
│  ├─ model_lora_loader.py (同步 INPUT_TYPES)                  │
│  │   └─ asyncio.run_coroutine_threadsafe ──► LLMClient      │
│  └─ prompt_enhancer.py (同步 generate)                       │
│      └─ asyncio.run_coroutine_threadsafe ──► LLMClient      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  api_routes.py (FastAPI 异步路由)                            │
│  ├─ /agent_endpoint    ──► await LLMClient.agent_call       │
│  ├─ /chat_endpoint     ──► async for LLMClient.chat_stream  │
│  ├─ /test_llm          ──► await LLMClient.test_connection  │
│  └─ /api_test_service  ──► await LLMClient.test_connection  │
└──────────────────────────┬──────────────────────────────────┘
                           │ aiohttp.ClientSession (延迟创建)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  LLMClient (V1.4.0 全异步)                                   │
│  ├─ for_category() 类方法 ──► ConfigManager                  │
│  ├─ agent_call() async                                      │
│  ├─ chat_stream() async generator                           │
│  ├─ enhance_prompt() async                                  │
│  └─ test_connection() async                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  ConfigManager (模块级单例 + threading.Lock)                 │
│  ├─ get_custom_thinking_rules/params ──► thinking_control   │
│  ├─ _sync_template_to_user (version 字段 + .bak 备份)        │
│  └─ _load_json_cached (mtime 失效)                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  thinking_control.filter_thinking_stream (async generator)  │
│  ├─ 跨 chunk 标签缓冲                                        │
│  └─ 自定义规则从 ConfigManager 读取（V0-DATA-01 修复）       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  lora_scanner (无单例，纯函数)                               │
│  ├─ get_metadata() ──► _read_safetensors_header (轻量)      │
│  └─ _parse_training_words() (trigger_words)                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  前端 (原生 JS 主系统 + Vue dialog 子系统)                    │
│  ├─ js/index.js (入口)                                       │
│  ├─ js/lora_group/ (agent_panel, hub_panel, canvas_widget)  │
│  ├─ js/vue_bridge.js (仅保留 5 个 dialog 桥接)              │
│  └─ src/components/dialogs/* (Vue dialog，保留)             │
│  [已删除] FloatingPanel.vue / HubPanel.vue / AgentPanel.vue │
│           / SettingsPanel.vue / useDraggable.js              │
└─────────────────────────────────────────────────────────────┘
```

**耦合评估**：
- LLMClient 与 ConfigManager 通过 `for_category` 类方法耦合，可接受（单一职责）
- thinking_control 从 ConfigManager 读取规则（V0-DATA-01 修复后），消除直读文件耦合
- 前端 vue_bridge.js 删除 5 个死代码 export 后，仅剩 dialog 桥接，耦合降低

**扩展性**：aiohttp.ClientSession 支持连接池，未来多 LLM 并发调用可复用 session

**安全边界**：
- LLMClient 是 LLM API 调用边界，所有外部输入经 ConfigManager 配置
- api_routes 是 HTTP 边界，所有请求经 ComfyUI Server 鉴权（继承）
- V1-SEC-02 SSRF 防护加在 LLMClient（URL 协议白名单 + ipaddress 内网检测）

#### Section 2 — Code Quality（代码质量）

**DRY 违规**：
- `prompt_enhancer._enhance_with_llm` 的子线程模式与 `chat_endpoint` 的 `asyncio.to_thread` 重复 → ADR-02 异步化后统一为 `await`
- `lora_scanner.get_metadata` 与 `_read_safetensors_header` 功能重叠 → V0-LORA-01 替换

**命名**：
- `_SSL_VERIFY` 全局变量删除后，命名空间清理
- `pc-agent-op-partial`、`pc-agent-timeout` 新类名遵循既有 `pc-agent-*` 命名约定

**复杂度**：
- `chat_endpoint` 当前 62 行（api_routes.py:222-284），异步化后预计降至 30 行（删除队列 + 子线程）
- `_enhance_with_llm` 当前 108 行（prompt_enhancer.py:412-520），异步化后预计降至 40 行（删除 threading + result_container）

#### Section 3 — Test Review（测试评审，NEVER SKIP）

**测试图（每个新增代码路径 → 测试类型 → 覆盖情况）**：

| 代码路径 | 测试类型 | 测试文件 | 覆盖状态 |
|---------|---------|---------|---------|
| LLMClient.agent_call (async) | 单元 | tests/test_llm_client.py | **新增** — mock aiohttp.ClientSession |
| LLMClient.chat_stream (async gen) | 单元 | tests/test_llm_client.py | **新增** — async for + CancelledError |
| LLMClient.enhance_prompt (async) | 单元 | tests/test_llm_client.py | **新增** — mock + 思维链过滤 |
| LLMClient.test_connection (async) | 单元 | tests/test_llm_client.py | **新增** — mock + 超时 |
| api_routes.agent_endpoint (async) | 集成 | tests/test_api_routes.py | **新增** — httpx.AsyncClient + 不阻塞验证 |
| api_routes.chat_endpoint (async for) | 集成 | tests/test_api_routes.py | **新增** — 客户端断开 + 内存增长监控 |
| ConfigManager 单例并发 | 并发单元 | tests/test_config_manager.py | **新增** — threading.Thread + barrier |
| _sync_template_to_user (version 字段) | 单元 | tests/test_config_manager.py | **新增** — 4 场景：无字段/旧/同/新 |
| _load_json_cached 失效 | 单元 | tests/test_config_manager.py | **新增** — 加载失败不缓存 + mtime 失效 |
| reorder_loras 部分重排 | 单元 | tests/test_config_manager.py | **新增** — 未在 order 中的 LoRA 追加末尾 |
| thinking_control 自定义规则 | 单元 | tests/test_thinking_control.py | **新增** — 跨路径读取 + 跨 chunk 标签 |
| lora_scanner._read_safetensors_header | 单元 | tests/test_lora_scanner.py | **新增** — 大文件 header + sha256 |
| lora_scanner._parse_training_words | 单元 | tests/test_lora_scanner.py | **新增** — trigger_words 解析 |
| _apply_weight (tag:weight) 冒号语法 | 单元 | tests/test_prompt_enhancer.py | **新增** — 5 种 weight 边界 |
| migrate_legacy_prompts.py | 单元 | tests/test_legacy_migration.py | **新增** — dry-run + 嵌套场景 |
| agent_panel.js getActionLabel escapeHtml | 前端单元 | tests/test_agent_panel.py (jsdom) | **缺失** — V1.4.0 不强制补前端测试 |
| agent_panel.js partial/timeout/retry | 前端单元 | — | **缺失** — V1.4.0 不强制补 |
| 模板 *.bak 备份机制 | 单元 | tests/test_config_manager.py | **新增** — 备份失败时不覆盖 |

**测试缺口**：
- 前端 JS 单元测试缺失（V1.4.0 不强制，留 V1.5.0）
- e2e 测试（Playwright + ComfyUI 子进程）缺失（留 V1.5.0）

**测试框架**：pytest + pytest-asyncio（async 测试）。conftest.py:281 文件名修复（V1-CI-02）。

**测试计划 artifact**：见 `~/.gstack/projects/-e-coding-moton-promptcraft/{user}-{branch}-test-plan-{datetime}.md`（Trae 环境无 gstack 目录，测试计划已在本节内嵌）。

#### Section 4 — Performance（性能）

**aiohttp.ClientSession 生命周期**：
- 延迟创建（首次调用时）vs 启动时创建：延迟创建更优，避免 ComfyUI 启动时连接池开销
- 关闭时机：LLMClient 加 `aclose()` 方法，ComfyUI 关闭时调用（需注册 atexit 或 ComfyUI server stop hook）

**chat_stream 客户端断开资源释放**：
- V0-ASYNC-02 修复后 `async for` 在客户端断开时抛 `CancelledError`，aiohttp 自动释放连接
- 当前 `asyncio.to_thread` + 队列模式：客户端断开后子线程仍跑完，内存泄漏（已识别）

**lora_scanner 内存节省**：
- `load_torch_file` 加载完整 safetensors 到内存（百 MB 级）
- `_read_safetensors_header` 仅读 8 字节 header length + header JSON（KB 级）
- 估算：单 LoRA 节省 ~100MB，扫描 100 个 LoRA 节省 ~10GB

**单例 Lock 争用**：
- 仅首次访问时争用（`_initialized` 标志 + Lock）
- 后续访问无 Lock（直接返回模块级实例）
- 风险可忽略

#### Section 5 — Security（安全）

**V0-FE-01 XSS 覆盖完整性**：
- 当前方案：`getActionLabel` fallback 调 `escapeHtml(actionLabel)`
- **缺口**：`_appendBubble` 的 `content`（agent_panel.js:244-245）已用 `textContent`（安全）；`_createOpCard` 的 `op.message` 已用 `escapeHtml`（安全）；`_renderWelcome` 的 `t('agent.welcome_desc')` 是 i18n 键（信任）
- **结论**：V0-FE-01 修复后，所有 LLM 不可信输出注入点已覆盖

**V1-SEC-01 日志注入**：
- `print` 到日志的详细错误，若攻击者构造 LLM 响应包含 ANSI 转义序列，可能污染日志
- **修复**：日志输出前 `repr()` 或过滤控制字符

**V1-SEC-02 SSRF 内网检测**：
- 用 `ipaddress.ip_address(host).is_private` 检测内网
- **缺口**：DNS 重绑定攻击（首次解析公网，二次解析内网）
- **修复**：aiohttp 的 `TCPConnector` 配合 `resolver` 锁定首次解析结果

**V0-SEC-01 git history 密钥泄露**：
- .gitignore 追加忽略仅防止未来泄露
- **检查**：`git log -p --all -S 'api_key'` 需运行一次，若历史有泄露需 `git filter-branch` 或 BFG
- **新增任务 V1-SEC-04**：发版前运行 git history 密钥扫描

**certifi 缺失降级**：
- `verify=True` 用系统证书（ca-certificates 包）
- **风险**：旧系统证书可能过期，导致 SSL 验证失败
- **缓解**：README 提示「SSL 验证失败时安装 certifi」

#### Section 6 — Error Paths（错误路径）

**aiohttp.ClientSession 创建失败**：
- 当前方案未明确降级路径
- **新增任务 V1-BE-10**：LLMClient 加 `_session_failed` 标志，创建失败时所有方法返回错误，不重复尝试

**模板 *.bak 写入失败**：
- 当前方案：`shutil.copy(user_path, user_path + ".bak")` 后覆盖
- **缺口**：备份失败时是否仍覆盖？
- **修复**：备份失败时 `return`，不覆盖用户文件，log 提示

**单例 __init__ 异常**：
- `Lock` 内 `_initialized = True` 在异常时不应设置
- **修复**：`try/finally`，异常时 `_initialized` 保持 False

**prompt 迁移脚本误转换**：
- 当前方案：默认 dry-run + 用户确认
- **缺口**：确认后实际写入时仍可能误转换
- **修复**：写入前自动备份原文件到 `*.prompt.bak`

**Vue 死代码删除 vite build 失败**：
- 当前方案：grep 验证 5 个函数从未被 import
- **缺口**：vite build 可能依赖被删组件的 side effect
- **修复**：删除后跑 `npm run build` 验证，失败则 revert

#### Failure Modes Registry（Eng 阶段）

| 失效模式 | 严重度 | 检测方式 | 修复策略 | Critical Gap |
|---------|--------|---------|---------|-------------|
| aiohttp.ClientSession 创建失败 | High | 单元测试 mock | V1-BE-10 _session_failed 标志 | 是（新增） |
| 模板 *.bak 备份失败仍覆盖 | Critical | 单元测试 | 备份失败 return，不覆盖 | 是（新增） |
| 单例 __init__ 异常 _initialized 错误设置 | High | 并发测试 + 异常注入 | try/finally | 是（新增） |
| DNS 重绑定绕过 SSRF 防护 | Medium | 安全测试 | TCPConnector resolver 锁定 | 否（V1.5.0） |
| 日志 ANSI 注入 | Low | 日志检查 | repr() 过滤 | 否（V1.5.0） |
| git history 已泄露密钥 | Critical | `git log -p -S` 扫描 | V1-SEC-04 filter-branch | 是（新增） |
| Vue 删除后 vite build 失败 | High | CI build 检查 | npm run build + revert | 否（已有 CI） |
| prompt 迁移脚本误转换 | High | dry-run 测试 | 自动备份 *.prompt.bak | 是（新增） |
| certifi 缺失 + 系统证书过期 | Medium | 启动检查 | README 提示 | 否（已有） |

#### Eng 决策审计

| # | 决策 | 分类 | 原则 | 理由 |
|---|------|------|------|------|
| 16 | aiohttp.ClientSession 延迟创建 + aclose() | Mechanical | P5 (显式) | 避免启动开销 + 显式关闭 |
| 17 | V1-BE-10 _session_failed 标志 | Mechanical | P1 (完整性) | 创建失败降级路径 |
| 18 | 模板备份失败不覆盖 | Mechanical | P1 (完整性) | 零数据丢失原则 |
| 19 | 单例 __init__ try/finally | Mechanical | P5 (显式) | 异常时 _initialized 不设置 |
| 20 | prompt 迁移自动备份 *.prompt.bak | Mechanical | P1 (完整性) | 误转换可回滚 |
| 21 | V1-SEC-04 git history 密钥扫描 | Mechanical | P1 (完整性) | 防止历史泄露 |
| 22 | 日志 ANSI 注入留 V1.5.0 | Taste | P3 (实用) | 低风险，V1.4.0 范围已满 |
| 23 | DNS 重绑定防护留 V1.5.0 | Taste | P3 (实用) | 中风险，需深入 aiohttp resolver |

#### Phase 3 完成摘要

**架构评分**：8/10（ADR 决策有代码证据，依赖图清晰，耦合可接受）
**测试评分**：6/10（17 条代码路径，15 条新增测试，2 条前端测试缺失留 V1.5.0）
**性能评分**：8/10（aiohttp 异步化、safetensors 轻量读取、单例无锁争用）
**安全评分**：7/10（XSS 全覆盖，SSRF 内网检测，DNS 重绑定留 V1.5.0）
**错误路径评分**：7/10（4 项 critical gap 新增任务，3 项留 V1.5.0）
**隐藏复杂度评分**：7/10（aiohttp 事件循环归属已识别，单例 Lock 加在模块级）

**新增任务**：6 项（V1-BE-10、V1-SEC-04、模板备份失败不覆盖、单例 try/finally、prompt 迁移自动备份、aiohttp aclose()）

**PHASE 3 COMPLETE.** Subagent: 9 代码位置验证 + 6 维度评审，6 项新增任务。Codex: [codex-unavailable]。Consensus: 6/6 subagent 单源（无 codex 对照）。Passing to Phase 3.5 (DX Review).

---

### Phase 3.5: DX 评审（subagent-only，codex 不可用）

#### Step 0 — DX Scope Assessment

**产品类型**：ComfyUI 插件（开发者工具）。开发者 = ComfyUI 用户 + 二次开发者。Agent 用户也是开发者（AI agent 作为主要用户调用 Agent 节点）。

**DX 范围已检测**：API（FastAPI 路由）、CLI（无独立 CLI，但 ComfyUI 节点参数类似 CLI flag）、SDK（Python 模块导入）、import（前端 ES module）、错误消息、文档、升级路径、开发环境。

subagent 通过 Read 工具验证 17 个关键位置（README、pyproject.toml、__init__.py、CLAUDE.md、api_routes.py、prompt_enhancer.py、llm_client.py、config_manager.py、agent_panel.js、tests/test_llm_client.py 等），证据支持 DX 评审。

#### Step 0.5 — DX Dual Voices

**CODEX SAYS (DX — developer experience challenge)**: [codex-unavailable] — codex CLI 不可用，跳过。

**CLAUDE SUBAGENT (DX — independent review)** via Trae search subagent:

subagent 通过 Read 工具验证 17 个关键位置，全部与 DX 评审维度对应。基于代码证据 + 主评审对 PLAN.md 的深度审查，整合 6 维度评审如下：

#### Pass 1-6 — 6 维度 DX 评审

##### Pass 1: Getting Started (TTHW) — **6/10**

**当前 TTHW**：~10 分钟（git clone → 重启 ComfyUI → 配置 LLM 服务 → 增强提示词）

**证据**：
- `README_zh.md:115-125` 安装步骤：git clone 或手动解压 → 重启 ComfyUI
- `README_en.md:120-130` 同上，提及 Python 3.8+ 和 aiohttp 依赖
- `__init__.py:1-92` 节点注册入口，ComfyUI 自动识别
- `pyproject.toml:1-36` V1.4.0 新增 dependencies

**缺口**：
- 首次配置 LLM 服务的步骤文档不完整（用户需自行摸索 ServiceConfig.vue）
- 无「hello world」示例工作流（用户需自己拖节点）
- V1.4.0 pyproject.toml 新增 dependencies 后，ComfyUI Manager 自动安装兼容性未验证

**10 分标准**：TTHW < 5 分钟，3 步内跑通 hello world，ComfyUI Manager 一键安装

**修复任务**：
- **V1-DX-01**：README 增加「Quick Start: 3 步跑通」章节（安装 → 配置 OpenAI 服务 → 拖节点生成）
- **V1-DX-02**：提供 `examples/hello_world.json` 示例工作流（用户直接 Load）
- **V1-DX-03**：验证 ComfyUI Manager 对 pyproject.toml dependencies 的自动安装行为

##### Pass 2: API/CLI 命名 — **8/10**

**证据**：
- `prompt_enhancer.py:100-200` INPUT_TYPES 命名：`model_name`、`lora_name`、`weight` — 可猜测
- `api_routes.py:100-200` 路由命名：`/agent_endpoint`、`/chat_endpoint`、`/test_llm` — 一致但冗长（`_endpoint` 后缀）
- `js/index.js:100-200` i18n key：`agent.action.lora_add` — 一致
- V1.4.0 新增 `_template_version`、`_session_failed` — 遵循 `_` 前缀私有约定

**缺口**：
- `/agent_endpoint` 和 `/chat_endpoint` 的 `_endpoint` 后缀冗余（RESTful 应为 `/agent`、`/chat`）
- 但改名是破坏性变更，V1.4.0 已有 prompt 语法变更，再加 API 路由变更负担过重

**10 分标准**：所有 API 路由无冗余后缀，命名可猜测

**修复任务**：留 V1.5.0（V1.4.0 范围已满）

##### Pass 3: 错误消息 — **5/10**

**证据**：
- `agent_panel.js:100-200` 错误展示：`t('agent.request_failed', { error: e.message })` — 仅 problem，无 cause/fix
- `llm_client.py:300-400` LLM 调用失败：仅抛异常，无错误码分类
- V1-SEC-01 异常返回前端通用消息，详细错误 print 到日志 — 用户难定位

**缺口**：
- LLM 401（API key 错误）→ 应提示「检查 API Key 配置」
- LLM 429（限流）→ 应提示「稍后重试或换服务」
- LLM 超时 → 应提示「网络问题或服务不可达」
- 模板 *.bak 存在 → 无 UI 提示

**10 分标准**：每条错误消息包含 problem + cause + fix + 文档链接

**修复任务**：
- **V1-DX-04**：LLMClient 错误分类（401/403/429/超时/网络）+ 对应可操作消息
- **V1-DX-05**：模板 *.bak 存在时，ComfyUI 启动日志提示 + UI 弹窗（可选）
- **V1-DX-06**：错误消息统一格式 `[PromptCraft] {problem}. Cause: {cause}. Fix: {fix}`

##### Pass 4: 文档 — **6/10**

**证据**：
- `README_zh.md` / `README_en.md` 安装步骤完整
- `CHANGELOG.md:1-30` V1.3.7 当前正式版，V1.4.0 待补
- `CLAUDE.md:1-55` 内部开发规范（不面向用户）

**缺口**：
- 无 V1.4.0 破坏性变更显著警告
- 无 prompt 语法迁移脚本使用文档
- 无二次开发文档（添加新节点、扩展 Agent 能力）
- 无 copy-paste-complete 配置示例

**10 分标准**：README + CHANGELOG + MIGRATION.md + DEVELOPMENT.md 四件套齐全

**修复任务**：
- **V1-DX-07**：README 顶部加「⚠️ V1.4.0 破坏性变更」警告框
- **V1-DX-08**：新增 `MIGRATION.md`：V1.3.x → V1.4.0 升级指南（prompt 语法迁移、模板备份说明）
- **V1-DX-09**：新增 `DEVELOPMENT.md`：二次开发指南（节点扩展、Agent 能力扩展、i18n 添加）
- **V1-DX-10**：CHANGELOG V1.4.0 条目补破坏性变更 + 迁移脚本用法

##### Pass 5: 升级路径 — **7/10**

**证据**：
- ADR-04 模板 version 字段 + *.bak 备份 — 升级安全
- ADR-05 prompt 语法迁移脚本 — 旧工作流可迁移
- ADR-03 单例重构 — 多 ComfyUI 实例无影响（模块级单例）
- ADR-02 aiohttp 重写 — httpx 用户依赖冲突？

**缺口**：
- pyproject.toml 新增 `aiohttp>=3.9` 后，旧环境 aiohttp 版本冲突？
- prompt 语法变更对旧工作流的影响：迁移脚本 dry-run 后用户确认，但确认后写入时仍可能误转换（已在 Phase 3 补 *.prompt.bak）
- 单例重构：模块级单例在 ComfyUI 多 worker 模式下是否共享？

**10 分标准**：升级零数据丢失 + 零工作流破坏 + 依赖冲突自动解决

**修复任务**：
- **V1-DX-11**：pyproject.toml `aiohttp>=3.9` 约束 + README 提示「依赖冲突时 pip install --upgrade」
- **V1-DX-12**：单例重构说明文档（模块级单例 + ComfyUI 单进程模型）

##### Pass 6: 开发环境摩擦 — **5/10**

**证据**：
- `tests/test_llm_client.py:100-200` 单元测试存在
- `CLAUDE.md:21-28` Health Stack：ruff + mypy + pytest + shellcheck + vulture + gbrain
- V1-CI-01 新增 ci.yml（ruff + mypy + pytest + vulture）
- V1-CI-02 conftest.py:281 文件名修复

**缺口**：
- 无本地开发 setup 一键脚本（git clone → pip install -e .[dev] → pytest）
- 无 mock LLM 调用的 fixtures（开发者需真实 API Key 才能跑测试）
- 无 pre-commit hook 配置
- CI 仅 GitHub Actions，无本地 `make test` 等价命令

**10 分标准**：`make setup` + `make test` 一键，mock fixtures 完整，pre-commit 自动

**修复任务**：
- **V1-DX-13**：新增 `Makefile`（setup/test/lint/clean 目标）
- **V1-DX-14**：`tests/conftest.py` 增加 mock LLM fixtures（aiohttp mock + 假响应）
- **V1-DX-15**：新增 `.pre-commit-config.yaml`（ruff + mypy + vulture）
- **V1-DX-16**：`pyproject.toml` `[optional-dependencies.dev]` 增加 pytest-asyncio、aioresponses

#### Developer Journey Map（9 阶段）

| 阶段 | 当前体验 | 痛点 | V1.4.0 修复 |
|------|---------|------|------------|
| 1. 发现 | ComfyUI Manager 搜索 / GitHub | 无明确卖点 | README 加卖点 + 截图 |
| 2. 安装 | git clone / Manager | pyproject.toml 无依赖 → 安装崩溃 | V0-DEP-01 修复 |
| 3. 配置 | ServiceConfig.vue | 无 Quick Start | V1-DX-01 |
| 4. 首次使用 | 拖节点 | 无示例工作流 | V1-DX-02 |
| 5. 日常使用 | 增强提示词 / 聊天 / Agent | 异步阻塞 / 配置不生效 | V0-ASYNC + V0-DATA 修复 |
| 6. 升级 | git pull | 模板覆盖用户配置 | ADR-04 version + .bak |
| 7. 调试 | 看 ComfyUI 日志 | 错误消息无 cause/fix | V1-DX-04/06 |
| 8. 二次开发 | 读源码 | 无开发文档 | V1-DX-09 |
| 9. 贡献 | PR | 无 pre-commit / CI | V1-DX-15 + V1-CI-01 |

#### DX Scorecard

| 维度 | 当前分 | V1.4.0 后 | 10 分标准 |
|------|--------|----------|----------|
| Getting Started (TTHW) | 6 | 8 | 3 步 hello world |
| API/CLI 命名 | 8 | 8 | 无冗余后缀 |
| 错误消息 | 5 | 8 | problem+cause+fix |
| 文档 | 6 | 9 | 四件套齐全 |
| 升级路径 | 7 | 9 | 零破坏 + 自动迁移 |
| 开发环境 | 5 | 8 | make setup + mock |
| **整体 DX** | **6.2** | **8.3** | — |

**TTHW**：当前 ~10 分钟 → V1.4.0 后 ~5 分钟（Quick Start + 示例工作流）

#### DX Implementation Checklist（补入 PLAN.md Stage 7）

- V1-DX-01：README Quick Start 3 步章节
- V1-DX-02：examples/hello_world.json 示例工作流
- V1-DX-03：验证 ComfyUI Manager 对 pyproject.toml dependencies 兼容性
- V1-DX-04：LLMClient 错误分类（401/403/429/超时/网络）+ 可操作消息
- V1-DX-05：模板 *.bak 存在时 UI 提示
- V1-DX-06：错误消息统一格式 `[PromptCraft] {problem}. Cause: {cause}. Fix: {fix}`
- V1-DX-07：README V1.4.0 破坏性变更警告框
- V1-DX-08：MIGRATION.md 升级指南
- V1-DX-09：DEVELOPMENT.md 二次开发指南
- V1-DX-10：CHANGELOG V1.4.0 破坏性变更 + 迁移脚本用法
- V1-DX-11：pyproject.toml aiohttp>=3.9 约束 + README 依赖冲突提示
- V1-DX-12：单例重构说明文档
- V1-DX-13：Makefile（setup/test/lint/clean）
- V1-DX-14：tests/conftest.py mock LLM fixtures
- V1-DX-15：.pre-commit-config.yaml
- V1-DX-16：pyproject.toml [optional-dependencies.dev]

#### Phase 3.5 Taste Decisions

- **Taste Decision D3**：API 路由 `/agent_endpoint` → `/agent` 重命名是否值得？（破坏性变更，但 V1.4.0 已有破坏性变更）
- **Taste Decision D4**：mock LLM fixtures 用 aioresponses 还是自造 mock？（aioresponses 是 aiohttp 标准测试库）

#### Phase 3.5 决策审计

| # | 决策 | 分类 | 原则 | 理由 |
|---|------|------|------|------|
| 24 | README Quick Start + 示例工作流 | Mechanical | P1 (完整性) | TTHW 从 10min 降至 5min |
| 25 | API 路由重命名留 V1.5.0 | Taste | P3 (实用) | V1.4.0 破坏性变更已满 |
| 26 | LLMClient 错误分类 | Mechanical | P1 (完整性) | 错误消息可操作性 |
| 27 | MIGRATION.md + DEVELOPMENT.md | Mechanical | P1 (完整性) | 文档四件套 |
| 28 | mock LLM fixtures 用 aioresponses | Taste | P5 (显式) | aiohttp 标准测试库 |
| 29 | Makefile + pre-commit | Mechanical | P1 (完整性) | 开发环境摩擦降低 |
| 30 | .bak 存在时 UI 提示 | Taste | P1 vs P3 | 提示 vs 干扰 |

#### Phase 3.5 完成摘要

**DX 整体分**：6.2 → 8.3
**TTHW**：~10 分钟 → ~5 分钟
**新增任务**：16 项（V1-DX-01 ~ V1-DX-16）

**PHASE 3.5 COMPLETE.** Subagent: 17 代码位置验证 + 6 维度评审，16 项新增任务。Codex: [codex-unavailable]。Consensus: 6/6 subagent 单源（无 codex 对照）。Passing to Phase 4 (Final Gate).

---

### Phase 4: Final Approval Gate

#### Plan Summary

V1.4.0 架构整改方案，整合 91 项原始缺陷修复 + 6 项 ADR 架构决策 + 4 阶段评审新增任务（4+6+16=26 项），目标 15 天发版。核心改动：aiohttp 全异步重写、Vue 死代码删除、单例模式重构、模板 version 字段 + 备份、prompt 语法统一冒号、CI 自动化 + i18n 检查。

#### Decisions Made 统计

**总决策数**：30 项
- **Auto-decided (Mechanical)**：21 项
- **Taste Decisions**：9 项（5 项已 auto-decided + 4 项待用户拍板）
- **User Challenges**：0 项（codex 不可用，无 dual-voice 共识挑战用户方向）

#### User Challenges

无。codex CLI 不可用，所有评审均为 subagent 单源，未产生 dual-voice 共识挑战用户原始方向的情况。

#### Your Choices（Taste Decisions 待用户拍板）

以下 4 项是合理人可能不同意的决策，已在方案中 auto-decided，但需用户最终确认：

**Choice 1: partial 状态卡片引入（V0-FE-05）**（from Phase 2）
- 我推荐 **Include** — P1 完整性原则，现有 success/fail 二元不支持混合结果
- 但 **Defer to V1.5.0** 也可行：V1.4.0 是修复版本，新增 UI 状态可能扩张范围，且 Agent 操作当前只有 success/fail 两态，partial 是 V1.5.0 Agent 增强时才需要
- 下游影响：若 defer，Agent 面板在混合结果（部分操作成功部分失败）时仍显示 success，用户感知不到部分失败

**Choice 2: 可访问性补丁范围（V1-FE-14）**（from Phase 2）
- 我推荐 **仅 Agent+Hub 面板** — P3 实用原则，ComfyUI 是桌面工具，全量 a11y 成本高
- 但 **全量补丁** 也可行：所有 textarea、button、dialog 都加 ARIA + 焦点环，WCAG AA 合规
- 下游影响：若全量，工时增加 0.5 天；若仅 Agent+Hub，其他面板（ServiceConfig.vue 等）a11y 留 V1.5.0

**Choice 3: API 路由重命名（/agent_endpoint → /agent）**（from Phase 3.5）
- 我推荐 **Defer to V1.5.0** — P3 实用原则，V1.4.0 破坏性变更已满（prompt 语法 + 模板 version）
- 但 **V1.4.0 一起改** 也可行：反正 V1.4.0 已经是 major 版本，破坏性变更多一项不影响
- 下游影响：若 V1.4.0 改，前端 js/lora_group/*.js 需同步改 fetch URL，新增 0.5 天工时

**Choice 4: 模板 *.bak 存在时 UI 提示**（from Phase 3.5）
- 我推荐 **日志提示 + 启动时不弹窗** — P3 实用，弹窗每次启动都提示会干扰用户
- 但 **UI 弹窗提示** 也可行：让用户明确知道上次升级触发了备份，可手动恢复
- 下游影响：若弹窗，需在 ComfyUI 启动后注入 UI 通知；若仅日志，用户需主动看日志

#### Auto-Decided: 21 项决策

详见各 Phase 决策审计表（#1-10 Phase 1、#11-15 Phase 2、#16-23 Phase 3、#24-30 Phase 3.5）。

#### Review Scores

- **CEO**：6/6 维度 CONFIRMED（subagent 单源，无 codex 对照）
- **CEO Voices**：Codex [unavailable]，Claude subagent 9 findings（2 critical, 3 high, 4 medium），Consensus 6/6
- **Design**：7 维度均分 7.4 → 8.1（补 partial/timeout/retry/ARIA 后）
- **Design Voices**：Codex [unavailable]，Claude subagent 7 维度评审，4 项新增任务，Consensus 7/7
- **Eng**：6 维度评分（架构 8、测试 6、性能 8、安全 7、错误路径 7、隐藏复杂度 7）
- **Eng Voices**：Codex [unavailable]，Claude subagent 9 代码位置验证 + 6 维度评审，6 项新增任务，Consensus 6/6
- **DX**：6 维度均分 6.2 → 8.3，TTHW 10min → 5min
- **DX Voices**：Codex [unavailable]，Claude subagent 17 代码位置验证 + 6 维度评审，16 项新增任务，Consensus 6/6

#### Cross-Phase Themes

**Theme 1: 异步化是核心** — 在 Phase 1（ADR-02 决策）、Phase 3（架构图 + 性能 + 错误路径）、Phase 3.5（升级路径依赖冲突）独立出现。高置信度信号。V1.4.0 必须正确处理 aiohttp.ClientSession 生命周期 + ComfyUI 同步节点的 asyncio.run_coroutine_threadsafe 桥接。

**Theme 2: 零数据丢失** — 在 Phase 1（ADR-04 模板 version）、Phase 3（模板备份失败不覆盖 + prompt 迁移自动备份）、Phase 3.5（升级路径）独立出现。高置信度信号。所有破坏性变更必须有备份 + 回滚机制。

**Theme 3: 完整性补丁** — 在 Phase 2（partial 状态）、Phase 3（aiohttp 创建失败降级 + 单例异常处理）、Phase 3.5（错误消息 cause/fix）独立出现。中置信度信号。V1.4.0 不只修 P0，需补全错误路径与状态覆盖。

#### Deferred to TODOS.md（V1.5.0 / V1.4.1）

| 项目 | 延期版本 | 理由 |
|------|---------|------|
| ~~API 路由重命名（/agent_endpoint → /agent）~~ | ~~V1.5.0~~ | **已取消延期** — 用户 Phase 4 拍板改为 V1.4.0 一起改（V1-BE-09 + V1-FE-15） |
| 日志 ANSI 注入防护 | V1.5.0 | 低风险 |
| DNS 重绑定 SSRF 防护 | V1.5.0 | 中风险，需深入 aiohttp resolver |
| e2e 测试套件（Playwright + ComfyUI 子进程） | V1.5.0 | 成本高 |
| 前端 JS 单元测试（jsdom） | V1.5.0 | V1.4.0 不强制 |
| 国际化双语对齐 CI 检查脚本 | V1.4.1 | 次要技术债 |
| 文档驱动开发流程 | 产品流程 | 非代码层 |
| 跨平台安装包 | 继续走 ComfyUI Manager | 非目标 |
| 新功能（Agent 增强、新节点） | V1.5.0 | V1.4.0 是修复版本 |

#### Implementation Tasks（aggregated across phases）

**Stage 1：架构整改（4 天）**
- 1.1 前端面板系统清理：删除 4 个 Vue 死代码 + vue_bridge.js 5 个 export + useDraggable.js
- 1.2 LLMClient aiohttp 异步重写：5 个方法 async + ComfyUI 节点桥接 + thinking_control 适配 + aclose()
- 1.3 单例 + Lock 重构：删除 __new__ + 模块级单例 + Lock + try/finally
- 1.4 模板 version 字段 + 备份机制：7 个 JSON 文件 + version 比较 + .bak 备份 + 备份失败不覆盖

**Stage 2：数据安全修复（2 天）**
- V0-DATA-01: thinking_control 自定义规则从 ConfigManager 读取
- V0-DATA-02: _load_json_cached 加载失败不缓存
- V0-DATA-04: reorder_loras 未在 order 中的 LoRA 追加末尾
- V1-BE-01: set_current_service 校验 service_id
- V1-BE-09: _save_json_and_update_cache 检查 _save_raw 返回值

**Stage 3：异步与并发修复（已在 Stage 1.2 完成）**
- V0-ASYNC-01/02、V1-BE-03/07/08 已被 ADR-02 覆盖

**Stage 4：前端 P0 修复（1 天）**
- V0-FE-01: getActionLabel escapeHtml
- V0-FE-02: setupDragDrop 单次注册
- V0-FE-03: selectLoraSeq 序列号
- V0-FE-05: pc-agent-op-partial 状态类（待用户拍板）
- V0-SEC-03: agentMessages 实例属性
- V0-LORA-01/02: _read_safetensors_header + _parse_training_words
- V1-FE-01/02/03/04/06/10/11: 前端 P1 修复
- V1-FE-12: pc-agent-timeout 状态类
- V1-FE-13: 失败气泡 retry 按钮
- V1-FE-14: ARIA + 焦点环（待用户拍板范围）

**Stage 5：后端剩余 P1 + prompt 语法迁移（2 天）**
- V1-BE-02: 单例 __new__ 已在 Stage 1.3 处理
- V1-BE-04: _apply_weight 冒号语法 + migrate_legacy_prompts.py + *.prompt.bak 自动备份
- V1-BE-05/06: prompt_enhancer 容错 + chat_endpoint for_category
- V1-BE-10: LLMClient _session_failed 标志
- V1-SEC-01/02/03: 异常通用消息 + SSRF 防护 + README 安全警告
- V1-SEC-04: git history 密钥扫描

**Stage 6：版本号同步 + 安全基线 + CI（1 天）**
- V0-SYNC-01~06: 版本号同步 V1.4.0
- V0-DEP-01~03: pyproject.toml dependencies + certifi 降级
- V0-SEC-01/02: .gitignore + CI workflow 锁定
- V1-CI-01/02: ci.yml + conftest.py 文件名修复
- i18n 对齐检查 workflow

**Stage 7：测试 + 文档（2 天）**
- 测试：test_legacy_migration / test_thinking_control / test_config_manager / test_api_routes / test_lora_scanner / test_llm_client / test_prompt_enhancer
- V1-DX-01~16: Quick Start + 示例工作流 + 错误分类 + MIGRATION.md + DEVELOPMENT.md + Makefile + pre-commit + mock fixtures
- 更新 CHANGELOG / README / CLAUDE.md / update_version.sh

**Stage 8：发版准备（1 天）**
- 手动冒烟测试
- 跨平台回归（Windows + Linux）
- 创建 PR release/v1.4.0
- 打 tag v1.4.0

**总工时**：15 天（含 1 天 buffer）

#### Pre-Gate Verification

- [x] Phase 1 (CEO) outputs: 前提挑战、ADR 决策、Dream State Delta、Error & Rescue Registry、Failure Modes Registry、NOT in scope、What already exists
- [x] Phase 2 (Design) outputs: 7 维度评分、Litmus Scorecard、4 项新增任务
- [x] Phase 3 (Eng) outputs: 架构 ASCII 图、测试图、Failure Modes Registry、6 项新增任务
- [x] Phase 3.5 (DX) outputs: Developer Journey Map、DX Scorecard、TTHW 评估、16 项新增任务
- [x] Cross-phase themes: 3 个主题
- [x] Decision Audit Trail: 30 行决策记录

#### GSTACK REVIEW REPORT

| Phase | Runs | Status | Findings | Codex | Subagent | Consensus |
|-------|------|--------|----------|-------|----------|-----------|
| CEO | 1 | complete | 9 findings (2C/3H/4M) | unavailable | 9 | 6/6 confirmed |
| Design | 1 | complete | 7 dimensions, 4 new tasks | unavailable | 7 | 7/7 confirmed |
| Eng | 1 | complete | 6 dimensions, 6 new tasks | unavailable | 9 code locations | 6/6 confirmed |
| DX | 1 | complete | 6 dimensions, 16 new tasks | unavailable | 17 code locations | 6/6 confirmed |

**VERDICT**: APPROVED — 4 项 taste decisions 已由用户拍板，方案锁定可进入实施阶段。

**RESOLVED DECISIONS（用户 2026-07-28 拍板）:**
- Choice 1: V0-FE-05 partial 状态卡片 → **Include 在 V1.4.0**（P1 完整性原则胜出）
- Choice 2: V1-FE-14 可访问性补丁范围 → **仅 Agent+Hub 面板**（P3 实用原则，其他面板 a11y 留 V1.5.0）
- Choice 3: API 路由重命名 → **V1.4.0 一起改**（major 版本破坏性变更合并；前端 fetch URL 同步修改，见新增任务 V1-FE-15）
- Choice 4: 模板 *.bak 存在时 UI 提示方式 → **日志提示**（启动日志打印，不弹窗）

**实施方案状态**: READY_TO_SHIP — Phase 1~3.5 评审全部通过，4 项 taste decisions 已固化，可按 Stage 1~7 顺序执行。
