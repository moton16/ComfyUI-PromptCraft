/**
 * PromptCraft — AI Agent 浮动面板入口
 *
 * 功能:
 *   - AIChat 节点上的按钮打开 Agent 浮动对话框
 *   - 使用自然语言控制 LoRA 栈、底模等节点参数
 *   - 替代旧版纯聊天面板
 */

import { app } from '../../../scripts/app.js';
import { openAgentFloating } from './lora_group/agent_panel.js';

const PREFIX = '[PromptCraft Agent]';

// ==================== 扩展注册 ====================

app.registerExtension({
    name: 'Moton.PromptCraft.Chat',

    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== 'AIChat') return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const result = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

            // 添加打开 Agent 面板的按钮
            this.addWidget('button', ' AI Agent', null, () => {
                // 需要找到 ModelLoraGroupLoader 节点来获取 node 引用
                // 如果当前没有找到，传 null（Agent 仍可聊天但无法操作节点）
                const targetNode = findLoraGroupNode();
                openAgentFloating(targetNode);
            });

            // 移除 size 覆盖逻辑（V1-FE-21）：onNodeCreated 强制设置 [210, 60] 会覆盖用户手动调整的尺寸，
            // 且从工作流恢复时 configure 会还原已保存尺寸，此覆盖无意义；尺寸交给 LiteGraph 自动计算

            return result;
        };

        console.log(`${PREFIX} AIChat 节点钩子已注册`);
    },
});

/**
 * 查找工作流中的 ModelLoraGroupLoader 节点
 */
function findLoraGroupNode() {
    if (!app.graph || !app.graph._nodes) return null;
    return app.graph._nodes.find(n => n.comfyClass === 'ModelLoraGroupLoader') || null;
}

console.log(`${PREFIX} 前端模块加载完成`);
