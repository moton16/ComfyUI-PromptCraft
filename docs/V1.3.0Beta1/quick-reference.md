# PromptCraft v1.3.0_Beta1 快速参考

**分支**: feature/new-frontend
**状态**: 阶段 2 完成，阶段 3 待开始

---

## 当前进度

```
阶段 1 ✅ 项目骨架 + 3 个组件迁移
阶段 2 ✅ 基础设施（StackAPI pub-sub, composables, CSS tokens）
阶段 3 🔲 批量迁移剩余组件
阶段 4 🔲 集成测试
阶段 5 🔲 优化和清理
```

---

## 关键文件

### 入口文件
- `js/index.js` — 主入口，1190 行
- `js/vue_bridge.js` — Vue 桥接模块
- `src/main.js` — Vue 入口

### 已迁移组件
- `src/components/ServiceConfig.vue` ✅
- `src/components/dialogs/NegativePromptEditor.vue` ✅
- `src/components/dialogs/RuleManager.vue` ✅

### 基础设施
- `js/lora_group/stack_api.js` — 添加了 `onChange()` 发布-订阅
- `src/composables/useStackApi.js` — 栈数据响应式
- `src/composables/useDraggable.js` — 拖拽逻辑
- `src/styles/variables.css` — CSS 设计系统

### 构建配置
- `vite.config.js` — Vite 构建配置
- `package.json` — 项目配置

---

## 待迁移组件（阶段 3）

| 组件 | 原始文件 | 行数 | 难度 |
|------|----------|------|------|
| LibraryEditor | `js/index.js:88-330` | ~240 | 中 |
| PromptHistory | `js/index.js:334-511` | ~180 | 中 |
| HubPanel | `js/lora_group/hub_panel.js` | 1258 | 高 |
| AgentPanel | `js/lora_group/agent_panel.js` | 320 | 中 |
| FloatingPanel | `js/index.js:621-741` | ~110 | 中 |
| Toast | 待创建 | ~30 | 低 |
| SettingsPanel | `js/control_panel.js` | 349 | 中 |

---

## 常用命令

```bash
# 构建 Vue 模块
npm run build

# 开发模式
npm run dev

# 语法检查
node --check js/index.js

# 查看构建产物
ls -la js/promptcraft-vue.*
```

---

## 架构图

```
┌─────────────────────────────────────────────────────────────┐
│  js/index.js (原生 JS)                                       │
│    ↓ import                                                  │
│  js/vue_bridge.js (懒加载 Vue 模块)                          │
│    ↓ 动态 import()                                           │
│  src/main.js → promptcraft-vue.js (构建产物)                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  StackAPI (原生 JS)                                          │
│    ↓ onChange() 发布-订阅                                     │
│  useStackApi.js (Vue Composable)                             │
│    ↓ ref() 响应式数据                                         │
│  Vue 组件                                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 经验教训

### ✅ 成功做法
1. 渐进式迁移，不破坏现有功能
2. 桥接模式保持向后兼容
3. 发布-订阅最小侵入性
4. CSS 变量统一设计系统
5. Composables 逻辑复用

### ❌ 踩过的坑
1. .gitignore 导致构建产物缺失
2. ComfyUI 变量名没有官方文档
3. Teleport 与 LiteGraph 冲突
4. StackAPI 调用链重复通知
5. CSS 作用域冲突

---

## 下一步行动

1. 继续迁移 `LibraryEditor.vue`
2. 然后迁移 `PromptHistory.vue`
3. 最后迁移复杂的 `HubPanel.vue`（1258 行）

每个组件完成后运行 `npm run build` 验证。

---

## 注意事项

- **不要使用 Teleport**: 与 LiteGraph canvas 冲突
- **CSS 使用 .pc- 前缀**: 避免冲突
- **构建产物不提交**: .gitignore 已忽略
- **Vue 由 ComfyUI 提供**: external 化处理

---

**最后更新**: 2026-05-31
**版本**: v1.3.0_Beta1
