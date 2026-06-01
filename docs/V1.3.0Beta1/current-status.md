# PromptCraft v1.3.0_Beta1 当前状态快照

**日期**: 2026-05-31
**分支**: feature/new-frontend
**最新提交**: chore: bump version to v1.3.0_Beta1

---

## 一、已完成工作

### 1.1 阶段 1：项目骨架 + 3 个组件迁移 ✅

**提交记录**:
- `feat: initialize Vue 3 + Vite frontend scaffold`
- `feat: migrate ServiceConfig to Vue 3`
- `feat: migrate NegativePromptEditor and RuleManager to Vue 3`

**完成内容**:
1. 创建 Vue 3 + Vite 项目结构
2. 配置 Vite library mode
3. 创建 vue_bridge.js 桥接模块
4. 迁移 ServiceConfig.vue
5. 迁移 NegativePromptEditor.vue
6. 迁移 RuleManager.vue
7. 创建基础 UI 组件 (BaseDialog, BaseToggle, BaseDropdown)
8. 创建 composables (useApi, useI18n, useToast)

### 1.2 阶段 2：基础设施 ✅

**提交记录**:
- `feat: 添加基础设施 - StackAPI 发布-订阅、拖拽 composable、CSS 变量`
- `fix(qa): ISSUE-001 — missing reactive import in NegativePromptEditor.vue`
- `fix(qa): ISSUE-002 — category mismatch in set_current_service`
- `fix(qa): ISSUE-003 — batch notifications in expandGroupIntoStack`

**完成内容**:
1. StackAPI 发布-订阅机制
   - 添加 `_listeners` Set
   - 添加 `onChange(callback)` 导出函数
   - 添加 `_notify(nodeId)` 内部函数
   - 在所有 9 个写操作中调用 `_notify()`

2. Vue Composables
   - `useStackApi.js` — 栈数据响应式
   - `useDraggable.js` — 拖拽逻辑

3. CSS 设计系统
   - `variables.css` — 设计 Token
   - 两层变量系统 (`--pc-*` 映射到 ComfyUI 主题)

4. QA 修复
   - 修复 NegativePromptEditor.vue 的 reactive 导入
   - 修复 ServiceConfig.vue 的 category 不匹配
   - 修复 expandGroupIntoStack 的重复通知

---

## 二、文件清单

### 2.1 核心配置文件

| 文件 | 作用 | 状态 |
|------|------|------|
| `package.json` | 项目配置 | ✅ |
| `vite.config.js` | Vite 构建配置 | ✅ |
| `.gitignore` | Git 忽略规则 | ✅ |

### 2.2 原生 JS 文件

| 文件 | 行数 | 状态 |
|------|------|------|
| `js/index.js` | 1190 | ✅ 已修改（导入 Vue 组件） |
| `js/vue_bridge.js` | 75 | ✅ 新建 |
| `js/control_panel.js` | 250 | ✅ 版本号已更新 |
| `js/i18n.js` | 100 | ✅ |
| `js/chat_panel.js` | 100 | ✅ |
| `js/lora_group/index.js` | 100 | ✅ |
| `js/lora_group/stack_api.js` | 200 | ✅ 已添加发布-订阅 |
| `js/lora_group/canvas_widget.js` | 800 | ✅ |
| `js/lora_group/hub_panel.js` | 1258 | ✅ |
| `js/lora_group/agent_panel.js` | 320 | ✅ |
| `js/lora_group/api.js` | 100 | ✅ |
| `js/lora_group/service_config.js` | 50 | ✅ 已修改（调用 Vue） |
| `js/lora_group/service_config_native.js` | 500 | ✅ |
| `js/lora_group/styles.css` | 1000 | ✅ |
| `js/lora_prompt_loader/index.js` | 80 | ✅ |

### 2.3 Vue 源码文件

| 文件 | 行数 | 状态 |
|------|------|------|
| `src/main.js` | 100 | ✅ 入口文件 |
| `src/vue_app.js` | 50 | ✅ Vue app 创建 |
| `src/components/ServiceConfig.vue` | 126 | ✅ 已迁移 |
| `src/components/dialogs/NegativePromptEditor.vue` | 178 | ✅ 已迁移 |
| `src/components/dialogs/RuleManager.vue` | 249 | ✅ 已迁移 |
| `src/components/common/BaseDialog.vue` | 80 | ✅ |
| `src/components/common/BaseToggle.vue` | 60 | ✅ |
| `src/components/common/BaseDropdown.vue` | 100 | ✅ |
| `src/composables/useApi.js` | 50 | ✅ |
| `src/composables/useI18n.js` | 30 | ✅ |
| `src/composables/useToast.js` | 40 | ✅ |
| `src/composables/useStackApi.js` | 120 | ✅ 新建 |
| `src/composables/useDraggable.js` | 150 | ✅ 新建 |
| `src/styles/variables.css` | 200 | ✅ 新建 |

### 2.4 Python 文件

| 文件 | 状态 |
|------|------|
| `__init__.py` | ✅ 版本号已更新 |
| `thinking_control.py` | ✅ 版本号已更新 |
| `llm_client.py` | ✅ 版本号已更新 |

### 2.5 文档文件

| 文件 | 状态 |
|------|------|
| `README_zh.md` | ✅ 版本号和版本历史已更新 |
| `README_en.md` | ✅ 版本号已更新 |
| `CHANGELOG.md` | ✅ v1.3.0_Beta1 更新日志已添加 |

---

## 三、构建产物

### 3.1 Vue 构建产物

```
js/promptcraft-vue.js   180.65 kB (gzip: 52.55 kB)
js/promptcraft-vue.css   11.70 kB (gzip: 2.66 kB)
```

**注意**: 这两个文件被 .gitignore 忽略，需要手动运行 `npm run build` 生成。

### 3.2 构建命令

```bash
# 安装依赖
npm install

# 构建
npm run build

# 开发模式（热重载）
npm run dev
```

---

## 四、Git 状态

### 4.1 当前分支

```
feature/new-frontend
```

### 4.2 最近提交

```
2c1b391 chore: bump version to v1.3.0_Beta1
316e1e9 fix(qa): ISSUE-003 — batch notifications in expandGroupIntoStack
575a617 fix(qa): ISSUE-002 — category mismatch in set_current_service
7a7df9b fix(qa): ISSUE-001 — missing reactive import in NegativePromptEditor.vue
57f6ce0 chore: add gstack skill routing rules to CLAUDE.md
8f767fe feat: 添加基础设施 - StackAPI 发布-订阅、拖拽 composable、CSS 变量
```

### 4.3 工作区状态

```
On branch feature/new-frontend
nothing to commit, working tree clean
```

---

## 五、待办事项

### 5.1 阶段 3：批量迁移剩余组件

- [ ] LibraryEditor.vue (~240 行)
- [ ] PromptHistory.vue (~180 行)
- [ ] HubPanel.vue (1258 行) — 最复杂
- [ ] AgentPanel.vue (320 行)
- [ ] FloatingPanel.vue (~110 行)
- [ ] Toast.vue (~30 行)
- [ ] SettingsPanel.vue (349 行)

### 5.2 阶段 4：集成测试

- [ ] ComfyUI 环境测试
- [ ] 浏览器兼容性测试
- [ ] 性能测试

### 5.3 阶段 5：优化和清理

- [ ] 删除原生 JS 代码
- [ ] 优化构建产物
- [ ] 完善文档

---

## 六、关键决策记录

### 6.1 架构决策

1. **桥接模式**: vue_bridge.js 作为原生 JS 与 Vue 的桥梁
2. **Vite Library Mode**: 输出单个 ES module 文件
3. **渐进式迁移**: 先迁移简单组件，保留复杂组件
4. **发布-订阅**: 最小侵入性地添加响应式
5. **CSS 变量**: 统一设计系统

### 6.2 技术选型

1. **Vue 3**: Composition API + `<script setup>`
2. **Vite**: 快速构建 + 热重载
3. **CSS 变量**: 两层系统 (`.pc-*` 映射到 ComfyUI 主题)
4. **ES Modules**: 原生模块系统

### 6.3 放弃的方案

1. **❌ Teleport**: 与 LiteGraph canvas 冲突
2. **❌ Scoped CSS**: 与原生 JS 组件冲突
3. **❌ 完全重写**: 风险太高

---

## 七、经验教训

### 7.1 成功因素

1. 渐进式迁移降低风险
2. 桥接模式保持向后兼容
3. 发布-订阅最小侵入性
4. CSS 变量统一设计系统
5. Composables 逻辑复用

### 7.2 失败教训

1. .gitignore 导致构建产物缺失
2. ComfyUI 变量名没有官方文档
3. Teleport 与 LiteGraph 冲突
4. StackAPI 调用链重复通知
5. CSS 作用域冲突

---

## 八、下一步行动

### 8.1 立即行动

1. 继续迁移 `LibraryEditor.vue`
2. 然后迁移 `PromptHistory.vue`
3. 最后迁移复杂的 `HubPanel.vue`（1258 行）

### 8.2 注意事项

- 每个组件完成后运行 `npm run build` 验证
- 不要使用 Teleport
- CSS 使用 `.pc-` 前缀
- 构建产物不提交（.gitignore 已忽略）

---

**文档版本**: v1.0
**最后更新**: 2026-05-31
**状态**: 阶段 2 完成，阶段 3 待开始
