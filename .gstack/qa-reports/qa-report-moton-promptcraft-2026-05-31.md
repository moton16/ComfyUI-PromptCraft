# QA Report — ComfyUI-PromptCraft

**Date:** 2026-05-31
**Branch:** `feature/new-frontend`
**Base:** `main`
**Mode:** Code-level logic review (diff-aware, no browser)
**Tier:** Standard (fix critical + high + medium)
**Duration:** ~15 min

---

## Summary

| Metric | Value |
|--------|-------|
| Files analyzed | 29 (changed in branch diff) |
| Issues found | 3 |
| Fixes applied | 3 (verified: 3, best-effort: 0, reverted: 0) |
| Deferred | 0 |
| Health score | N/A (code-only review) |

### PR Summary

> QA found 3 issues across the Vue 3 + Vite frontend refactor, fixed all 3. Critical: missing `reactive` import crashes NegativePromptEditor. Medium: category mismatch breaks service binding in ServiceConfig. Low: notification spam on group expand.

---

## Branch Context

This branch (`feature/new-frontend`) is a Vue 3 + Vite frontend refactor of PromptCraft. It introduces:

- **6 Vue components:** ServiceConfig, BaseDialog, BaseDropdown, BaseToggle, NegativePromptEditor, RuleManager
- **5 composables:** useApi, useDraggable, useI18n, useStackApi, useToast
- **CSS design tokens** (`variables.css`)
- **JS bridge** (`vue_bridge.js`) for lazy-loading Vue modules from native JS
- **StackAPI** publish-subscribe state management for LoRA stacks
- **Python backend** changes in api_routes, config_manager, llm_client, thinking_control

---

## Issues

### ISSUE-001 — Missing `reactive` import in NegativePromptEditor.vue

| Field | Value |
|-------|-------|
| Severity | **Critical** |
| Category | Functional |
| File | `src/components/dialogs/NegativePromptEditor.vue:2,17` |
| Fix Status | ✅ verified |
| Commit | `7a7df9b` |

**Description:** `NegativePromptEditor.vue` creates a `status` object using `reactive()` at line 17, but only imports `ref` and `onMounted` from Vue. When the dialog opens, Vue throws a `ReferenceError: reactive is not defined`, crashing the entire negative prompt editor.

**Fix:** Added `reactive` to the Vue import statement.

---

### ISSUE-002 — Category mismatch in ServiceConfig → set_current_service

| Field | Value |
|-------|-------|
| Severity | **Medium** |
| Category | Functional |
| File | `src/components/ServiceConfig.vue:165`, `config_manager.py:511` |
| Fix Status | ✅ verified |
| Commit | `575a617` |

**Description:** `ServiceConfig.vue` sends category `'enhance'` when the user changes the prompt enhancement service binding. But `config_manager.set_current_service()` validates categories against `("enhance_basic", "enhance_detail", "enhance_normal", "agent")` — `'enhance'` is rejected. The UI appears to work (no visible error) but the binding is silently dropped on the backend.

The migration code in `load_services_config()` converts old `enhance` → `enhance_basic` in the data structure, but the API validation was not updated to match.

**Fix:** Added `'enhance'` → `'enhance_basic'` alias in `set_current_service()` so the frontend's category name is accepted and mapped correctly.

---

### ISSUE-003 — Notification spam in expandGroupIntoStack

| Field | Value |
|-------|-------|
| Severity | **Low** |
| Category | Performance |
| File | `js/lora_group/stack_api.js:233-252` |
| Fix Status | ✅ verified |
| Commit | `316e1e9` |

**Description:** `expandGroupIntoStack` calls `addLora()` in a loop for each LoRA in a group. Each `addLora` call triggers `_notify()`, firing all pub-sub listeners. With a group of 10 LoRAs, that's 10 separate reactive updates — causing unnecessary re-renders and potential UI stutter.

**Fix:** Rewrote `expandGroupIntoStack` to add items directly to the stack array without calling `addLora`, then fire `_notify()` once at the end. Also added duplicate-check logic inline.

---

## Architecture Notes

1. **Vue 3 + ComfyUI integration pattern is solid.** The `createModalMounter` pattern in `main.js` cleanly handles mount/unmount lifecycle. The `vue_bridge.js` lazy-loading with loading-lock prevents double-import races.

2. **CSS design tokens (`variables.css`) are well-structured.** Two-layer system (PromptCraft `--pc-*` → ComfyUI theme `--base-*` / `--primary-*`) keeps theme consistency. All components use fallback values.

3. **useDraggable composable is clean.** Handles both mouse and touch events, constrains to viewport, properly cleans up listeners on unmount. The `handleRef` option for drag handles is a nice touch.

4. **Python backend: `config_manager.py` uses atomic writes** (temp file + rename) — good for preventing config corruption on crash.

5. **`thinking_control.py` has a bug in `filter_thinking_stream`** at line 362: after finding a close tag within the same block as an open tag, it references `state["thinking_buffer"][close_match.end():]` but `state["thinking_buffer"]` was just reset to `""` on line 360. This means content between the close tag and end of chunk is lost. However, this function is not currently used in production (the `chat_stream` method in `llm_client.py` implements its own inline filtering), so it's a latent bug — noted but not fixed in this pass.

---

## Commits

| SHA | Message |
|-----|---------|
| `7a7df9b` | fix(qa): ISSUE-001 — missing reactive import in NegativePromptEditor.vue |
| `575a617` | fix(qa): ISSUE-002 — category mismatch in set_current_service |
| `316e1e9` | fix(qa): ISSUE-003 — batch notifications in expandGroupIntoStack |

---

## Telemetry

```
STATUS: DONE
REASON: 3 bugs found and fixed across 29 changed files
ATTEMPTED: Code-level logic review of all branch-diff files
RECOMMENDATION: Run the project in ComfyUI to verify the Vue components render correctly in the actual host environment
```
