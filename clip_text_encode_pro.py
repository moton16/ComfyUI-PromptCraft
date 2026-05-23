"""
CLIP Text Encode Pro 节点
官方 CLIPTextEncode 升级版：多一个 text2 可选输入口
合并两段文本后一起 CLIP 编码
"""

class CLIPTextEncodePro:
    """标准 CLIP 文本编码器 + 文本合并"""

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "text1": ("STRING", {"multiline": True, "dynamicPrompts": True}),
                "clip": ("CLIP",),
            },
            "optional": {
                "text2": ("STRING", {"multiline": True, "default": ""}),
            }
        }

    RETURN_TYPES = ("CONDITIONING",)
    FUNCTION = "encode"
    CATEGORY = "Moton PromptCraft"
    DESCRIPTION = "标准 CLIP 文本编码器升级版，额外支持 text2 输入。自动合并两段文本后一起编码为 CONDITIONING。"

    def encode(self, clip, text1, text2=""):
        if clip is None:
            raise RuntimeError("ERROR: clip input is invalid: None\n\nIf the clip is from a checkpoint loader node your checkpoint does not contain a valid clip or text encoder model.")

        parts = []
        if text2 and text2.strip():
            parts.append(text2.strip())
        if text1 and text1.strip():
            parts.append(text1.strip())

        merged = ", ".join(parts)

        tokens = clip.tokenize(merged)
        return (clip.encode_from_tokens_scheduled(tokens), )
