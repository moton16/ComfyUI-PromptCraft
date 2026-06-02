"""
LoRA 公共工具函数
抽取自 model_lora_loader.py 和 lora_prompt_loader.py 的重复代码
"""

import threading
from collections import OrderedDict

try:
    import folder_paths
    import comfy.sd
    import comfy.utils
    HAS_COMFY = True
except ImportError:
    HAS_COMFY = False

from .lora_group_manager import lora_group_manager
from .lora_scanner import LoraScanner

# 共享 LoRA 文件缓存 — 线程安全 + LRU 驱逐（最多 8 个文件）
_LORA_CACHE_MAX = 8
_lora_cache = OrderedDict()
_lora_cache_lock = threading.Lock()


def flatten_stack(items):
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


def load_single_lora(model, clip, lora_name, strength_model, strength_clip):
    """加载单个 LoRA（带线程安全 LRU 缓存）"""
    lora_path = folder_paths.get_full_path_or_raise("loras", lora_name)

    with _lora_cache_lock:
        if lora_path in _lora_cache:
            _lora_cache.move_to_end(lora_path)
            lora = _lora_cache[lora_path]
        else:
            lora = None

    if lora is None:
        # 加载在锁外执行（I/O 密集），避免阻塞其他线程
        loaded = comfy.utils.load_torch_file(lora_path, safe_load=True)
        with _lora_cache_lock:
            _lora_cache[lora_path] = loaded
            _lora_cache.move_to_end(lora_path)
            # LRU 驱逐：超过上限时淘汰最久未用的
            while len(_lora_cache) > _LORA_CACHE_MAX:
                _lora_cache.popitem(last=False)
        lora = loaded

    model_lora, clip_lora = comfy.sd.load_lora_for_models(
        model, clip, lora, strength_model, strength_clip)
    return model_lora, clip_lora


def clear_cache():
    """清空 LoRA 文件缓存"""
    with _lora_cache_lock:
        _lora_cache.clear()
