"""
思维链控制模块测试
覆盖: build_thinking_suppression / filter_thinking_content / filter_thinking_stream / validate_custom_rule
"""

import pytest
from thinking_control import (
    build_thinking_suppression,
    filter_thinking_content,
    filter_thinking_stream,
    validate_custom_rule,
    get_supported_models,
    THINKING_CONTROL_RULES,
    EXCLUDE_PATTERNS,
    FUZZY_KEYWORDS,
)


# ==================== build_thinking_suppression ====================

class TestBuildThinkingSuppression:
    """模型名称 → 思维链控制参数映射"""

    def test_empty_model_returns_empty(self):
        assert build_thinking_suppression("") == {}
        assert build_thinking_suppression(None) == {}

    def test_disable_false_returns_empty(self):
        assert build_thinking_suppression("deepseek-v3", disable_thinking=False) == {}

    # --- DeepSeek 系列 ---
    def test_deepseek_v3(self):
        result = build_thinking_suppression("deepseek-v3")
        assert result == {"thinking": {"type": "disabled"}}

    def test_deepseek_v3_1(self):
        result = build_thinking_suppression("deepseek-v3.1")
        assert result == {"thinking": {"type": "disabled"}}

    def test_deepseek_chat(self):
        result = build_thinking_suppression("deepseek-chat")
        assert result == {"thinking": {"type": "disabled"}}

    def test_deepseek_v2_5(self):
        result = build_thinking_suppression("deepseek-v2.5")
        assert result == {"thinking": {"type": "disabled"}}

    # --- DeepSeek R1 推理模型 ---
    def test_deepseek_r1(self):
        result = build_thinking_suppression("deepseek-r1")
        assert result == {"reasoning": {"effort": "none"}}

    def test_qwen_thinking(self):
        result = build_thinking_suppression("qwen-thinking")
        assert result == {"reasoning": {"effort": "none"}}

    # --- Qwen 系列 ---
    def test_qwen3(self):
        result = build_thinking_suppression("qwen3-8b")
        assert result == {"enable_thinking": False}

    def test_qwen_plus(self):
        result = build_thinking_suppression("qwen-plus")
        assert result == {"enable_thinking": False}

    def test_qwen_max(self):
        result = build_thinking_suppression("qwen-max")
        assert result == {"enable_thinking": False}

    def test_qwen_turbo(self):
        result = build_thinking_suppression("qwen-turbo")
        assert result == {"enable_thinking": False}

    def test_qwen2_5(self):
        result = build_thinking_suppression("qwen2.5-72b")
        assert result == {"enable_thinking": False}

    # --- 智谱 GLM 系列 ---
    def test_glm5(self):
        result = build_thinking_suppression("glm-5")
        assert result == {"thinking": {"type": "disabled"}}

    def test_glm4_7(self):
        result = build_thinking_suppression("glm-4.7")
        assert result == {"thinking": {"type": "disabled"}}

    def test_glm4_5(self):
        result = build_thinking_suppression("glm-4.5")
        assert result == {"thinking": {"type": "disabled"}}

    # --- MiMo 系列 ---
    def test_mimo_v2_5_pro(self):
        result = build_thinking_suppression("mimo-v2.5-pro")
        assert result == {"thinking": {"type": "disabled"}}

    def test_mimo_v2_flash(self):
        result = build_thinking_suppression("mimo-v2-flash")
        assert result == {"thinking": {"type": "disabled"}}

    # --- Claude 系列 ---
    def test_claude_sonnet_4(self):
        result = build_thinking_suppression("claude-sonnet-4")
        assert result == {"thinking": {"type": "disabled"}}

    def test_claude_3_7_sonnet(self):
        result = build_thinking_suppression("claude-3.7-sonnet")
        assert result == {"thinking": {"type": "disabled"}}

    # --- Gemini 系列 ---
    def test_gemini_2_0_flash(self):
        result = build_thinking_suppression("gemini-2.0-flash")
        assert result == {"reasoning_effort": "none"}

    def test_gemini_3(self):
        result = build_thinking_suppression("gemini-3-pro")
        assert result == {"reasoning_effort": "low"}

    # --- Grok 系列 ---
    def test_grok_3_mini(self):
        result = build_thinking_suppression("grok-3-mini")
        assert result == {"reasoning_effort": "low"}

    # --- 排除规则 ---
    def test_excluded_gemini_2_5_pro(self):
        result = build_thinking_suppression("gemini-2.5-pro")
        assert result == {}

    def test_excluded_grok_4(self):
        result = build_thinking_suppression("grok-4")
        assert result == {}

    # --- 模糊匹配 ---
    def test_fuzzy_deepseek_unknown_variant(self):
        result = build_thinking_suppression("deepseek-some-new-model")
        assert result == {"thinking": {"type": "disabled"}}

    def test_fuzzy_unknown_model_returns_empty(self):
        result = build_thinking_suppression("gpt-4o")
        assert result == {}

    # --- 激进模式 ---
    def test_aggressive_mode_unmatched(self):
        result = build_thinking_suppression("some-unknown-model", aggressive=True)
        assert result == {"thinking": {"type": "disabled"}}

    def test_aggressive_mode_excluded_still_excluded(self):
        result = build_thinking_suppression("gemini-2.5-pro", aggressive=True)
        assert result == {}

    # --- 大小写不敏感 ---
    def test_case_insensitive(self):
        result = build_thinking_suppression("DeepSeek-V3")
        assert result == {"thinking": {"type": "disabled"}}

    def test_case_insensitive_upper(self):
        result = build_thinking_suppression("QWEN-PLUS")
        assert result == {"enable_thinking": False}


# ==================== filter_thinking_content ====================

class TestFilterThinkingContent:
    """文本中思维链标签的过滤"""

    def test_empty_text(self):
        assert filter_thinking_content("") == ""
        # None 输入返回 None（函数行为: if not text: return text）
        assert filter_thinking_content(None) is None

    def test_no_thinking_tags(self):
        text = "A beautiful anime girl in a cyberpunk city"
        assert filter_thinking_content(text) == text

    def test_think_tag(self):
        text = "<think>\nLet me think about this.\n</think>Here is the result."
        assert filter_thinking_content(text) == "Here is the result."

    def test_thinking_tag(self):
        text = "<thinking>Some reasoning here.</thinking>The actual answer."
        assert filter_thinking_content(text) == "The actual answer."

    def test_thinking_tag_with_attributes(self):
        text = '<thinking type="reasoning">Deep thoughts.</thinking>Answer.'
        assert filter_thinking_content(text) == "Answer."

    def test_reasoning_tag(self):
        text = "<reasoning>Step 1, Step 2.</reasoning>Final result."
        assert filter_thinking_content(text) == "Final result."

    def test_thoughts_tag(self):
        text = "<thoughts>Internal thoughts.</thoughts>Output."
        assert filter_thinking_content(text) == "Output."

    def test_thought_tag(self):
        text = "<thought>Quick thought.</thought>Answer."
        assert filter_thinking_content(text) == "Answer."

    def test_unclosed_opening_tag(self):
        text = "<think>Some incomplete thinking..."
        result = filter_thinking_content(text)
        # 孤立的开始标签到末尾应被过滤
        assert "incomplete" not in result or result.strip() == ""

    def test_orphan_closing_tag(self):
        text = "<think>Hidden thoughts.</think>Visible text."
        result = filter_thinking_content(text)
        assert "Visible text" in result

    def test_json_reasoning_content(self):
        text = '{"reasoning_content": "thinking...", "content": "actual answer"}'
        result = filter_thinking_content(text)
        assert result == "actual answer"

    def test_json_reasoning_field(self):
        text = '{"reasoning": "internal", "content": "output"}'
        result = filter_thinking_content(text)
        assert result == "output"

    def test_json_thought_field(self):
        text = '{"thought": "analysis", "answer": "result"}'
        result = filter_thinking_content(text)
        assert result == "result"

    def test_normal_text_preserved(self):
        text = "1girl, anime, cyberpunk, neon lights, best quality"
        assert filter_thinking_content(text) == text

    def test_multiple_tags(self):
        text = "<think>first</think>Middle<think>second</tool_call>End"
        result = filter_thinking_content(text)
        # 两对标签都被移除，中间的文本保留
        assert "first" not in result
        assert "second" not in result
        assert "Middle" in result or "End" in result


# ==================== filter_thinking_stream ====================

class TestFilterThinkingStream:
    """流式思维链过滤"""

    def test_empty_chunk(self):
        state = {}
        result, state = filter_thinking_stream("", state)
        assert result == ""

    def test_no_tags_passthrough(self):
        state = {}
        result, state = filter_thinking_stream("Hello world", state)
        assert result == "Hello world"
        assert state["in_thinking"] is False

    def test_open_tag_enters_thinking(self):
        state = {}
        result, state = filter_thinking_stream("prefix<think>", state)
        assert result == "prefix"
        assert state["in_thinking"] is True

    def test_content_inside_thinking_filtered(self):
        state = {"in_thinking": True, "thinking_buffer": "", "tag_buffer": ""}
        result, state = filter_thinking_stream("hidden thoughts", state)
        assert result == ""

    def test_close_tag_exits_thinking(self):
        state = {"in_thinking": True, "thinking_buffer": "", "tag_buffer": ""}
        result, state = filter_thinking_stream("more thinking</think>visible", state)
        assert result == "visible"
        assert state["in_thinking"] is False

    def test_open_and_close_in_same_chunk(self):
        state = {}
        result, state = filter_thinking_stream("prefix<think>hidden</think>suffix", state)
        # prefix 应保留，hidden 应被过滤，suffix 应保留
        assert "prefix" in result
        assert "hidden" not in result
        assert "suffix" in result

    def test_multi_chunk_flow(self):
        state = {}
        # chunk 1: 开始标签
        r1, state = filter_thinking_stream("A<think>", state)
        assert r1 == "A"
        assert state["in_thinking"] is True

        # chunk 2: 思维链内容
        r2, state = filter_thinking_stream("thinking...", state)
        assert r2 == ""

        # chunk 3: 闭合标签 + 后续内容
        r3, state = filter_thinking_stream("</think>B", state)
        assert r3 == "B"
        assert state["in_thinking"] is False


# ==================== validate_custom_rule ====================

class TestValidateCustomRule:
    """自定义规则格式验证"""

    def test_valid_rule(self):
        rule = {
            "name": "test_model",
            "patterns": [r"test[-_/.]?v1"],
            "params": {"thinking": {"type": "disabled"}},
        }
        is_valid, msg = validate_custom_rule(rule)
        assert is_valid is True

    def test_not_dict(self):
        is_valid, msg = validate_custom_rule("not a dict")
        assert is_valid is False
        assert "字典" in msg

    def test_missing_name(self):
        rule = {"patterns": [r"test"], "params": {}}
        is_valid, msg = validate_custom_rule(rule)
        assert is_valid is False
        assert "name" in msg

    def test_missing_patterns(self):
        rule = {"name": "test", "params": {}}
        is_valid, msg = validate_custom_rule(rule)
        assert is_valid is False
        assert "patterns" in msg

    def test_patterns_not_list(self):
        rule = {"name": "test", "patterns": "not_a_list", "params": {}}
        is_valid, msg = validate_custom_rule(rule)
        assert is_valid is False

    def test_missing_params(self):
        rule = {"name": "test", "patterns": [r"test"]}
        is_valid, msg = validate_custom_rule(rule)
        assert is_valid is False
        assert "params" in msg

    def test_invalid_regex(self):
        rule = {
            "name": "bad_regex",
            "patterns": [r"[invalid"],
            "params": {},
        }
        is_valid, msg = validate_custom_rule(rule)
        assert is_valid is False
        assert "正则" in msg


# ==================== get_supported_models ====================

class TestGetSupportedModels:
    """获取支持的模型列表"""

    def test_returns_list(self):
        models = get_supported_models()
        assert isinstance(models, list)
        assert len(models) > 0

    def test_each_model_has_required_fields(self):
        models = get_supported_models()
        for m in models:
            assert "name" in m
            assert "patterns" in m
            assert "params" in m

    def test_rules_count(self):
        """确保规则数量合理（当前应有 10+ 条规则）"""
        assert len(THINKING_CONTROL_RULES) >= 10

    def test_fuzzy_keywords_not_empty(self):
        assert len(FUZZY_KEYWORDS) >= 8


# ==================== 边界情况 ====================

class TestEdgeCases:

    def test_whitespace_model_name(self):
        result = build_thinking_suppression("  deepseek-v3  ")
        assert result == {"thinking": {"type": "disabled"}}

    def test_model_with_slash_path(self):
        result = build_thinking_suppression("Pro/zai-org/GLM-5")
        # SiliconFlow 规则应匹配
        assert "enable_thinking" in result or "thinking" in result

    def test_filter_preserves_multiline(self):
        text = "Line 1\nLine 2\nLine 3"
        assert filter_thinking_content(text) == text

    def test_filter_empty_after_removing_all(self):
        text = "<think>only thinking</tool_call>"
        result = filter_thinking_content(text)
        assert result.strip() == ""
