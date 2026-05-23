"""
AI Chat Node - ComfyUI AI 聊天节点
最小化节点，前端按钮打开聊天面板，通过 API 调用 LLM 进行对话
"""


class AIChat:
    """AI 聊天节点 - 点击按钮打开聊天面板"""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {},
        }

    RETURN_TYPES = ()
    RETURN_NAMES = ()
    FUNCTION = "execute"
    CATEGORY = "Moton PromptCraft"
    OUTPUT_NODE = True

    def execute(self):
        return ()
