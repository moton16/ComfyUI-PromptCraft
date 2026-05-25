"""
Moton's Prompt Enhancer - ComfyUI Custom Node
功能丰富的提示词增强节点，支持内置库随机选择 + LLM细节补充
使用 config_manager 统一管理 SFW/NSFW 库和 LLM 配置
提供前端设置面板（js/）- 接入 ComfyUI v3 全局设置
"""

import os
import sys
from pathlib import Path

# 获取当前目录
current_dir = Path(__file__).parent

# 添加到 sys.path
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

# 前端面板目录（ComfyUI 自动加载）
WEB_DIRECTORY = "js"

# 节点映射
NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}

# 延迟导入，避免循环依赖
try:
    from .prompt_enhancer import PromptEnhancer
    NODE_CLASS_MAPPINGS["PromptEnhancer"] = PromptEnhancer
# 不要修改这一段了行不行，不要改NODE_DISPLAY_NAME_MAPPINGS["PromptEnhancer"] = "PromptCraft"这个字段，求你了，这是节点名称不要乱改
    NODE_DISPLAY_NAME_MAPPINGS["PromptEnhancer"] = "PromptCraft"
except ImportError as e:
    print(f"[PromptCraft] Warning: Failed to import PromptEnhancer: {e}")

try:
    from .ai_chat import AIChat
    NODE_CLASS_MAPPINGS["AIChat"] = AIChat
    NODE_DISPLAY_NAME_MAPPINGS["AIChat"] = "AI Chat"
except ImportError as e:
    print(f"[PromptCraft] Warning: Failed to import AIChat: {e}")

try:
    from .model_lora_loader import ModelLoraGroupLoader
    NODE_CLASS_MAPPINGS["ModelLoraGroupLoader"] = ModelLoraGroupLoader
    NODE_DISPLAY_NAME_MAPPINGS["ModelLoraGroupLoader"] = "Model & LoRA Group Loader"
except ImportError as e:
    print(f"[PromptCraft] Warning: Failed to import ModelLoraGroupLoader: {e}")

try:
    from .lora_prompt_loader import LoraPromptLoader
    NODE_CLASS_MAPPINGS["LoraPromptLoader"] = LoraPromptLoader
    NODE_DISPLAY_NAME_MAPPINGS["LoraPromptLoader"] = "LoRA Prompt Loader"
except ImportError as e:
    print(f"[PromptCraft] Warning: Failed to import LoraPromptLoader: {e}")

try:
    from .clip_text_encode_pro import CLIPTextEncodePro
    NODE_CLASS_MAPPINGS["CLIPTextEncodePro"] = CLIPTextEncodePro
    NODE_DISPLAY_NAME_MAPPINGS["CLIPTextEncodePro"] = "CLIP Text Encode Pro"
except ImportError as e:
    print(f"[PromptCraft] Warning: Failed to import CLIPTextEncodePro: {e}")

# 初始化 config_manager（触发配置文件创建和迁移）
try:
    from .config_manager import config_manager
except Exception as e:
    print(f"[PromptCraft] Warning: config_manager init failed: {e}")

# 尝试导入 API 路由（设置面板 API）- 注意改名避免与 ComfyUI 内置 server 冲突
try:
    from . import api_routes
    print(f"[PromptCraft] 设置面板 API 已加载")
except ImportError as e:
    print(f"[PromptCraft] Warning: 设置面板 API 导入失败: {e}")

# 确保 data 目录存在
data_dir = current_dir / "data"
if not data_dir.exists():
    data_dir.mkdir(parents=True, exist_ok=True)

# 如果需要兼容旧版 default_prompts.json，自动迁移到 sfw_prompts.json
old_library = data_dir / "default_prompts.json"
sfw_library = data_dir / "sfw_prompts.json"
if old_library.exists() and not sfw_library.exists():
    import shutil
    shutil.copy(old_library, sfw_library)
    print(f"[PromptCraft] 已迁移旧库文件: {old_library.name} -> {sfw_library.name}")

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]

print(f"\033[94m[PromptCraft]\033[0m \033[92mV1.2.2 节点加载完成\033[0m | "
      f"\033[93m{len(NODE_CLASS_MAPPINGS)} 个节点\033[0m | "
      f"\033[96m面板目录: js/\033[0m")
