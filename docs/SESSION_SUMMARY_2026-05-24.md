# PromptCraft v1.2.1 Mod0 开发经验总结与反思

> 日期: 2026-05-24
> 版本跨度: V1.2.0 Mod1 → V1.2.1 Mod0

---

## 一、本次开发的核心问题

### 问题 1：DeepSeek 推理模型 API 调用不稳定

**现象**：5 次调用失败 3 次，日志显示模型返回 `"content": ""` 但实际响应在 `"reasoning_content"` 字段中。

**根因分析**：
- DeepSeek V4 Flash 是推理模型，默认开启思维链（chain-of-thought）
- 思维链输出走 `reasoning_content` 字段，`content` 可能为空
- 原始代码只读 `content`，空值直接判定为"格式异常"

**教训**：不能假设所有 OpenAI 兼容 API 的响应结构一致。推理模型（DeepSeek R1/V4、Qwen3、Gemini 2.5 等）有额外的 `reasoning_content` / `thinking` 字段，必须做兼容处理。

---

### 问题 2：LLM 改写 LoRA 触发词导致失效

**现象**：PromptEnhancer 接入 LLM 后，LoRA 的触发词被 LLM 改写或丢弃，导致 LoRA 不生效。

**根因**：LoRA 标签拼在 prompt 最前面，整条一起发给 LLM，LLM 输出替换整条字符串 — 没有结构化的保护机制。

**解决方案选择过程**：

| 方案 | 描述 | 可靠性 | 上下文感知 | 复杂度 |
|------|------|--------|-----------|--------|
| A. 前后分离 | LLM 只增强非 LoRA 部分 | 100% | 无 | 低 |
| B. 标记保护 | `///` 标记 + 指令约束 | ~85% | 有 | 低 |
| C. 标记+后验证 | B 的基础上加自动补回 | ~99% | 有 | 中 |
| D. 结构化输出 | LLM 只返回增量 | 100% | 有 | 高 |

最终选择 **方案 C**，理由：
- 保留 LLM 感知 LoRA 语义的能力（增强更协调）
- 后验证兜底确保标签不丢失
- 实现复杂度适中

---

## 二、架构设计反思

### 2.1 思维链控制的三层防御

参考 `prompt-assistan` 节点，最终采用三层防御：

```
第一层：发送模型特定的思维链关闭参数（prevention）
  ↓ 如果模型不支持或忽略
第二层：过滤输出中的 <think> 等标签（post-processing）
  ↓ 如果 content 为空
第三层：回退读取 reasoning_content（safety net）
```

**反思**：第一层是最干净的方案（从源头关闭），但不能 100% 依赖。三层防御确保了各种模型的兼容性。

### 2.2 per-service 配置 vs 全局配置

两个新开关（`disable_thinking`、`filter_thinking_output`）是 **per-service** 的，不是全局的。

**理由**：
- 不同服务可能用不同模型（一个 DeepSeek、一个 GPT）
- 同一个用户可能同时用推理模型和非推理模型
- per-service 配置粒度更细，不会互相干扰

**代价**：UI 每个服务都要单独配置，但默认值是 ON，大多数用户不需要改。

### 2.3 LoRA 标记保护的向后兼容

`///` 保护指令通过两个渠道注入：
1. **默认 system prompt**（`config_manager.py`）— 新用户自动获得
2. **动态注入**（`llm_client.py`）— 老用户无需重置配置

**反思**：不应强制覆盖用户已有的 system prompt。动态注入是更好的向后兼容策略。

---

## 三、技术细节备忘

### 3.1 思维链控制的模型匹配规则

```python
# 特定模型需要特殊参数
DeepSeek V3/V4/Chat → {"thinking": {"type": "disabled"}}
Qwen3（非 reasoning）→ {"enable_thinking": False}
Qwen3 R1/Thinking   → {"reasoning": {"effort": "none"}}
Gemini 2.0/2.5 Flash → {"reasoning_effort": "none"}
Gemini 3             → {"reasoning_effort": "low"}
```

**关键**：正则匹配必须排除不应关闭的模型（如 Gemini 2.5 Pro、Grok 4）。

### 3.2 `///` 标记的选择

- 不会与常见 prompt 内容冲突
- 不会被误判为权重语法（不像 `()`、`[]`）
- 对 LLM 来说是明确的分隔符
- 后验证时用 `.lower()` 做大小写不敏感匹配

### 3.3 流式响应中的 reasoning_content

DeepSeek 的流式 API 中，`reasoning_content` 走的是 `delta.reasoning_content`，而 `content` 可能全程为空。处理逻辑：
- 用 `has_content` 标记是否收到过 `content`
- 只在 `content` 从未出现时，才回退到 `reasoning_content`
- 如果 `filter_output` 开启，不 yield reasoning 内容（因为那是思维链，不是最终答案）

---

## 四、文件变更清单

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `thinking_control.py` | 新建 | 思维链控制模块（模型匹配 + 内容过滤） |
| `config_manager.py` | 修改 | 服务 schema 新增两个开关 + 默认 system prompt 更新 |
| `llm_client.py` | 修改 | 三处方法加入思维链控制 + LoRA 标记保护 |
| `prompt_enhancer.py` | 修改 | LoRA 标记包裹 + 后验证逻辑 |
| `js/lora_group/service_config.js` | 修改 | 前端开关 UI + checkbox 数据收集 |
| `js/lora_group/styles.css` | 修改 | toggle switch 样式 |
| `__init__.py` | 修改 | 版本号更新 |

---

## 五、后续可优化方向

1. **thinking_control.py 的规则需要持续维护** — 新模型发布时可能需要添加规则
2. **LoRA 标记保护的后验证可以更智能** — 当前是精确匹配，可以改为模糊匹配（处理 LLM 稍微改写了但语义相同的情况）
3. **system prompt 的可视化编辑** — 当前用户只能通过设置面板编辑，可以考虑加预览功能
4. **流式输出的实时 LoRA 验证** — 当前只在完整响应后验证，流式场景下可以边收边验证
