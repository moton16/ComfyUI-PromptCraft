/**
 * LoRA Prompt Loader — 前端扩展
 * 复用 lora_group 的 canvas_widget 为新节点提供 LoRA 栈 UI
 */

import { app } from '../../../../scripts/app.js';
import { initCanvasWidget, refreshGroupStatus } from '../lora_group/canvas_widget.js';
import { openHubPanel } from '../lora_group/hub_panel.js';
import * as StackAPI from '../lora_group/stack_api.js';
import { t } from '../i18n.js';

app.registerExtension({
    name: 'Comfy.MotonPromptCraft.LoraPromptLoader',

    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== 'LoraPromptLoader') return;

        const origCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            origCreated?.apply(this, arguments);
            initCanvasWidget(this);
        };

        const origConfigure = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function () {
            origConfigure?.apply(this, arguments);
            const widget = this.widgets?.find(w => w.name === 'lora_stack_data');
            if (widget && widget.value) {
                try {
                    const parsed = typeof widget.value === 'string' ? JSON.parse(widget.value) : widget.value;
                    if (parsed && parsed.items && parsed.items.length > 0) {
                        StackAPI.restoreStack(this.id, widget.value);
                    }
                } catch {}
            }
            this._loraConfigured = true;
            refreshGroupStatus(this);
        };

        const origExecuted = nodeType.prototype.onExecuted;
        nodeType.prototype.onExecuted = function (message) {
            origExecuted?.apply(this, arguments);
            refreshGroupStatus(this);
        };

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
});
