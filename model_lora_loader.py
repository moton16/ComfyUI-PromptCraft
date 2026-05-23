"""
Model & LoRA Stack Loader 节点 v1.3.0
支持底模切换 + LoRA 个体调用 + 群组引用混合栈
前端通过隐藏 JSON widget 传递栈数据，后端在执行时解析并加载
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


class ModelLoraGroupLoader:
    """底模 + LoRA 栈加载器（支持个体 LoRA + 群组混合）"""

    # LoRA 文件缓存 {lora_path: lora_dict}
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
            },
            "optional": {
                "model": ("MODEL",),
                "clip": ("CLIP",),
                "vae": ("VAE",),
                "lora_stack_data": ("STRING", {"default": "{}", "multiline": True}),
            },
        }

    RETURN_TYPES = ("MODEL", "CLIP", "VAE", "STRING")
    RETURN_NAMES = ("model", "clip", "vae", "lora_prompt_data")
    FUNCTION = "execute"
    CATEGORY = "Moton PromptCraft"
    DESCRIPTION = "加载底模并应用 LoRA 栈（个体 LoRA + 群组引用混合）。前端管理栈状态，后端执行时解析。"

    @classmethod
    def IS_CHANGED(cls, checkpoint, strength_multiplier,
                   model=None, clip=None, vae=None, lora_stack_data="{}"):
        m = hashlib.sha256()
        m.update(checkpoint.encode())
        m.update(str(strength_multiplier).encode())
        m.update(lora_stack_data.encode())
        if os.path.exists(lora_group_manager.groups_path):
            m.update(str(os.path.getmtime(lora_group_manager.groups_path)).encode())
        return m.hexdigest()

    def execute(self, checkpoint, strength_multiplier,
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
        if not items:
            return (model, clip, vae, "{}")

        # 3. 展平栈：group ref → 展开为个体 LoRA
        flat_loras = self._flatten_stack(items)

        if not flat_loras:
            return (model, clip, vae, "{}")

        # 4. 获取 LoRA prompt 注入数据（支持按组过滤）
        selected_groups = {}
        for item in flat_loras:
            if item.get("enabled", True):
                lora_path = item["lora"]
                sel = item.get("selected_group")
                if sel:
                    selected_groups[lora_path] = sel
        lora_paths = [
            item["lora"] for item in flat_loras if item.get("enabled", True)
        ]
        prompt_data = lora_prompt_manager.get_all_for_stack(lora_paths, selected_groups)
        prompt_json = json.dumps(prompt_data, ensure_ascii=False)

        # 5. 逐个加载 LoRA（迭代堆叠）
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

        return (model, clip, vae, prompt_json)

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
