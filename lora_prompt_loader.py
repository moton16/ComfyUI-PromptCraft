"""
LoRA Prompt Loader 节点
加载底模 + LoRA 栈 + 合并 LoRA prompt 与用户文本
输出可直接接入标准 CLIP 文本编码器的纯文本 STRING
"""

import os
import json
import hashlib

try:
    import folder_paths
    import comfy.sd
    import comfy.utils
    HAS_COMFY = True
except ImportError:
    HAS_COMFY = False

from .lora_group_manager import lora_group_manager
from .lora_scanner import LoraScanner
from .lora_prompt_manager import lora_prompt_manager


class LoraPromptLoader:
    """底模 + LoRA 栈 + Prompt 合并加载器"""

    _lora_cache = {}

    @classmethod
    def INPUT_TYPES(cls):
        if HAS_COMFY:
            checkpoint_list = ["None"] + folder_paths.get_filename_list("checkpoints")
        else:
            checkpoint_list = ["None"]

        return {
            "required": {
                "checkpoint": (checkpoint_list, {
                    "default": "None",
                    "tooltip": "选择底模，'None' 则使用上游传入的 MODEL"
                }),
                "strength_multiplier": ("FLOAT", {
                    "default": 1.0, "min": 0.0, "max": 2.0, "step": 0.05,
                    "tooltip": "全局 LoRA 权重乘数"
                }),
                "positive_text": ("STRING", {
                    "default": "",
                    "multiline": True,
                    "tooltip": "用户正面提示词（LoRA prompt 将自动添加在最前面）"
                }),
                "negative_text": ("STRING", {
                    "default": "",
                    "multiline": True,
                    "tooltip": "用户负面提示词（LoRA negative 将自动添加在最前面）"
                }),
            },
            "optional": {
                "model": ("MODEL",),
                "clip": ("CLIP",),
                "vae": ("VAE",),
                "lora_stack_data": ("STRING", {"default": "{}", "multiline": True}),
            },
        }

    RETURN_TYPES = ("MODEL", "CLIP", "VAE", "STRING", "STRING")
    RETURN_NAMES = ("model", "clip", "vae", "positive_text", "negative_text")
    FUNCTION = "execute"
    CATEGORY = "Moton PromptCraft"
    DESCRIPTION = "加载底模 + LoRA 栈，自动合并 LoRA prompt 与用户文本。输出纯文本 STRING，可直接接入标准 CLIP 编码器。"

    @classmethod
    def IS_CHANGED(cls, checkpoint, strength_multiplier,
                   positive_text="", negative_text="",
                   model=None, clip=None, vae=None, lora_stack_data="{}"):
        m = hashlib.sha256()
        m.update(checkpoint.encode())
        m.update(str(strength_multiplier).encode())
        m.update(positive_text.encode())
        m.update(negative_text.encode())
        m.update(lora_stack_data.encode())
        if os.path.exists(lora_group_manager.groups_path):
            m.update(str(os.path.getmtime(lora_group_manager.groups_path)).encode())
        return m.hexdigest()

    def execute(self, checkpoint, strength_multiplier,
                positive_text="", negative_text="",
                model=None, clip=None, vae=None, lora_stack_data="{}"):

        # 1. 加载底模
        if checkpoint != "None":
            if not HAS_COMFY:
                raise RuntimeError("ComfyUI 核心模块未加载")
            ckpt_path = folder_paths.get_full_path_or_raise("checkpoints", checkpoint)
            out = comfy.sd.load_checkpoint_guess_config(
                ckpt_path,
                output_vae=True,
                output_clip=True,
                embedding_directory=folder_paths.get_folder_paths("embeddings")
            )
            model = out[0]
            clip = out[1]
            vae = out[2]

        if model is None:
            raise ValueError("未提供 MODEL：请连接上游或选择底模")

        # 2. 解析栈数据
        try:
            stack = json.loads(lora_stack_data)
        except (json.JSONDecodeError, TypeError):
            stack = {}

        items = stack.get("items", [])

        # 3. 展平栈并加载 LoRA
        flat_loras = self._flatten_stack(items)

        # 收集 prompt 数据
        selected_groups = {}
        enabled_lora_paths = []
        for item in flat_loras:
            if item.get("enabled", True):
                enabled_lora_paths.append(item["lora"])
                sel = item.get("selected_group")
                if sel:
                    selected_groups[item["lora"]] = sel

        prompt_data = lora_prompt_manager.get_all_for_stack(
            enabled_lora_paths, selected_groups)

        # 4. 提取 LoRA prompt 文本
        lora_pos_elements, lora_neg_elements = self._extract_prompt_text(prompt_data)

        # 5. 合并正面文本
        positive_parts = lora_pos_elements[:]
        user_pos = positive_text.strip()
        if user_pos:
            positive_parts.append(user_pos)
        final_positive = ", ".join(positive_parts)

        # 6. 合并负面文本
        negative_parts = lora_neg_elements[:]
        user_neg = negative_text.strip()
        if user_neg:
            negative_parts.append(user_neg)
        final_negative = ", ".join(negative_parts)

        # 7. 逐个加载 LoRA
        for item in flat_loras:
            if not item.get("enabled", True):
                continue

            s_model = item["weight"] * strength_multiplier
            s_clip = item["clip_weight"] * strength_multiplier

            if s_model == 0 and s_clip == 0:
                continue

            if clip is None:
                s_clip = 0

            model, clip = self._load_single_lora(
                model, clip, item["lora"], s_model, s_clip)

        return (model, clip, vae, final_positive, final_negative)

    def _extract_prompt_text(self, prompt_data):
        """从 prompt JSON 中提取正/负面文本（去重）"""
        positive_elements = []
        negative_elements = []
        for lora_info in prompt_data.values():
            for group in lora_info.get("groups", []):
                for p in group.get("prompts", []):
                    if p and p not in positive_elements:
                        positive_elements.append(p)
                neg = group.get("negative", "")
                if neg and neg not in negative_elements:
                    negative_elements.append(neg)
        return positive_elements, negative_elements

    def _flatten_stack(self, items):
        """将栈条目展平为个体 LoRA 列表（group ref 递归展开）"""
        flat = []
        for item in items:
            if item.get("type") == "group":
                group_data = lora_group_manager.get_group(item["group_name"])
                if group_data is None:
                    print(f"[PromptCraft] 警告: 群组 '{item['group_name']}' 不存在，跳过")
                    continue

                validation = LoraScanner.validate_group(group_data)
                if validation["missing"]:
                    for miss in validation["missing"]:
                        print(f"[PromptCraft] 警告: LoRA 文件不存在，跳过: {miss['lora']}")

                stack_weight = item.get("weight", 1.0)
                stack_clip = item.get("clip_weight", 1.0)
                stack_enabled = item.get("enabled", True)

                for lora_item in validation["valid"]:
                    if not lora_item.get("enabled", True):
                        continue
                    flat.append({
                        "type": "lora",
                        "lora": lora_item["lora"],
                        "weight": lora_item["weight"] * stack_weight,
                        "clip_weight": lora_item["clip_weight"] * stack_clip,
                        "enabled": stack_enabled,
                        "selected_group": item.get("selected_group"),
                    })
            else:
                flat.append(item)
        return flat

    @classmethod
    def _load_single_lora(cls, model, clip, lora_name, strength_model, strength_clip):
        """加载单个 LoRA（带字典缓存）"""
        lora_path = folder_paths.get_full_path_or_raise("loras", lora_name)

        if lora_path not in cls._lora_cache:
            cls._lora_cache[lora_path] = comfy.utils.load_torch_file(
                lora_path, safe_load=True)

        lora = cls._lora_cache[lora_path]
        model_lora, clip_lora = comfy.sd.load_lora_for_models(
            model, clip, lora, strength_model, strength_clip)
        return model_lora, clip_lora

    @classmethod
    def clear_cache(cls):
        cls._lora_cache.clear()
