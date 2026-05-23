"""
思维链控制模块
根据模型名称自动发送关闭思维链的参数，并过滤响应中的思维链输出

参考 prompt-assistan 的 thinking_control.py 设计
"""

import re
from typing import Dict, Any, List


# ==================== 模型匹配规则 ====================

THINKING_CONTROL_RULES: List[Dict[str, Any]] = [
    {
        "name": "zhipu_glm",
        "patterns": [r"glm[-_/.]?4\.(5|6)"],
        "params": {"thinking": {"type": "disabled"}},
    },
    {
        "name": "qwen3_enable_thinking",
        "patterns": [
            r"qwen[-_/.]?3(?!.*thinking)(?!.*r1)",
            r"qwen.*[-_/.]?vl",
        ],
        "params": {"enable_thinking": False},
    },
    {
        "name": "qwen_deepseek_reasoning",
        "patterns": [
            r"qwen.*[-_/.]?(r1|thinking)",
            r"deepseek.*[-_/.]?(r1|reason)",
        ],
        "params": {"reasoning": {"effort": "none"}},
    },
    {
        "name": "deepseek_v3_thinking",
        "patterns": [
            r"deepseek[-_/.]?v3(\.1|\.2)?(?!.*r1)",
            r"deepseek[-_/.]?chat",
            r"deepseek[-_/.]?v4",
        ],
        "params": {"thinking": {"type": "disabled"}},
    },
    {
        "name": "gemini2_reasoning",
        "patterns": [r"gemini[-_/.]?2\.(0|5)[-_/.]?(flash|lite)"],
        "params": {"reasoning_effort": "none"},
    },
    {
        "name": "gemini3_thinking",
        "patterns": [r"gemini[-_/.]?3"],
        "params": {"reasoning_effort": "low"},
    },
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


def build_thinking_suppression(model: str, disable_thinking: bool = True) -> Dict[str, Any]:
    """
    根据模型名称返回思维链控制参数

    Args:
        model: 模型名称
        disable_thinking: True=关闭思考

    Returns:
        思维链控制参数字典，或空字典
    """
    if not model or not disable_thinking:
        return {}

    model_lower = model.strip().lower()

    # 排除规则
    for pattern in EXCLUDE_PATTERNS:
        if re.search(pattern, model_lower):
            return {}

    # 遍历规则，返回第一个匹配
    for rule in THINKING_CONTROL_RULES:
        for pattern in rule["patterns"]:
            if re.search(pattern, model_lower):
                return rule["params"].copy()

    return {}


def filter_thinking_content(text: str) -> str:
    """
    过滤文本中的思维链标签

    支持: <think>, <thinking>, <reasoning>, <thoughts>
    """
    if not text:
        return text

    # 配对标签
    text = re.sub(r'<(think|thinking|reasoning|thoughts?)>[\s\S]*?</\1>', '', text, flags=re.IGNORECASE)
    # 孤立的闭合标签（思维链在开头的情况）
    text = re.sub(r'^[\s\S]*?</(think|thinking|reasoning|thoughts?)>', '', text, flags=re.IGNORECASE)

    return text.strip()
