.PHONY: lint typecheck test format deadcode check migrate-test pack clean

lint:
	ruff check .

typecheck:
	mypy --ignore-missing-imports .

test:
	pytest tests/ -v

format:
	ruff format . && ruff check --fix .

deadcode:
	vulture . --min-confidence 80

check: lint typecheck test

migrate-test:
	python migrate_legacy_prompts.py

pack:
	python pack_release.py

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + ; rm -rf .pytest_cache .ruff_cache
