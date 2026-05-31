/**
 * PromptCraft — 设置面板内容模块
 * 通过 createSettingsContent() 返回 DOM 元素，
 * 由 index.js 的 registerSettings() 传入 ComfyUI 的 type: () => element
 *
 * 设计语言：Light / Clean / Editorial — 浅色系
 * CSS 前缀：pc- (promptcraft)
 */

import { api } from '../../../scripts/api.js';
import { t, getLang, setLang } from './i18n.js';

const API_PREFIX = '/moton_prompt_enhancer/api';

async function apiRequest(method, endpoint, body = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await api.fetchApi(`${API_PREFIX}${endpoint}`, opts);
    return res.json();
}

/**
 * 创建嵌入 ComfyUI 设置面板的 PromptCraft 内容区块
 * 返回一个 DOM 元素，可直接作为 addSetting 的 type 回调返回值
 */
export function createSettingsContent() {
    const root = document.createElement('div');
    root.className = 'pc-settings';

    // Brand header
    root.innerHTML = `
        <div class="pc-brand">
            <div class="pc-brand-icon">◆</div>
            <span class="pc-brand-text">PromptCraft</span>
            <span class="pc-brand-ver">v1.2.6</span>
        </div>
    `;

    // Language switch
    const langCard = createSectionCard('🌐', t('settings.language'));
    const langRow = document.createElement('div');
    langRow.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 0;';
    langRow.innerHTML = `
        <select id="pc-lang-select" style="background:#2a2a2a;color:#ddd;border:1px solid #555;border-radius:4px;padding:4px 8px;font-size:12px;cursor:pointer;">
            <option value="zh">中文</option>
            <option value="en">English</option>
        </select>
        <span style="font-size:11px;color:#888;">${t('settings.language_hint')}</span>
    `;
    langCard.body.appendChild(langRow);
    root.appendChild(langCard.root);

    const langSelect = langRow.querySelector('#pc-lang-select');
    langSelect.value = getLang();
    langSelect.addEventListener('change', () => setLang(langSelect.value));

    // Section: API Services
    root.appendChild(buildApiSection());

    // Section: Floating Panel Switch
    root.appendChild(buildPanelSwitch());

    // Section: Prompt Tools
    root.appendChild(buildToolsSection());

    // Section: LoRA Hub
    root.appendChild(buildHubSection());

    // Section: About
    root.appendChild(buildAboutSection());

    return root;
}

// ==================== Section Builders ====================

function buildPanelSwitch() {
    const card = createSectionCard('◆', t('settings.floating_panel'));
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
    const isHidden = localStorage.getItem('moton-pe-panel-hidden') === 'true';
    row.innerHTML = `
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:#666;">
            <input type="checkbox" id="pc-panel-switch" ${isHidden ? '' : 'checked'} style="cursor:pointer;">
            ${t('settings.show_panel')}
        </label>
        <span style="font-size:11px;color:#aaa;">${t('settings.panel_hint')}</span>
    `;
    card.body.appendChild(row);

    card.root.addEventListener('change', (e) => {
        if (e.target.id === 'pc-panel-switch') {
            const visible = e.target.checked;
            window.dispatchEvent(new CustomEvent('promptcraft:toggle-panel', { detail: { visible } }));
        }
    });

    return card.root;
}


function buildApiSection() {
    const card = createSectionCard('⬡', t('settings.api_services'));

    // Category assignment row
    const catRow = document.createElement('div');
    catRow.className = 'pc-cat-row';
    catRow.innerHTML = `
        <div class="pc-cat-item">
            <span class="pc-cat-label">${t('settings.basic_enhance')}</span>
            <select class="pc-cat-select" data-cat="enhance_basic"><option>${t('common.loading')}</option></select>
        </div>
        <div class="pc-cat-item">
            <span class="pc-cat-label">${t('settings.detail_enhance')}</span>
            <select class="pc-cat-select" data-cat="enhance_detail"><option>${t('common.loading')}</option></select>
        </div>
        <div class="pc-cat-item">
            <span class="pc-cat-label">${t('settings.normal_enhance')}</span>
            <select class="pc-cat-select" data-cat="enhance_normal"><option>${t('common.loading')}</option></select>
        </div>
        <div class="pc-cat-item">
            <span class="pc-cat-label">AI Agent</span>
            <select class="pc-cat-select" data-cat="agent"><option>${t('common.loading')}</option></select>
        </div>
    `;
    card.body.appendChild(catRow);

    // Service list
    const svcList = document.createElement('div');
    svcList.className = 'pc-svc-list';
    svcList.dataset.role = 'svc-list';
    card.body.appendChild(svcList);

    // Action row
    const actionRow = document.createElement('div');
    actionRow.className = 'pc-action-row';
    actionRow.innerHTML = `
        <button class="pc-btn-sm pc-btn-sm-primary" data-action="manage-services">${t('settings.manage_services')}</button>
        <button class="pc-btn-sm" data-action="add-service">${t('settings.add_service')}</button>
    `;
    card.body.appendChild(actionRow);

    // Events
    card.root.addEventListener('change', (e) => {
        if (e.target.classList.contains('pc-cat-select')) {
            const cat = e.target.dataset.cat;
            const svcId = e.target.value;
            apiRequest('PUT', '/services/current', { category: cat, service_id: svcId, model: '' });
        }
    });

    card.root.addEventListener('click', (e) => {
        const action = e.target.closest('[data-action]')?.dataset.action;
        if (action === 'manage-services') {
            window.dispatchEvent(new CustomEvent('promptcraft:open-services'));
        }
        if (action === 'add-service') {
            handleAddService(svcList, catRow);
        }
    });

    // Load data
    loadApiSectionData(svcList, catRow);

    return card.root;
}

function buildToolsSection() {
    const card = createSectionCard('📐', t('settings.prompt_tools'));

    const grid = document.createElement('div');
    grid.className = 'pc-tool-grid';
    grid.innerHTML = `
        <div class="pc-tool-card" data-action="open-rules">
            <div class="pc-tool-icon">📐</div>
            <div class="pc-tool-info">
                <div class="pc-tool-name">${t('settings.rule_manager')}</div>
                <div class="pc-tool-desc">${t('settings.rule_manager_desc')}</div>
            </div>
            <span class="pc-tool-arrow">→</span>
        </div>
        <div class="pc-tool-card" data-action="open-library">
            <div class="pc-tool-icon">▤</div>
            <div class="pc-tool-info">
                <div class="pc-tool-name">${t('settings.prompt_library')}</div>
                <div class="pc-tool-desc">${t('settings.prompt_library_desc')}</div>
            </div>
            <span class="pc-tool-arrow">→</span>
        </div>
        <div class="pc-tool-card" data-action="open-history">
            <div class="pc-tool-icon">⏱</div>
            <div class="pc-tool-info">
                <div class="pc-tool-name">${t('settings.prompt_history')}</div>
                <div class="pc-tool-desc">${t('settings.prompt_history_desc')}</div>
            </div>
            <span class="pc-tool-arrow">→</span>
        </div>
        <div class="pc-tool-card" data-action="reload-cache">
            <div class="pc-tool-icon">↻</div>
            <div class="pc-tool-info">
                <div class="pc-tool-name">${t('settings.reload_cache')}</div>
                <div class="pc-tool-desc">${t('settings.reload_cache_desc')}</div>
            </div>
            <span class="pc-tool-arrow">↻</span>
        </div>
    `;
    card.body.appendChild(grid);

    card.root.addEventListener('click', (e) => {
        const action = e.target.closest('[data-action]')?.dataset.action;
        if (action === 'open-rules') window.dispatchEvent(new CustomEvent('promptcraft:open-rule-manager'));
        if (action === 'open-library') window.dispatchEvent(new CustomEvent('promptcraft:open-library-editor'));
        if (action === 'open-history') window.dispatchEvent(new CustomEvent('promptcraft:open-history'));
        if (action === 'reload-cache') handleReloadCache(e.target.closest('.pc-tool-card'));
    });

    return card.root;
}

function buildHubSection() {
    const card = createSectionCard('⬡', 'LoRA Hub');

    const link = document.createElement('div');
    link.className = 'pc-tool-grid-wide';
    link.innerHTML = `
        <div class="pc-tool-card-wide" data-action="open-hub">
            <div class="pc-tool-icon" style="font-size:22px">⬡</div>
            <div class="pc-tool-info">
                <div class="pc-tool-name" style="font-size:14px">${t('settings.open_lora_hub')}</div>
                <div class="pc-tool-desc">${t('settings.lora_hub_desc')}</div>
            </div>
            <span class="pc-tool-arrow">→</span>
        </div>
    `;
    card.body.appendChild(link);

    card.root.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="open-hub"]')) {
            window.dispatchEvent(new CustomEvent('promptcraft:open-hub'));
        }
    });

    return card.root;
}

function buildAboutSection() {
    const card = document.createElement('div');
    card.className = 'pc-section-card pc-section-card-flat';
    card.innerHTML = `
        <div class="pc-section-body">
            <div class="pc-about-row">
                <span>PromptCraft v1.2.6</span>
                <span class="pc-about-dot"></span>
                <span>Author: Moton</span>
            </div>
        </div>
    `;
    return card;
}

// ==================== Helpers ====================

function createSectionCard(icon, title) {
    const root = document.createElement('div');
    root.className = 'pc-section-card';

    const head = document.createElement('div');
    head.className = 'pc-section-head';
    head.innerHTML = `<div class="pc-section-icon">${icon}</div><div class="pc-section-title">${title}</div>`;
    root.appendChild(head);

    const body = document.createElement('div');
    body.className = 'pc-section-body';
    root.appendChild(body);

    return { root, body };
}

async function loadApiSectionData(svcListEl, catRowEl) {
    try {
        const res = await apiRequest('GET', '/services');
        if (!res.success) return;
        const { services, current } = res.data;

        // Populate category selects
        for (const cat of ['enhance_basic', 'enhance_detail', 'enhance_normal', 'agent']) {
            const sel = catRowEl.querySelector(`.pc-cat-select[data-cat="${cat}"]`);
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

        // Render service mini cards
        svcListEl.innerHTML = '';
        for (const svc of services) {
            const mini = document.createElement('div');
            mini.className = 'pc-svc-mini';
            const isBasic = current.enhance_basic?.service_id === svc.id;
            const isDetail = current.enhance_detail?.service_id === svc.id;
            const isNormal = current.enhance_normal?.service_id === svc.id;
            const isAgent = current.agent?.service_id === svc.id;
            let badges = '';
            if (isBasic) badges += `<span class="pc-svc-badge pc-svc-badge-amber">${t('settings.basic_enhance')}</span>`;
            if (isDetail) badges += `<span class="pc-svc-badge pc-svc-badge-amber">${t('settings.detail_enhance')}</span>`;
            if (isNormal) badges += `<span class="pc-svc-badge pc-svc-badge-amber">${t('settings.normal_enhance')}</span>`;
            if (isAgent) badges += '<span class="pc-svc-badge pc-svc-badge-teal">Agent</span>';
            mini.innerHTML = `
                <span class="pc-svc-mini-name">${escHtml(svc.name)}</span>
                <span class="pc-svc-mini-url">${escHtml(svc.api_url || t('settings.not_configured'))}</span>
                ${badges}
            `;
            svcListEl.appendChild(mini);
        }
    } catch (e) {
        console.error(`[PromptCraft] ${t('settings.load_services_failed')}`, e);
    }
}

async function handleAddService(svcListEl, catRowEl) {
    try {
        const res = await apiRequest('POST', '/services', { name: t('settings.new_service') });
        if (res.success) {
            loadApiSectionData(svcListEl, catRowEl);
        }
    } catch (e) {
        console.error(`[PromptCraft] ${t('settings.add_service_failed')}`, e);
    }
}

async function handleReloadCache(cardEl) {
    try {
        await apiRequest('POST', '/library/sfw_reload', {});
        await apiRequest('POST', '/library/nsfw_reload', {});
        if (cardEl) {
            cardEl.classList.add('pc-tool-card-success');
            setTimeout(() => cardEl.classList.remove('pc-tool-card-success'), 1200);
        }
    } catch (e) {
        console.error(`[PromptCraft] ${t('settings.cache_reload_failed')}`, e);
    }
}

function escHtml(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
