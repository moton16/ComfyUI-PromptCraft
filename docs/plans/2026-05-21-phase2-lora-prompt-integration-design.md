# Phase 2 设计文档 — LoRA Prompt 联动 + Agent 内置 Prompt

**日期：** 2026-05-21
**版本：** V1.2.0 Mod2
**状态：** 实施中

## 需求

1. 每个 LoRA 可存储多组 prompt，通过节点连线注入 PromptEnhancer
2. LoRA prompt 在 PromptEnhancer 最前端注入，LLM 不碰
3. Agent 内置 system prompt 独立 Python 文件，前端不可编辑
4. LLM 客户端新增 agent_call() 方法

## 架构

### 新增文件

- `lora_prompt_manager.py` — LoRA prompt 组 CRUD 单例
- `agent_prompt.py` — Agent 内置 prompt（开发者编辑）

### 修改文件

- `model_lora_loader.py` — 新增 STRING 输出 `lora_prompt_data`
- `prompt_enhancer.py` — 新增 optional STRING 输入 `lora_prompt_data`，最前端注入
- `llm_client.py` — 新增 `agent_call()` 方法
- `config_manager.py` — 管理 lora_prompts.json
- `api_routes.py` — 新增 4 个 LoRA prompt API
- 前端 `canvas_widget.js` — LoRA 栈条目增加 ✎ 按钮
- 前端 `group_panel.js` — LoRA 列表增加 prompt 编辑区
- 前端 `api.js` — 新增 prompt API 封装

### 数据流

```
ModelLoraGroupLoader
  ├── MODEL / CLIP 输出
  └── lora_prompt_data (STRING JSON) 输出

PromptEnhancer
  ├── lora_prompt_data 输入 ← 接收 LoRA prompt 数据
  ├── 1. 注入 LoRA prompt（最前端）
  ├── 2. 库标签组装
  ├── 3. 用户 Prompt
  ├── 4. LLM 扩写（可选，不碰 LoRA prompt）
  └── 5. 正面提示词 / 负面提示词 输出
```

### lora_prompts.json 结构

```json
{
  "version": "1.0.0",
  "loras": {
    "<lora_relative_path>": {
      "groups": [
        {
          "name": "组名",
          "prompts": ["英文提示词"],
          "negative": "负面提示词（可选）"
        }
      ]
    }
  }
}
```

### API 端点

- GET `/lora_prompts` — 全部配置
- GET `/lora_prompts/<lora>` — 单个 LoRA 配置
- POST `/lora_prompts/<lora>` — 创建/更新
- DELETE `/lora_prompts/<lora>/group/<name>` — 删除 prompt 组
