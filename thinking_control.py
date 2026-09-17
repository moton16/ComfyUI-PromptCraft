"""
思维链控制模块
根据模型名称自动发送关闭思维链的参数，并过滤响应中的思维链输出

V1.3.3 — 中文变量名→英文标识符改造，支持 nodeDefs.json 双语翻译
V1.3.5 — 修复前端旧工作流值迁移、随机填充过滤、i18n 缺失 key
V1.3.6 — 版本号更新
V1.3.7 — 优化代码结构
V1.4.0 — 自定义规则改由 config_manager 统一读取用户配置目录

参考 prompt-assistan 的 thinking_control.py 设计
"""

import json
import re
from typing import Any, Dict, List

# ==================== 模型匹配规则 ====================

THINKING_CONTROL_RULES: List[Dict[str, Any]] = [
    # DeepSeek 系列（官方格式）
    {
        "name": "deepseek_v3_thinking",
        "patterns": [
            r"deepseek[-_/.]?v3(\.1|\.2)?",
            r"deepseek[-_/.]?chat",
            r"deepseek[-_/.]?v4",
            r"deepseek[-_/.]?v2\.5",
        ],
        "params": {"thinking": {"type": "disabled"}},
    },
    # DeepSeek R1 系列（推理模型）
    {
        "name": "qwen_deepseek_reasoning",
        "patterns": [
            r"qwen.*[-_/.]?(r1|thinking)",
            r"deepseek.*[-_/.]?(r1|reason)",
        ],
        "params": {"reasoning": {"effort": "none"}},
    },
    # Qwen 系列（官方格式：enable_thinking）
    {
        "name": "qwen_enable_thinking",
        "patterns": [
            r"qwen[-_/.]?3",
            r"qwen.*[-_/.]?vl",
            r"qwen[-_/.]?2\.5",
            r"qwen[-_/.]?plus",
            r"qwen[-_/.]?max",
            r"qwen[-_/.]?turbo",
        ],
        "params": {"enable_thinking": False},
    },
    # 智谱 GLM 系列（官方格式）
    {
        "name": "zhipu_glm",
        "patterns": [
            r"glm[-_/.]?5\.1",
            r"glm[-_/.]?5",
            r"glm[-_/.]?5[-_/.]?(turbo|v)",
            r"glm[-_/.]?4\.7",
            r"glm[-_/.]?4\.6",
            r"glm[-_/.]?4\.5",
            r"glm[-_/.]?4\.5v",
        ],
        "params": {"thinking": {"type": "disabled"}},
    },
    # 小米 MiMo 系列（官方格式）
    {
        "name": "mimo_thinking",
        "patterns": [
            r"mimo[-_/.]?v2\.5",
            r"mimo[-_/.]?v2\.5[-_/.]?(pro|flash)",
            r"mimo[-_/.]?v2[-_/.]?(pro|flash|omni)",
        ],
        "params": {"thinking": {"type": "disabled"}},
    },
    # 硅基流动 SiliconFlow 系列（官方格式：enable_thinking）
    # 注意：模型名在 build_thinking_suppression 中已被 lower()，pattern 必须全小写
    {
        "name": "siliconflow_thinking",
        "patterns": [
            r"siliconflow[-_/.]?(glm|deepseek|qwen)",
            r"pro/zai-org/glm[-_/.]?(5|4\.7)",
            r"zai-org/glm[-_/.]?(4\.6|4\.5)",
            r"deepseek-ai/deepseek[-_/.]?v3\.(1|2)",
            r"qwen/qwen3[-_/.]?(8b|14b|32b|30b)",
            r"qwen/qwen3\.5[-_/.]?(397b|122b|35b|27b|9b|4b)",
            r"tencent/hunyuan[-_/.]?a13b",
        ],
        "params": {"enable_thinking": False},
    },
    # Claude 系列
    {
        "name": "claude_thinking",
        "patterns": [
            r"claude[-_/.]?(3\.5|3\.7|4)[-_/.]?(sonnet|opus|haiku)",
            r"claude[-_/.]?(sonnet|opus|haiku)[- _]?(3\.5|3\.7|4)",
        ],
        "params": {"thinking": {"type": "disabled"}},
    },
    # Gemini 2 系列
    {
        "name": "gemini2_reasoning",
        "patterns": [r"gemini[-_/.]?2\.(0|5)[-_/.]?(flash|lite)"],
        "params": {"reasoning_effort": "none"},
    },
    # Gemini 3 系列
    {
        "name": "gemini3_thinking",
        "patterns": [r"gemini[-_/.]?3"],
        "params": {"reasoning_effort": "low"},
    },
    # Grok 3 Mini
    {
        "name": "grok3_mini_reasoning",
        "patterns": [r"grok[-_/.]?3[-_/.]?mini"],
        "params": {"reasoning_effort": "low"},
    },
]

# 明确不支持关闭的模型
EXCLUDE_PATTERNS = [
    r"gemini[-_/.]?2\.5[-_/.]?pro",
    r"grok[-_/.]?4",
    r".*speciale",
]

# 模糊匹配关键词（当精确匹配失败时使用）
FUZZY_KEYWORDS: Dict[str, Dict[str, Any]] = {
    "deepseek": {"thinking": {"type": "disabled"}},
    "qwen": {"enable_thinking": False},
    "claude": {"thinking": {"type": "disabled"}},
    "glm": {"thinking": {"type": "disabled"}},
    "gemini": {"reasoning_effort": "none"},
    "grok": {"reasoning_effort": "low"},
    "mimo": {"thinking": {"type": "disabled"}},
    "minimax": {"thinking": {"type": "disabled"}},
    "siliconflow": {"enable_thinking": False},
    "hunyuan": {"enable_thinking": False},
}


# V0-DATA-01: 自定义规则/参数改由 config_manager 统一读取用户配置目录
# （原实现直读插件 data/ 目录，导致用户在用户配置目录修改的规则不生效）
# config_manager 内部已处理文件不存在与异常，此处仅做 import 失败兜底


def _load_custom_rules() -> List[Dict[str, Any]]:
    """加载用户自定义规则（通过 config_manager 读取用户配置目录）"""
    try:
        from .config_manager import config_manager
        return config_manager.get_custom_thinking_rules()
    except Exception as e:
        print(f"[ThinkingControl] 加载自定义规则失败: {e}")
    return []


def _load_custom_params() -> Dict[str, Any]:
    """加载用户自定义参数（通过 config_manager 读取用户配置目录）"""
    try:
        from .config_manager import config_manager
        return config_manager.get_custom_thinking_params()
    except Exception as e:
        print(f"[ThinkingControl] 加载自定义参数失败: {e}")
    return {}


def build_thinking_suppression(model: str, disable_thinking: bool = True, aggressive: bool = False) -> Dict[str, Any]:
    """
    根据模型名称返回思维链控制参数

    Args:
        model: 模型名称
        disable_thinking: True=关闭思考
        aggressive: True=对未匹配模型强制发送通用参数（可能导致API错误）

    Returns:
        思维链控制参数字典，或空字典
    """
    if not model or not disable_thinking:
        return {}

    model_lower = model.strip().lower()

    # 排除规则
    for pattern in EXCLUDE_PATTERNS:
        if re.search(pattern, model_lower):
            print(f"[ThinkingControl] 模型 {model} 匹配排除规则，跳过思维链控制")
            return {}

    # 1. 遍历内置规则，返回第一个匹配
    for rule in THINKING_CONTROL_RULES:
        for pattern in rule["patterns"]:
            if re.search(pattern, model_lower):
                params = rule["params"].copy()
                print(f"[ThinkingControl] 模型 {model} 匹配规则 {rule['name']}，参数: {params}")
                return params

    # 2. 遍历用户自定义规则
    custom_rules = _load_custom_rules()
    for rule in custom_rules:
        patterns = rule.get("patterns", [])
        for pattern in patterns:
            try:
                if re.search(pattern, model_lower):
                    params = rule.get("params", {}).copy()
                    print(f"[ThinkingControl] 模型 {model} 匹配自定义规则 {rule.get('name', 'unknown')}，参数: {params}")
                    return params
            except re.error:
                continue

    # 3. 模糊匹配：如果模型名称包含特定关键词，使用默认参数
    for keyword, default_params in FUZZY_KEYWORDS.items():
        if keyword in model_lower:
            params = default_params.copy()
            print(f"[ThinkingControl] 模型 {model} 模糊匹配关键词 {keyword}，参数: {params}")
            return params

    # 4. 如果用户配置了全局自定义参数，使用它
    custom_params = _load_custom_params()
    if custom_params:
        print(f"[ThinkingControl] 模型 {model} 使用全局自定义参数: {custom_params}")
        return custom_params.copy()

    # 5. 如果开启激进模式，对未匹配模型强制发送通用参数
    if aggressive:
        generic_params = {"thinking": {"type": "disabled"}}
        print(f"[ThinkingControl] 模型 {model} 未匹配规则，激进模式强制发送通用参数: {generic_params}")
        return generic_params

    print(f"[ThinkingControl] 模型 {model} 未匹配任何规则")
    return {}


def filter_thinking_content(text: str) -> str:
    """
    过滤文本中的思维链标签

    支持: <think>, <thinking>, <reasoning>, <thoughts>, <thought>,
          <thinking type="...">, <reasoning_effort> 等变体
    V1.2.5_Mod6 — 增强过滤逻辑，支持更多格式和变体
    """
    if not text:
        return text

    original_length = len(text)

    # 定义思维链标签模式（支持带属性的标签）
    THINKING_TAGS = r'(think|thinking|reasoning|thoughts?|reasoning_effort)'
    OPEN_TAG = rf'<{THINKING_TAGS}(\s[^>]*)?>'
    CLOSE_TAG = rf'</{THINKING_TAGS}>'

    # 1. 配对标签（支持带属性的标签，如 <thinking type="reasoning">）
    text = re.sub(rf'{OPEN_TAG}[\s\S]*?{CLOSE_TAG}', '', text, flags=re.IGNORECASE)

    # 2. 孤立的闭合标签：仅当文本以思维链标签开头时处理，避免误删正常正文
    # （旧实现从文本开头一直删到第一个 </tag>，正文中出现标签字面量时会被整段抹除）
    # 如 "<thinking>思考...</thinking>正文" → "正文"
    if re.match(rf'{OPEN_TAG}', text.lstrip(), flags=re.IGNORECASE):
        text = re.sub(rf'^{OPEN_TAG}[\s\S]*?{CLOSE_TAG}', '', text, count=1, flags=re.IGNORECASE)

    # 3. 孤立的开始标签：删除未闭合思维链标签及其后内容，保留标签前的正文
    # 如 "正文 <thinking>未闭合..." → "正文 "
    text = re.sub(rf'{OPEN_TAG}[\s\S]*$', '', text, flags=re.IGNORECASE)

    # 4. 处理 DeepSeek 特殊格式：reasoning_content 字段可能包含思维链
    # 如果内容以 "reasoning_content" 开头，可能是 JSON 格式
    if text.strip().startswith('{"reasoning_content"'):
        try:
            data = json.loads(text)
            if "reasoning_content" in data:
                # 只返回 content 部分
                text = data.get("content", "")
        except json.JSONDecodeError:
            pass

    # 5. 处理其他 JSON 格式的思维链字段
    # 支持 {"reasoning": "..."}, {"thought": "..."} 等
    json_thinking_patterns = [
        r'^\s*\{"reasoning"\s*:',
        r'^\s*\{"thought"\s*:',
        r'^\s*\{"thinking"\s*:',
    ]
    for pattern in json_thinking_patterns:
        if re.match(pattern, text.strip()):
            try:
                data = json.loads(text)
                # 尝试找到实际内容字段
                for key in ["content", "answer", "response", "result"]:
                    if key in data:
                        text = data[key]
                        break
            except json.JSONDecodeError:
                pass

    # 6. 过滤常见的思维链开头模式（可选，可能误伤）
    # 注释掉以避免误伤，但保留作为参考
    # text = re.sub(r'^(Let me think|I need to think|Thinking about|First, let me|Let me analyze)[\s\S]*?(?=\n\n|\Z)', '', text, flags=re.IGNORECASE)

    result = text.strip()

    # 记录过滤效果
    if len(result) < original_length:
        print(f"[ThinkingControl] 过滤思维链: {original_length} -> {len(result)} 字符")

    return result


def filter_thinking_stream(chunk: str, state: dict) -> tuple:
    """
    流式过滤思维链内容

    Args:
        chunk: 当前流式输出的文本块
        state: 状态字典，包含 in_thinking, thinking_buffer 等状态

    Returns:
        (filtered_chunk, updated_state)
    """
    if not chunk:
        return chunk, state

    # 初始化状态
    if "in_thinking" not in state:
        state["in_thinking"] = False
        state["thinking_buffer"] = ""
        state["tag_buffer"] = ""

    # 定义思维链标签模式
    THINKING_TAGS = r'(think|thinking|reasoning|thoughts?|reasoning_effort)'
    OPEN_PATTERN = re.compile(rf'<{THINKING_TAGS}(\s[^>]*)?>', re.IGNORECASE)
    CLOSE_PATTERN = re.compile(rf'</{THINKING_TAGS}>', re.IGNORECASE)

    result = ""

    # 如果已经在思维链中，检查是否有闭合标签
    if state["in_thinking"]:
        state["thinking_buffer"] += chunk
        close_match = CLOSE_PATTERN.search(chunk)
        if close_match:
            # 找到闭合标签，结束思维链
            state["in_thinking"] = False
            state["thinking_buffer"] = ""
            # 返回闭合标签之后的内容
            result = chunk[close_match.end():]
        # 如果没有闭合标签，返回空字符串（继续过滤）
        return result, state

    # 检查是否有开始标签
    open_match = OPEN_PATTERN.search(chunk)
    if open_match:
        # 找到开始标签
        state["in_thinking"] = True
        state["thinking_buffer"] = chunk[open_match.start():]
        # 返回开始标签之前的内容
        result = chunk[:open_match.start()]

        # 检查同一块中是否有闭合标签
        close_match = CLOSE_PATTERN.search(state["thinking_buffer"])
        if close_match:
            # 同一块中有闭合标签
            state["in_thinking"] = False
            # 先提取闭合标签之后的内容，再清空 buffer
            suffix = state["thinking_buffer"][close_match.end():]
            state["thinking_buffer"] = ""
            result += suffix

        return result, state

    # 没有思维链标签，返回原始内容
    return chunk, state


def strip_thinking_chunk(text: str, in_thinking: bool) -> tuple:
    """从 chunk 中移除思维链标签区间，保留区间外内容（流式过滤统一实现）

    修复：同一 chunk 可能同时含思维链开始标签与后续正常文本（或结束标签后还有内容），
    整块丢弃会导致正常内容丢失。此处按标签位置切分，只丢弃标签区间内的内容。
    支持带属性的开始标签，如 <thinking type="reasoning">。

    Args:
        text: 当前 chunk 文本
        in_thinking: 上一 chunk 结束时是否仍在思维链内

    Returns:
        (过滤后的文本, 新的 in_thinking 状态)
    """
    if not text:
        return text, in_thinking

    THINKING_TAGS = r'(think|thinking|reasoning|thoughts?|reasoning_effort)'
    OPEN_PATTERN = re.compile(rf'<{THINKING_TAGS}(\s[^>]*)?>', re.IGNORECASE)
    CLOSE_PATTERN = re.compile(rf'</{THINKING_TAGS}>', re.IGNORECASE)

    out = []
    pos = 0
    if in_thinking:
        # 上一 chunk 在思维链内，先找结束标签；找不到则整个 chunk 都是思维链内容
        m = CLOSE_PATTERN.search(text)
        if not m:
            return "", True
        pos = m.end()
        in_thinking = False
    while True:
        m = OPEN_PATTERN.search(text, pos)
        if not m:
            out.append(text[pos:])
            break
        out.append(text[pos:m.start()])
        m2 = CLOSE_PATTERN.search(text, m.end())
        if not m2:
            # 开始标签未闭合，标签后内容视为思维链，置状态并丢弃
            in_thinking = True
            break
        pos = m2.end()
    return "".join(out), in_thinking


def get_supported_models() -> List[Dict[str, Any]]:
    """获取支持思维链控制的模型列表（用于前端显示）"""
    models = []
    for rule in THINKING_CONTROL_RULES:
        models.append({
            "name": rule["name"],
            "patterns": rule["patterns"],
            "params": rule["params"],
        })
    return models


def validate_custom_rule(rule: Dict[str, Any]) -> tuple:
    """
    验证用户自定义规则的格式

    Returns:
        (is_valid, error_message)
    """
    if not isinstance(rule, dict):
        return False, "规则必须是字典格式"

    if "name" not in rule:
        return False, "规则缺少 name 字段"

    if "patterns" not in rule or not isinstance(rule["patterns"], list):
        return False, "规则缺少 patterns 字段或格式错误"

    if "params" not in rule or not isinstance(rule["params"], dict):
        return False, "规则缺少 params 字段或格式错误"

    # 验证正则表达式
    for pattern in rule["patterns"]:
        try:
            re.compile(pattern)
        except re.error as e:
            return False, f"正则表达式错误: {pattern} - {e}"

    return True, "规则格式正确"
