"""
Agent Prompt 模块测试
覆盖: get_agent_system_prompt / build_agent_context
"""

import json
import pytest
from agent_prompt import (
    get_agent_system_prompt,
    build_agent_context,
    AGENT_SYSTEM_PROMPT,
    AGENT_CONTEXT_TEMPLATE,
)


class TestGetAgentSystemPrompt:

    def test_returns_string(self):
        prompt = get_agent_system_prompt()
        assert isinstance(prompt, str)
        assert len(prompt) > 100

    def test_contains_key_operations(self):
        prompt = get_agent_system_prompt()
        assert "lora_add" in prompt
        assert "lora_remove" in prompt
        assert "checkpoint" in prompt
        assert "prompt_set" in prompt
        assert "query" in prompt

    def test_contains_json_format_instruction(self):
        prompt = get_agent_system_prompt()
        assert "JSON" in prompt
        assert "operations" in prompt

    def test_is_same_as_constant(self):
        assert get_agent_system_prompt() == AGENT_SYSTEM_PROMPT


class TestBuildAgentContext:

    def test_basic_context(self):
        state = {"checkpoint": "animagine-xl.safetensors", "loras": []}
        instruction = "添加一个赛博朋克风格的LoRA"
        result = build_agent_context(state, instruction)

        assert isinstance(result, str)
        assert instruction in result
        # state 应被 JSON 序列化到结果中
        assert "animagine-xl" in result

    def test_complex_state(self):
        state = {
            "checkpoint": "model.safetensors",
            "stack": [
                {"lora": "style/cyber.safetensors", "weight": 0.8, "enabled": True}
            ],
            "categories": {"scene": "city", "style": "anime"},
            "user_prompt": "1girl",
        }
        instruction = "把LoRA权重调到1.0"
        result = build_agent_context(state, instruction)

        assert "style/cyber.safetensors" in result
        assert instruction in result

    def test_unicode_state(self):
        state = {"prompt": "一个女孩在赛博朋克城市"}
        instruction = "把场景改成夜晚"
        result = build_agent_context(state, instruction)

        assert "赛博朋克城市" in result
        assert "夜晚" in result

    def test_empty_state(self):
        result = build_agent_context({}, "查询当前状态")
        assert "查询当前状态" in result

    def test_template_structure(self):
        state = {"test": True}
        instruction = "test instruction"
        result = build_agent_context(state, instruction)

        # 应包含 "Current workflow state:" 和 "User instruction:"
        assert "Current workflow state:" in result
        assert "User instruction:" in result
