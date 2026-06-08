# Code Quality Fix Plan — V1.3.5

## Problem Statement

CODE_QUALITY_REPORT.md 评分 82.4/100，存在以下问题需要修复。主人要求全部修复，不计成本。

## Scope

### In Scope
1. **P0** — `control_panel.js:252` 版本号不一致（v1.2.5 Mod2 → v1.3.5）
2. **P1** — `prompt_enhancer.py` LEGACY_*_MAP 迁移映射表独立为 `legacy_migration.py`
3. **P1** — `prompt_enhancer.py` 拆分 `generate()` 为子函数（158行 → ~5个30行函数）
4. **P1** — `api_routes.py` 统一使用 `api_handler` 装饰器（35+端点）
5. **P2** — JS 文件补充 JSDoc 注释（重点：promptcraft-vue.js、hub_panel.js、canvas_widget.js）

### NOT in Scope
- `promptcraft-vue.js` 拆分为 Vue SFC（这是 Vite 构建产物，需改 src/ 源码，另案处理）
- `config_manager.py` God Object 拆分（基础设施级改动，风险过高）
- JS 测试覆盖（工程量大，单独排期）
- `hub_panel.js` CSS 提取（前端重构子任务）

## Affected Files

| 文件 | 变更类型 | 风险 |
|------|---------|------|
| `js/control_panel.js` | 修改 1 行 | 零 |
| `prompt_enhancer.py` | 重构（拆函数 + 移出常量） | 低-中 |
| `legacy_migration.py` | 新增 | 低 |
| `api_routes.py` | 重构（统一装饰器） | 低-中 |
| `tests/test_prompt_enhancer.py` | 可能需更新 mock 路径 | 低 |

## Implementation Details

### Task 1: control_panel.js 版本号修复
- 文件：`js/control_panel.js:252`
- 变更：`PromptCraft v1.2.5 Mod2` → `PromptCraft v1.3.5`

### Task 2: LEGACY_*_MAP 独立
- 新建 `legacy_migration.py`
- 移入 `LEGACY_KEY_MAP`、`LEGACY_RANDOM_MAP`、`LEGACY_EXPAND_MAP`（~90行）
- `prompt_enhancer.py` 改为 `from .legacy_migration import ...`

### Task 3: generate() 拆分
当前 generate() 职责：
1. kwargs 迁移（`_prepare_kwargs`）
2. LoRA Prompt 注入
3. 预设配置解析
4. 核心内容分类遍历
5. 技术参数遍历
6. LLM 增强调用
7. 负面提示词生成
8. 历史记录保存

拆分为：
- `_inject_lora_prompts(kwargs)` → (lora_prompt_elements, lora_negative_elements)
- `_build_prompt_elements(kwargs, special_enabled, lora_prompt_elements)` → list[str]
- `_enhance_with_llm(positive_prompt, kwargs, lora_prompt_elements)` → (str, bool)
- `_generate_negative(negative_type, lora_negative_elements)` → str
- `_save_history(positive_prompt, negative_prompt, kwargs)` → None
- generate() 变为调度器，调用上述子函数

### Task 4: api_routes.py 统一装饰器
当前状态：`api_handler` 装饰器已存在但只有少数端点使用。
目标：所有纯 CRUD 端点统一使用 `@api_handler("描述")`，消除重复 try/except。
保留特殊端点（如 test_llm_connection）的自定义错误处理。

### Task 5: JS JSDoc 补充
- `promptcraft-vue.js`：给主要函数和组件块加 JSDoc
- `hub_panel.js`：给 openHubPanel()、createXxxCard() 等关键函数加 JSDoc
- `canvas_widget.js`：给 StackAPI 和 widget 相关函数加 JSDoc

## Test Plan
- 运行 `pytest tests/test_prompt_enhancer.py -v` 验证 generate() 重构不破坏行为
- 运行 `pytest tests/ -v` 全量回归
- 手动检查 `js/control_panel.js` 版本号显示正确

## Risk Mitigation
- generate() 拆分保持函数签名不变，只做内部重构
- LEGACY_*_MAP 独立是纯搬文件，零逻辑变更
- api_routes.py 统一装饰器只消除重复，不改变 API 行为
- 所有变更都有测试覆盖
