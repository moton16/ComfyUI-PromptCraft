/**
 * Agent Panel — AI Agent 对话 UI 组件
 * 支持两种复用模式：
 *   - Hub Tab 模式: 渲染到 Hub 右侧面板容器
 *   - 浮动窗口模式: 创建全屏 overlay 面板
 */

import * as Executor from './agent_executor.js';
import { renderStack } from './canvas_widget.js';

// ==================== 对话状态 ====================

const agentMessages = []; // [{role, content, operations?}]

// ==================== 公共入口 ====================

/**
 * 在容器内创建 Agent 面板（Hub Tab 模式）
 */
export function createAgentPanel(container, node, options = {}) {
    container.innerHTML = '';
    const panel = new AgentPanelUI(container, node, options);
    return panel;
}

/**
 * 打开 Agent 浮动窗口
 */
export function openAgentFloating(node) {
    const existing = document.getElementById('pc-agent-floating');
    if (existing) existing.remove();

    const dialog = document.createElement('div');
    dialog.id = 'pc-agent-floating';
    dialog.className = 'pc-agent-backdrop';

    const panel = document.createElement('div');
    panel.className = 'pc-agent-modal';

    dialog.appendChild(panel);
    document.body.appendChild(dialog);

    // ESC 关闭
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            dialog.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    // 点击背景关闭
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            dialog.remove();
            document.removeEventListener('keydown', escHandler);
        }
    });

    createAgentPanel(panel, node, { mode: 'floating' });
}

// ==================== AgentPanelUI 类 ====================

class AgentPanelUI {
    constructor(container, node, options) {
        this.container = container;
        this.node = node;
        this.mode = options.mode || 'hub'; // 'hub' | 'floating'
        this._build();
    }

    _build() {
        // 对话区域
        this.messagesEl = document.createElement('div');
        this.messagesEl.className = 'pc-agent-messages';

        // 渲染历史消息或欢迎
        if (agentMessages.length === 0) {
            this._renderWelcome();
        } else {
            for (const msg of agentMessages) {
                this._appendBubble(msg.role, msg.content, msg.operations);
            }
        }

        // 快捷指令栏
        const quickBar = document.createElement('div');
        quickBar.className = 'pc-agent-quickbar';
        const shortcuts = [
            { label: '当前状态', cmd: '显示当前节点的状态' },
            { label: '清空栈', cmd: '清空所有 LoRA' },
            { label: '帮助', cmd: '你能做什么？' },
        ];
        for (const s of shortcuts) {
            const btn = document.createElement('button');
            btn.className = 'pc-agent-quick-btn';
            btn.textContent = s.label;
            btn.addEventListener('click', () => this._sendInstruction(s.cmd));
            quickBar.appendChild(btn);
        }

        // 输入区域
        const inputArea = document.createElement('div');
        inputArea.className = 'pc-agent-input-area';

        this.textarea = document.createElement('textarea');
        this.textarea.className = 'pc-agent-textarea';
        this.textarea.placeholder = '输入自然语言指令... (Enter 发送, Shift+Enter 换行)';
        this.textarea.rows = 1;

        const sendBtn = document.createElement('button');
        sendBtn.className = 'pc-agent-send-btn';
        sendBtn.textContent = '发送';

        inputArea.appendChild(this.textarea);
        inputArea.appendChild(sendBtn);

        // 状态栏
        this.statusBar = document.createElement('div');
        this.statusBar.className = 'pc-agent-status';
        this.statusBar.textContent = '就绪';

        // 组装
        this.container.appendChild(this.messagesEl);
        this.container.appendChild(quickBar);
        this.container.appendChild(inputArea);
        this.container.appendChild(this.statusBar);

        // 事件
        sendBtn.addEventListener('click', () => this._handleSend());

        this.textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this._handleSend();
            }
        });

        this.textarea.addEventListener('input', () => {
            this.textarea.style.height = 'auto';
            this.textarea.style.height = Math.min(this.textarea.scrollHeight, 100) + 'px';
        });

        this._scrollToBottom();
    }

    _handleSend() {
        const text = this.textarea.value.trim();
        if (!text) return;
        this.textarea.value = '';
        this.textarea.style.height = 'auto';
        this._sendInstruction(text);
    }

    async _sendInstruction(instruction) {
        // 移除欢迎
        const welcome = this.messagesEl.querySelector('.pc-agent-welcome');
        if (welcome) welcome.remove();

        // 添加用户消息
        agentMessages.push({ role: 'user', content: instruction });
        this._appendBubble('user', instruction);
        this._scrollToBottom();

        this.statusBar.textContent = 'Agent 正在思考...';
        this.statusBar.className = 'pc-agent-status pc-agent-thinking';

        try {
            // 构建当前状态
            const currentState = Executor.buildCurrentState(this.node);

            // 调用 Agent API
            const responseText = await Executor.callAgent(instruction, currentState);

            // 解析响应
            const parsed = Executor.parseAgentResponse(responseText);

            if (parsed.error) {
                agentMessages.push({ role: 'assistant', content: `错误: ${parsed.error}` });
                this._appendBubble('assistant', `错误: ${parsed.error}`);
            } else if (parsed.clarification) {
                agentMessages.push({ role: 'assistant', content: parsed.clarification });
                this._appendBubble('assistant', parsed.clarification);
            } else if (parsed.operations) {
                // 执行操作
                const results = Executor.executeOperations(parsed.operations, this.node);

                // 刷新画布
                renderStack(this.node);

                // 构建回复文本
                const successCount = results.filter(r => r.success).length;
                const failCount = results.filter(r => !r.success).length;
                let replyText = '';
                if (successCount > 0) {
                    replyText += `已执行 ${successCount} 个操作。`;
                }
                if (failCount > 0) {
                    replyText += ` ${failCount} 个操作失败。`;
                }

                agentMessages.push({ role: 'assistant', content: replyText, operations: results });
                this._appendBubble('assistant', replyText, results);
            }

            this.statusBar.textContent = '就绪';
            this.statusBar.className = 'pc-agent-status';

        } catch (e) {
            const errMsg = `请求失败: ${e.message}`;
            agentMessages.push({ role: 'assistant', content: errMsg });
            this._appendBubble('assistant', errMsg);
            this.statusBar.textContent = '错误';
            this.statusBar.className = 'pc-agent-status pc-agent-error';
        }

        this._scrollToBottom();
    }

    _renderWelcome() {
        const welcome = document.createElement('div');
        welcome.className = 'pc-agent-welcome';
        welcome.innerHTML = `
            <div class="pc-agent-welcome-icon">✦</div>
            <div class="pc-agent-welcome-title">PromptCraft Agent</div>
            <div class="pc-agent-welcome-desc">
                使用自然语言控制 LoRA 栈<br>
                试试："添加一个赛博朋克风格的 LoRA"<br>
                或："把所有 LoRA 权重调到 0.8"
            </div>
        `;
        this.messagesEl.appendChild(welcome);
    }

    _appendBubble(role, content, operations) {
        const bubble = document.createElement('div');
        bubble.className = `pc-agent-bubble pc-agent-${role}`;

        const label = document.createElement('div');
        label.className = 'pc-agent-bubble-label';
        label.textContent = role === 'user' ? '你' : 'Agent';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'pc-agent-bubble-content';
        contentDiv.textContent = content;

        bubble.appendChild(label);
        bubble.appendChild(contentDiv);

        // 操作结果卡片
        if (operations && operations.length > 0) {
            for (const op of operations) {
                const card = this._createOpCard(op);
                bubble.appendChild(card);
            }
        }

        this.messagesEl.appendChild(bubble);
    }

    _createOpCard(op) {
        const card = document.createElement('div');
        card.className = `pc-agent-op-card ${op.success ? 'pc-agent-op-success' : 'pc-agent-op-fail'}`;

        const icon = op.success ? '✓' : '✕';
        const actionLabel = getActionLabel(op.action);

        card.innerHTML = `
            <div class="pc-agent-op-header">
                <span class="pc-agent-op-icon">${icon}</span>
                <span class="pc-agent-op-action">${actionLabel}</span>
            </div>
            <div class="pc-agent-op-message">${escapeHtml(op.message || '')}</div>
        `;

        // Query 操作显示状态详情
        if (op.action === 'query' && op.state) {
            const detail = document.createElement('div');
            detail.className = 'pc-agent-op-detail';
            detail.innerHTML = `
                <div>底模: ${escapeHtml(op.state.checkpoint)}</div>
                <div>栈内 LoRA: ${op.state.stack_count} 项</div>
                ${op.state.stack_items.map(i =>
                    `<div class="pc-agent-op-lora">${i.enabled ? '☑' : '☐'} ${escapeHtml(i.name)} (${i.weight}/${i.clip_weight})</div>`
                ).join('')}
            `;
            card.appendChild(detail);
        }

        return card;
    }

    _scrollToBottom() {
        requestAnimationFrame(() => {
            this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
        });
    }
}

// ==================== 工具函数 ====================

function getActionLabel(action) {
    const labels = {
        lora_add: '添加 LoRA',
        lora_remove: '移除 LoRA',
        lora_toggle: '切换 LoRA',
        lora_weight: '修改权重',
        checkpoint: '切换底模',
        prompt_set: '设置提示词',
        category_set: '设置分类',
        query: '查询状态',
    };
    return labels[action] || action;
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
}
