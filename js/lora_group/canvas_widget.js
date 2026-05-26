/**
 * LoRA Stack — 内联画布 Widget
 * 在 LiteGraph 节点上渲染紧凑的 LoRA 栈，支持个体 LoRA + 群组引用混合排列
 * 添加「模型权重」「CLIP权重」标签 + LoRA Hub 入口按钮
 */

import * as StackAPI from './stack_api.js';
import * as GroupAPI from './api.js';
import { openHubPanel, setHubRefreshCallback } from './hub_panel.js';
import { t } from '../i18n.js';

const NODE_WIDTH = 320;

// 注册栈刷新回调（避免循环依赖）
setHubRefreshCallback((node) => renderStack(node));

/**
 * 初始化节点画布 Widget
 */
export function initCanvasWidget(node) {
    node.serialize_widgets = true;
    node._loraStackEl = null;

    // 隐藏 lora_stack_data 数据 widget（保留序列化能力）
    // 注意：不能改 type 为 'converted-widget'，否则 LiteGraph configure() 会跳过该 widget 的值恢复
    const hiddenW = node.widgets?.find(w => w.name === 'lora_stack_data');
    if (hiddenW) {
        hiddenW.origComputeSize = hiddenW.computeSize;
        hiddenW.computeSize = () => [0, -4];
        hiddenW.serializeValue = () => hiddenW.value;
        if (hiddenW.element) {
            hiddenW.element.style.display = 'none';
        }
    }
    // 标记节点尚未完成 configure 恢复（防止 renderStack 在恢复前覆盖 widget）
    node._loraConfigured = false;
    // 新建节点不会触发 onConfigure，用延迟兜底解锁 syncToWidget
    setTimeout(() => {
        if (node._loraConfigured === false) node._loraConfigured = true;
    }, 500);

    // 创建内联 LoRA 栈 DOM widget
    createStackWidget(node);

    // Hub 打开回调
    node._lgmOpenPanel = () => openHubPanel(node);

    // 初始渲染
    renderStack(node);
}

/**
 * 创建栈 DOM widget
 */
function createStackWidget(node) {
    const el = document.createElement('div');
    el.className = 'lsw-root';
    el.innerHTML = `
        <div class="lsw-header" data-role="header">
            <div class="lsw-header-left">
                <span class="lsw-title">${t('hub.lora_stack')}</span>
                <span class="lsw-count" data-role="count">0</span>
            </div>
            <div class="lsw-header-right">
                <button class="lsw-header-btn" data-action="add-lora" title="${t('canvas.add_lora_title')}">+</button>
                <button class="lsw-header-btn" data-action="add-group" title="${t('canvas.add_group_title')}">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="1" y="1" width="6" height="6" rx="1"/>
                        <rect x="9" y="1" width="6" height="6" rx="1"/>
                        <rect x="1" y="9" width="6" height="6" rx="1"/>
                        <rect x="9" y="9" width="6" height="6" rx="1"/>
                    </svg>
                </button>
                <button class="lsw-hub-btn" data-action="open-hub" title="${t('canvas.open_hub_title')}">⚙ Hub</button>
            </div>
        </div>
        <div class="lsw-stack" data-role="stack"></div>
        <div class="lsw-empty" data-role="empty">
            <span class="lsw-empty-text">${t('hub.click_to_add')}</span>
        </div>
    `;

    // 阻止事件穿透到 LiteGraph
    for (const evt of ['mousedown', 'mouseup', 'click', 'pointerdown', 'pointerup']) {
        el.addEventListener(evt, e => e.stopPropagation());
    }

    // 事件委托
    el.addEventListener('click', handleStackClick(node));
    el.addEventListener('dblclick', handleStackDblClick(node));
    el.addEventListener('input', handleStackInput(node));
    el.addEventListener('change', handleStackChange(node));

    // 添加 LoRA 按钮
    el.querySelector('[data-action="add-lora"]').addEventListener('click', (e) => {
        e.stopPropagation();
        showAddLoraMenu(node, e.currentTarget);
    });

    // 添加群组按钮
    el.querySelector('[data-action="add-group"]').addEventListener('click', (e) => {
        e.stopPropagation();
        showAddGroupMenu(node, e.currentTarget);
    });

    // Hub 按钮
    el.querySelector('[data-action="open-hub"]').addEventListener('click', (e) => {
        e.stopPropagation();
        openHubPanel(node);
    });

    const widget = node.addDOMWidget('lora_stack_ui', 'div', el, {
        serialize: false,
    });
    widget._lswType = 'stack';

    node._loraStackEl = el;

    // 设置节点最小宽度
    const origResize = node.onResize;
    node.onResize = function () {
        let [w, h] = this.size;
        if (w < NODE_WIDTH) w = NODE_WIDTH;
        this.size = [w, h];
        if (origResize) origResize.apply(this, arguments);
    };
}

/**
 * 渲染整个栈
 */
export function renderStack(node) {
    const el = node._loraStackEl;
    if (!el) return;

    const stack = StackAPI.getStack(node.id);
    const stackEl = el.querySelector('[data-role="stack"]');
    const emptyEl = el.querySelector('[data-role="empty"]');
    const countEl = el.querySelector('[data-role="count"]');

    const items = stack.items;
    countEl.textContent = items.length;

    if (items.length === 0) {
        stackEl.innerHTML = '';
        emptyEl.style.display = '';
        syncToWidget(node);
        return;
    }

    emptyEl.style.display = 'none';
    stackEl.innerHTML = '';

    items.forEach((item, idx) => {
        const row = createItemRow(item, idx, node);
        stackEl.appendChild(row);
    });

    // Drag & drop
    setupDragDrop(stackEl, node);
    syncToWidget(node);
}

/**
 * 创建单个栈条目行
 */
function createItemRow(item, idx, node) {
    const row = document.createElement('div');
    row.className = 'lsw-item' + (item.enabled ? '' : ' lsw-disabled');
    row.dataset.id = item.id;
    row.dataset.idx = idx;
    row.draggable = true;

    if (item.type === 'group') {
        row.innerHTML = createGroupRowHTML(item, idx);
    } else {
        row.innerHTML = createLoraRowHTML(item, idx);
    }

    return row;
}

function createLoraRowHTML(item, idx) {
    const name = item.lora.split('/').pop().replace(/\.safetensors$/, '');
    const safeName = escapeAttr(name);
    const selGroup = item.selected_group || '';
    const groupLabel = selGroup === '__none__' ? t('canvas.none') : (selGroup ? escapeHtml(selGroup) : t('canvas.all'));
    return `
        <div class="lsw-grip" draggable="true" title="${t('hub.drag_sort')}">⠿</div>
        <div class="lsw-toggle ${item.enabled ? 'on' : ''}" data-action="toggle" title="${item.enabled ? t('hub.disable') : t('hub.enable')}"></div>
        <div class="lsw-info">
            <div class="lsw-name" title="${safeName}">${escapeHtml(name)}</div>
            <div class="lsw-prompt-sel" data-action="select-group" data-idx="${idx}" title="${t('hub.select_prompt_group')}">
                <span class="lsw-prompt-sel-label">${groupLabel}</span>
                <span class="lsw-prompt-sel-arrow">▾</span>
            </div>
        </div>
        <div class="lsw-weights">
            <div class="lsw-w-group">
                <span class="lsw-w-label">${t('hub.field_model')}</span>
                <div class="lsw-w-arrows">
                    <button class="lsw-w-arrow" data-action="w-up" data-field="weight" data-idx="${idx}" title="+0.05">▲</button>
                    <input class="lsw-w" type="number" step="0.05" min="0" max="2"
                           value="${item.weight}" data-field="weight" data-idx="${idx}" title="${t('hub.model_weight')}" />
                    <button class="lsw-w-arrow" data-action="w-down" data-field="weight" data-idx="${idx}" title="-0.05">▼</button>
                </div>
            </div>
            <div class="lsw-w-group">
                <span class="lsw-w-label">CLIP</span>
                <div class="lsw-w-arrows">
                    <button class="lsw-w-arrow" data-action="w-up" data-field="clip_weight" data-idx="${idx}" title="+0.05">▲</button>
                    <input class="lsw-w" type="number" step="0.05" min="0" max="2"
                           value="${item.clip_weight}" data-field="clip_weight" data-idx="${idx}" title="${t('hub.clip_weight')}" />
                    <button class="lsw-w-arrow" data-action="w-down" data-field="clip_weight" data-idx="${idx}" title="-0.05">▼</button>
                </div>
            </div>
        </div>
        <button class="lsw-edit-btn" data-action="edit-prompt" data-lora="${escapeAttr(item.lora)}" title="${t('hub.open_hub')}">✎</button>
        <button class="lsw-remove" data-action="remove" title="${t('hub.remove')}">×</button>
    `;
}

function createGroupRowHTML(item, idx) {
    const safeName = escapeAttr(item.group_name);
    return `
        <div class="lsw-grip" draggable="true" title="${t('hub.drag_sort')}">⠿</div>
        <div class="lsw-toggle ${item.enabled ? 'on' : ''}" data-action="toggle" title="${item.enabled ? t('hub.disable') : t('hub.enable')}"></div>
        <div class="lsw-group-badge" title="${t('hub.group_ref')} ${safeName}">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                <rect x="1" y="1" width="6" height="6" rx="1"/>
                <rect x="9" y="1" width="6" height="6" rx="1"/>
                <rect x="1" y="9" width="6" height="6" rx="1"/>
                <rect x="9" y="9" width="6" height="6" rx="1"/>
            </svg>
        </div>
        <div class="lsw-name lsw-group-name">${escapeHtml(item.group_name)}</div>
        <div class="lsw-weights">
            <div class="lsw-w-group">
                <span class="lsw-w-label">${t('hub.field_model')}</span>
                <div class="lsw-w-arrows">
                    <button class="lsw-w-arrow" data-action="w-up" data-field="weight" data-idx="${idx}" title="+0.05">▲</button>
                    <input class="lsw-w" type="number" step="0.05" min="0" max="2"
                           value="${item.weight}" data-field="weight" data-idx="${idx}" title="${t('hub.model_weight')}" />
                    <button class="lsw-w-arrow" data-action="w-down" data-field="weight" data-idx="${idx}" title="-0.05">▼</button>
                </div>
            </div>
            <div class="lsw-w-group">
                <span class="lsw-w-label">CLIP</span>
                <div class="lsw-w-arrows">
                    <button class="lsw-w-arrow" data-action="w-up" data-field="clip_weight" data-idx="${idx}" title="+0.05">▲</button>
                    <input class="lsw-w" type="number" step="0.05" min="0" max="2"
                           value="${item.clip_weight}" data-field="clip_weight" data-idx="${idx}" title="${t('hub.clip_weight')}" />
                    <button class="lsw-w-arrow" data-action="w-down" data-field="clip_weight" data-idx="${idx}" title="-0.05">▼</button>
                </div>
            </div>
        </div>
        <button class="lsw-remove" data-action="remove" title="${t('hub.remove')}">×</button>
    `;
}

/**
 * 事件处理：click（toggle / remove / edit-prompt / open-hub）
 */
function handleStackClick(node) {
    return (e) => {
        const actionEl = e.target.closest('[data-action]');
        const action = actionEl?.dataset.action;
        const row = e.target.closest('.lsw-item');
        if (!row) return;

        const itemId = row.dataset.id;

        if (action === 'toggle') {
            const newState = StackAPI.toggleEnabled(node.id, itemId);
            if (newState !== null) {
                actionEl.classList.toggle('on', newState);
                row.classList.toggle('lsw-disabled', !newState);
                syncToWidget(node);
            }
        } else if (action === 'w-up' || action === 'w-down') {
            // Weight arrow buttons
            e.stopPropagation();
            const field = actionEl.dataset.field;
            const idx = parseInt(actionEl.dataset.idx);
            const input = row.querySelector(`.lsw-w[data-field="${field}"][data-idx="${idx}"]`);
            if (input) {
                let val = parseFloat(input.value) || 0;
                val += action === 'w-up' ? 0.05 : -0.05;
                val = Math.max(0, Math.min(2, Math.round(val * 100) / 100));
                input.value = val;
                const stack = StackAPI.getStack(node.id);
                if (stack.items[idx]) {
                    stack.items[idx][field] = val;
                    syncToWidget(node);
                }
            }
        } else if (action === 'select-group') {
            // Prompt group selector
            e.stopPropagation();
            const promptSel = actionEl.closest('.lsw-prompt-sel');
            const idx = parseInt(promptSel.dataset.idx);
            showPromptGroupMenu(node, idx, itemId, promptSel);
        } else if (action === 'remove') {
            row.style.transform = 'translateX(100%)';
            row.style.opacity = '0';
            row.style.transition = 'all 0.15s ease';
            setTimeout(() => {
                StackAPI.removeItem(node.id, itemId);
                renderStack(node);
            }, 150);
        } else if (action === 'edit-prompt') {
            e.stopPropagation();
            const loraPath = actionEl.dataset.lora;
            openHubPanel(node, { targetLora: loraPath });
        }
    };
}

/**
 * 事件处理：双击 prompt 选择器复制 prompt 到剪切板
 */
function handleStackDblClick(node) {
    return async (e) => {
        const promptSel = e.target.closest('.lsw-prompt-sel');
        if (!promptSel) return;

        e.stopPropagation();
        e.preventDefault();

        const idx = parseInt(promptSel.dataset.idx);
        const stack = StackAPI.getStack(node.id);
        const item = stack.items[idx];
        if (!item || item.type !== 'lora') return;

        const selGroup = item.selected_group;
        if (selGroup === '__none__') return;

        try {
            const data = await GroupAPI.getLoraPrompts(item.lora);
            const groups = data.groups || [];
            let text = '';

            if (!selGroup) {
                // "全部" — merge all groups' prompts
                const allPrompts = [];
                for (const g of groups) {
                    for (const p of (g.prompts || [])) {
                        if (p && !allPrompts.includes(p)) allPrompts.push(p);
                    }
                }
                text = allPrompts.join(', ');
            } else {
                const group = groups.find(g => g.name === selGroup);
                if (group && group.prompts) {
                    text = group.prompts.join(', ');
                }
            }

            if (!text) return;

            await navigator.clipboard.writeText(text);

            // Visual feedback
            const labelEl = promptSel.querySelector('.lsw-prompt-sel-label');
            if (labelEl) {
                const orig = labelEl.textContent;
                labelEl.textContent = t('hub.copied');
                labelEl.style.color = '#00cd72';
                setTimeout(() => {
                    labelEl.textContent = orig;
                    labelEl.style.color = '';
                }, 1000);
            }
        } catch (err) {
            console.error('[PromptCraft] 复制失败:', err);
        }
    };
}

/**
 * 事件处理：input（权重实时更新）
 */
function handleStackInput(node) {
    return (e) => {
        const input = e.target.closest('.lsw-w');
        if (!input) return;

        const idx = parseInt(input.dataset.idx);
        const field = input.dataset.field;
        const val = parseFloat(input.value) || 0;

        const stack = StackAPI.getStack(node.id);
        if (stack.items[idx]) {
            stack.items[idx][field] = val;
            syncToWidget(node);
        }
    };
}

/**
 * 事件处理：change（权重 clamp）
 */
function handleStackChange(node) {
    return (e) => {
        const input = e.target.closest('.lsw-w');
        if (!input) return;

        let val = parseFloat(input.value) || 0;
        val = Math.max(0, Math.min(2, val));
        input.value = val;
    };
}

/**
 * Drag & drop 重排序
 */
function setupDragDrop(container, node) {
    let dragIdx = null;

    container.addEventListener('dragstart', (e) => {
        const row = e.target.closest('.lsw-item');
        if (!row) return;
        dragIdx = parseInt(row.dataset.idx);
        row.classList.add('lsw-dragging');
        e.dataTransfer.effectAllowed = 'move';
    });

    container.addEventListener('dragend', (e) => {
        container.querySelectorAll('.lsw-dragging, .lsw-drag-over').forEach(el => {
            el.classList.remove('lsw-dragging', 'lsw-drag-over');
        });
        dragIdx = null;
    });

    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const row = e.target.closest('.lsw-item');
        if (row && parseInt(row.dataset.idx) !== dragIdx) {
            container.querySelectorAll('.lsw-drag-over').forEach(el => el.classList.remove('lsw-drag-over'));
            row.classList.add('lsw-drag-over');
        }
    });

    container.addEventListener('dragleave', (e) => {
        const row = e.target.closest('.lsw-item');
        if (row) row.classList.remove('lsw-drag-over');
    });

    container.addEventListener('drop', (e) => {
        e.preventDefault();
        const row = e.target.closest('.lsw-item');
        if (!row || dragIdx === null) return;

        const toIdx = parseInt(row.dataset.idx);
        if (dragIdx !== toIdx) {
            StackAPI.reorder(node.id, dragIdx, toIdx);
            renderStack(node);
        }

        container.querySelectorAll('.lsw-drag-over').forEach(el => el.classList.remove('lsw-drag-over'));
    });
}

/**
 * 显示添加 LoRA 菜单（搜索 + 浏览）
 */
async function showAddLoraMenu(node, anchorBtn) {
    document.querySelector('.lsw-dropdown')?.remove();

    const menu = document.createElement('div');
    menu.className = 'lsw-dropdown';
    menu.innerHTML = `
        <div class="lsw-dropdown-search">
            <input class="lsw-dropdown-input" placeholder="${t('canvas.search_lora')}" data-role="search" />
        </div>
        <div class="lsw-dropdown-list" data-role="list">
            <div class="lsw-dropdown-loading">${t('common.loading')}</div>
        </div>
    `;

    const rect = anchorBtn.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 4}px`;
    menu.style.left = `${rect.left}px`;
    menu.style.zIndex = '10001';

    document.body.appendChild(menu);
    menu.addEventListener('mousedown', e => e.stopPropagation());
    menu.addEventListener('click', e => e.stopPropagation());

    let allLoras = [];
    let favorites = [];
    try {
        [allLoras, favorites] = await Promise.all([
            GroupAPI.getLoraList(),
            GroupAPI.getLoraFavorites().catch(() => []),
        ]);
    } catch {
        menu.querySelector('[data-role="list"]').innerHTML =
            `<div class="lsw-dropdown-loading" style="color:#ff4444;">${t('hub.load_failed')}</div>`;
        return;
    }
    const favSet = new Set(favorites);

    function renderList(files) {
        const listEl = menu.querySelector('[data-role="list"]');
        listEl.innerHTML = '';

        // Sort: favorites first (alphabetical), then rest (alphabetical)
        const favFiles = files.filter(f => favSet.has(f)).sort();
        const nonFavFiles = files.filter(f => !favSet.has(f)).sort();
        const sorted = [...favFiles, ...nonFavFiles];
        const shown = sorted.slice(0, 50);

        if (favFiles.length > 0 && !menu.querySelector('[data-role="search"]').value.trim()) {
            const header = document.createElement('div');
            header.className = 'lsw-dropdown-header';
            header.innerHTML = `<span style="color:#c8842a;font-size:11px;font-weight:600;">★ ${t('canvas.favorites')}</span>`;
            listEl.appendChild(header);
        }

        let favSectionDone = false;
        for (const file of shown) {
            const isFav = favSet.has(file);
            // Insert separator between favorites and non-favorites
            if (!isFav && !favSectionDone && favFiles.length > 0) {
                favSectionDone = true;
                const sep = document.createElement('div');
                sep.className = 'lsw-dropdown-header';
                sep.innerHTML = `<span style="color:#999;font-size:11px;">${t('canvas.all_lora')}</span>`;
                listEl.appendChild(sep);
            }

            const name = file.split('/').pop().replace(/\.safetensors$/, '');
            const item = document.createElement('div');
            item.className = 'lsw-dropdown-item' + (isFav ? ' lsw-dropdown-item-fav' : '');
            item.style.cssText = 'display:flex; align-items:center; gap:6px;';

            const starBtn = document.createElement('span');
            starBtn.className = 'lsw-fav-star' + (isFav ? ' lsw-fav-active' : '');
            starBtn.textContent = isFav ? '★' : '☆';
            starBtn.title = isFav ? t('hub.unfavorite') : t('hub.favorite');
            starBtn.style.cssText = 'cursor:pointer; font-size:13px; color:' + (isFav ? '#c8842a' : '#ccc') + '; flex-shrink:0; width:16px; text-align:center;';
            starBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                try {
                    const res = await GroupAPI.toggleLoraFavorite(file);
                    if (res.favorited) {
                        favSet.add(file);
                        starBtn.textContent = '★';
                        starBtn.style.color = '#c8842a';
                    } else {
                        favSet.delete(file);
                        starBtn.textContent = '☆';
                        starBtn.style.color = '#ccc';
                    }
                } catch {}
            });

            const nameSpan = document.createElement('span');
            nameSpan.style.cssText = 'flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;';
            nameSpan.textContent = name;
            nameSpan.title = file;

            item.appendChild(starBtn);
            item.appendChild(nameSpan);
            item.addEventListener('click', () => {
                if (StackAPI.addLora(node.id, file)) {
                    renderStack(node);
                }
                menu.remove();
            });
            listEl.appendChild(item);
        }
        if (shown.length === 0) {
            listEl.innerHTML = `<div class="lsw-dropdown-loading">${t('canvas.no_match')}</div>`;
        }
    }

    renderList(allLoras);

    menu.querySelector('[data-role="search"]').addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        renderList(q ? allLoras.filter(f => f.toLowerCase().includes(q)) : allLoras);
    });

    setTimeout(() => menu.querySelector('[data-role="search"]').focus(), 50);

    const closeHandler = (e) => {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('mousedown', closeHandler);
        }
    };
    setTimeout(() => document.addEventListener('mousedown', closeHandler), 100);
}

/**
 * 显示添加群组菜单
 */
async function showAddGroupMenu(node, anchorBtn) {
    document.querySelector('.lsw-dropdown')?.remove();

    const groups = await StackAPI.getAvailableGroups();
    const entries = Object.entries(groups);

    const menu = document.createElement('div');
    menu.className = 'lsw-dropdown';
    menu.innerHTML = `
        <div class="lsw-dropdown-header">
            <span>${t('canvas.group_ref')}</span>
            <button class="lsw-dropdown-manage" data-action="manage">${t('canvas.open_hub')}</button>
        </div>
        <div class="lsw-dropdown-list" data-role="list"></div>
    `;

    const rect = anchorBtn.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 4}px`;
    menu.style.left = `${rect.left}px`;
    menu.style.zIndex = '10001';

    document.body.appendChild(menu);
    menu.addEventListener('mousedown', e => e.stopPropagation());

    const listEl = menu.querySelector('[data-role="list"]');

    if (entries.length === 0) {
        listEl.innerHTML = `<div class="lsw-dropdown-loading">${t('canvas.no_groups')}<br><span style="font-size:10px;color:#777;">${t('canvas.create_in_hub')}</span></div>`;
    } else {
        for (const [name, info] of entries) {
            const item = document.createElement('div');
            item.className = 'lsw-dropdown-item lsw-dropdown-group';
            item.innerHTML = `
                <span class="lsw-dropdown-group-icon">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="1" y="1" width="6" height="6" rx="1"/>
                        <rect x="9" y="1" width="6" height="6" rx="1"/>
                        <rect x="1" y="9" width="6" height="6" rx="1"/>
                        <rect x="9" y="9" width="6" height="6" rx="1"/>
                    </svg>
                </span>
                <span style="flex:1;">${escapeHtml(name)}</span>
                <span style="font-size:10px;color:#777;">${info.count || 0}</span>
            `;
            item.addEventListener('click', () => {
                if (StackAPI.addGroup(node.id, name)) {
                    renderStack(node);
                }
                menu.remove();
            });
            listEl.appendChild(item);
        }
    }

    menu.querySelector('[data-action="manage"]').addEventListener('click', () => {
        menu.remove();
        openHubPanel(node);
    });

    const closeHandler = (e) => {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('mousedown', closeHandler);
        }
    };
    setTimeout(() => document.addEventListener('mousedown', closeHandler), 100);
}

/**
 * 显示 Prompt 组选择菜单
 */
async function showPromptGroupMenu(node, idx, itemId, anchorEl) {
    document.querySelector('.lsw-dropdown')?.remove();

    const stack = StackAPI.getStack(node.id);
    const item = stack.items[idx];
    if (!item || item.type !== 'lora') return;

    const menu = document.createElement('div');
    menu.className = 'lsw-dropdown';
    menu.innerHTML = `<div class="lsw-dropdown-loading">${t('common.loading')}</div>`;

    const rect = anchorEl.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 2}px`;
    menu.style.left = `${rect.left}px`;
    menu.style.zIndex = '10001';

    document.body.appendChild(menu);
    menu.addEventListener('mousedown', e => e.stopPropagation());
    menu.addEventListener('click', e => e.stopPropagation());

    // Fetch available groups for this lora
    let groups = [];
    try {
        const data = await GroupAPI.getLoraPrompts(item.lora);
        groups = data.groups || [];
    } catch {
        groups = [];
    }

    const currentSel = item.selected_group || '';
    let html = '<div class="lsw-dropdown-list">';

    // "All" option
    html += `<div class="lsw-dropdown-item ${!currentSel ? 'lsw-dropdown-item-active' : ''}" data-group="">${t('canvas.all_groups')}</div>`;

    // "None" option — load LoRA weight but inject no prompts
    html += `<div class="lsw-dropdown-item lsw-dropdown-item-none ${currentSel === '__none__' ? 'lsw-dropdown-item-active' : ''}" data-group="__none__">${t('canvas.no_inject')}</div>`;

    for (const g of groups) {
        const active = g.name === currentSel ? 'lsw-dropdown-item-active' : '';
        html += `<div class="lsw-dropdown-item ${active}" data-group="${escapeAttr(g.name)}">${escapeHtml(g.name)} <span style="color:#777;font-size:10px;">(${(g.prompts || []).length})</span></div>`;
    }

    if (groups.length === 0) {
        html += `<div class="lsw-dropdown-loading" style="padding:8px;">${t('canvas.no_prompt_group')}<br><span style="font-size:10px;color:#777;">${t('canvas.create_hint')}</span></div>`;
    }

    html += '</div>';
    menu.innerHTML = html;

    menu.addEventListener('click', (e) => {
        const groupItem = e.target.closest('[data-group]');
        if (!groupItem) return;
        const groupName = groupItem.dataset.group || null;
        StackAPI.setSelectedGroup(node.id, itemId, groupName);
        syncToWidget(node);
        // Update the label in the row
        const labelEl = anchorEl.querySelector('.lsw-prompt-sel-label');
        if (labelEl) {
            labelEl.textContent = groupName === '__none__' ? t('canvas.none') : (groupName || t('canvas.all'));
        }
        menu.remove();
    });

    const closeHandler = (e) => {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('mousedown', closeHandler);
        }
    };
    setTimeout(() => document.addEventListener('mousedown', closeHandler), 100);
}

/**
 * 同步栈数据到隐藏 widget
 */
function syncToWidget(node) {
    // 在 configure 恢复完成前，不要覆盖 widget 值（防止丢失已保存的工作流数据）
    if (node._loraConfigured === false) return;
    const widget = node.widgets?.find(w => w.name === 'lora_stack_data');
    if (widget) {
        widget.value = StackAPI.serialize(node.id);
    }
}

/**
 * 外部刷新入口
 */
export function refreshGroupStatus(node) {
    renderStack(node);
}

// ==================== 工具函数 ====================

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
