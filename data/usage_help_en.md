# PromptCraft Usage Guide

## Introduction

PromptCraft is a feature-rich ComfyUI prompt enhancement node with built-in library random selection + LLM detail enhancement.

## Core Features

### Prompt Enhancer

- **Built-in Prompt Library**: SFW / NSFW libraries covering scenes, actions, clothing, expressions, and more
- **Random Selection**: Each category supports full random, SFW-only random, and NSFW-only random modes
- **LLM Expansion**: Integrates with LLMs for basic, detailed, and standard expansion modes
- **Negative Prompts**: Built-in negative prompt library with random selection or custom input

### LoRA Management

- **LoRA Hub**: Centralized LoRA file management with search, favorites, and grouping
- **LoRA Stack**: Manage LoRA loading order and weights directly on canvas nodes
- **Group References**: Combine multiple LoRAs into groups for one-click application

### Prompt Tools

- **Rule Manager**: Set SFW / NSFW enhancement rules
- **Library Editor**: Edit categories and options in the prompt library
- **Prompt History**: View and reuse past prompts

## Quick Start

1. Add a **PromptCraft** node to the canvas
2. Enter your base prompt in the **User Prompt** field
3. Select specific tags or random modes from each category dropdown
4. For LLM expansion, configure an API service in settings first, then enable **LLM**
5. Connect positive/negative prompt outputs to downstream nodes

## Settings Panel

Click the gear icon in ComfyUI's top-right corner → find the **PromptCraft** group:

- **Language**: Switch between Chinese / English
- **API Service Configuration**: Manage LLM service connections
- **Floating Panel**: Toggle the quick-access panel in the bottom-right corner
- **Prompt Tools**: Rule Manager, Library Editor, History

## FAQ

**Q: Prompt library changes not taking effect?**
A: After editing the library, click the "Reload Cache" button in the settings panel.

**Q: LLM expansion not responding?**
A: Check if the API endpoint URL and API Key are correct in the service configuration. Use the "Test Connection" button to verify.

**Q: How to add custom prompts?**
A: Use the "Library Editor" in the settings panel to directly edit categories and options in the SFW / NSFW libraries.

---

