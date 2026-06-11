"""
CLIPTextEncodePro 节点测试
覆盖: INPUT_TYPES / RETURN_TYPES / FUNCTION 属性, encode() 各种输入场景
"""

import pytest
from unittest.mock import MagicMock
from clip_text_encode_pro import CLIPTextEncodePro


def _make_clip():
    clip = MagicMock()
    clip.tokenize.return_value = {"tokens": "mocked"}
    clip.encode_from_tokens_scheduled.return_value = "conditioning_result"
    return clip


# ==================== 节点属性 ====================

class TestNodeProperties:
    """CLIPTextEncodePro 节点元信息验证"""

    def test_function(self):
        assert CLIPTextEncodePro.FUNCTION == "encode"

    def test_return_types(self):
        assert CLIPTextEncodePro.RETURN_TYPES == ("CONDITIONING",)

    def test_input_types_has_text1(self):
        inputs = CLIPTextEncodePro.INPUT_TYPES()
        assert "text1" in inputs["required"]

    def test_input_types_has_clip(self):
        inputs = CLIPTextEncodePro.INPUT_TYPES()
        assert "clip" in inputs["required"]

    def test_input_types_has_text2(self):
        inputs = CLIPTextEncodePro.INPUT_TYPES()
        assert "text2" in inputs["optional"]

    def test_text2_default_empty_string(self):
        inputs = CLIPTextEncodePro.INPUT_TYPES()
        text2_def = inputs["optional"]["text2"]
        assert text2_def[1]["default"] == ""


# ==================== encode 方法 ====================

class TestEncode:
    """encode() 编码行为验证"""

    def test_text1_only(self):
        clip = _make_clip()
        node = CLIPTextEncodePro()
        result = node.encode(clip, "hello world")
        clip.tokenize.assert_called_once_with("hello world")
        assert result == ("conditioning_result",)

    def test_merges_text1_and_text2(self):
        clip = _make_clip()
        node = CLIPTextEncodePro()
        result = node.encode(clip, "text1 content", "text2 content")
        clip.tokenize.assert_called_once_with("text2 content, text1 content")
        assert result == ("conditioning_result",)

    def test_text2_before_text1(self):
        clip = _make_clip()
        node = CLIPTextEncodePro()
        node.encode(clip, "second", "first")
        call_args = clip.tokenize.call_args[0][0]
        assert call_args.startswith("first")
        assert call_args.endswith("second")

    def test_empty_text2_ignored(self):
        clip = _make_clip()
        node = CLIPTextEncodePro()
        node.encode(clip, "only text1", "")
        clip.tokenize.assert_called_once_with("only text1")

    def test_whitespace_text2_ignored(self):
        clip = _make_clip()
        node = CLIPTextEncodePro()
        node.encode(clip, "only text1", "   ")
        clip.tokenize.assert_called_once_with("only text1")

    def test_empty_text1_with_text2(self):
        clip = _make_clip()
        node = CLIPTextEncodePro()
        node.encode(clip, "", "second")
        clip.tokenize.assert_called_once_with("second")

    def test_none_clip_raises_runtime_error(self):
        node = CLIPTextEncodePro()
        with pytest.raises(RuntimeError, match="clip input is invalid"):
            node.encode(None, "some text")

    def test_encode_from_tokens_called(self):
        clip = _make_clip()
        node = CLIPTextEncodePro()
        node.encode(clip, "prompt")
        clip.encode_from_tokens_scheduled.assert_called_once_with({"tokens": "mocked"})
