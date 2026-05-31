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
