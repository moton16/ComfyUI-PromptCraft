# ComfyUI-PromptCraft

## ⚠️ 版本号位置索引（更新版本时必改）

> 当前版本：**V1.3.6**
> 以下位置都硬编码了版本号，发版时必须同步更新：

| 文件 | 行号 | 内容 |
|------|------|------|
| `js/index.js` | `const VERSION = '...'` | 前端版本常量 |
| `js/control_panel.js` | `pc-brand-ver` | 设置面板显示版本 |
| `pyproject.toml` | `version = "..."` | Python 包版本（只支持语义化版本号，不能带 beta/mod 等后缀） |
| `__init__.py` | 末尾 `print(...)` | 启动日志版本 |
| `model_lora_loader.py` | 文件头 docstring | 节点版本注释 |
| `llm_client.py` | 文件头 docstring | 模块版本注释 |
| `thinking_control.py` | 文件头 docstring | 模块版本注释 |
| `README_zh.md` | badge + 版本历史 | 中文 README |
| `README_en.md` | badge | 英文 README |
| `CHANGELOG.md` | 顶部条目 | 更新日志 |

## Health Stack

- typecheck: mypy --ignore-missing-imports .
- lint: ruff check .
- test: pytest
- shell: shellcheck *.sh
- deadcode: vulture . --min-confidence 80
- gbrain: gbrain doctor --json (wrapped in timeout 5s)

## GBrain Configuration (configured by /setup-gbrain)
- Mode: local-stdio
- Engine: pglite
- Config file: ~/.gbrain/config.json (mode 0600)
- Setup date: 2026-05-31
- MCP registered: yes (user scope)
- Artifacts sync: off
- Current repo policy: read-write

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
