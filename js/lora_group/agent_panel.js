/**
 * Agent Panel — AI Agent 对话 UI 组件
 * 支持两种复用模式：
 *   - Hub Tab 模式: 渲染到 Hub 右侧面板容器
 *   - 浮动窗口模式: 创建全屏 overlay 面板
 */

import * as Executor from './agent_executor.js';
import { renderStack } from './canvas_widget.js';
import { t } from '../i18n.js';

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
            { label: t('agent.shortcut_status'), cmd: '显示当前节点的状态' },
            { label: t('agent.shortcut_clear'), cmd: '清空所有 LoRA' },
            { label: t('agent.shortcut_help'), cmd: '你能做什么？' },
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
        this.textarea.placeholder = t('agent.placeholder');
        this.textarea.rows = 1;

        const sendBtn = document.createElement('button');
        sendBtn.className = 'pc-agent-send-btn';
        sendBtn.textContent = t('agent.send');

        inputArea.appendChild(this.textarea);
        inputArea.appendChild(sendBtn);

        // 状态栏
        this.statusBar = document.createElement('div');
        this.statusBar.className = 'pc-agent-status';
        this.statusBar.textContent = t('agent.status.ready');

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

        this.statusBar.textContent = t('agent.thinking');
        this.statusBar.className = 'pc-agent-status pc-agent-thinking';

        try {
            // 构建当前状态
            const currentState = Executor.buildCurrentState(this.node);

            // 调用 Agent API
            const responseText = await Executor.callAgent(instruction, currentState);

            // 解析响应
            const parsed = Executor.parseAgentResponse(responseText);

            if (parsed.error) {
                agentMessages.push({ role: 'assistant', content: `${t('common.error')}: ${parsed.error}` });
                this._appendBubble('assistant', `${t('common.error')}: ${parsed.error}`);
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
                    replyText += t('agent.ops_executed', { count: successCount });
                }
                if (failCount > 0) {
                    replyText += ` ${t('agent.ops_failed', { count: failCount })}`;
                }

                agentMessages.push({ role: 'assistant', content: replyText, operations: results });
                this._appendBubble('assistant', replyText, results);
            }

            this.statusBar.textContent = t('agent.status.ready');
            this.statusBar.className = 'pc-agent-status';

        } catch (e) {
            const errMsg = t('agent.request_failed', { error: e.message });
            agentMessages.push({ role: 'assistant', content: errMsg });
            this._appendBubble('assistant', errMsg);
            this.statusBar.textContent = t('common.error');
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
                ${t('agent.welcome_desc')}
            </div>
        `;
        this.messagesEl.appendChild(welcome);
    }

    _appendBubble(role, content, operations) {
        const bubble = document.createElement('div');
        bubble.className = `pc-agent-bubble pc-agent-${role}`;

        const label = document.createElement('div');
        label.className = 'pc-agent-bubble-label';
        label.textContent = role === 'user' ? t('agent.user_label') : t('agent.agent_label');

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
                <div>${t('agent.status_model', { model: escapeHtml(op.state.checkpoint) })}</div>
                <div>${t('agent.status_lora_count', { count: op.state.stack_count })}</div>
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
        lora_add: t('agent.action.lora_add'),
        lora_remove: t('agent.action.lora_remove'),
        lora_toggle: t('agent.action.lora_toggle'),
        lora_weight: t('agent.action.lora_weight'),
        checkpoint: t('agent.action.checkpoint'),
        prompt_set: t('agent.action.prompt_set'),
        category_set: t('agent.action.category_set'),
        query: t('agent.action.query'),
    };
    return labels[action] || action;
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
}
