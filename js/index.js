/**
 * PromptCraft — LiteGraph 生命周期钩子方案
 *
 * 功能:
 *   🤖 语言大模型接入（API 配置 / 提示词规则）
 *   📝 规则管理器（基础扩写 / 详细扩写）- 按钮触发
 *   📚 Prompt 库编辑器（双库管理）- 按钮触发
 *   🔄 缓存管理 - 按钮触发
 *   🎛️ 节点内「特殊内容」开关 → 动态过滤组合框选项（LiteGraph widget 操作）
 */

import { app } from '../../../scripts/app.js';
import { api } from '../../../scripts/api.js';

// LoRA Group Manager 模块
import './lora_group/index.js';

// LoRA Prompt Loader 模块
import './lora_prompt_loader/index.js';

// AI Agent 聊天面板模块
import './chat_panel.js';

// 多服务 API 配置面板
import { openServiceConfigModal } from './lora_group/service_config.js';

// 设置面板内容生成器
import { createSettingsContent } from './control_panel.js';

const API_PREFIX = '/moton_prompt_enhancer/api';
const PREFIX = '[PromptCraft]';
const VERSION = '1.2.1 Mod3';

// ==================== 工具函数 ====================

function log(msg, data) {
    if (data !== undefined) {
        console.log(`${PREFIX} ${msg}`, data);
    } else {
        console.log(`${PREFIX} ${msg}`);
    }
}

async function request(method, endpoint, body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    try {
        const res = await api.fetchApi(`${API_PREFIX}${endpoint}`, options);
        const json = await res.json();
        return json;
    } catch (err) {
        log(`请求失败 ${endpoint}:`, err);
        return { success: false, error: err.message };
    }
}

function escHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

// ==================== 负面 Prompt 编辑器 ====================

function openNegativePromptEditor() {
    const existing = document.getElementById('moton-pe-negative-editor');
    if (existing) existing.remove();

    const dialog = document.createElement('div');
    dialog.id = 'moton-pe-negative-editor';
    dialog.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); z-index: 99999;
        display: flex; align-items: center; justify-content: center;
    `;

    dialog.innerHTML = `
        <div style="
            background: #ffffff; border: 1px solid #e0e0e0; border-radius: 14px;
            padding: 24px; width: 94%; max-width: 900px; max-height: 90vh;
            display: flex; flex-direction: column;
            color: #333; font-family: 'Segoe UI', Arial, sans-serif;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04);
        ">
            <h2 style="margin: 0 0 10px 0; color: #c8842a; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                负面 Prompt 编辑器
            </h2>

            <p style="color: #999; font-size: 12px; margin: 0 0 12px 0;">
                在此编辑自定义负面提示词。保存后，在节点中选择"负面提示词类型 → 自定义"即可使用。
            </p>

            <div style="flex:1; display: flex; flex-direction: column;">
                <textarea id="mpe-negative-text" style="
                    width: 100%; flex: 1; min-height: 300px;
                    background: #fafafa; color: #333;
                    border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px;
                    font-size: 13px; font-family: 'JetBrains Mono', Consolas, monospace; resize: vertical;
                    box-sizing: border-box; outline: none;
                " placeholder="输入自定义负面提示词（英文标签，逗号分隔）..."></textarea>
            </div>

            <div style="display: flex; gap: 10px; align-items: center; margin-top: 14px; padding-top: 12px; border-top: 1px solid #f0f0f0;">
                <span id="mpe-negative-status" style="color: #999; font-size: 12px; flex: 1;">就绪</span>
                <button id="mpe-negative-save" style="padding: 8px 22px; background: #333; color: #fff; border: 1px solid #333; border-radius: 7px; cursor: pointer; font-weight: 500; font-size: 13px;">
                    保存
                </button>
                <button id="mpe-negative-close" style="padding: 8px 20px; background: #fff; color: #666; border: 1px solid #e0e0e0; border-radius: 7px; cursor: pointer; font-size: 13px;">
                    关闭
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    const textEl = dialog.querySelector('#mpe-negative-text');
    const statusEl = dialog.querySelector('#mpe-negative-status');

    function setStatus(msg, isError) {
        statusEl.textContent = msg;
        statusEl.style.color = isError ? '#d44' : '#4a8';
    }

    async function loadNegative() {
        setStatus('加载中...', false);
        try {
            const res = await request('GET', '/negative_prompt');
            if (res.success) {
                textEl.value = (res.data && res.data.content) ? res.data.content : '';
                setStatus('已加载');
            } else {
                setStatus('加载失败: ' + (res.error || '未知错误'), true);
            }
        } catch (e) {
            setStatus('加载异常: ' + e.message, true);
        }
    }

    async function saveNegative() {
        setStatus('保存中...', false);
        try {
            const res = await request('POST', '/negative_prompt', { content: textEl.value });
            if (res.success) {
                setStatus('✅ 负面提示词已保存');
            } else {
                setStatus('保存失败: ' + (res.error || '未知错误'), true);
            }
        } catch (e) {
            setStatus('保存异常: ' + e.message, true);
        }
    }

    dialog.querySelector('#mpe-negative-save').addEventListener('click', saveNegative);
    dialog.querySelector('#mpe-negative-close').addEventListener('click', () => dialog.remove());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.remove(); });
    dialog.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveNegative();
        }
        if (e.key === 'Escape') {
            dialog.remove();
        }
    });

    loadNegative();
}

// ==================== 规则管理器弹窗 ====================

function openRuleManager() {
    const existing = document.getElementById('moton-pe-rule-manager');
    if (existing) existing.remove();

    const dialog = document.createElement('div');
    dialog.id = 'moton-pe-rule-manager';
    dialog.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); z-index: 99999;
        display: flex; align-items: center; justify-content: center;
    `;

    dialog.innerHTML = `
        <div style="
            background: #ffffff; border: 1px solid #e0e0e0; border-radius: 14px;
            padding: 24px; width: 94%; max-width: 900px; max-height: 90vh;
            display: flex; flex-direction: column;
            color: #333; font-family: 'Segoe UI', Arial, sans-serif;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04);
        ">
            <h2 style="margin: 0 0 14px 0; color: #c8842a; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                提示词规则管理器
            </h2>

            <div style="flex:1; overflow-y: auto; max-height: 70vh; padding-right: 4px;">

                <!-- #1 基础扩写 -->
                <div style="border: 1px solid #e8e8e8; border-radius: 10px; margin-bottom: 14px; overflow: hidden;">
                    <div style="background: #fafafa; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-weight: 600; color: #c8842a; font-size: 14px;">#1 基础扩写</span>
                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px; color: #666;">
                            <input type="checkbox" id="mpe-rule-sfw-enabled" style="cursor: pointer;">
                            启用
                        </label>
                    </div>
                    <div style="padding: 10px 14px;">
                        <textarea id="mpe-rule-sfw-text" style="
                            width: 100%; height: 150px; background: #fafafa; color: #333;
                            border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px;
                            font-size: 13px; font-family: 'JetBrains Mono', Consolas, monospace; resize: vertical;
                            box-sizing: border-box; outline: none;
                        " placeholder="设置基础扩写的规则...(支持PromptCraft库占位符)"></textarea>
                    </div>
                </div>

                <!-- #2 详细扩写 -->
                <div style="border: 1px solid #e8e8e8; border-radius: 10px; margin-bottom: 14px; overflow: hidden;">
                    <div style="background: #fafafa; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-weight: 600; color: #c8842a; font-size: 14px;">#2 详细扩写</span>
                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px; color: #666;">
                            <input type="checkbox" id="mpe-rule-nsfw-enabled" style="cursor: pointer;">
                            启用
                        </label>
                    </div>
                    <div style="padding: 10px 14px;">
                        <textarea id="mpe-rule-nsfw-text" style="
                            width: 100%; height: 150px; background: #fafafa; color: #333;
                            border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px;
                            font-size: 13px; font-family: 'JetBrains Mono', Consolas, monospace; resize: vertical;
                            box-sizing: border-box; outline: none;
                        " placeholder="设置详细扩写的规则...(支持PromptCraft库占位符)"></textarea>
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 10px; align-items: center; margin-top: 8px; padding-top: 12px; border-top: 1px solid #f0f0f0;">
                <span id="mpe-rule-status" style="color: #999; font-size: 12px; flex: 1;">就绪</span>
                <button id="mpe-rule-save" style="padding: 8px 22px; background: #333; color: #fff; border: 1px solid #333; border-radius: 7px; cursor: pointer; font-weight: 500; font-size: 13px;">
                    保存
                </button>
                <button id="mpe-rule-close" style="padding: 8px 20px; background: #fff; color: #666; border: 1px solid #e0e0e0; border-radius: 7px; cursor: pointer; font-size: 13px;">
                    关闭
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    const ruleSfwText = dialog.querySelector('#mpe-rule-sfw-text');
    const ruleNsfwText = dialog.querySelector('#mpe-rule-nsfw-text');
    const ruleSfwEnabled = dialog.querySelector('#mpe-rule-sfw-enabled');
    const ruleNsfwEnabled = dialog.querySelector('#mpe-rule-nsfw-enabled');
    const statusEl = dialog.querySelector('#mpe-rule-status');

    function setStatus(msg, isError) {
        statusEl.textContent = msg;
        statusEl.style.color = isError ? '#d44' : '#4a8';
    }

    async function loadRules() {
        setStatus('加载中...', false);
        try {
            const res = await request('GET', '/system_prompt');
            if (res.success) {
                const d = res.data || {};
                ruleSfwText.value = d.sfw_rules || '';
                ruleNsfwText.value = d.nsfw_rules || '';
                ruleSfwEnabled.checked = d.sfw_enabled !== false;
                ruleNsfwEnabled.checked = d.nsfw_enabled !== false;
                setStatus('已加载');
            } else {
                setStatus('加载失败: ' + (res.error || '未知错误'), true);
            }
        } catch (e) {
            setStatus('加载异常: ' + e.message, true);
        }
    }

    async function saveRules() {
        setStatus('保存中...', false);
        try {
            const payload = {
                sfw_rules: ruleSfwText.value,
                nsfw_rules: ruleNsfwText.value,
                sfw_enabled: ruleSfwEnabled.checked,
                nsfw_enabled: ruleNsfwEnabled.checked,
            };
            const res = await request('POST', '/system_prompt', payload);
            if (res.success) {
                setStatus('✅ 规则已保存');
            } else {
                setStatus('保存失败: ' + (res.error || '未知错误'), true);
            }
        } catch (e) {
            setStatus('保存异常: ' + e.message, true);
        }
    }

    dialog.querySelector('#mpe-rule-save').addEventListener('click', saveRules);
    dialog.querySelector('#mpe-rule-close').addEventListener('click', () => dialog.remove());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.remove(); });
    dialog.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveRules();
        }
        if (e.key === 'Escape') {
            dialog.remove();
        }
    });

    loadRules();
}

// ==================== Prompt 库编辑器 ====================

function openLibraryEditor() {
    const existing = document.getElementById('moton-pe-library-editor');
    if (existing) existing.remove();

    const dialog = document.createElement('div');
    dialog.id = 'moton-pe-library-editor';
    dialog.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); z-index: 99999;
        display: flex; align-items: center; justify-content: center;
    `;

    let currentTab = 'sfw';
    let currentLibData = null;

    dialog.innerHTML = `
        <div style="
            background: #ffffff; border: 1px solid #e0e0e0; border-radius: 14px;
            padding: 24px; width: 94%; max-width: 900px; max-height: 90vh;
            display: flex; flex-direction: column;
            color: #333; font-family: 'Segoe UI', Arial, sans-serif;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04);
        ">
            <h2 style="margin: 0 0 10px 0; color: #c8842a; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                Prompt 库编辑器
            </h2>

            <p style="color: #999; font-size: 12px; margin: 0 0 8px 0;">
                编辑 Prompt 库中的分类、选项内容，保存后自动生效。
            </p>

            <!-- 标签切换 -->
            <div style="display:flex; gap: 6px; margin-bottom: 14px;">
                <button id="mpe-tab-sfw" style="
                    padding: 6px 16px; border: 1px solid #e0e0e0; border-radius: 7px;
                    background: #fff; color: #666; cursor: pointer; font-weight: 500;
                    font-size: 13px; font-family: inherit;
                ">普通内容库 (SFW)</button>
                <button id="mpe-tab-nsfw" style="
                    padding: 6px 16px; border: 1px solid #e0e0e0; border-radius: 7px;
                    background: #fff; color: #666; cursor: pointer; font-weight: 500;
                    font-size: 13px; font-family: inherit;
                ">特殊内容库 (NSFW)</button>
            </div>

            <!-- 状态栏 -->
            <div style="display:flex; gap: 8px; align-items: center; margin-bottom: 6px;">
                <span id="mpe-status" style="color: #999; font-size: 12px; flex: 1;">就绪</span>
                <button id="mpe-refresh" style="
                    padding: 4px 12px; background: #fff; color: #888;
                    border: 1px solid #e0e0e0; border-radius: 6px; cursor: pointer; font-size: 12px;
                    font-family: inherit;
                ">刷新</button>
            </div>

            <!-- 编辑表格容器 -->
            <div id="mpe-content" style="flex:1; overflow-y: auto; max-height: 60vh; border: 1px solid #e8e8e8; border-radius: 8px; background: #fafafa;">
                <div style="padding:60px; text-align:center; color:#ccc;">加载中...</div>
            </div>

            <!-- 底部按钮 -->
            <div style="display: flex; gap: 10px; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0;">
                <span style="color:#bbb; font-size:11px;">编辑后点击保存，节点下拉将自动更新</span>
                <button id="mpe-save" style="
                    padding: 8px 22px; background: #333; color: #fff;
                    border: 1px solid #333; border-radius: 7px; cursor: pointer; font-weight: 500;
                    font-size: 13px;
                ">保存</button>
                <button id="mpe-close" style="
                    padding: 8px 20px; background: #fff; color: #666;
                    border: 1px solid #e0e0e0; border-radius: 7px; cursor: pointer;
                    font-size: 13px;
                ">关闭</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    const contentEl = dialog.querySelector('#mpe-content');
    const statusEl = dialog.querySelector('#mpe-status');
    const tabSfw = dialog.querySelector('#mpe-tab-sfw');
    const tabNsfw = dialog.querySelector('#mpe-tab-nsfw');

    function setStatus(msg, isError) {
        statusEl.textContent = msg;
        statusEl.style.color = isError ? '#d44' : '#4a8';
    }

    function setActiveTab(tab) {
        currentTab = tab;
        tabSfw.style.background = tab === 'sfw' ? '#f5f0e8' : '#fff';
        tabSfw.style.borderColor = tab === 'sfw' ? '#c8842a' : '#e0e0e0';
        tabSfw.style.color = tab === 'sfw' ? '#c8842a' : '#666';
        tabSfw.style.fontWeight = tab === 'sfw' ? '600' : '500';
        tabNsfw.style.background = tab === 'nsfw' ? '#fff0f0' : '#fff';
        tabNsfw.style.borderColor = tab === 'nsfw' ? '#d88' : '#e0e0e0';
        tabNsfw.style.color = tab === 'nsfw' ? '#c44' : '#666';
        tabNsfw.style.fontWeight = tab === 'nsfw' ? '600' : '500';
    }
    setActiveTab('sfw');

    function collectCategoriesFromTable() {
        const newCats = {};
        const rows = contentEl.querySelectorAll('.cat-row');
        rows.forEach(row => {
            const key = row.dataset.catKey;
            if (!key) return;
            const opts = [];
            const items = row.querySelectorAll('.opt-item');
            items.forEach(item => {
                const labelEl = item.querySelector('.opt-label');
                const enEl = item.querySelector('.opt-en');
                if (labelEl && enEl) {
                    const lbl = labelEl.value.trim();
                    const en = enEl.value.trim();
                    if (lbl && en) {
                        opts.push({ label: lbl, en: en });
                    }
                }
            });
            const existingCat = (currentLibData.categories && currentLibData.categories[key]) || {};
            newCats[key] = { label: key, description: existingCat.description || '', options: opts };
            // 收集子组数据
            const sgSections = row.querySelectorAll('.sg-section');
            if (sgSections.length > 0) {
                const newSubgroups = {};
                sgSections.forEach(sgEl => {
                    const sgKey = sgEl.dataset.sgKey;
                    const sgOpts = [];
                    sgEl.querySelectorAll('.sg-opt-item').forEach(item => {
                        const lbl = item.querySelector('.opt-label')?.value.trim();
                        const en = item.querySelector('.opt-en')?.value.trim();
                        if (lbl && en) sgOpts.push({ label: lbl, en: en });
                    });
                    newSubgroups[sgKey] = {
                        label: (existingCat.subgroups?.[sgKey]?.label) || sgKey,
                        options: sgOpts,
                    };
                });
                newCats[key].subgroups = newSubgroups;
            } else if (existingCat.subgroups) {
                newCats[key].subgroups = existingCat.subgroups;
            }
        });
        return newCats;
    }

    async function loadLibrary(type) {
        setActiveTab(type);
        contentEl.innerHTML = '<div style="padding:60px; text-align:center; color:#555;">加载中...</div>';
        try {
            const res = await request('GET', `/library/${type}`);
            if (res.success) {
                currentLibData = res.data;
                const cats = res.data.categories || {};
                const catCount = Object.keys(cats).length;
                let html = '<table style="width:100%; border-collapse: collapse;">';
                Object.entries(cats).forEach(([key, cat]) => {
                    html += `<tr class="cat-row" data-cat-key="${key}" style="border-bottom: 1px solid #f0f0f0;">
                        <td style="vertical-align: top; padding: 10px 8px; width: 100px; font-weight: 600; color: #c8842a; font-size: 13px;">${key}</td>
                        <td style="padding: 6px 8px;">
                            <div style="display: flex; flex-direction: column; gap: 4px;">`;
                    const opts = (cat && cat.options) ? cat.options : [];
                    opts.forEach(opt => {
                        html += `<div class="opt-item" style="display: flex; gap: 6px; align-items: center; margin-bottom: 2px;">
                            <input class="opt-label" value="${escHtml(opt.label || '')}" style="flex:1; background: #fff; color: #333; border: 1px solid #e0e0e0; border-radius: 5px; padding: 4px 8px; font-size: 12px; outline: none; font-family: inherit;">
                            <input class="opt-en" value="${escHtml(opt.en || '')}" style="flex:1; background: #fff; color: #333; border: 1px solid #e0e0e0; border-radius: 5px; padding: 4px 8px; font-size: 12px; font-family: 'JetBrains Mono', monospace; outline: none;">
                        </div>`;
                    });
                    // 渲染子组（二级分类）
                    const subgroups = (cat && cat.subgroups) ? cat.subgroups : {};
                    Object.entries(subgroups).forEach(([sgKey, sg]) => {
                        html += `<div class="sg-section" data-sg-key="${escHtml(sgKey)}" style="margin-top: 8px; padding: 6px 8px; background: #f8f6f0; border-radius: 6px; border: 1px solid #e8e4d8;">
                            <div style="font-size: 11px; font-weight: 600; color: #b07830; margin-bottom: 4px;">🎲 ${escHtml(sg.label || sgKey)}</div>`;
                        (sg.options || []).forEach(opt => {
                            html += `<div class="sg-opt-item" style="display: flex; gap: 6px; align-items: center; margin-bottom: 2px;">
                                <input class="opt-label" value="${escHtml(opt.label || '')}" style="flex:1; background: #fff; color: #333; border: 1px solid #e0e0e0; border-radius: 5px; padding: 4px 8px; font-size: 12px; outline: none; font-family: inherit;">
                                <input class="opt-en" value="${escHtml(opt.en || '')}" style="flex:1; background: #fff; color: #333; border: 1px solid #e0e0e0; border-radius: 5px; padding: 4px 8px; font-size: 12px; font-family: 'JetBrains Mono', monospace; outline: none;">
                            </div>`;
                        });
                        html += `</div>`;
                    });
                    html += `</div></td></tr>`;
                });
                html += '</table>';
                contentEl.innerHTML = html;

                let optCount = 0;
                Object.values(cats).forEach(c => {
                    optCount += ((c && c.options) || []).length;
                    const sgs = (c && c.subgroups) || {};
                    Object.values(sgs).forEach(sg => { optCount += ((sg && sg.options) || []).length; });
                });
                setStatus(`${type.toUpperCase()} 库已加载 · ${catCount} 分类 / ${optCount} 选项`);
            } else {
                contentEl.innerHTML = `<div style="color:#d44;text-align:center;padding:60px 0;">加载失败: ${escHtml(res.error || '未知错误')}</div>`;
                setStatus('加载失败', true);
            }
        } catch (e) {
            contentEl.innerHTML = `<div style="color:#d44;text-align:center;padding:60px 0;">加载异常: ${escHtml(e.message)}</div>`;
            setStatus('加载异常', true);
        }
    }

    async function saveLibrary() {
        try {
            const newCategories = collectCategoriesFromTable();
            const payload = { ...currentLibData, categories: newCategories };
            JSON.stringify(payload);
            setStatus('保存中...', false);
            const res = await request('POST', `/library/${currentTab}`, payload);
            if (res.success) {
                await request('POST', `/library/${currentTab}_reload`, {});
                setStatus(`${currentTab.toUpperCase()} 库已保存并重载缓存 ✅`);
                currentLibData = payload;
            } else {
                setStatus(`保存失败: ${res.error || '未知错误'}`, true);
            }
        } catch (e) {
            setStatus(`数据收集失败: ${e.message}`, true);
        }
    }

    tabSfw.addEventListener('click', () => { setActiveTab('sfw'); loadLibrary('sfw'); });
    tabNsfw.addEventListener('click', () => { setActiveTab('nsfw'); loadLibrary('nsfw'); });
    dialog.querySelector('#mpe-save').addEventListener('click', saveLibrary);
    dialog.querySelector('#mpe-refresh').addEventListener('click', () => loadLibrary(currentTab));
    dialog.querySelector('#mpe-close').addEventListener('click', () => dialog.remove());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.remove(); });

    dialog.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveLibrary();
        }
        if (e.key === 'Escape') {
            dialog.remove();
        }
    });

    loadLibrary('sfw');
}

// ==================== Prompt 历史记录管理器 ====================

function openPromptHistory() {
    const existing = document.getElementById('moton-pe-history');
    if (existing) existing.remove();

    const dialog = document.createElement('div');
    dialog.id = 'moton-pe-history';
    dialog.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); z-index: 99999;
        display: flex; align-items: center; justify-content: center;
    `;

    dialog.innerHTML = `
        <div style="
            background: #ffffff; border: 1px solid #e0e0e0; border-radius: 14px;
            padding: 24px; width: 94%; max-width: 900px; max-height: 90vh;
            display: flex; flex-direction: column;
            color: #333; font-family: 'Segoe UI', Arial, sans-serif;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04);
        ">
            <h2 style="margin: 0 0 6px 0; color: #c8842a; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                Prompt 历史记录
            </h2>

            <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
                <span style="color:#999; font-size:12px; flex:1;">点击条目可复制正面提示词</span>
                <label style="display:flex; align-items:center; gap:4px; font-size:12px; color:#666;">
                    上限:
                    <select id="mpe-history-limit" style="background:#fafafa; color:#333; border:1px solid #e0e0e0; border-radius:5px; padding:2px 6px; font-size:12px;">
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50" selected>50</option>
                        <option value="100">100</option>
                        <option value="0">无上限</option>
                    </select>
                </label>
                <button id="mpe-history-clear" style="padding:4px 12px; background:#fff; color:#d44; border:1px solid #e0e0e0; border-radius:6px; cursor:pointer; font-size:12px;">清空历史</button>
            </div>

            <div id="mpe-history-list" style="flex:1; overflow-y:auto; max-height:60vh; border:1px solid #e8e8e8; border-radius:8px; background:#fafafa;">
                <div style="padding:60px; text-align:center; color:#ccc;">加载中...</div>
            </div>

            <div style="display:flex; gap:10px; align-items:center; margin-top:12px; padding-top:12px; border-top:1px solid #f0f0f0;">
                <span id="mpe-history-status" style="color:#999; font-size:12px; flex:1;">就绪</span>
                <button id="mpe-history-close" style="padding:8px 20px; background:#fff; color:#666; border:1px solid #e0e0e0; border-radius:7px; cursor:pointer; font-size:13px;">关闭</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    const listEl = dialog.querySelector('#mpe-history-list');
    const statusEl = dialog.querySelector('#mpe-history-status');
    const limitSelect = dialog.querySelector('#mpe-history-limit');

    function setStatus(msg, isError) {
        statusEl.textContent = msg;
        statusEl.style.color = isError ? '#d44' : '#4a8';
    }

    function formatTime(ts) {
        const d = new Date(ts * 1000);
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    function truncate(s, max) {
        if (!s) return '';
        return s.length > max ? s.slice(0, max) + '...' : s;
    }

    async function loadHistory() {
        setStatus('加载中...', false);
        try {
            const res = await request('GET', '/prompt_history');
            if (res.success) {
                const data = res.data || {};
                const entries = data.entries || [];
                limitSelect.value = String(data.limit ?? 50);

                if (entries.length === 0) {
                    listEl.innerHTML = '<div style="padding:60px; text-align:center; color:#ccc;">暂无历史记录</div>';
                    setStatus('暂无记录');
                    return;
                }

                listEl.innerHTML = '';
                entries.forEach((entry, idx) => {
                    const item = document.createElement('div');
                    item.style.cssText = 'display:flex; gap:10px; align-items:flex-start; padding:10px 12px; border-bottom:1px solid #f0f0f0; cursor:pointer; transition:background 0.12s;';
                    item.onmouseenter = () => item.style.background = '#f5f0e8';
                    item.onmouseleave = () => item.style.background = '';

                    const timeStr = formatTime(entry.timestamp);
                    const posPreview = truncate(entry.positive, 120);
                    const negPreview = truncate(entry.negative, 60);
                    const extra = entry.extra || {};
                    const tags = [];
                    if (extra.llm_enhanced) tags.push('LLM');
                    if (extra.special) tags.push('NSFW');
                    const tagStr = tags.length > 0 ? tags.map(t => `<span style="background:#f0e8d8;color:#b07830;padding:1px 5px;border-radius:3px;font-size:10px;">${t}</span>`).join('') : '';

                    item.innerHTML = `
                        <div style="flex:1; min-width:0;">
                            <div style="display:flex; gap:6px; align-items:center; margin-bottom:3px;">
                                <span style="color:#999; font-size:11px;">${timeStr}</span>
                                ${tagStr}
                            </div>
                            <div style="color:#333; font-size:12px; word-break:break-all; line-height:1.4;">${escHtml(posPreview)}</div>
                            ${negPreview ? `<div style="color:#999; font-size:11px; margin-top:2px;">Neg: ${escHtml(negPreview)}</div>` : ''}
                        </div>
                        <div style="display:flex; gap:4px; flex-shrink:0;">
                            <button class="mpe-hist-copy" data-idx="${idx}" style="padding:3px 8px; background:#fff; color:#666; border:1px solid #e0e0e0; border-radius:5px; cursor:pointer; font-size:11px;" title="复制正面提示词">复制</button>
                            <button class="mpe-hist-del" data-id="${escHtml(entry.id)}" style="padding:3px 8px; background:#fff; color:#d44; border:1px solid #e0e0e0; border-radius:5px; cursor:pointer; font-size:11px;" title="删除">×</button>
                        </div>
                    `;

                    // Click to copy positive prompt
                    item.addEventListener('click', (e) => {
                        if (e.target.closest('.mpe-hist-copy') || e.target.closest('.mpe-hist-del')) return;
                        navigator.clipboard?.writeText(entry.positive || '').catch(() => {});
                        setStatus('已复制正面提示词');
                    });

                    // Copy button
                    item.querySelector('.mpe-hist-copy').addEventListener('click', (e) => {
                        e.stopPropagation();
                        navigator.clipboard?.writeText(entry.positive || '').catch(() => {});
                        const btn = e.target;
                        btn.textContent = '已复制';
                        btn.style.color = '#00cd72';
                        setTimeout(() => { btn.textContent = '复制'; btn.style.color = ''; }, 1000);
                    });

                    // Delete button
                    item.querySelector('.mpe-hist-del').addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const entryId = e.target.dataset.id;
                        await request('DELETE', `/prompt_history/${entryId}`);
                        loadHistory();
                    });

                    listEl.appendChild(item);
                });

                setStatus(`共 ${entries.length} 条记录`);
            } else {
                setStatus('加载失败', true);
            }
        } catch (e) {
            setStatus('加载异常: ' + e.message, true);
        }
    }

    // Limit change
    limitSelect.addEventListener('change', async () => {
        const limit = parseInt(limitSelect.value);
        await request('PUT', '/prompt_history/limit', { limit });
        setStatus(`上限已设为 ${limit === 0 ? '无上限' : limit}`);
        loadHistory();
    });

    // Clear all
    dialog.querySelector('#mpe-history-clear').addEventListener('click', async () => {
        if (!confirm('确定清空所有历史记录？')) return;
        await request('DELETE', '/prompt_history');
        loadHistory();
        setStatus('已清空');
    });

    // Close
    dialog.querySelector('#mpe-history-close').addEventListener('click', () => dialog.remove());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.remove(); });
    dialog.addEventListener('keydown', (e) => { if (e.key === 'Escape') dialog.remove(); });

    loadHistory();
}

// ==================== 特殊内容 标签缓存 ====================

/**
 * 从服务器加载 特殊内容 库所有 label，缓存到全局变量
 */
async function loadNsfwLabelCache() {
    try {
        const res = await request('GET', '/library/nsfw');
        if (res.success) {
            const nsfwLabels = new Set();
            const cats = res.data.categories || {};
            Object.values(cats).forEach(cat => {
                // 收集 category 层的 options
                const options = (cat && cat.options) ? cat.options : [];
                options.forEach(opt => {
                    if (opt.label) nsfwLabels.add(opt.label);
                });
                // 收集 subgroups 中的 options
                const subgroups = (cat && cat.subgroups) ? cat.subgroups : {};
                Object.values(subgroups).forEach(sg => {
                    (sg.options || []).forEach(opt => {
                        if (opt.label) nsfwLabels.add(opt.label);
                    });
                });
            });
            window._motonNsfwLabels = nsfwLabels;
            log(`NSFW 标签缓存已加载: ${nsfwLabels.size} 个标签`);
            
            // NSFW 缓存加载完成后，重新过滤画布上所有已有节点的 combo widget
            setTimeout(() => {
                const graphs = [app.graph];
                graphs.forEach(g => {
                    if (!g || !g._nodes) return;
                    g._nodes.forEach(node => {
                        if (node.type === 'PromptEnhancer') {
                            filterAllComboWidgetsOnNode(node);
                        }
                    });
                });
                log('已重过滤所有现有节点的 combo widget');
            }, 100);
        } else {
            log('加载 NSFW 标签缓存失败:', res.error);
        }
    } catch (e) {
        log('加载 NSFW 标签缓存异常:', e);
    }
}

// ==================== 设置面板集成 ====================

function registerSettings() {
    const settings = app.ui.settings || (app.extensionManager && app.extensionManager.settings);
    if (!settings) {
        log('⚠️ 设置面板不可用，尝试延迟注册...');
        setTimeout(registerSettings, 1000);
        return;
    }

    settings.addSetting({
        id: 'PromptCraft.Settings',
        name: ' ',
        type: () => createSettingsContent(),
    });

    // 隐藏 ComfyUI FormItem 自带的 label（name 属性产生的冗余标题）
    // createSettingsContent() 自带品牌头，不需要 FormItem label
    const hideLabel = () => {
        document.querySelectorAll('.pc-settings').forEach(el => {
            let node = el.parentElement;
            for (let depth = 0; depth < 6 && node && node !== document.body; depth++) {
                const children = Array.from(node.children);
                if (children.includes(el) && children.length >= 2) {
                    children.forEach(c => {
                        if (c !== el) {
                            c.style.setProperty('display', 'none', 'important');
                            c.style.setProperty('height', '0', 'important');
                            c.style.setProperty('overflow', 'hidden', 'important');
                            c.style.setProperty('margin', '0', 'important');
                            c.style.setProperty('padding', '0', 'important');
                        }
                    });
                    node.style.setProperty('grid-template-rows', 'none', 'important');
                    node.style.setProperty('grid-template-columns', '1fr', 'important');
                    node.style.setProperty('display', 'block', 'important');
                    break;
                }
                node = node.parentElement;
            }
            el.style.setProperty('width', '100%', 'important');
            el.style.setProperty('max-width', '100%', 'important');
            el.style.setProperty('box-sizing', 'border-box', 'important');
        });
    };

    const observer = new MutationObserver(() => {
        if (document.querySelector('.comfyui-settings-dialog, [class*="settings-dialog"], .settings_dialog')) {
            requestAnimationFrame(hideLabel);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    requestAnimationFrame(hideLabel);

    log(`V${VERSION} 设置面板已注册`);
}

// ==================== 浮动快捷面板（兜底） ====================

const FALLBACK_PANEL_ID = 'moton-pe-fallback-panel';

function ensureFallbackPanel() {
    if (localStorage.getItem('moton-pe-panel-hidden') === 'true') return;
    if (document.getElementById(FALLBACK_PANEL_ID)) return;

    const storageKey = 'moton-pe-panel-state';
    let saved;
    try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { saved = {}; }

    const container = document.createElement('div');
    container.id = FALLBACK_PANEL_ID;
    container.style.cssText = `position:fixed; left:${saved.x ?? window.innerWidth - 56}px; top:${saved.y ?? window.innerHeight - 56}px; z-index:99990; cursor:grab; user-select:none; font-family:'Segoe UI',Arial,sans-serif;`;

    const gearBtn = document.createElement('div');
    gearBtn.style.cssText = 'width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,0.7); border:1px solid rgba(0,0,0,0.12); color:rgba(200,132,42,0.4); font-size:15px; line-height:30px; text-align:center; cursor:pointer; transition:all 0.25s; opacity:0.35;';
    gearBtn.textContent = '◆';
    gearBtn.onmouseenter = () => { gearBtn.style.opacity='1'; gearBtn.style.background='#fff'; gearBtn.style.color='#c8842a'; gearBtn.style.borderColor='rgba(200,132,42,0.4)'; gearBtn.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'; };
    gearBtn.onmouseleave = () => { gearBtn.style.opacity='0.35'; gearBtn.style.background='rgba(255,255,255,0.7)'; gearBtn.style.color='rgba(200,132,42,0.4)'; gearBtn.style.borderColor='rgba(0,0,0,0.12)'; gearBtn.style.boxShadow='none'; };
    container.appendChild(gearBtn);

    const panel = document.createElement('div');
    panel.style.cssText = 'display:none; position:absolute; bottom:38px; right:0; background:#fff; border:1px solid #e0e0e0; border-radius:10px; padding:10px 12px; flex-direction:column; gap:5px; box-shadow:0 8px 32px rgba(0,0,0,0.12); min-width:200px;';

    const t = document.createElement('div');
    t.style.cssText = 'color:#c8842a; font-size:12px; font-weight:bold; margin-bottom:4px; letter-spacing:0.5px;';
    t.textContent = '◆ PromptCraft';
    panel.appendChild(t);

    // Quick access buttons
    const QUICK_BUTTONS = [
        { text: '📐 规则管理器', fn: openRuleManager },
        { text: '▤ 库编辑器', fn: openLibraryEditor },
        { text: '⏱ Prompt 历史', fn: openPromptHistory },
    ];

    QUICK_BUTTONS.forEach(({ text, fn }) => {
        const b = document.createElement('button');
        b.textContent = text;
        b.style.cssText = 'padding:5px 12px; background:transparent; color:#888; border:1px solid transparent; border-radius:5px; cursor:pointer; font-size:11.5px; white-space:nowrap; text-align:left; width:100%; transition:all 0.15s; font-family:inherit;';
        b.onmouseenter = () => { b.style.background='#f5f5f5'; b.style.color='#333'; b.style.borderColor='#e0e0e0'; };
        b.onmouseleave = () => { b.style.background='transparent'; b.style.color='#888'; b.style.borderColor='transparent'; };
        b.onclick = (e) => { e.stopPropagation(); fn(); };
        panel.appendChild(b);
    });

    const col = document.createElement('button');
    col.textContent = '✕';
    col.style.cssText = 'padding:3px 10px; background:transparent; color:#ccc; border:1px solid #e0e0e0; border-radius:5px; cursor:pointer; font-size:11px; align-self:flex-end; margin-top:2px; transition:all 0.15s;';
    col.onmouseenter = () => { col.style.color='#333'; col.style.borderColor='#ccc'; };
    col.onmouseleave = () => { col.style.color='#ccc'; col.style.borderColor='#e0e0e0'; };
    col.onclick = () => { panel.style.display='none'; gearBtn.textContent='◆'; };
    panel.appendChild(col);
    container.appendChild(panel);

    let dragging = false, sx, sy, ox, oy;
    gearBtn.onclick = () => { if(dragging)return; panel.style.display = panel.style.display==='none'?'flex':'none'; gearBtn.textContent = panel.style.display==='none'?'◆':'▼'; };
    container.onmousedown = (e) => { if(e.target!==container&&e.target!==gearBtn)return; dragging=true; sx=e.clientX; sy=e.clientY; ox=container.offsetLeft; oy=container.offsetTop; container.style.cursor='grabbing'; e.preventDefault(); };
    document.addEventListener('mousemove', (e) => { if(!dragging)return; container.style.left=Math.max(0,Math.min(ox+e.clientX-sx,window.innerWidth-40))+'px'; container.style.top=Math.max(0,Math.min(oy+e.clientY-sy,window.innerHeight-40))+'px'; });
    document.addEventListener('mouseup', () => { if(!dragging)return; dragging=false; container.style.cursor='grab'; try{localStorage.setItem(storageKey,JSON.stringify({x:container.offsetLeft,y:container.offsetTop}));}catch{} });

    // 右键菜单：关闭浮窗
    container.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const oldMenu = document.getElementById('moton-pe-ctx-menu');
        if (oldMenu) oldMenu.remove();

        const menu = document.createElement('div');
        menu.id = 'moton-pe-ctx-menu';
        menu.style.cssText = `position:fixed; left:${e.clientX}px; top:${e.clientY}px; z-index:99999; background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:4px; box-shadow:0 4px 16px rgba(0,0,0,0.12); min-width:140px; font-family:'Segoe UI',Arial,sans-serif;`;

        const closeBtn = document.createElement('div');
        closeBtn.textContent = '关闭浮窗';
        closeBtn.style.cssText = 'padding:6px 12px; cursor:pointer; font-size:12px; color:#666; border-radius:4px; transition:all 0.15s;';
        closeBtn.onmouseenter = () => { closeBtn.style.background = '#f5f5f5'; closeBtn.style.color = '#333'; };
        closeBtn.onmouseleave = () => { closeBtn.style.background = ''; closeBtn.style.color = '#666'; };
        closeBtn.onclick = () => {
            container.remove();
            localStorage.setItem('moton-pe-panel-hidden', 'true');
            menu.remove();
            alert('浮窗已关闭，可通过 PromptCraft 设置面板重新开启');
        };
        menu.appendChild(closeBtn);

        document.body.appendChild(menu);
        const closeMenu = (ev) => { if (!menu.contains(ev.target)) { menu.remove(); document.removeEventListener('click', closeMenu); } };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    });

    document.body.appendChild(container);
    log('◆ 浮动快捷面板已创建');
}

function toggleFallbackPanel(visible) {
    if (visible) {
        localStorage.removeItem('moton-pe-panel-hidden');
        ensureFallbackPanel();
    } else {
        const panel = document.getElementById(FALLBACK_PANEL_ID);
        if (panel) panel.remove();
        localStorage.setItem('moton-pe-panel-hidden', 'true');
    }
}

// ==================== 增强 multiline 输入框高度（LiteGraph Widget 级别） ====================

/**
 * 通过覆写 widget.computeSize 来设置 multiline 输入框高度
 * 这样做可以让 LiteGraph 自动重新计算节点的整体布局，避免 UI 错位
 */
function enhanceMultilineWidgetHeight(widget, targetHeight) {
    if (!widget || widget._motonHeightEnhanced) return;
    
    const origComputeSize = widget.computeSize;
    widget.computeSize = function() {
        const sz = origComputeSize ? origComputeSize.call(this) : [200, 60];
        return [sz[0], targetHeight];
    };
    widget._motonHeightEnhanced = true;
}

/**
 * 对节点上的「用户Prompt」和「大模型提示词」widget 设置增强高度
 */
function enhanceNodeMultilineWidgets(node) {
    if (!node || !node.widgets) return;
    
    const targetWidgets = node.widgets.filter(
        w => w.name === '用户Prompt' || w.name === '大模型提示词'
    );
    
    if (targetWidgets.length === 0) return;
    
    targetWidgets.forEach(w => enhanceMultilineWidgetHeight(w, 60));
    
    // 只刷新画布，不强制改节点宽度（保留 ComfyUI 原始宽度）
    if (node.graph && node.graph.setDirtyCanvas) {
        node.graph.setDirtyCanvas(true, true);
    }
    
    log('✅ 节点 multiline widget 高度已增强 (60px)');
}

/**
 * 同步调整 DOM textarea 的外观（视觉层面，不影响布局）
 */
function syncTextareaAppearance(node, targetHeight) {
    // 找一个能定位到该节点 DOM 的方法：ComfyUI 会在 textarea 上设置 data-* 属性
    setTimeout(() => {
        const allAreas = document.querySelectorAll('textarea.comfy-multiline-input');
        allAreas.forEach(ta => {
            if (ta.dataset.motonAppearanceFixed) return;
            const ph = ta.getAttribute('placeholder') || '';
            if (ph.includes('输入你的基础Prompt') || ph.includes('输入对LLM大模型的特殊要求')) {
                ta.style.maxHeight = '200px';
                ta.style.overflowY = 'auto';
                ta.style.resize = 'vertical';
                ta.dataset.motonAppearanceFixed = '1';
            }
        });
    }, 200);
}

// ==================== LiteGraph 生命周期钩子方案（核心） ====================

/**
 * ComfyUI 分类下拉控件 widget 名称列表
 * 这些是节点 INPUT_TYPES 中定义为 combo/下拉的字段名
 */
const CATEGORY_COMBO_NAMES = [
    '场景类型', '动作姿态', '服饰细节', '表情状态',
    '机位角度', '镜头类型',
    '特效镜头', '镜头滤镜', '光线类型',
    '视觉风格', '质量等级', '时间设定', '情绪表达(忌与表情状态同时随机)'
];

/**
 * ComfyUI 组合框通常用 customtext 类型（Combo widget）
 * SFW + NSFW 随机标记
 */
const SUBGROUP_RANDOM_PREFIX = '🎲 随机·';
const RANDOM_MARKERS_BASE = ['🎲 随机选择', '🎲 仅在SFW库随机', '🎲 仅在特殊内容库随机'];
const RANDOM_MARKERS_NSFW_ONLY = ['🎲 仅在特殊内容库随机'];

/**
 * 判定一个字符串是否属于任何随机标记（基础标记 + 子组随机标记）
 */
function isRandomMarker(val) {
    if (!val || typeof val !== 'string') return false;
    if (RANDOM_MARKERS_BASE.includes(val)) return true;
    if (val.startsWith(SUBGROUP_RANDOM_PREFIX)) return true;
    return false;
}

/**
 * 判断一个标签是否属于 NSFW 库
 */
function isNsfwLabel(label) {
    if (!label || isRandomMarker(label)) return false;
    if (window._motonNsfwLabels && window._motonNsfwLabels.has(label)) return true;
    return false;
}

/**
 * 过滤单个组合框 widget 的选项值
 * @param {object} widget - LiteGraph Combo widget (customtext 类型)
 * @param {boolean} specialEnabled - 是否启用特殊内容
 */
function filterComboWidget(widget, specialEnabled) {
    if (!widget || !widget.options || !widget.options.values) return;
    if (!Array.isArray(widget.options.values)) return;

    const fullValues = widget._motonFullValues || [...widget.options.values];
    // 首次记录完整的值列表
    if (!widget._motonFullValues) {
        widget._motonFullValues = [...fullValues];
    }

    if (specialEnabled) {
        // 恢复全部选项
        widget.options.values = [...widget._motonFullValues];

        // 检查当前选中值是否还在列表中
        if (widget.value && !widget.options.values.includes(widget.value)) {
            // 如果不在（极少情况），设为第一个有效值
            widget.value = widget.options.values[0] || '——';
        }
    } else {
        // 过滤掉 NSFW 标签
        const filtered = fullValues.filter(v => {
            // 仅在特殊内容库随机的选项在开关关闭时不可见
            if (RANDOM_MARKERS_NSFW_ONLY.includes(v)) return false;
            // 子组随机标记（🎲 随机·子组名）仅在特殊内容开启时显示
            if (v.startsWith(SUBGROUP_RANDOM_PREFIX)) return false;
            // 基础随机标记（全局随机 / 仅SFW随机）始终可见
            if (v === '🎲 随机选择' || v === '🎲 仅在SFW库随机') return true;
            if (v === '——') return true;                  // 保留空选项
            if (isNsfwLabel(v)) return false;              // 过滤 NSFW 标签
            return true;                                   // 保留 SFW 标签
        });

        widget.options.values = filtered;

        // 如果当前选中值被过滤掉了，切换到第一个有效选项
        if (widget.value && !filtered.includes(widget.value)) {
            widget.value = filtered[0] || '——';
        }
    }

    // 通知 LiteGraph 刷新 widget（如果节点已挂载到 canvas）
    if (widget.node && widget.node.graph && widget.node.graph.setDirtyCanvas) {
        widget.node.graph.setDirtyCanvas(true, true);
    }
}

/**
 * 过滤节点上所有分类相关的组合框
 * @param {object} node - LiteGraph node 实例
 */
function filterAllComboWidgetsOnNode(node) {
    if (!node || !node.widgets) return;

    const specialWidget = node.widgets.find(w => w.name === '特殊内容');
    const specialEnabled = specialWidget ? Boolean(specialWidget.value) : false;

    node.widgets.forEach(widget => {
        if (CATEGORY_COMBO_NAMES.includes(widget.name)) {
            filterComboWidget(widget, specialEnabled);
        }
    });
}

/**
 * 随机填充所有分类下拉（质量等级不参与随机填充）
 */
async function randomFillAll(node) {
    if (!node || !node.widgets) return;

    // 获取当前特殊内容状态
    const specialWidget = node.widgets.find(w => w.name === '特殊内容');
    const specialEnabled = specialWidget ? Boolean(specialWidget.value) : false;

    // 质量等级不参与随机填充
    const SKIP_RANDOM = ['质量等级'];

    for (const widget of node.widgets) {
        if (!CATEGORY_COMBO_NAMES.includes(widget.name)) continue;
        if (SKIP_RANDOM.includes(widget.name)) continue;

        // 跳过已选择 "——" 的栏目，保持原样不填充
        if (widget.value === '——' || widget.value === '') continue;

        const values = widget._motonFullValues || (widget.options && widget.options.values) || [];
        // 根据特殊内容开关过滤可用值
        let candidates;
        if (specialEnabled) {
            candidates = values.filter(v => v !== '——');
        } else {
            candidates = values.filter(v =>
                v !== '——' &&
                !isNsfwLabel(v)
            );
        }

        if (candidates.length > 0) {
            const pick = candidates[Math.floor(Math.random() * candidates.length)];
            widget.value = pick;

            // 触发 LiteGraph widget callback
            if (widget.callback) {
                try {
                    widget.callback(pick);
                } catch (e) {
                    // 忽略 callback 错误
                }
            }
        }
    }

    // 刷新画布
    if (node.graph && node.graph.setDirtyCanvas) {
        node.graph.setDirtyCanvas(true, true);
    }

    log('🎲 随机填充完成（质量等级保持不变）');
}

// ==================== 扩展注册 ====================

// 画布 API 状态提示
const LLM_STATUS_ICONS = {
    calling: '⏳',
    success: '✅',
    error: '❌',
    interrupted: '⚠️'
};

const LLM_STATUS_COLORS = {
    calling: '#f0ad4e',
    success: '#5cb85c',
    error: '#d9534f',
    interrupted: '#ff9800'
};

// 创建浮动状态提示
function showLlmStatusToast(status, message) {
    const existing = document.getElementById('promptcraft-llm-status-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'promptcraft-llm-status-toast';
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 99999;
        padding: 12px 20px; border-radius: 8px;
        background: ${LLM_STATUS_COLORS[status] || '#333'}; color: white;
        font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: promptcraft-fadeIn 0.3s ease-out;
        display: flex; align-items: center; gap: 8px;
    `;
    toast.innerHTML = `<span style="font-size:16px">${LLM_STATUS_ICONS[status] || '⏳'}</span><span>${escHtml(message)}</span>`;

    document.body.appendChild(toast);

    // 自动消失
    const duration = status === 'calling' ? 0 : 3000;
    if (duration > 0) {
        setTimeout(() => {
            toast.style.animation = 'promptcraft-fadeOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    return toast;
}

// 添加动画样式
if (!document.getElementById('promptcraft-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'promptcraft-toast-styles';
    style.textContent = `
        @keyframes promptcraft-fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes promptcraft-fadeOut { from { opacity: 1; } to { opacity: 0; transform: translateY(-10px); } }
    `;
    document.head.appendChild(style);
}

// 监听后端 LLM 状态事件（仅使用浮动 Toast，不修改画布节点）
api.addEventListener('promptcraft.llm_status', (event) => {
    const { status, message } = event.detail;
    log(`LLM 状态: ${status} - ${message}`);
    showLlmStatusToast(status, message);
});

app.registerExtension({
    name: 'Moton.PromptCraft',

    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== 'PromptEnhancer') return;

        // ============ 钩子0：每次渲染时兜底过滤 ============
        const onDrawBackground = nodeType.prototype.onDrawBackground;
        nodeType.prototype.onDrawBackground = function (ctx) {
            const result = onDrawBackground ? onDrawBackground.apply(this, arguments) : undefined;
            // 如果初始过滤已完成且 NSFW 缓存已加载，但节点尚未被渲染过滤过，做一次兜底
            if (!this._motonRenderFiltered && window._motonNsfwLabels) {
                this._motonRenderFiltered = true;
                filterAllComboWidgetsOnNode(this);
            }
            return result;
        };

        // ============ 钩子1：节点创建时 ============
        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const result = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

            // 找到「特殊内容」widget 的索引位置
            let specialIndex = -1;
            let specialWidget = null;
            for (let i = 0; i < this.widgets.length; i++) {
                if (this.widgets[i].name === '特殊内容') {
                    specialIndex = i;
                    specialWidget = this.widgets[i];
                    break;
                }
            }

            // 在「特殊内容」widget 之后注入「随机填充」按钮
            if (specialIndex >= 0 && specialWidget) {
                const randomBtn = this.addWidget('button', '🎲 随机填充', null, () => {
                    randomFillAll(this);
                });

                // 移动到特殊内容 widget 之后
                if (randomBtn) {
                    const idx = this.widgets.indexOf(randomBtn);
                    if (idx > specialIndex + 1) {
                        this.widgets.splice(idx, 1);
                        this.widgets.splice(specialIndex + 1, 0, randomBtn);
                    }
                }
            }

            // 绑定「特殊内容」toggle 回调 — 过滤所有 combo widget
            if (specialWidget) {
                const origCallback = specialWidget.callback;
                specialWidget.callback = function (value) {
                    // 先调用原始 callback（如果有）
                    if (origCallback) {
                        origCallback.call(this, value);
                    }
                    // 过滤所有分类组合框
                    filterAllComboWidgetsOnNode(this.node || specialWidget.node);
                }.bind(specialWidget);
            }

            // 初始化：根据「特殊内容」默认值过滤所有 combo
            setTimeout(() => {
                filterAllComboWidgetsOnNode(this);
                // 标记此节点的过滤状态，供 onDrawBackground 做兜底
                this._motonInitialFilterDone = true;
            }, 50);

            // 调整 multiline textarea 的 DOM 外观（可拖拽调整大小等）
            syncTextareaAppearance(this, 86);

            // 锁定节点宽度为 450px，高度交给 ComfyUI 原生计算
            const nodeRef = this;
            this.computeSize = function () {
                // 使用 LiteGraph 原始 computeSize（基于 widget 数量自动计算高度）
                const sz = LGraphNode.prototype.computeSize
                    ? LGraphNode.prototype.computeSize.apply(this, arguments)
                    : [200, 60];
                // 只覆盖宽度，高度由 ComfyUI 原生决定
                return [450, sz[1]];
            };

            // 强制设置节点宽度为 450px 并刷新画布
            setTimeout(() => {
                if (nodeRef.size) {
                    nodeRef.size[0] = 450;
                }
                if (nodeRef.graph && nodeRef.graph.setDirtyCanvas) {
                    nodeRef.graph.setDirtyCanvas(true, true);
                }
            }, 200);

            return result;
        };

        // ============ 钩子2：节点从工作流 JSON 恢复时 ============
        const onConfigure = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function (info) {
            const result = onConfigure ? onConfigure.apply(this, arguments) : undefined;

            // 恢复后重新应用 NSFW 过滤
            setTimeout(() => {
                filterAllComboWidgetsOnNode(this);
            }, 100);

            // 恢复 textarea 外观
            setTimeout(() => {
                syncTextareaAppearance(this, 86);
            }, 200);

            return result;
        };

        log('✅ PromptCraft LiteGraph 生命周期钩子已注册');
    },
});

// ==================== 全局初始化 ====================

// 0. 控制面板 → 子面板事件桥接
window.addEventListener('promptcraft:open-rule-manager', () => openRuleManager());
window.addEventListener('promptcraft:open-library-editor', () => openLibraryEditor());
window.addEventListener('promptcraft:open-history', () => openPromptHistory());
window.addEventListener('promptcraft:open-services', () => openServiceConfigModal());
window.addEventListener('promptcraft:open-hub', () => {
    // Find a ModelLoraGroupLoader node on the canvas
    const node = app.graph._nodes?.find(n => n.type === 'ModelLoraGroupLoader');
    if (node) {
        import('./lora_group/hub_panel.js').then(m => m.openHubPanel(node));
    } else {
        alert('请先在画布上添加一个 LoRA Group 节点');
    }
});
window.addEventListener('promptcraft:toggle-panel', (e) => {
    toggleFallbackPanel(e.detail.visible);
});

// 1. 加载 NSFW 标签缓存
loadNsfwLabelCache();

// 2. 注册设置面板
registerSettings();

// 3. 创建浮动快捷面板（兜底入口）
setTimeout(() => ensureFallbackPanel(), 3000);

log(`V${VERSION} 前端模块加载完成`);