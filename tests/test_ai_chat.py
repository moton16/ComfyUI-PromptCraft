"""
AIChat 节点测试
覆盖: 属性检查 / execute 返回值
"""

from ai_chat import AIChat


class TestNodeProperties:

    def test_function_name(self):
        assert AIChat.FUNCTION == "execute"

    def test_output_node(self):
        assert AIChat.OUTPUT_NODE is True

    def test_return_types(self):
        assert AIChat.RETURN_TYPES == ()

    def test_category(self):
        assert AIChat.CATEGORY == "Moton PromptCraft"

    def test_return_names(self):
        assert AIChat.RETURN_NAMES == ()


class TestExecute:

    def test_returns_empty_tuple(self):
        node = AIChat()
        result = node.execute()
        assert result == ()
