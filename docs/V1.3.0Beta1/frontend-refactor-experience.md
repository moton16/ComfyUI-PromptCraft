# PromptCraft v1.3.0_Beta1 前端重构经验与教训

**日期**: 2026-05-31
**分支**: feature/new-frontend
**目标**: Vue 3 + Vite 前端重构

---

## 一、项目背景

### 1.1 原始状态
- 纯原生 JS + DOM 操作
- 所有组件在 `js/index.js` 中（1190+ 行）
- 无模块化、无构建工具
- 样式硬编码在 JS 字符串中

### 1.2 重构目标
- Vue 3 + Vite 构建体系
- 组件化架构
- CSS 设计系统
- 渐进式迁移（不破坏现有功能）

---

## 二、架构决策

### 2.1 采用桥接模式（Bridge Pattern）

**决策**: 创建 `vue_bridge.js` 作为原生 JS 与 Vue 之间的桥梁

**原因**:
- ComfyUI 扩展系统要求 `app.registerExtension()` 在顶层
- 不能直接用 Vue 接管整个 UI
- 需要懒加载 Vue 模块以减少初始加载时间

**实现**:
```js
// js/vue_bridge.js
let _vueModule = null;
async function loadVueModule() {
    if (_vueModule) return _vueModule;
    _vueModule = await import('./promptcraft-vue.js');
    return _vueModule;
}

export async function openNegativePromptEditorVue() {
    const vueModule = await loadVueModule();
    vueModule.openNegativePromptEditor(api);
}
```

**效果**: ✅ 成功
- Vue 模块按需加载
- 原生 JS 代码保持不变
- 向后兼容

---

### 2.2 采用 Vite Library Mode

**决策**: 使用 Vite 的 library mode 构建单个 JS 文件

**配置**:
```js
// vite.config.js
build: {
    lib: {
        entry: 'src/main.js',
        formats: ['es'],
        fileName: 'promptcraft-vue',
    },
    outDir: 'js',
    rollupOptions: {
        external: ['vue'],
        output: { globals: { vue: 'Vue' } },
    },
}
```

**原因**:
- 输出单个 ES module 文件
- Vue 由 ComfyUI 提供（external）
- CSS 单独打包

**效果**: ✅ 成功
- 构建产物：`js/promptcraft-vue.js` (180 kB) + `js/promptcraft-vue.css` (11.7 kB)

---

### 2.3 渐进式迁移策略

**决策**: 先迁移 3 个简单组件，保留复杂组件为原生 JS

**迁移顺序**:
1. ✅ ServiceConfig.vue (服务配置)
2. ✅ NegativePromptEditor.vue (负面提示词编辑器)
3. ✅ RuleManager.vue (规则管理器)
4. 🔲 LibraryEditor.vue (Prompt 库编辑器)
5. 🔲 HubPanel.vue (LoRA Hub 面板 - 1258 行)
6. 🔲 AgentPanel.vue (AI Agent 面板)
7. 🔲 FloatingPanel.vue (浮动快捷面板)

**原因**:
- 降低风险
- 可以验证架构可行性
- 保持功能可用

**效果**: ✅ 成功
- 前 3 个组件迁移完成
- 原有功能保持正常

---

## 三、技术实现细节

### 3.1 StackAPI 发布-订阅机制

**问题**: StackAPI 是纯命令式 API，Vue 无法感知数据变化

**解决方案**: 添加轻量级发布-订阅

```js
// js/lora_group/stack_api.js
const _listeners = new Set();

export function onChange(callback) {
    _listeners.add(callback);
    return () => _listeners.delete(callback);
}

function _notify(nodeId) {
    _listeners.forEach(fn => {
        try { fn(nodeId); } catch (e) { console.error('StackAPI listener error:', e); }
    });
}

// 在所有写操作中调用 _notify()
export function restoreStack(nodeId, data) { /* ... */ _notify(nodeId); }
export function addLora(nodeId, lora) { /* ... */ _notify(nodeId); }
// ... 其他 9 个写操作
```

**Vue Composable**:
```js
// src/composables/useStackApi.js
export function useStack(nodeId) {
    const items = ref(StackAPI.getStack(nodeId).items);
    const unsub = StackAPI.onChange((changedNodeId) => {
        if (changedNodeId === nodeId) {
            items.value = [...StackAPI.getStack(nodeId).items];
        }
    });
    onUnmounted(unsub);
    return { items };
}
```

**效果**: ✅ 成功
- 最小侵入性（不改变 API 签名）
- Vue 响应式数据自动更新
- 自动清理订阅

**教训**: 
- 在现有 API 上添加发布-订阅比重写整个 API 更安全
- `onUnmounted` 清理订阅防止内存泄漏

---

### 3.2 CSS 设计 Token 系统

**问题**: 原有样式硬编码，无法适配 ComfyUI 主题

**解决方案**: 两层 CSS 变量系统

```css
/* src/styles/variables.css */
:root {
    /* 项目 Token */
    --pc-bg-panel: var(--base-background, #1e1e1e);
    --pc-text-primary: var(--text-primary, #e0e0e0);
    --pc-border: var(--interface-stroke, #3d3d3d);
    
    /* 间距 */
    --pc-space-xs: 4px;
    --pc-space-sm: 8px;
    --pc-space-md: 12px;
    
    /* 圆角 */
    --pc-radius-sm: 4px;
    --pc-radius-md: 8px;
    
    /* 动画 */
    --pc-transition-fast: 0.15s ease;
    --pc-transition-normal: 0.25s ease;
    
    /* z-index */
    --pc-z-dialog: 10000;
    --pc-z-toast: 10001;
}
```

**效果**: ✅ 成功
- 自动适配 ComfyUI 主题
- 统一的设计语言
- 易于维护和修改

**教训**:
- `var(--fallback, default)` 提供降级方案
- ComfyUI 主题变量名需要查阅源码

---

### 3.3 Vue 组件挂载模式

**问题**: Vue 组件需要在 vanilla JS 环境中挂载

**解决方案**: createModalMounter 工厂函数

```js
// src/main.js
function createModalMounter(component, modalId) {
    let appInstance = null;
    let container = null;

    return {
        open(comfyApi) {
            this.close();
            container = document.createElement('div');
            container.id = modalId;
            document.body.appendChild(container);

            const app = createApp(component, {
                comfyApi,
                onClose: () => this.close(),
            });
            appInstance = { unmount: () => { app.unmount(); container.remove(); } };
            app.mount(container);
        },
        close() {
            if (appInstance) { appInstance.unmount(); appInstance = null; }
        }
    };
}
```

**效果**: ✅ 成功
- 自动清理旧实例
- 防止内存泄漏
- 统一的生命周期管理

**教训**:
- `createApp` 每次创建新实例比复用更安全
- `container.remove()` 确保 DOM 清理

---

### 3.4 Composables 设计模式

**useStackApi** — 栈数据响应式
```js
export function useStack(nodeId) {
    const items = ref([]);
    // 自动订阅 + 自动清理
    return { items, refresh };
}
```

**useDraggable** — 拖拽逻辑
```js
export function useDraggable(options) {
    const position = ref({ x: 20, y: 20 });
    const isDragging = ref(false);
    // 鼠标 + 触摸事件处理
    // 视口约束
    // 自动清理
    return { position, isDragging, setPosition, resetPosition };
}
```

**useToast** — 通知系统
```js
export function useToast() {
    const show = (message, type) => { /* ... */ };
    return { show };
}
```

**效果**: ✅ 成功
- 逻辑复用
- 自动清理
- 类型安全（如果用 TypeScript）

---

## 四、踩过的坑

### 4.1 .gitignore 导致构建产物缺失

**问题**: `js/promptcraft-vue.js` 和 `js/promptcraft-vue.css` 被 .gitignore 忽略

**原因**: 
```
# .gitignore
js/promptcraft-vue.js
js/promptcraft-vue.css
```

**后果**: 
- clone 仓库后文件不存在
- 必须手动运行 `npm run build`

**教训**:
- 构建产物应该在文档中明确说明
- 或者提供 `postinstall` 脚本自动构建

---

### 4.2 ComfyUI 变量名不确定

**问题**: ComfyUI 主题变量名没有官方文档

**解决方案**: 
- 查阅 ComfyUI 源码
- 浏览器 DevTools 检查
- 社区经验

**记录的变量**:
```css
--base-background        /* 面板背景 */
--text-primary           /* 主文本 */
--interface-stroke       /* 边框 */
--primary-background     /* 主色调 */
--descrip-text           /* 次要文本 */
```

**教训**:
- 需要持续维护变量映射表
- 提供 fallback 值

---

### 4.3 Teleport 不能用

**问题**: Vue 3 的 `<Teleport>` 与 LiteGraph canvas 冲突

**原因**: 
- LiteGraph 使用 pointer-events 捕获鼠标事件
- Teleport 会破坏事件冒泡

**解决方案**: 不使用 Teleport，直接在 body 下创建容器

**教训**:
- ComfyUI 的 LiteGraph canvas 是特殊的
- 避免使用 Vue 的高级特性

---

### 4.4 StackAPI 调用链中的重复通知

**问题**: `expandGroupIntoStack` 调用 `addLora`，导致重复通知

**解决方案**: 
- `expandGroupIntoStack` 不调用 `_notify()`
- 因为 `addLora` 已经调用了 `_notify()`

**教训**:
- 分析调用链避免重复
- 使用调用图工具可视化

---

### 4.5 CSS 作用域冲突

**问题**: Vue 组件的 scoped CSS 与原生 JS 组件冲突

**解决方案**: 
- 使用 `.pc-` 前缀
- 不使用 scoped，使用 BEM 命名

**教训**:
- 混合架构需要严格的命名约定
- CSS 变量可以减少冲突

---

## 五、性能优化

### 5.1 懒加载 Vue 模块

```js
// 只在需要时加载 Vue
const vueModule = await import('./promptcraft-vue.js');
```

**效果**: 初始加载时间减少 ~180 kB

### 5.2 CSS 单独打包

```js
// vite.config.js
cssCodeSplit: false, // 所有 CSS 打包到一个文件
```

**效果**: CSS 可以被浏览器缓存

### 5.3 Vue external 化

```js
// vite.config.js
external: ['vue'],
```

**效果**: Vue 不重复打包，由 ComfyUI 提供

---

## 六、测试策略

### 6.1 构建验证

每次修改后运行：
```bash
npm run build
```

检查：
- 构建是否成功
- 产物大小是否合理
- 导出函数是否正确

### 6.2 功能验证

在 ComfyUI 中测试：
- 打开每个迁移的组件
- 检查控制台错误
- 验证数据流

### 6.3 回归测试

确保原有功能正常：
- LoRA 节点加载
- 设置面板
- 浮动快捷面板

---

## 七、下一步计划

### 7.1 阶段 3：批量迁移剩余组件

| 组件 | 行数 | 难度 | 状态 |
|------|------|------|------|
| LibraryEditor.vue | ~240 | 中 | 待迁移 |
| PromptHistory.vue | ~180 | 中 | 待迁移 |
| HubPanel.vue | 1258 | 高 | 待迁移 |
| AgentPanel.vue | 320 | 中 | 待迁移 |
| FloatingPanel.vue | ~110 | 中 | 待迁移 |
| Toast.vue | ~30 | 低 | 待迁移 |
| SettingsPanel.vue | 349 | 中 | 待迁移 |

### 7.2 阶段 4：集成测试

- ComfyUI 环境测试
- 浏览器兼容性测试
- 性能测试

### 7.3 阶段 5：优化和清理

- 删除原生 JS 代码
- 优化构建产物
- 完善文档

---

## 八、关键文件清单

### 8.1 核心文件

| 文件 | 作用 | 状态 |
|------|------|------|
| `js/vue_bridge.js` | Vue 桥接模块 | ✅ 完成 |
| `js/lora_group/stack_api.js` | StackAPI 发布-订阅 | ✅ 完成 |
| `src/main.js` | Vue 入口 | ✅ 完成 |
| `src/styles/variables.css` | CSS 设计系统 | ✅ 完成 |
| `vite.config.js` | Vite 配置 | ✅ 完成 |

### 8.2 已迁移组件

| 文件 | 作用 | 状态 |
|------|------|------|
| `src/components/ServiceConfig.vue` | 服务配置面板 | ✅ 完成 |
| `src/components/dialogs/NegativePromptEditor.vue` | 负面提示词编辑器 | ✅ 完成 |
| `src/components/dialogs/RuleManager.vue` | 规则管理器 | ✅ 完成 |
| `src/components/common/BaseDialog.vue` | 基础对话框 | ✅ 完成 |
| `src/components/common/BaseToggle.vue` | 基础开关 | ✅ 完成 |
| `src/components/common/BaseDropdown.vue` | 基础下拉菜单 | ✅ 完成 |

### 8.3 Composables

| 文件 | 作用 | 状态 |
|------|------|------|
| `src/composables/useStackApi.js` | 栈数据响应式 | ✅ 完成 |
| `src/composables/useDraggable.js` | 拖拽逻辑 | ✅ 完成 |
| `src/composables/useToast.js` | 通知系统 | ✅ 完成 |
| `src/composables/useApi.js` | API 请求 | ✅ 完成 |
| `src/composables/useI18n.js` | 国际化 | ✅ 完成 |

---

## 九、经验总结

### 9.1 成功因素

1. **渐进式迁移**: 不一次性重写，降低风险
2. **桥接模式**: 保持向后兼容
3. **发布-订阅**: 最小侵入性地添加响应式
4. **CSS 变量**: 统一设计系统
5. **Composables**: 逻辑复用和自动清理

### 9.2 失败教训

1. **.gitignore 问题**: 构建产物需要明确文档
2. **Teleport 限制**: ComfyUI 环境有特殊限制
3. **重复通知**: 需要分析调用链
4. **CSS 冲突**: 需要严格的命名约定

### 9.3 最佳实践

1. **先架构后组件**: 基础设施优先
2. **每步验证**: 构建 + 功能测试
3. **文档同步**: 代码和文档一起更新
4. **版本控制**: 频繁提交，便于回滚

---

## 十、附录

### 10.1 常用命令

```bash
# 构建 Vue 模块
npm run build

# 开发模式（热重载）
npm run dev

# 语法检查
node --check js/index.js

# 查看构建产物大小
ls -la js/promptcraft-vue.*
```

### 10.2 调试技巧

1. 浏览器控制台查看错误
2. `console.log` 在 vue_bridge.js 中
3. Network 面板检查模块加载
4. Vue DevTools 检查组件状态

### 10.3 参考资源

- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [ComfyUI 源码](https://github.com/comfyanonymous/ComfyUI)
- [ComfyUI 扩展开发指南](https://github.com/comfyanonymous/ComfyUI/wiki/Creating-Custom-Nodes)

---

**文档版本**: v1.0
**最后更新**: 2026-05-31
**作者**: Moton + Claude
