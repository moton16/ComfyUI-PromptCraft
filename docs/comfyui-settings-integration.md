# ComfyUI 设置面板集成 — 技术备忘

> 日期：2026-05-22
> 背景：将 PromptCraft 的设置 UI 嵌入 ComfyUI 原生设置面板，避免自定义模态框。过程中踩了三层嵌套、i18n 回退、"其它"分组等多个坑，本文档记录核心机制与最佳实践。

---

## 1. ComfyUI `addSetting` API 机制

### 1.1 调用方式

```js
app.ui.settings.addSetting({
    id: 'PromptCraft.Settings',   // 必须，决定侧边栏分组
    name: ' ',                     // FormItem 标签文字
    type: () => createSettingsContent(),  // 自定义 DOM 元素
});
```

### 1.2 `type: () => element` 的包装机制

`addSetting` 收到 `type` 为函数的配置后，内部创建一个 **`CustomFormValue`** 组件，将返回的 DOM 元素包裹在一个 **FormItem** 容器内。FormItem 会：
- 使用 `name` 属性作为 **label**（标签文字）
- 用 PrimeVue 的 `FormItem` 组件渲染，带 label + content 的上下布局

**关键问题**：这个 FormItem label 是 **不可配置的**——没有 `hideLabel`、`showLabel` 等属性来控制。

### 1.3 `name` 属性的三种行为

| `name` 值 | 表现 |
|-----------|------|
| `'PromptCraft'` | 正常显示 label "PromptCraft" |
| `''`（空字符串） | i18n 系统找不到翻译 key，回退显示 `settings.PromptCraft.name` |
| `' '`（空格） | i18n 翻译为空白，视觉上 label 几乎不可见 |

空字符串陷阱：ComfyUI 使用 `@formatjs/intl` 做 i18n。`name` 被用作翻译 lookup key，空字符串无法匹配任何 key，fallback 显示原始 key path。

---

## 2. `buildTree` — 侧边栏分组逻辑

### 2.1 核心代码（ComfyUI 内部）

```js
// 简化版，来自 ComfyUI 的 settings panel
function buildTree(settings) {
    for (const e of settings) {
        const path = e.category || e.id.split('.');
        //          ↑ category 不存在时，用 id 的点号分段
        // ...
    }
    // 单段 id = 叶子节点 → 移入 "Other" 分组
    let leaves = (e.children ?? []).filter(e => e.leaf);
    if (leaves.length) {
        e.children.push({
            key: 'Other', label: 'Other',
            leaf: false, children: leaves
        });
    }
}
```

### 2.2 id 分段与侧边栏行为

| id 格式 | 分段数 | 侧边栏表现 |
|---------|--------|-----------|
| `'PromptCraft'` | 1 段 | 叶子节点 → 被移入 **"Other"** 分组 |
| `'PromptCraft.Settings'` | 2 段 | **"PromptCraft"** 成为独立分组（非叶子），"Settings" 为其子项 |
| `'PromptCraft.Settings.Sub'` | 3 段 | 三层嵌套，一般不需要 |

### 2.3 预定义分组

ComfyUI 硬编码了以下分类：`Comfy`、`LiteGraph`、`Appearance`、`3D`、`Mask Editor`、`Other`。

**任何不在预定义列表中的 id 都会被归入 "Other"。** 除非 id 是两段式，此时第一段会自动创建一个新分组。

---

## 3. 踩坑记录

### 坑 1：三层嵌套 — "PromptCraft" → "设置" → "PromptCraft"

**原始代码**：
```js
id: 'PromptCraft.Settings',
name: 'PromptCraft',
```

**问题**：ComfyUI 侧边栏显示 "PromptCraft" 分组 → 点击后内容区显示 "PromptCraft > Settings" 面包屑 → FormItem label 又显示一个 "PromptCraft"。三层标题。

**根因**：两段式 id 第一段 = 侧边栏分组名，第二段 = 内容区子项名，`name` = FormItem label。三者叠加。

### 坑 2：单段 id 掉入 "Other"

**尝试**：
```js
id: 'PromptCraft',    // 单段，想消除面包屑
name: ' ',
```

**结果**：侧边栏出现 "Other" → "PromptCraft"。因为单段 id 是叶子节点，被 `buildTree` 的逻辑移入 "Other"。

### 坑 3：空字符串 name 显示 i18n key path

**尝试**：
```js
id: 'PromptCraft',
name: '',    // 空字符串想隐藏 label
```

**结果**：FormItem label 显示 `settings.PromptCraft.name`（i18n 回退）。

### 坑 4：MutationObserver CSS 选择器的不确定性

`hideLabel()` 使用 `[class*="form"]` 和 `[class*="label"]` 通配选择器，依赖 ComfyUI 的 minified class name 格式。如果 ComfyUI 更新了 PrimeVue 版本或打包方式，这些选择器可能失效。

---

## 4. 最终方案

### 4.1 代码

```js
settings.addSetting({
    id: 'PromptCraft.Settings',   // 两段式 → 独立分组，不落入 "Other"
    name: ' ',                    // 空格 → 避免 i18n key path 回退
    type: () => createSettingsContent(),
});

// MutationObserver 动态隐藏 FormItem label
const hideLabel = () => {
    document.querySelectorAll('.pc-settings').forEach(el => {
        const formItem = el.closest('[class*="form"]') || el.parentElement;
        if (!formItem || formItem === document.body) return;
        const label = formItem.querySelector('label, .label, [class*="label"]');
        if (label && label.parentElement === formItem) {
            label.style.display = 'none';
        }
    });
};

new MutationObserver(() => {
    if (document.querySelector('.comfyui-settings-dialog, [class*="settings-dialog"], .settings_dialog')) {
        requestAnimationFrame(hideLabel);
    }
}).observe(document.body, { childList: true, subtree: true });
```

### 4.2 效果

- 侧边栏：独立的 **"PromptCraft"** 分组，不在 "Other" 下
- 内容区：面包屑 "PromptCraft > Settings"（ComfyUI 自动）→ 品牌头（`createSettingsContent()` 自带）→ 各功能区块
- FormItem label：被 MutationObserver 隐藏，不出现冗余标题

### 4.3 各字段的作用

| 字段 | 值 | 作用 |
|------|-----|------|
| `id` | `'PromptCraft.Settings'` | 决定侧边栏分组为 "PromptCraft"，子项为 "Settings" |
| `name` | `' '` | 单空格，避免 i18n 空 key 回退，同时视觉上 label 为空 |
| `type` | `() => createSettingsContent()` | 返回自定义 DOM，被 CustomFormValue 包裹 |
| MutationObserver | — | 兜底隐藏 FormItem label |

---

## 5. 设计约束与注意事项

1. **`name` 不能为空字符串**：i18n 会回退显示 key path
2. **`name` 不能为空格以外的占位符**（如 `'-'`、`'.'`）：PrimeVue FormItem 的 label 会显示它
3. **MutationObserver 通配选择器脆弱**：ComfyUI 版本更新可能导致 class name 变化，需要定期验证
4. **无法完全消除面包屑**：两段式 id 的面包屑是 ComfyUI SettingsPanel 组件的内置行为，无法通过 `addSetting` API 控制
5. **`category` 属性未被广泛使用**：如果 ComfyUI 未来支持 `category` 属性直接指定分组，就不需要依赖 id 分段

---

## 6. 模态弹窗（子面板）注意事项

PromptCraft 的子面板（负面提示词编辑器、规则管理器、库编辑器、服务配置）通过 `window.dispatchEvent(new CustomEvent('promptcraft:open-*'))` 触发，在 `index.js` 中监听并创建 `position: fixed` 的全屏弹窗。

这些弹窗的样式与 ComfyUI 设置面板无关，但需要注意：
- 遮罩 z-index 不能低于 ComfyUI 的 settings dialog
- 浅色设计（白底 + `#c8842a` 琥珀色强调）与 ComfyUI 暗色主题形成对比
- 关闭时需要 `document.body.removeChild(backdrop)` 清理 DOM
