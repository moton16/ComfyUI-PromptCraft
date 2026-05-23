/**
 * PromptCraft — 多服务 API 配置面板
 * 支持多个 API 服务，分别用于提示词增强和 AI Agent
 */

import { api } from '../../../../scripts/api.js';

const API_PREFIX = '/moton_prompt_enhancer/api';

async function apiRequest(method, endpoint, body = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await api.fetchApi(`${API_PREFIX}${endpoint}`, opts);
    return res.json();
}

let _modalInstance = null;

export function openServiceConfigModal() {
    if (_modalInstance) _modalInstance.remove();
    _modalInstance = buildModal();
    document.body.appendChild(_modalInstance);
}

function buildModal() {
    const backdrop = document.createElement('div');
    backdrop.className = 'lsc-backdrop';

    const modal = document.createElement('div');
    modal.className = 'lsc-modal';

    // Header
    const header = document.createElement('div');
    header.className = 'lsc-header';
    header.innerHTML = `
        <div class="lsc-header-title">
            <span class="lsc-header-icon">◈</span>
            <span>API 服务配置</span>
        </div>
        <button class="lsc-close-btn" data-action="close">×</button>
    `;
    modal.appendChild(header);

    // Category bar
    const catBar = document.createElement('div');
    catBar.className = 'lsc-cat-bar';
    catBar.innerHTML = `
        <div class="lsc-cat-item">
            <span class="lsc-cat-label">提示词增强</span>
            <select class="lsc-cat-select" data-category="enhance"><option>加载中...</option></select>
        </div>
        <div class="lsc-cat-item">
            <span class="lsc-cat-label">AI Agent</span>
            <select class="lsc-cat-select" data-category="agent"><option>加载中...</option></select>
        </div>
    `;
    modal.appendChild(catBar);

    // Body
    const body = document.createElement('div');
    body.className = 'lsc-body';

    // Sidebar
    const sidebar = document.createElement('div');
    sidebar.className = 'lsc-sidebar';
    sidebar.innerHTML = `<div class="lsc-service-list" data-role="service-list"></div>
        <button class="lsc-add-btn" data-action="add-service">+ 添加服务</button>`;
    body.appendChild(sidebar);

    // Detail
    const detail = document.createElement('div');
    detail.className = 'lsc-detail';
    detail.innerHTML = `<div class="lsc-detail-placeholder">选择左侧服务进行编辑</div>`;
    body.appendChild(detail);

    modal.appendChild(body);
    backdrop.appendChild(modal);

    // Events
    let selectedServiceId = null;

    backdrop.addEventListener('click', (e) => {
        const action = e.target.closest('[data-action]')?.dataset.action;
        if (action === 'close') { backdrop.remove(); _modalInstance = null; }
        if (action === 'add-service') handleAddService(backdrop);
        if (action === 'save-service') handleSaveService(backdrop, selectedServiceId);
        if (action === 'delete-service') handleDeleteService(backdrop, selectedServiceId);
        if (action === 'test-service') handleTestService(backdrop, selectedServiceId);

        const card = e.target.closest('.lsc-svc-card');
        if (card && card.dataset.serviceId) {
            selectedServiceId = card.dataset.serviceId;
            selectService(backdrop, selectedServiceId);
        }
    });

    backdrop.addEventListener('change', (e) => {
        if (e.target.classList.contains('lsc-cat-select')) {
            const cat = e.target.dataset.category;
            const svcId = e.target.value;
            apiRequest('PUT', '/services/current', { category: cat, service_id: svcId, model: '' });
        }
    });

    // ESC close
    const esc = (e) => { if (e.key === 'Escape') { backdrop.remove(); _modalInstance = null; document.removeEventListener('keydown', esc); } };
    document.addEventListener('keydown', esc);

    // Load data
    loadServicesData(backdrop);

    return backdrop;
}

async function loadServicesData(backdrop) {
    try {
        const res = await apiRequest('GET', '/services');
        if (!res.success) return;
        const { services, current } = res.data;

        // Populate category selects
        for (const cat of ['enhance', 'agent']) {
            const sel = backdrop.querySelector(`.lsc-cat-select[data-category="${cat}"]`);
            if (!sel) continue;
            sel.innerHTML = '';
            for (const svc of services) {
                const opt = document.createElement('option');
                opt.value = svc.id;
                opt.textContent = svc.name;
                if (current[cat]?.service_id === svc.id) opt.selected = true;
                sel.appendChild(opt);
            }
        }

        // Render service list
        const listEl = backdrop.querySelector('[data-role="service-list"]');
        listEl.innerHTML = '';
        for (const svc of services) {
            const card = document.createElement('div');
            card.className = 'lsc-svc-card';
            card.dataset.serviceId = svc.id;
            const isEnhance = current.enhance?.service_id === svc.id;
            const isAgent = current.agent?.service_id === svc.id;
            let badges = '';
            if (isEnhance) badges += '<span class="lsc-badge lsc-badge-amber">增强</span>';
            if (isAgent) badges += '<span class="lsc-badge lsc-badge-copper">Agent</span>';
            card.innerHTML = `
                <div class="lsc-svc-card-name">${escHtml(svc.name)}</div>
                <div class="lsc-svc-card-url">${escHtml(svc.api_url || '未配置')}</div>
                <div class="lsc-svc-card-badges">${badges}</div>
            `;
            listEl.appendChild(card);
        }
    } catch (e) {
        console.error('[PromptCraft] 加载服务配置失败:', e);
    }
}

async function selectService(backdrop, svcId) {
    // Highlight
    backdrop.querySelectorAll('.lsc-svc-card').forEach(c => c.classList.toggle('lsc-selected', c.dataset.serviceId === svcId));

    try {
        const res = await apiRequest('GET', '/services');
        if (!res.success) return;
        const svc = res.data.services.find(s => s.id === svcId);
        if (!svc) return;

        const detail = backdrop.querySelector('.lsc-detail');
        detail.innerHTML = `
            <div class="lsc-detail-form">
                <div class="lsc-field">
                    <label>服务名称</label>
                    <input class="lsc-input" data-field="name" value="${escAttr(svc.name)}" />
                </div>
                <div class="lsc-field">
                    <label>API 端点 URL</label>
                    <input class="lsc-input" data-field="api_url" value="${escAttr(svc.api_url)}" placeholder="https://api.example.com/v1/chat/completions" />
                </div>
                <div class="lsc-field">
                    <label>API Key</label>
                    <input class="lsc-input" type="password" data-field="api_key" data-masked="true" value="${escAttr(svc.api_key)}" placeholder="输入 API Key" />
                </div>
                <div class="lsc-field">
                    <label>模型名称</label>
                    <input class="lsc-input" data-field="model" value="${escAttr(svc.model)}" placeholder="gpt-4o-mini / deepseek-chat" />
                </div>
                <div class="lsc-field-row">
                    <div class="lsc-field lsc-field-half">
                        <label>Temperature</label>
                        <input class="lsc-input" type="number" step="0.05" min="0" max="2" data-field="temperature" value="${svc.temperature}" />
                    </div>
                    <div class="lsc-field lsc-field-half">
                        <label>Max Tokens</label>
                        <input class="lsc-input" type="number" step="50" min="50" max="4000" data-field="max_tokens" value="${svc.max_tokens}" />
                    </div>
                </div>
                <div class="lsc-actions">
                    <button class="lsc-btn lsc-btn-primary" data-action="test-service">🧪 测试连接</button>
                    <button class="lsc-btn lsc-btn-save" data-action="save-service">💾 保存</button>
                    <button class="lsc-btn lsc-btn-danger" data-action="delete-service">删除服务</button>
                </div>
                <div class="lsc-status" data-role="status"></div>
            </div>
        `;

        // Track API key modifications - clear masked flag when user types
        const apiKeyInput = detail.querySelector('[data-field="api_key"]');
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', () => {
                apiKeyInput.dataset.masked = 'false';
            });
            apiKeyInput.addEventListener('focus', () => {
                if (apiKeyInput.dataset.masked === 'true') {
                    apiKeyInput.value = '';
                    apiKeyInput.dataset.masked = 'false';
                }
            });
        }
    } catch (e) {
        console.error('[PromptCraft] 加载服务详情失败:', e);
    }
}

function collectFormData(backdrop) {
    const data = {};
    backdrop.querySelectorAll('.lsc-input[data-field]').forEach(input => {
        const field = input.dataset.field;
        // Skip API key if it's still masked (user didn't change it)
        if (field === 'api_key' && input.dataset.masked === 'true') {
            return;
        }
        let val = input.value;
        if (field === 'temperature' || field === 'max_tokens') val = parseFloat(val);
        data[field] = val;
    });
    return data;
}

function setStatus(backdrop, msg, isError = false) {
    const el = backdrop.querySelector('[data-role="status"]');
    if (el) {
        el.textContent = msg;
        el.className = 'lsc-status ' + (isError ? 'lsc-status-error' : 'lsc-status-ok');
    }
}

async function handleSaveService(backdrop, svcId) {
    if (!svcId) return;
    const data = collectFormData(backdrop);
    try {
        const res = await apiRequest('PUT', `/services/${svcId}`, data);
        if (res.success) {
            setStatus(backdrop, '已保存 ✓');
            loadServicesData(backdrop);
        } else {
            setStatus(backdrop, '保存失败: ' + (res.error || ''), true);
        }
    } catch (e) {
        setStatus(backdrop, '保存异常: ' + e.message, true);
    }
}

async function handleAddService(backdrop) {
    try {
        const res = await apiRequest('POST', '/services', { name: '新服务' });
        if (res.success) {
            await loadServicesData(backdrop);
            selectService(backdrop, res.data.id);
        }
    } catch (e) {
        console.error('[PromptCraft] 添加服务失败:', e);
    }
}

async function handleDeleteService(backdrop, svcId) {
    if (!svcId) return;
    if (!confirm('确定删除此服务？')) return;
    try {
        const res = await apiRequest('DELETE', `/services/${svcId}`);
        if (res.success) {
            loadServicesData(backdrop);
            const detail = backdrop.querySelector('.lsc-detail');
            detail.innerHTML = '<div class="lsc-detail-placeholder">服务已删除</div>';
        } else {
            alert(res.error || '删除失败');
        }
    } catch (e) {
        alert('删除异常: ' + e.message);
    }
}

async function handleTestService(backdrop, svcId) {
    if (!svcId) return;
    setStatus(backdrop, '测试中...');
    try {
        // If API key was modified, send inline config for testing
        const apiKeyInput = backdrop.querySelector('[data-field="api_key"]');
        const keyModified = apiKeyInput && apiKeyInput.dataset.masked === 'false';
        const body = {};
        if (keyModified) {
            body.config = collectFormData(backdrop);
            // Ensure required fields for test
            if (!body.config.api_url) {
                setStatus(backdrop, '❌ 请先填写 API 端点 URL', true);
                return;
            }
        }
        const res = await apiRequest('POST', `/services/${svcId}/test`, body);
        if (res.success) {
            setStatus(backdrop, '✅ ' + (res.data?.message || '连接成功'));
        } else {
            setStatus(backdrop, '❌ ' + (res.error || '连接失败'), true);
        }
    } catch (e) {
        setStatus(backdrop, '❌ ' + e.message, true);
    }
}

function escHtml(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
function escAttr(s) { return (s || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
