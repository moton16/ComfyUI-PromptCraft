/**
 * LoRA Hub — 统一管理面板
 * 整合 LoRA 磁盘浏览、群组管理、Prompt 编辑于一体
 * 替代旧的 group_panel.js + lora_browser.js
 */

import * as API from './api.js';
import * as StackAPI from './stack_api.js';
import { createAgentPanel } from './agent_panel.js';
import { t } from '../i18n.js';

// ==================== 公共入口 ====================

let _hubInstance = null;
let _onRefreshStack = null;

/**
 * 注册栈刷新回调（由 canvas_widget 调用，避免循环依赖）
 */
export function setHubRefreshCallback(fn) {
    _onRefreshStack = fn;
}

export function openHubPanel(node, options = {}) {
    if (_hubInstance) {
        _hubInstance.close();
    }
    _hubInstance = new HubPanel(node, options);
}

// ==================== HubPanel 类 ====================

class HubPanel {
    constructor(node, options = {}) {
        this.node = node;
        this.activeTab = 'lora'; // 'lora' | 'group'
        this.selectedLora = null;
        this.selectedGroup = null;
        this.folderTree = null;
        this.currentPath = ['/'];
        this.allLoras = [];
        this.searchQuery = '';
        this.favorites = new Set();
        this.initialTarget = options.targetLora || null;
        this._loadFavorites();
        this._build();
        document.body.appendChild(this.backdrop);
    }

    // ---------- 收藏管理 ----------

    async _loadFavorites() {
        try {
            const favs = await API.getLoraFavorites();
            this.favorites = new Set(favs);
        } catch {
            this.favorites = new Set();
        }
    }

    async _toggleFavorite(loraPath) {
        try {
            const res = await API.toggleLoraFavorite(loraPath);
            if (res.favorited) {
                this.favorites.add(loraPath);
            } else {
                this.favorites.delete(loraPath);
            }
            return res.favorited;
        } catch {
            return this.favorites.has(loraPath);
        }
    }

    // ---------- 构建 DOM ----------

    _build() {
        // Backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'lhub-backdrop';

        // Modal
        const modal = document.createElement('div');
        modal.className = 'lhub-modal';

        // Header
        const header = document.createElement('div');
        header.className = 'lhub-header';
        header.innerHTML = `
            <div class="lhub-header-left">
                <h2 class="lhub-title">${t('hub.title')}</h2>
            </div>
            <div class="lhub-header-right">
                <button class="lhub-btn lhub-btn-sm" data-action="export" title="${t('hub.export_title')}">${t('hub.export')}</button>
                <button class="lhub-close-btn" data-action="close" title="${t('hub.close')}">×</button>
            </div>
        `;
        modal.appendChild(header);

        // Body
        const body = document.createElement('div');
        body.className = 'lhub-body';

        // Sidebar
        this.sidebar = this._buildSidebar();
        body.appendChild(this.sidebar);

        // Content
        this.content = document.createElement('div');
        this.content.className = 'lhub-content';
        this._renderWelcome();
        body.appendChild(this.content);

        modal.appendChild(body);

        // Footer
        const footer = document.createElement('div');
        footer.className = 'lhub-footer';
        footer.innerHTML = `
            <div class="lhub-footer-stack" data-role="footer-stack">${t('hub.stack_count', { count: 0 })}</div>
        `;
        modal.appendChild(footer);

        this.backdrop.appendChild(modal);

        // Events
        this._bindEvents();
        this._updateFooter();

        // Load initial tab content (fix: sidebar was empty on first open)
        this._switchTab('lora');

        // 定位逻辑：优先使用指定的 targetLora，否则默认选中栈顶
        if (this.initialTarget) {
            this._navigateToLora(this.initialTarget);
        } else {
            this._autoSelectTopLora();
        }
    }

    _buildSidebar() {
        const sidebar = document.createElement('div');
        sidebar.className = 'lhub-sidebar';

        sidebar.innerHTML = `
            <div class="lhub-tabs">
                <button class="lhub-tab lhub-tab-active" data-tab="lora">
                    <span class="lhub-tab-icon">◆</span> LoRA
                </button>
                <button class="lhub-tab" data-tab="group">
                    <span class="lhub-tab-icon">✦</span> ${t('hub.tab_group')}
                </button>
                <button class="lhub-tab" data-tab="agent">
                    <span class="lhub-tab-icon">◈</span> ${t('hub.tab_agent')}
                </button>
            </div>
            <div class="lhub-search">
                <input class="lhub-search-input" data-role="sidebar-search" />
            </div>
            <div class="lhub-list" data-role="sidebar-list"></div>
            <div class="lhub-sidebar-footer" data-role="sidebar-footer"></div>
        `;

        return sidebar;
    }

    // ---------- 事件绑定 ----------

    _bindEvents() {
        // Header actions
        this.backdrop.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (action === 'close') this.close();
            else if (action === 'export') this._exportGroups();
        });

        // Tab switching
        this.backdrop.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('[data-tab]');
            if (!tabBtn) return;
            const tab = tabBtn.dataset.tab;
            this._switchTab(tab);
        });

        // Search
        this.sidebar.querySelector('[data-role="sidebar-search"]').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.trim().toLowerCase();
            this._renderSidebarList();
        });

        // Sidebar click
        this.sidebar.addEventListener('click', (e) => {
            const loraItem = e.target.closest('[data-lora-path]');
            const groupItem = e.target.closest('[data-group-name]');

            if (loraItem) {
                this._selectLora(loraItem.dataset.loraPath);
            } else if (groupItem) {
                this._selectGroup(groupItem.dataset.groupName);
            }

            // Footer buttons
            const footerAction = e.target.closest('[data-footer-action]');
            if (footerAction) {
                const fa = footerAction.dataset.footerAction;
                if (fa === 'create-group') this._createGroup();
            }
        });

        // Content delegation
        this.content.addEventListener('click', (e) => {
            this._handleContentClick(e);
        });
        this.content.addEventListener('change', (e) => {
            this._handleContentChange(e);
        });
        this.content.addEventListener('input', (e) => {
            this._handleContentInput(e);
        });

        // ESC close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.close();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        this._escHandler = escHandler;
    }

    // ---------- Tab 切换 ----------

    _switchTab(tab) {
        this.activeTab = tab;
        this.searchQuery = '';

        const searchEl = this.sidebar.querySelector('[data-role="sidebar-search"]');
        const listEl = this.sidebar.querySelector('[data-role="sidebar-list"]');

        this.sidebar.querySelectorAll('.lhub-tab').forEach(btn => {
            btn.classList.toggle('lhub-tab-active', btn.dataset.tab === tab);
        });

        if (tab === 'agent') {
            searchEl.style.display = 'none';
            listEl.style.display = 'none';
            listEl.innerHTML = '';
            this.sidebar.querySelector('[data-role="sidebar-footer"]').innerHTML = '';
            this._renderAgent();
        } else {
            searchEl.style.display = '';
            listEl.style.display = '';
            searchEl.value = '';
            searchEl.placeholder = tab === 'lora' ? t('hub.search_lora') : t('hub.search_group');
            this._renderSidebarList();
            this._renderSidebarFooter();
        }
    }

    // ---------- 侧栏渲染 ----------

    _renderSidebarList() {
        const listEl = this.sidebar.querySelector('[data-role="sidebar-list"]');
        listEl.innerHTML = `<div class="lhub-loading">${t('common.loading')}</div>`;

        if (this.activeTab === 'lora') {
            this._renderLoraList(listEl);
        } else {
            this._renderGroupList(listEl);
        }
    }

    async _renderLoraList(listEl) {
        if (this.allLoras.length === 0) {
            try {
                const data = await API.getLoraFolders();
                this.folderTree = data;
                this.allLoras = data.all || [];
            } catch {
                listEl.innerHTML = `<div class="lhub-empty-msg">${t('hub.load_failed')}</div>`;
                return;
            }
        }

        listEl.innerHTML = '';

        if (this.searchQuery) {
            // Search mode — favorites first
            try {
                const results = await API.searchLoras(this.searchQuery);
                if (results.length === 0) {
                    listEl.innerHTML = `<div class="lhub-empty-msg">${t('hub.no_match')}</div>`;
                    this._onSidebarRendered?.();
                    return;
                }
                const sliced = results.slice(0, 100);
                const favResults = sliced.filter(f => this.favorites.has(f)).sort();
                const nonFavResults = sliced.filter(f => !this.favorites.has(f));
                if (favResults.length > 0) {
                    for (const file of favResults) {
                        listEl.appendChild(this._createLoraItem(file));
                    }
                    if (nonFavResults.length > 0) {
                        const sep = document.createElement('div');
                        sep.style.cssText = 'height:1px; background:#e8e8e8; margin:4px 0;';
                        listEl.appendChild(sep);
                    }
                }
                for (const file of nonFavResults) {
                    listEl.appendChild(this._createLoraItem(file));
                }
            } catch {
                listEl.innerHTML = `<div class="lhub-empty-msg">${t('hub.search_failed')}</div>`;
            }
            this._onSidebarRendered?.();
            return;
        }

        // Folder tree mode
        this._renderFolderTree(listEl);
        this._onSidebarRendered?.();
    }

    _renderFolderTree(listEl) {
        listEl.innerHTML = '';
        let node = this.folderTree;

        // Navigate to current path
        for (let i = 1; i < this.currentPath.length; i++) {
            if (node[this.currentPath[i]]) {
                node = node[this.currentPath[i]];
            } else break;
        }

        // Breadcrumb
        const breadcrumb = document.createElement('div');
        breadcrumb.className = 'lhub-breadcrumb';
        this.currentPath.forEach((part, i) => {
            if (i > 0) {
                const sep = document.createElement('span');
                sep.className = 'lhub-breadcrumb-sep';
                sep.textContent = '›';
                breadcrumb.appendChild(sep);
            }
            const item = document.createElement('span');
            item.className = 'lhub-breadcrumb-item';
            item.textContent = part === '/' ? t('hub.root_dir') : part;
            item.addEventListener('click', () => {
                this.currentPath = this.currentPath.slice(0, i + 1);
                this._renderSidebarList();
            });
            breadcrumb.appendChild(item);
        });
        listEl.appendChild(breadcrumb);

        // Subfolders
        const entries = Object.entries(node).filter(([k]) => k !== 'all' && k !== '/');
        for (const [name, sub] of entries) {
            const chip = document.createElement('div');
            chip.className = 'lhub-folder-item';
            const count = sub.all?.length || 0;
            chip.innerHTML = `
                <span class="lhub-folder-icon">▸</span>
                <span class="lhub-folder-name">${escapeHtml(name)}</span>
                <span class="lhub-folder-count">${count}</span>
            `;
            chip.addEventListener('click', () => {
                this.currentPath.push(name);
                this._renderSidebarList();
            });
            listEl.appendChild(chip);
        }

        // Files in current directory
        const rootFiles = node['/']?.all || [];
        const files = entries.length === 0 ? (node.all || []) : rootFiles;

        // Show favorites at top when at root level (not in subfolder)
        const isRoot = this.currentPath.length <= 1;
        if (isRoot && this.favorites.size > 0 && files.length > 0) {
            const favFiles = files.filter(f => this.favorites.has(f)).sort();
            if (favFiles.length > 0) {
                const favHeader = document.createElement('div');
                favHeader.className = 'lhub-folder-item';
                favHeader.style.cssText = 'color:#c8842a; font-size:11px; font-weight:600; padding:4px 8px; cursor:default;';
                favHeader.textContent = t('hub.favorites', { count: favFiles.length });
                listEl.appendChild(favHeader);
                for (const file of favFiles) {
                    listEl.appendChild(this._createLoraItem(file));
                }
                const sep = document.createElement('div');
                sep.style.cssText = 'height:1px; background:#e8e8e8; margin:4px 0;';
                listEl.appendChild(sep);
            }
        }

        for (const file of files) {
            // Skip favorites already shown above (only at root)
            if (isRoot && this.favorites.has(file)) continue;
            listEl.appendChild(this._createLoraItem(file));
        }
    }

    _createLoraItem(file) {
        const originalName = file.split('/').pop().replace(/\.safetensors$/, '');
        const isFav = this.favorites.has(file);

        // 获取备注名（如果有的话）
        let displayName = originalName;
        if (this.node) {
            const stack = StackAPI.getStack(this.node.id);
            const loraItem = stack.items.find(i => i.type === 'lora' && i.lora === file);
            if (loraItem && loraItem.note && loraItem.note.trim()) {
                displayName = loraItem.note.trim();
            }
        }

        const item = document.createElement('div');
        item.className = 'lhub-lora-item' + (isFav ? ' lhub-lora-item-fav' : '');
        if (this.selectedLora === file) {
            item.classList.add('lhub-selected');
        }
        item.dataset.loraPath = file;
        item.title = displayName !== originalName ? `${displayName}\n${file}` : file;

        const star = document.createElement('span');
        star.className = 'lhub-fav-star' + (isFav ? ' lhub-fav-active' : '');
        star.textContent = isFav ? '★' : '☆';
        star.style.cssText = 'cursor:pointer; font-size:12px; color:' + (isFav ? '#c8842a' : '#ccc') + '; flex-shrink:0; margin-right:2px;';
        star.title = isFav ? t('hub.unfavorite') : t('hub.favorite');
        star.addEventListener('click', async (e) => {
            e.stopPropagation();
            const nowFav = await this._toggleFavorite(file);
            star.textContent = nowFav ? '★' : '☆';
            star.style.color = nowFav ? '#c8842a' : '#ccc';
            star.title = nowFav ? t('hub.unfavorite') : t('hub.favorite');
            item.classList.toggle('lhub-lora-item-fav', nowFav);
        });

        const icon = document.createElement('span');
        icon.className = 'lhub-lora-icon';
        icon.textContent = '◆';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'lhub-lora-name';
        nameSpan.textContent = displayName;
        if (displayName !== originalName) {
            nameSpan.style.color = '#c8842a';
        }

        item.appendChild(star);
        item.appendChild(icon);
        item.appendChild(nameSpan);
        return item;
    }

    async _renderGroupList(listEl) {
        try {
            const groups = await API.getGroups();
            listEl.innerHTML = '';

            const entries = Object.entries(groups);
            if (entries.length === 0) {
                listEl.innerHTML = `<div class="lhub-empty-msg">${t('hub.no_groups')}</div>`;
                return;
            }

            for (const [name, info] of entries) {
                if (this.searchQuery && !name.toLowerCase().includes(this.searchQuery)) continue;
                const item = document.createElement('div');
                item.className = 'lhub-group-item';
                if (this.selectedGroup === name) item.classList.add('lhub-selected');
                item.dataset.groupName = name;
                item.innerHTML = `
                    <span class="lhub-group-icon">✦</span>
                    <div class="lhub-group-info">
                        <div class="lhub-group-name">${escapeHtml(info.label || name)}</div>
                        <div class="lhub-group-meta">${t('hub.lora_count', { count: info.count || 0 })}</div>
                    </div>
                `;
                listEl.appendChild(item);
            }
        } catch {
            listEl.innerHTML = `<div class="lhub-empty-msg">${t('hub.load_failed')}</div>`;
        }
    }

    _renderSidebarFooter() {
        const footer = this.sidebar.querySelector('[data-role="sidebar-footer"]');
        footer.innerHTML = '';
        if (this.activeTab === 'group') {
            footer.innerHTML = `
                <button class="lhub-btn lhub-btn-primary lhub-btn-full" data-footer-action="create-group">${t('hub.new_group')}</button>
            `;
        }
    }

    // ---------- 自动选中栈顶 LoRA ----------

    _autoSelectTopLora() {
        if (!this.node) return;
        const stack = StackAPI.getStack(this.node.id);
        if (!stack.items || stack.items.length === 0) return;

        const firstItem = stack.items[0];
        if (firstItem.type !== 'lora') return;

        this._onSidebarRendered = () => {
            this._selectLora(firstItem.lora);
            this._onSidebarRendered = null;
        };
    }

    /**
     * 导航到指定 LoRA（用于 edit-prompt 定位）
     */
    async _navigateToLora(loraPath) {
        if (!this.folderTree) {
            try {
                const data = await API.getLoraFolders();
                this.folderTree = data;
                this.allLoras = data.all || [];
            } catch {
                return;
            }
        }

        const parts = loraPath.replace(/\\/g, '/').split('/');
        this.currentPath = parts.length > 1 ? ['/', ...parts.slice(0, -1)] : ['/'];

        this._onSidebarRendered = () => {
            this._selectLora(loraPath);
            this._onSidebarRendered = null;
        };
        this._renderSidebarList();
    }

    // ---------- 右侧内容渲染 ----------

    _renderWelcome() {
        this.content.innerHTML = `
            <div class="lhub-welcome">
                <div class="lhub-welcome-icon">◆</div>
                <div class="lhub-welcome-title">${t('hub.title')}</div>
                <div class="lhub-welcome-desc">
                    ${t('hub.welcome_desc')}
                </div>
            </div>
        `;
    }

    _renderAgent() {
        this.content.innerHTML = '';
        createAgentPanel(this.content, this.node, { mode: 'hub' });
    }

    async _selectLora(loraPath) {
        this.selectedLora = loraPath;
        this.selectedGroup = null;

        // Highlight sidebar
        this.sidebar.querySelectorAll('.lhub-lora-item, .lhub-group-item').forEach(el => {
            el.classList.remove('lhub-selected');
        });
        this.sidebar.querySelector(`[data-lora-path="${CSS.escape(loraPath)}"]`)?.classList.add('lhub-selected');

        // Show loading
        this.content.innerHTML = `<div class="lhub-loading" style="padding:40px;text-align:center;color:#999;">${t('common.loading')}</div>`;

        // Load data in parallel
        let promptData, allGroups, loraInfo;
        try {
            [promptData, allGroups, loraInfo] = await Promise.all([
                API.getLoraPrompts(loraPath).catch(() => ({ groups: [] })),
                API.getGroups().catch(() => ({})),
                API.getLoraInfo(loraPath).catch(() => null),
            ]);
        } catch {
            promptData = { groups: [] };
            allGroups = {};
            loraInfo = null;
        }

        // Check membership
        const memberOf = Object.keys(allGroups);
        const membershipGroups = [];
        for (const gName of memberOf) {
            try {
                const gDetail = await API.getGroup(gName);
                if (gDetail.loras?.some(l => l.lora === loraPath)) {
                    membershipGroups.push(gName);
                }
            } catch {}
        }

        const filename = loraPath.split('/').pop();
        const displayName = loraInfo?.name || filename.replace(/\.safetensors$/, '');
        const promptGroups = promptData.groups || [];
        const folderParts = loraPath.replace(/\\/g, '/').split('/');
        const folder = folderParts.length > 1 ? folderParts.slice(0, -1).join('/') : '';

        // Info card HTML
        const infoCardHTML = this._buildInfoCardHTML(loraInfo, filename, displayName, folder, loraPath);
        // Training words HTML
        const trainWordsHTML = this._buildTrainingWordsHTML(loraInfo?.training_words || []);

        // 获取备注信息
        let currentNote = '';
        if (this.node) {
            const stack = StackAPI.getStack(this.node.id);
            const loraItem = stack.items.find(i => i.type === 'lora' && i.lora === loraPath);
            if (loraItem) {
                currentNote = loraItem.note || '';
            }
        }

        this.content.innerHTML = `
            <div class="lhub-detail">
                ${infoCardHTML}

                <div class="lhub-detail-section">
                    <div class="lhub-section-title">${t('hub.display_name')}</div>
                    <div class="lhub-note-editor-hub">
                        <input class="lhub-note-input" type="text" value="${escapeAttr(currentNote)}"
                               placeholder="${t('hub.note_placeholder_hub')}" data-role="note-input" />
                        <div class="lhub-note-actions">
                            <button class="lhub-btn lhub-btn-sm lhub-btn-primary" data-action="save-note">${t('common.save')}</button>
                            <button class="lhub-btn lhub-btn-sm" data-action="clear-note">${t('hub.clear_note')}</button>
                        </div>
                        <div class="lhub-note-hint">${t('hub.note_hint')}</div>
                    </div>
                </div>

                <div class="lhub-detail-section">
                    <div class="lhub-section-title">${t('hub.prompt_groups')}</div>
                    <div class="lhub-prompt-groups" data-role="prompt-groups">
                        ${this._renderPromptGroupsHTML(promptGroups)}
                    </div>
                    <div class="lhub-prompt-actions">
                        <button class="lhub-btn lhub-btn-primary" data-action="add-prompt-group">${t('hub.new_prompt_group')}</button>
                    </div>
                </div>

                <div class="lhub-detail-section">
                    <div class="lhub-section-title">${t('hub.belong_groups')}</div>
                    <div class="lhub-membership">
                        ${membershipGroups.length > 0
                            ? membershipGroups.map(g => `<span class="lhub-membership-tag">${escapeHtml(g)}</span>`).join('')
                            : `<span class="lhub-muted">${t('hub.not_in_group')}</span>`}
                    </div>
                    <div class="lhub-add-to-group" style="margin-top:8px;">
                        <select class="lhub-select" data-role="group-select">
                            <option value="">${t('hub.add_to_group')}</option>
                            ${memberOf.map(g => `<option value="${escapeAttr(g)}">${escapeHtml(g)}</option>`).join('')}
                        </select>
                        <button class="lhub-btn lhub-btn-sm" data-action="add-to-group">${t('hub.add')}</button>
                    </div>
                </div>

                ${trainWordsHTML}

                <div class="lhub-detail-section">
                    <button class="lhub-btn lhub-btn-primary" data-action="add-to-stack">${t('hub.add_to_stack')}</button>
                </div>
            </div>
        `;

        this._bindChipEvents();
    }

    _buildInfoCardHTML(info, filename, displayName, folder, loraPath) {
        const hashShort = info?.sha256_short || '';
        const hashFull = info?.sha256 || '';
        const baseModel = info?.base_model || '';
        const clipSkip = info?.clip_skip || '';
        const description = info?.description || '';

        let modelBadge = '';
        if (baseModel) {
            let cls = 'lhub-model-badge';
            if (baseModel.toLowerCase().includes('sdxl') || baseModel.toLowerCase().includes('xl')) cls += ' lhub-model-sdxl';
            else if (baseModel.toLowerCase().includes('flux')) cls += ' lhub-model-flux';
            else cls += ' lhub-model-sd15';
            modelBadge = `<span class="${cls}">${escapeHtml(baseModel)}</span>`;
        }

        return `
            <div class="lhub-info-card">
                <div class="lhub-info-header">
                    <div class="lhub-info-display-name">${escapeHtml(displayName)}</div>
                    <div class="lhub-info-sub">
                        ${folder ? `<span class="lhub-folder-badge">${escapeHtml(folder)}</span>` : ''}
                        <span class="lhub-info-filename">${escapeHtml(filename)}</span>
                    </div>
                </div>
                <div class="lhub-info-fields">
                    ${hashShort ? `<div class="lhub-info-field"><span class="lhub-field-label">${t('hub.field_hash')}</span><span class="lhub-field-value"><span class="lhub-hash-text">${escapeHtml(hashShort)}</span><button class="lhub-hash-copy" data-full-hash="${escapeAttr(hashFull)}" title="${t('hub.copy_hash')}">${t('hub.copy')}</button></span></div>` : ''}
                    ${modelBadge ? `<div class="lhub-info-field"><span class="lhub-field-label">${t('hub.field_model')}</span><span class="lhub-field-value">${modelBadge}</span></div>` : ''}
                    ${clipSkip ? `<div class="lhub-info-field"><span class="lhub-field-label">CLIP</span><span class="lhub-field-value">Skip ${escapeHtml(clipSkip)}</span></div>` : ''}
                    ${description ? `<div class="lhub-info-field lhub-info-field-full"><span class="lhub-field-label">${t('hub.field_desc')}</span><span class="lhub-field-value lhub-field-desc">${escapeHtml(description)}</span></div>` : ''}
                </div>
            </div>
        `;
    }

    _buildTrainingWordsHTML(words) {
        if (!words || words.length === 0) return '';

        const chipsHTML = words.map((w, i) => {
            const word = w.word || w;
            const count = w.count || '';
            const tip = count ? t('hub.occurrence', { count }) : '';
            return `<span class="lhub-chip lhub-chip-${i % 5}" data-word="${escapeAttr(word)}" ${tip ? `data-tip="${escapeAttr(tip)}"` : ''}><span class="lhub-chip-word">${escapeHtml(word)}</span>${count ? `<span class="lhub-chip-count">${count}</span>` : ''}</span>`;
        }).join('');

        return `
            <div class="lhub-train-section">
                <div class="lhub-train-head">
                    <span class="lhub-section-title-inline">${t('hub.training_words')}</span>
                    <div class="lhub-train-btns">
                        <button class="lhub-train-copy-all" data-action="copy-selected-words">${t('hub.copy')}</button>
                        <button class="lhub-train-copy-all" data-action="copy-all-words">${t('hub.copy_all')}</button>
                    </div>
                </div>
                <div class="lhub-chip-box">${chipsHTML}</div>
            </div>
        `;
    }

    _bindChipEvents() {
        // Chip click: toggle selection (multi-select)
        this.content.querySelectorAll('.lhub-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                chip.classList.toggle('lhub-chip-selected');
            });
        });

        // Hash copy
        this.content.querySelectorAll('.lhub-hash-copy').forEach(btn => {
            btn.addEventListener('click', () => {
                const hash = btn.dataset.fullHash;
                if (hash) {
                    navigator.clipboard?.writeText(hash).catch(() => {});
                    btn.textContent = t('hub.copied_check');
                    btn.classList.add('lhub-hash-copied');
                    setTimeout(() => {
                        btn.textContent = t('hub.copy');
                        btn.classList.remove('lhub-hash-copied');
                    }, 1000);
                }
            });
        });

        // Copy selected words
        this.content.querySelectorAll('[data-action="copy-selected-words"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const selected = [...this.content.querySelectorAll('.lhub-chip.lhub-chip-selected')].map(c => c.dataset.word).filter(Boolean);
                if (selected.length === 0) return;
                navigator.clipboard?.writeText(selected.join(' , ')).catch(() => {});
                const orig = btn.textContent;
                btn.textContent = t('hub.copied_check');
                setTimeout(() => { btn.textContent = orig; }, 1000);
            });
        });

        // Copy all words
        this.content.querySelectorAll('[data-action="copy-all-words"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const words = [...this.content.querySelectorAll('.lhub-chip')].map(c => c.dataset.word).filter(Boolean);
                if (words.length) {
                    navigator.clipboard?.writeText(words.join(' , ')).catch(() => {});
                    const orig = btn.textContent;
                    btn.textContent = t('hub.copied_check');
                    setTimeout(() => { btn.textContent = orig; }, 1000);
                }
            });
        });
    }

    _renderPromptGroupsHTML(groups) {
        if (!groups || groups.length === 0) {
            return `<div class="lhub-muted" style="padding:12px;">${t('hub.no_prompt_groups')}</div>`;
        }
        return groups.map(g => `
            <div class="lhub-prompt-group" data-group-name="${escapeAttr(g.name)}">
                <div class="lhub-pg-header">
                    <span class="lhub-pg-name">${escapeHtml(g.name)}</span>
                    <div class="lhub-pg-actions">
                        <button class="lhub-btn-icon-sm" data-action="delete-prompt-group" data-pg-name="${escapeAttr(g.name)}" title="${t('hub.delete_prompt_group')}">×</button>
                    </div>
                </div>
                <div class="lhub-pg-field">
                    <label class="lhub-pg-label">${t('hub.positive_prompt')}</label>
                    <textarea class="lhub-pg-textarea" data-action="update-prompt-positive" data-pg-name="${escapeAttr(g.name)}" rows="2" placeholder="${t('hub.comma_separated')}">${escapeHtml((g.prompts || []).join(', '))}</textarea>
                </div>
                <div class="lhub-pg-field">
                    <label class="lhub-pg-label">${t('hub.negative_prompt')}</label>
                    <textarea class="lhub-pg-textarea" data-action="update-prompt-negative" data-pg-name="${escapeAttr(g.name)}" rows="1" placeholder="${t('hub.optional')}">${escapeHtml(g.negative || '')}</textarea>
                </div>
                <button class="lhub-btn lhub-btn-sm lhub-mt-4" data-action="save-prompt-group" data-pg-name="${escapeAttr(g.name)}">${t('common.save')}</button>
            </div>
        `).join('');
    }

    async _selectGroup(groupName) {
        this.selectedGroup = groupName;
        this.selectedLora = null;

        // Highlight sidebar
        this.sidebar.querySelectorAll('.lhub-lora-item, .lhub-group-item').forEach(el => {
            el.classList.remove('lhub-selected');
        });
        this.sidebar.querySelector(`[data-group-name="${CSS.escape(groupName)}"]`)?.classList.add('lhub-selected');

        let group;
        try {
            group = await API.getGroup(groupName);
        } catch (e) {
            this.content.innerHTML = `<div class="lhub-welcome"><div class="lhub-welcome-desc">${t('hub.load_failed')}: ${escapeHtml(e.message)}</div></div>`;
            return;
        }

        const loras = group.loras || [];

        this.content.innerHTML = `
            <div class="lhub-detail">
                <div class="lhub-detail-header">
                    <div class="lhub-detail-title">${escapeHtml(group.label || groupName)}</div>
                    <div class="lhub-detail-path">${t('hub.lora_count', { count: loras.length })}</div>
                    <div class="lhub-detail-actions">
                        <button class="lhub-btn lhub-btn-sm" data-action="rename-group" data-gn="${escapeAttr(groupName)}">${t('hub.rename')}</button>
                        <button class="lhub-btn lhub-btn-sm lhub-btn-danger" data-action="delete-group" data-gn="${escapeAttr(groupName)}">${t('hub.delete_group')}</button>
                    </div>
                </div>

                <div class="lhub-lora-list-container">
                    <div class="lhub-group-lora-list" data-role="group-lora-list">
                        ${loras.length === 0 ? `<div class="lhub-muted" style="padding:20px;text-align:center;">${t('hub.no_lora_in_group')}</div>` : ''}
                    </div>
                </div>
            </div>
        `;

        if (loras.length > 0) {
            const listEl = this.content.querySelector('[data-role="group-lora-list"]');
            this._renderGroupLoraList(listEl, groupName, loras);
        }
    }

    _renderGroupLoraList(container, groupName, loras) {
        container.innerHTML = '';
        for (const lora of loras) {
            const name = lora.lora.split('/').pop().replace(/\.safetensors$/, '');
            const enabled = lora.enabled !== false;

            const item = document.createElement('div');
            item.className = 'lhub-gl-item' + (enabled ? '' : ' lhub-gl-disabled');
            item.dataset.loraName = lora.lora;
            item.draggable = true;

            item.innerHTML = `
                <div class="lhub-gl-drag" title="${t('hub.drag_sort')}">⠿</div>
                <div class="lhub-gl-toggle ${enabled ? 'lhub-on' : ''}" data-action="toggle-gp" data-gn="${escapeAttr(groupName)}" data-ln="${escapeAttr(lora.lora)}"></div>
                <div class="lhub-gl-name">${escapeHtml(name)}</div>
                <div class="lhub-gl-weights">
                    <div class="lhub-gl-w-group">
                        <span class="lhub-gl-w-label">${t('hub.model_weight')}</span>
                        <input class="lhub-gl-w-input" type="number" step="0.05" min="0" max="2"
                               value="${lora.weight}" data-field="weight" data-gn="${escapeAttr(groupName)}" data-ln="${escapeAttr(lora.lora)}" />
                    </div>
                    <div class="lhub-gl-w-group">
                        <span class="lhub-gl-w-label">${t('hub.clip_weight')}</span>
                        <input class="lhub-gl-w-input" type="number" step="0.05" min="0" max="2"
                               value="${lora.clip_weight}" data-field="clip_weight" data-gn="${escapeAttr(groupName)}" data-ln="${escapeAttr(lora.lora)}" />
                    </div>
                </div>
                <button class="lhub-gl-remove" data-action="remove-gp" data-gn="${escapeAttr(groupName)}" data-ln="${escapeAttr(lora.lora)}" title="${t('hub.remove')}">×</button>
            `;

            // Drag & drop
            item.addEventListener('dragstart', (e) => {
                item.classList.add('lhub-gl-dragging');
                e.dataTransfer.setData('text/plain', lora.lora);
            });
            item.addEventListener('dragend', () => {
                item.classList.remove('lhub-gl-dragging');
                container.querySelectorAll('.lhub-gl-drag-over').forEach(el => el.classList.remove('lhub-gl-drag-over'));
            });
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                item.classList.add('lhub-gl-drag-over');
            });
            item.addEventListener('dragleave', () => {
                item.classList.remove('lhub-gl-drag-over');
            });
            item.addEventListener('drop', async (e) => {
                e.preventDefault();
                item.classList.remove('lhub-gl-drag-over');
                const draggedName = e.dataTransfer.getData('text/plain');
                if (draggedName === lora.lora) return;

                const currentOrder = loras.map(l => l.lora);
                const fromIdx = currentOrder.indexOf(draggedName);
                const toIdx = currentOrder.indexOf(lora.lora);
                currentOrder.splice(fromIdx, 1);
                currentOrder.splice(toIdx, 0, draggedName);

                await API.reorderLoras(groupName, currentOrder);
                const updated = await API.getGroup(groupName);
                this._renderGroupLoraList(container, groupName, updated.loras || []);
            });

            container.appendChild(item);
        }
    }

    // ---------- Content 事件处理 ----------

    _handleContentClick(e) {
        const action = e.target.closest('[data-action]')?.dataset.action;
        if (!action) return;

        switch (action) {
            case 'add-prompt-group':
                this._addPromptGroup();
                break;
            case 'delete-prompt-group': {
                const pgName = e.target.dataset.pgName;
                this._deletePromptGroup(pgName);
                break;
            }
            case 'save-prompt-group': {
                const pgName = e.target.dataset.pgName;
                this._savePromptGroup(pgName);
                break;
            }
            case 'add-to-group': {
                const select = this.content.querySelector('[data-role="group-select"]');
                const groupName = select?.value;
                if (groupName && this.selectedLora) {
                    this._addLoraToGroup(groupName, this.selectedLora);
                }
                break;
            }
            case 'add-to-stack': {
                if (this.selectedLora && this.node) {
                    StackAPI.addLora(this.node.id, this.selectedLora);
                    if (_onRefreshStack) _onRefreshStack(this.node);
                    this._updateFooter();
                }
                break;
            }
            case 'rename-group': {
                const gn = e.target.dataset.gn;
                this._renameGroup(gn);
                break;
            }
            case 'delete-group': {
                const gn = e.target.dataset.gn;
                this._deleteGroup(gn);
                break;
            }
            case 'toggle-gp': {
                const gn = e.target.dataset.gn;
                const ln = e.target.dataset.ln;
                this._toggleGroupLora(gn, ln, e.target);
                break;
            }
            case 'remove-gp': {
                const gn = e.target.dataset.gn;
                const ln = e.target.dataset.ln;
                this._removeGroupLora(gn, ln);
                break;
            }
            case 'save-note': {
                this._saveNote();
                break;
            }
            case 'clear-note': {
                this._clearNote();
                break;
            }
        }
    }

    _handleContentChange(e) {
        // Group lora weight change
        if (e.target.classList.contains('lhub-gl-w-input')) {
            const gn = e.target.dataset.gn;
            const ln = e.target.dataset.ln;
            const field = e.target.dataset.field;
            const val = Math.max(0, Math.min(2, parseFloat(e.target.value) || 0));
            e.target.value = val;
            API.updateLoraInGroup(gn, ln, { [field]: val });
        }
    }

    _handleContentInput(e) {
        // Handled on change for prompt textareas
    }

    // ---------- Prompt 组操作 ----------

    async _addPromptGroup() {
        if (!this.selectedLora) return;
        const name = prompt(t('hub.prompt_group_name'));
        if (!name || !name.trim()) return;

        try {
            await API.addLoraPromptGroup(this.selectedLora, name.trim(), [], '');
            this._selectLora(this.selectedLora); // Refresh
        } catch (e) {
            alert(t('hub.create_failed', { error: e.message }));
        }
    }

    async _deletePromptGroup(pgName) {
        if (!this.selectedLora) return;
        if (!confirm(t('hub.confirm_delete_pg', { name: pgName }))) return;

        try {
            await API.deleteLoraPromptGroup(this.selectedLora, pgName);
            this._selectLora(this.selectedLora); // Refresh
        } catch (e) {
            alert(t('hub.delete_failed', { error: e.message }));
        }
    }

    async _savePromptGroup(pgName) {
        if (!this.selectedLora) return;

        const textareaPos = this.content.querySelector(`textarea[data-action="update-prompt-positive"][data-pg-name="${CSS.escape(pgName)}"]`);
        const textareaNeg = this.content.querySelector(`textarea[data-action="update-prompt-negative"][data-pg-name="${CSS.escape(pgName)}"]`);

        const prompts = textareaPos ? textareaPos.value.split(',').map(p => p.trim()).filter(Boolean) : [];
        const negative = textareaNeg ? textareaNeg.value.trim() : '';

        try {
            await API.updateLoraPromptGroup(this.selectedLora, pgName, { prompts, negative });
            // Flash success
            const btn = this.content.querySelector(`button[data-action="save-prompt-group"][data-pg-name="${CSS.escape(pgName)}"]`);
            if (btn) {
                const orig = btn.textContent;
                btn.textContent = t('hub.saved');
                btn.style.background = '#00cd72';
                btn.style.borderColor = '#00cd72';
                setTimeout(() => {
                    btn.textContent = orig;
                    btn.style.background = '';
                    btn.style.borderColor = '';
                }, 1200);
            }
        } catch (e) {
            alert(t('hub.save_failed', { error: e.message }));
        }
    }

    // ---------- 群组操作 ----------

    async _addLoraToGroup(groupName, loraPath) {
        try {
            await API.addLoraToGroup(groupName, loraPath);
            this._selectLora(loraPath); // Refresh membership
        } catch (e) {
            if (e.message.includes('已在群组中')) {
                alert(t('hub.already_in_group_desc'));
            } else {
                alert(t('hub.add_failed', { error: e.message }));
            }
        }
    }

    async _createGroup() {
        const name = prompt(t('hub.input_group_name'));
        if (!name || !name.trim()) return;

        try {
            await API.createGroup(name.trim());
            this._renderSidebarList();
            this._selectGroup(name.trim());
        } catch (e) {
            alert(t('hub.create_failed', { error: e.message }));
        }
    }

    async _renameGroup(oldName) {
        const newName = prompt(t('hub.rename_group', { name: oldName }), oldName);
        if (!newName || !newName.trim() || newName === oldName) return;

        try {
            await API.renameGroup(oldName, newName.trim());
            this._renderSidebarList();
            this._selectGroup(newName.trim());
        } catch (e) {
            alert(t('hub.rename_failed', { error: e.message }));
        }
    }

    async _deleteGroup(groupName) {
        if (!confirm(t('hub.confirm_delete_group', { name: groupName }))) return;

        try {
            await API.deleteGroup(groupName);
            this.selectedGroup = null;
            this._renderSidebarList();
            this._renderWelcome();
        } catch (e) {
            alert(t('hub.delete_group_failed', { error: e.message }));
        }
    }

    async _toggleGroupLora(groupName, loraName, el) {
        try {
            const group = await API.getGroup(groupName);
            const lora = group.loras?.find(l => l.lora === loraName);
            if (!lora) return;
            const newState = !(lora.enabled !== false);
            await API.updateLoraInGroup(groupName, loraName, { enabled: newState });
            this._selectGroup(groupName); // Refresh
        } catch (e) {
            console.error('[Hub] toggle failed:', e);
        }
    }

    async _removeGroupLora(groupName, loraName) {
        try {
            await API.removeLoraFromGroup(groupName, loraName);
            this._selectGroup(groupName); // Refresh
        } catch (e) {
            console.error('[Hub] remove failed:', e);
        }
    }

    async _exportGroups() {
        try {
            const groups = await API.getGroups();
            const fullGroups = {};
            for (const name of Object.keys(groups)) {
                fullGroups[name] = await API.getGroup(name);
            }
            const blob = new Blob([JSON.stringify(fullGroups, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'lora_groups_export.json';
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            alert(t('hub.export_failed', { error: e.message }));
        }
    }

    // ---------- 备注管理 ----------

    async _saveNote() {
        if (!this.selectedLora || !this.node) return;

        const input = this.content.querySelector('[data-role="note-input"]');
        if (!input) return;

        const note = input.value.trim();

        // 找到栈中的lora条目
        const stack = StackAPI.getStack(this.node.id);
        const loraItem = stack.items.find(i => i.type === 'lora' && i.lora === this.selectedLora);

        if (loraItem) {
            // 更新已有条目的备注
            StackAPI.updateNote(this.node.id, loraItem.id, note);
        } else {
            // 如果lora不在栈中，先添加到栈中再设置备注
            const added = StackAPI.addLora(this.node.id, this.selectedLora);
            if (added) {
                const newStack = StackAPI.getStack(this.node.id);
                const newItem = newStack.items[newStack.items.length - 1];
                StackAPI.updateNote(this.node.id, newItem.id, note);
            }
        }

        // 刷新画布
        if (_onRefreshStack) _onRefreshStack(this.node);

        // 显示保存成功反馈
        const btn = this.content.querySelector('[data-action="save-note"]');
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = t('hub.saved');
            btn.style.background = '#00cd72';
            btn.style.borderColor = '#00cd72';
            setTimeout(() => {
                btn.textContent = orig;
                btn.style.background = '';
                btn.style.borderColor = '';
            }, 1200);
        }

        // 刷新侧栏显示
        this._renderSidebarList();
    }

    async _clearNote() {
        if (!this.selectedLora || !this.node) return;

        const input = this.content.querySelector('[data-role="note-input"]');
        if (!input) return;

        input.value = '';

        // 找到栈中的lora条目
        const stack = StackAPI.getStack(this.node.id);
        const loraItem = stack.items.find(i => i.type === 'lora' && i.lora === this.selectedLora);

        if (loraItem) {
            StackAPI.updateNote(this.node.id, loraItem.id, '');
        }

        // 刷新画布
        if (_onRefreshStack) _onRefreshStack(this.node);

        // 刷新侧栏显示
        this._renderSidebarList();
    }

    // ---------- Footer ----------

    _updateFooter() {
        if (!this.node) return;
        const stack = StackAPI.getStack(this.node.id);
        const footerEl = this.backdrop.querySelector('[data-role="footer-stack"]');
        if (footerEl) footerEl.textContent = t('hub.stack_count', { count: stack.items.length });
    }

    // ---------- 关闭 ----------

    close() {
        this.backdrop.remove();
        document.removeEventListener('keydown', this._escHandler);
        // Refresh canvas widget if we have a node
        if (this.node && _onRefreshStack) {
            _onRefreshStack(this.node);
        }
        _hubInstance = null;
    }
}

// ==================== 工具函数 ====================

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
}

function escapeAttr(str) {
    return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
