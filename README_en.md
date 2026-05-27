<p align="center">
  <img src="https://img.shields.io/badge/ComfyUI-Node-blueviolet?style=for-the-badge" alt="ComfyUI Node"/>
  <img src="https://img.shields.io/badge/Version-v1.2.3-brightgreen?style=for-the-badge" alt="Version 1.2.3"/>
  <img src="https://img.shields.io/badge/Status-Stable-ff69b4?style=for-the-badge" alt="Stable"/>
  <img src="https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge" alt="Python 3.8+"/>
</p>

<h1 align="center">🎨 PromptCraft</h1>
<h3 align="center">— ComfyUI Full-Dimensional Prompt Enhancement · LoRA Group Management · AI Agent —</h3>

<p align="center">
  <b>Prompt Writer's Block Buster · 15+ Dimension Tags · Dual Library Toggle · Weight Control · LLM Enhancement · LoRA Full-Stack Management · AI Agent Natural Language Control</b>
</p>

<p align="center">
  <i>From prompt generation to LoRA orchestration, from LLM enhancement to natural language-driven workflows — one plugin covers the entire AI art pipeline</i>
</p>

<p align="center">
  <a href="./README.md">🌐 中文</a> | <a href="./README_en.md">English</a>
</p>

---

## 📖 Overview

**PromptCraft** is a feature-rich ComfyUI custom node plugin that started by solving "prompt writer's block" and has evolved into a full-pipeline tool covering prompt generation, LoRA management, LLM integration, and AI Agent capabilities.

Core capabilities include: a professional Prompt library with **15+ dimensions** and **hundreds of bilingual (Chinese/English) tags**, **LoRA group management + canvas inline stack**, **multi-service LLM integration with intelligent chain-of-thought control**, and **AI Agent natural language-driven workflow control**.

> Whether you're creating prompts, orchestrating LoRAs, or managing entire workflows with natural language, PromptCraft helps you get it done efficiently.

---

## ✨ Features

### 🎯 Prompt Core

| Feature | Description |
|---------|-------------|
| **🎲 Multi-Mode Random Fill** | Each category supports 4 modes: Full Random / SFW Only / NSFW Only / Subgroup Random |
| **🏷️ 15+ Dimension Tag Library** | Scene, Action, Costume, Emotion, Camera Angle, Lens, Lighting, Color Tone, Style, Quality, etc. — bilingual |
| **⚖️ Independent Weight Control** | 4 core categories (Scene/Action/Costume/Emotion) each support 0.0~2.0 weight, generating SD-native `(tag:weight)` syntax |
| **📦 Preset Configs** | Built-in presets (Ancient Beauty, Urban Fashion, Sci-Fi Warrior, etc.) — one-click four-dimensional combo |
| **🔄 Smart Cache Management** | Auto-detects file changes; Prompt library edits take effect without restart |
| **📝 LoRA Prompt Injection** | Each LoRA can carry its own prompt group, injected at the front in PromptEnhancer, not overwritten by LLM |

### 🎛️ LoRA Full-Stack Management

- **Model & LoRA Group Loader** — Base model switching + LoRA group one-click loading
  - Supports Checkpoint dropdown selection, or select "None" to pass through upstream MODEL
  - LoRA stack displayed inline on canvas, individual LoRA + group references mixed and draggable
  - Per-entry toggle + Model/CLIP dual weight inputs
  - Group references resolved in real-time (expanded during backend execution), always uses latest group config
  - Unified multiplier slider (0.0~2.0×), scale all LoRA weights in a group at once
  - Missing LoRAs in groups auto-skip with warning, no execution interruption
- **LoRA Hub Unified Management Panel** — Browse, Groups, Agent 3-tab layout
  - LoRA Tab: Folder tree navigation + fuzzy search + favorites + detail view
  - Groups Tab: Create/Rename/Delete/Search + LoRA drag-to-add/reorder/weight editing
  - Supports LoRA config import/export (JSON files)
- **LoRA Prompt Loader** — Base model switching + LoRA stack + text merge, outputs plain text
  - Can connect to CLIP Text Encode Pro for merged encoding, compatible with standard CheckpointLoader pipeline

### 🤖 LLM Enhancement

- Supports **OpenAI-compatible APIs** (recommended: DeepSeek / GLM / Qwen)
- **Multi-Service Config** — Configure multiple API services with independent URL / Key / Model management
- Temperature and Max Tokens adjustable
- **One-Click Connection Test** — Built-in test button in settings panel
- **Dual Rule System** — SFW basic expansion / NSFW detailed expansion, independently toggled
- **Intelligent Chain-of-Thought Control** — Auto-sends chain-of-thought disable parameters based on model name (supports GLM / Qwen / DeepSeek / Gemini / Grok, etc.), filters chain-of-thought output from responses
- **LLM Prompt Input Box** — Pass additional custom instructions to the LLM from within the node

### 🤖 AI Agent

- **Natural Language Driven** — Describe needs in plain language, Agent auto-translates to structured operations
- **8 Operation Types** — `lora_add` / `lora_remove` / `lora_toggle` / `lora_weight` / `checkpoint` / `prompt_set` / `category_set` / `query`
- **Dual Entry Points** — LoRA Hub sidebar Agent Tab + canvas floating dialog
- **Message Bubble Interaction** — Distinguishes user/Agent roles, operation result cards with real-time feedback (success/fail/skip)
- **Quick Command Buttons** — One-click trigger for common operations, no typing needed
- **System Prompt Hardcoded** — Not editable from frontend, ensures LLM behavior consistency

### 📚 Dual Prompt Library Management

- **Standard Content Library (SFW)** — Built-in scene, action, costume, and other categorized tags
- **Special Content Library (NSFW)** — Independently managed, merged with SFW library when enabled
- **Visual Library Editor** — Popup table editing, supports add/delete/modify categories and tags
- **Subgroup Support** — Tags can be categorized by subgroups, supports subgroup-level random selection
- **Empty Library Auto-Recovery** — Auto-restores from built-in templates if user library is accidentally emptied

### ⚙️ ComfyUI Global Settings Integration

One-stop management in the ComfyUI settings panel:

| Function | Type |
|----------|------|
| 🤖 Multi-Service API Config | Text/Boolean/Slider inputs |
| 🧪 LLM API Connection Test | Button trigger |
| ⛔ Negative Prompt Editor | Button popup |
| 📝 Prompt Rule Manager | Button popup |
| 📚 Prompt Library Editor (SFW/NSFW) | Button popup |
| 🔄 Prompt Library Cache Reload | Button trigger |
| 📋 Version Info | Read-only display |

### 🛡️ Security & Robustness

- **API Key Masking** — Displayed as masked in settings panel, never exposed in plain text
- **Atomic Writes** — Temp file + rename, prevents config corruption from interrupted writes
- **Auto Template Sync** — Built-in template updates auto-sync to user config
- **Dual Library Cache Isolation** — SFW/NSFW independent cache with mtime invalidation
- **LoRA Sidecar Cache** — `.pc-info-info.json` caches computed results with version-based forced refresh

---

## 🚀 Installation

### Requirements

- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) (latest version or ComfyUI-aki branch recommended)
- Python 3.8+
- `aiohttp` (API route dependency)

### Installation Steps

#### Method 1: Git Clone (Recommended)

```bash
cd <ComfyUI root>/custom_nodes
git clone https://github.com/your-repo/moton-promptcraft.git
```

#### Method 2: Manual Extract

1. Download the latest ZIP package
2. Extract to `<ComfyUI root>/custom_nodes/moton-promptcraft/`
3. Start/Restart ComfyUI

### Initial Setup

1. After restarting ComfyUI, search for **"PromptCraft"** in the node list to find all nodes
2. **(Optional)** Open ComfyUI Settings → Find the **PromptCraft** configuration area
3. Enter your LLM API URL, API Key, and Model name (if using LLM enhancement)
4. Drag nodes into the canvas, select tags or use random mode, then click generate

---

## 📖 Usage Guide

### 🔰 Node Overview

PromptCraft provides 5 ComfyUI nodes:

| Node | Type | Description |
|------|------|-------------|
| **PromptCraft** | Prompt | Core prompt generation node — 15+ dimension tags + weight control + LLM enhancement |
| **Model & LoRA Group Loader** | Model Loader | Base model switching + LoRA group/stack management — outputs MODEL + CLIP + VAE + lora_prompt_data |
| **LoRA Prompt Loader** | Text Tool | LoRA stack management + base model switching — outputs plain text (positive_text / negative_text) |
| **CLIP Text Encode Pro** | Encoder | Upgraded CLIPTextEncode — additionally supports text2 input for merged encoding |
| **AI Chat** | Dialog | Click button to open Agent chat panel — natural language-driven LoRA/model operations |

### 🎨 PromptCraft Core Node

1. Right-click on ComfyUI canvas → **Add Node** → Search `PromptCraft`
2. Node input area contains the following modules:

   ```
   ┌─────────────────────────────────────────────────────────┐
   │ 📝 User Input                                            │
   │   Custom Prefix · User Prompt · Custom Suffix            │
   │                                                          │
   │ 👤 Subject Settings                                      │
   │   Subject Count · Character Type                         │
   │                                                          │
   │ 🎯 Core Content (Weightable)                             │
   │   Scene Type · Action/Pose · Costume · Emotion/Mood      │
   │   Weight: [0.0~2.0] per item independently               │
   │                                                          │
   │ 🎬 Shooting & Lens                                       │
   │   Camera Angle · Lens Type · Special Lens · Lens Filter  │
   │                                                          │
   │ 💡 Lighting & Color                                      │
   │   Light Source · Light Type                              │
   │                                                          │
   │ 🎨 Style & Quality                                       │
   │   Visual Style · Quality Level                           │
   │                                                          │
   │ ⚙️ Control                                               │
   │   Preset Config · Special Content Toggle · LLM Toggle    │
   │   Expansion Mode · LLM Prompt · Neg Prompt Type          │
   │   lora_prompt_data Input                                 │
   └─────────────────────────────────────────────────────────┘
   ```

3. Node outputs three values:
   - **Positive Prompt** — Assembled complete positive prompt
   - **Negative Prompt** — Generated negative prompt based on selected template
   - **Full Info** — Debug summary (includes length, LLM status, special content status)

### 🎛️ LoRA Management Workflow

**Recommended Pipeline A — Model Loader Type:**

```
CheckpointLoader → ModelLoraGroupLoader → KSampler
                          ↓
                    PromptCraft (lora_prompt_data input)
```

ModelLoraGroupLoader outputs MODEL/CLIP/VAE and lora_prompt_data simultaneously — one line handles model loading and prompt injection.

**Recommended Pipeline B — Plain Text Type:**

```
CheckpointLoader → LoraPromptLoader → CLIPTextEncodePro → KSampler
                          ↓
                    PromptCraft (lora_prompt_data input)
```

LoraPromptLoader outputs plain text, merged and encoded via CLIPTextEncodePro — more flexible.

### 🎲 Random Mode Details

Each category dropdown offers four random modes:

| Option | Behavior |
|--------|----------|
| `🎲 Random` | Follows global "Special Content" toggle to decide which library to randomize from |
| `🎲 SFW Library Only` | Forces random selection from SFW library only |
| `🎲 NSFW Library Only` | Forces random selection from NSFW library only (requires special content enabled) |
| `🎲 Random · <Subgroup>` | Random within that subgroup only |

> Every run that includes any random tag will auto-generate different results, ensuring each image's prompt is unique.

### 🤖 LLM Enhancement

1. Enter your LLM's API URL, API Key, and Model name in the ComfyUI settings panel
2. Enable the "LLM" toggle in the node
3. Choose expansion mode: "Basic Expansion" or "Detailed Expansion"
4. (Optional) Enter special instructions for the LLM in the "LLM Prompt" input box
5. At runtime, the system first assembles library tags, then sends them to the LLM for detail enhancement
6. Chain-of-thought auto-control — system automatically disables chain-of-thought based on model name (supports GLM-4.x / Qwen3 / DeepSeek / Gemini / Grok, etc.)

### 🤖 AI Agent Usage

1. Switch to the **Agent Tab** in the LoRA Hub panel, or click the AI Chat node button on the canvas
2. Describe your needs in natural language, for example:
   - "Switch to a cyberpunk style LoRA, weight 0.8"
   - "Lower all LoRA weights to 0.5"
   - "What's the current workflow status?"
3. Agent automatically parses into structured operations and returns result cards after execution

---

## 🔢 Weight Syntax

Node weight output follows Stable Diffusion native syntax:

| Weight Value | Output Syntax | Effect |
|-------------|---------------|--------|
| `1.0` (default) | `tag` | Normal weight |
| `> 1.0` | `(tag:1.5)` | Enhanced weight |
| `< 1.0` | `[tag]` | Reduced weight |
| `0.0` | (not output) | Skip this tag |

---

## 📁 Data Storage

### User Config Directory (Editable)

```
<ComfyUI user dir>/default/prompt_enhancer/
├── llm_config.json           # LLM API config (multi-service)
├── llm_system_prompt.json    # System Prompt rule config
├── sfw_prompts.json          # SFW Prompt library (user-editable)
├── nsfw_prompts.json         # NSFW Prompt library (user-editable)
├── negative_prompt.json      # Custom negative prompts
├── lora_groups.json          # LoRA group config
├── lora_prompts.json         # LoRA Prompt group config
└── service_config.json       # Multi-service API config
```

### Built-in Template Directory (Read-only Reference)

```
<moton-promptcraft>/data/
├── sfw_prompts.json          # SFW built-in template
├── nsfw_prompts.json         # NSFW built-in template
├── llm_config.json           # LLM default config
├── llm_system_prompt.json    # System Prompt default template
└── default_prompts.json      # Legacy compatibility file (migrated)
```

> When built-in templates are updated, the system auto-syncs to the user directory, ensuring dropdowns always reflect the latest tags.

---

## 🗂️ Project Structure

```
moton-promptcraft/
├── __init__.py                   # Plugin entry, node registration + config initialization
├── prompt_enhancer.py            # Core node (INPUT_TYPES, generation logic, weight control)
├── model_lora_loader.py          # Model & LoRA Group Loader node
├── lora_prompt_loader.py         # LoRA Prompt Loader node
├── clip_text_encode_pro.py       # CLIP Text Encode Pro node
├── ai_chat.py                    # AI Chat node
├── config_manager.py             # Config manager (singleton, persistent CRUD)
├── llm_client.py                 # OpenAI-compatible LLM client + chain-of-thought control
├── api_routes.py                 # aiohttp API routes (frontend communication)
├── lora_group_manager.py         # LoRA group manager (CRUD + disk scan)
├── lora_prompt_manager.py        # LoRA Prompt group manager
├── lora_scanner.py               # LoRA disk scanner + sidecar cache
├── thinking_control.py           # Chain-of-thought auto-control (model-matched rules)
├── agent_prompt.py               # Agent System Prompt definition
├── CHANGELOG.md                  # Changelog
├── README.md                     # This document
├── js/
│   ├── index.js                  # Frontend main entry (LiteGraph hooks, settings panel)
│   ├── chat_panel.js             # AI Agent floating dialog
│   ├── control_panel.js          # Settings panel content generator
│   ├── lora_group/
│   │   ├── index.js              # LoRA Group frontend registration entry
│   │   ├── api.js                # LoRA/group API call wrappers
│   │   ├── stack_api.js          # Stack state management module
│   │   ├── canvas_widget.js      # Canvas inline LoRA stack widget
│   │   ├── hub_panel.js          # LoRA Hub unified management panel
│   │   ├── agent_panel.js        # Agent dialog panel
│   │   ├── agent_executor.js     # Agent operation executor
│   │   ├── service_config.js     # Multi-service API config panel
│   │   └── styles.css            # Hub panel styles
│   └── lora_prompt_loader/
│       └── index.js              # LoRA Prompt Loader frontend registration
├── data/                         # Built-in template data
│   ├── sfw_prompts.json
│   ├── nsfw_prompts.json
│   ├── llm_config.json
│   ├── llm_system_prompt.json
│   └── default_prompts.json
└── design/                       # Design docs & prototypes
```

---

## 📊 Code Statistics

| Category | Lines | Files |
|----------|-------|-------|
| Python Backend | ~4,100 | 15 |
| JavaScript Frontend | ~4,850 | 12 |
| CSS Styles | ~2,850 | 1 |
| **Total** | **~11,800** | **28** |

---

## 📝 Version History

### v1.2.3 (2026-05-26) — Current Version

- 🔧 **Update**: Prompt library consolidation and optimization, integrated V1.2.1 test improvements
- 🔧 **Optimize**: Improved stability

### v1.2.1 (2026-05-24)

- 🔧 **Adjust**: LoRA Prompt Loader base model loading logic fix
- 🔧 **Adjust**: LoRA application fix, hidden widgets changed to optional input method
- 🐛 **Fix**: Prompt group filtering and group reference expansion logic fix

### v1.2.0 (2026-05-21) — Major Update

- 🚀 **New**: Model & LoRA Group Loader node — base model switching + LoRA group one-click loading
- 🚀 **New**: LoRA stack mode — canvas inline LoRA list, individual + group mixed arrangement
- 🚀 **New**: LoRA Hub unified management panel — Browse/Groups/Agent 3 tabs
- 🚀 **New**: LoRA Prompt group system — each LoRA can carry its own prompt
- 🚀 **New**: AI Agent module — natural language-driven LoRA/model operations
- 🚀 **New**: LoRA Prompt Loader + CLIP Text Encode Pro nodes
- 🚀 **New**: AI Chat node
- 🚀 **New**: Intelligent chain-of-thought control — auto-disables based on model
- 🚀 **New**: Multi-service API configuration
- 🚀 **New**: 14+ API endpoints (group CRUD / LoRA scanning / Agent, etc.)
- 🔧 **Adjust**: Frontend modular refactor, LoRA code split into independent files
- 🔧 **Adjust**: Version number unified to v1.2.0

### v1.1.2 (2026-05-16)

- 🔧 **Adjust**: Removed some semantically overlapping Prompt groups, streamlined UI
- 🔧 **Adjust**: Improved LLM API connection test method
- 🐛 **Fix**: Fixed known issues

### v1.1.1 (2026-05-13)

- 🚀 **New**: Added "LLM Prompt" input box at bottom of node
- 🚀 **New**: Added "Negative Prompt Editor" in settings panel
- 🚀 **New**: Added NSFW subgroup for Action/Pose
- 🔧 **Adjust**: User Prompt concatenation order moved before library tags
- 🔧 **Adjust**: Removed custom negative prompt input from node, centralized in settings panel
- 🐛 **Fix**: Fixed UI overlap issue caused by abnormal input box height

### v1.1.0 (2026-05-12) — First Official Release

- 15+ dimension tag categories, bilingual (Chinese/English)
- Standard / Special content dual library independent management
- Weight syntax natively compatible with SD
- Four-dimensional preset configs (Scene, Action, Costume, Emotion)
- Optional LLM enhancement
- Deep ComfyUI settings panel integration
- Library content and LLM rules support custom editing

Full changelog available at [CHANGELOG.md](./CHANGELOG.md).

---

## ⚠️ Notes

1. **Special content library is empty by default** — Special content toggle is off by default, node dropdowns only show SFW tags
2. **API Key Security** — API Key is displayed as masked in settings panel, never exposed in plain text
3. **Config Corruption Protection** — Atomic write mechanism prevents config file corruption from interrupted writes
4. **Empty Library Auto-Recovery** — If user library is accidentally emptied, auto-restores from built-in templates
5. **LLM Requires Your Own Key** — LLM enhancement requires configuring your own OpenAI-compatible API Key
6. **Subgroups Only for Core Categories** — Subgroup random currently only works for Scene Type, Action/Pose, Costume, and Emotion/Mood
7. **LoRA File Location** — LoRA scanning reads from `ComfyUI\models\loras`, no manual import needed
8. **Agent Operation Scope** — AI Agent currently only supports LoRA stack and base model operations, canvas node wiring not yet supported

---

## ❓ FAQ

<details>
<summary><b>Q: Why can't I see special content tags in the node dropdown?</b></summary>
You need to enable the "Special Content" toggle in the node for special content tags to appear.
</details>

<details>
<summary><b>Q: I modified the Prompt library, why hasn't the node dropdown updated?</b></summary>
The system auto-reloads the cache after saving the Prompt library. If it still hasn't updated, manually click the "Reload Prompt Library Cache" button in the settings panel.
</details>

<details>
<summary><b>Q: How do I customize negative prompts?</b></summary>
Open ComfyUI Settings → PromptCraft → Click the "Negative Prompt Editor" button, edit and save in the popup. Then in the node, select "Negative Prompt Type → Custom".
</details>

<details>
<summary><b>Q: LLM enhancement isn't working, what should I do?</b></summary>
Please check: ① Is LLM enabled in the settings panel? ② Are API URL, API Key, and Model filled in correctly? ③ Is the "LLM" toggle checked in the node? ④ Use the "Test API Connection" button in the settings panel to verify your configuration.
</details>

<details>
<summary><b>Q: What's the difference between ModelLoraGroupLoader and LoraPromptLoader?</b></summary>
We recommend using ModelLoraGroupLoader. LoraPromptLoader is a legacy node from earlier design and is no longer maintained.
</details>

<details>
<summary><b>Q: What operations does the AI Agent support?</b></summary>
Currently supports 8 operations: add/remove/toggle/adjust-weight LoRA, switch base model, set prompt, set category selection, query current status. Canvas node wiring is not yet supported and will be improved in future updates.
</details>

<details>
<summary><b>Q: What's the difference between group references and individual LoRAs?</b></summary>
Group references are saved LoRA collections that are expanded into concrete LoRA lists during backend execution; individual LoRAs are single LoRAs added directly. Both can be mixed in the stack, with group references identified by purple names.
</details>

---

## 🤝 Contributing

Issues and Pull Requests are welcome!

- 🐛 **Report Bugs**: Please submit a [GitHub Issue]
- 💡 **Feature Requests**: Describe your ideas in an Issue
- 📦 **Extend Prompt Library**: Contributions of high-quality tags are welcome

## 📬 Contact

- **Author**: Moton
- **Email**: Moton16@163.com

---

## 📄 License

This project follows the original open-source license. See the license file in the project root directory for details.

---

<p align="center">
  <b>✨ PromptCraft — From prompts to workflows, ensuring every creation is inspired ✨</b>
  <br>
  <i>If this plugin helped you, feel free to give the project a ⭐</i>
</p>
