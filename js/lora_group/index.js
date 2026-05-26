/**
 * LoRA Stack Manager — 前端入口
 * 注册 ComfyUI 扩展，绑定节点生命周期钩子
 */

import { app } from '../../../../scripts/app.js';
import { initCanvasWidget, refreshGroupStatus } from './canvas_widget.js';
import { openHubPanel } from './hub_panel.js';
import * as StackAPI from './stack_api.js';
import { t } from '../i18n.js';

const EXTENSION_ID = 'Comfy.MotonPromptCraft.LoraGroupLoader';

// 加载样式
function loadStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('./styles.css', import.meta.url).pathname;
    document.head.appendChild(link);
}

loadStyles();

app.registerExtension({
    name: EXTENSION_ID,

    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== 'ModelLoraGroupLoader') return;

        // 节点创建时初始化自定义 widget
        const origCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            origCreated?.apply(this, arguments);
            initCanvasWidget(this);
        };

        // 加载工作流时恢复栈状态
        const origConfigure = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function () {
            origConfigure?.apply(this, arguments);
            // LiteGraph configure() 已恢复 widget 值，现在同步到 StackAPI 内存状态
            const widget = this.widgets?.find(w => w.name === 'lora_stack_data');
            if (widget && widget.value) {
                try {
                    const parsed = typeof widget.value === 'string' ? JSON.parse(widget.value) : widget.value;
                    if (parsed && parsed.items && parsed.items.length > 0) {
                        StackAPI.restoreStack(this.id, widget.value);
                    }
                } catch {}
            }
            // 标记 configure 已完成，允许 syncToWidget 写入
            this._loraConfigured = true;
            refreshGroupStatus(this);
        };

        // 节点执行完成后刷新
        const origExecuted = nodeType.prototype.onExecuted;
        nodeType.prototype.onExecuted = function (message) {
            origExecuted?.apply(this, arguments);
            refreshGroupStatus(this);
        };

        // 右键菜单
        const origMenu = nodeType.prototype.getExtraMenuOptions;
        nodeType.prototype.getExtraMenuOptions = function (_, menuOptions) {
            origMenu?.apply(this, arguments);
            menuOptions.push(
                { content: null },
                {
                    content: '⚙ LoRA Hub',
                    callback: () => openHubPanel(this),
                },
                {
                    content: t('lora_group.refresh_stack'),
                    callback: () => refreshGroupStatus(this),
                },
                {
                    content: t('lora_group.clear_stack'),
                    callback: () => {
                        const stack = StackAPI.getStack(this.id);
                        stack.items = [];
                        refreshGroupStatus(this);
                    },
                }
            );
        };
    },

    async nodeCreated(node) {
        if (node.comfyClass !== 'ModelLoraGroupLoader') return;
    },
});
