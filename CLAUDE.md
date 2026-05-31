# ComfyUI-PromptCraft

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
