"""
LoRA 磁盘扫描器 — 枚举可用 LoRA、读取元数据
"""

import os
import re
import json
import hashlib

try:
    import folder_paths
    HAS_FOLDER_PATHS = True
except ImportError:
    HAS_FOLDER_PATHS = False

try:
    import comfy.utils
    HAS_COMFY_UTILS = True
except ImportError:
    HAS_COMFY_UTILS = False

# 常见 Danbooru 标签集合 — 非 common 标签优先展示（可能是触发词）
COMMON_TAGS = frozenset([
    "1girl", "1boy", "solo", "2girls", "2boys", "multiple_girls", "multiple_boys",
    "long_hair", "short_hair", "black_hair", "brown_hair", "blonde_hair", "white_hair",
    "blue_eyes", "red_eyes", "green_eyes", "brown_eyes", "yellow_eyes", "purple_eyes",
    "looking_at_viewer", "smile", "open_mouth", "closed_mouth", "expressionless",
    "standing", "sitting", "lying_down", "walking", "running",
    "dress", "shirt", "skirt", "uniform", "school_uniform", "jacket",
    "highres", "absurdres", "masterpiece", "best_quality", "worst_quality",
    "very_bad_quality", "bad_quality", "blurry", "lowres",
    "day", "night", "outdoors", "indoors", "sky", "cloud",
    "simple_background", "white_background", "black_background", "transparent_background",
    "upper_body", "lower_body", "full_body", "portrait", "close-up",
    "animal_ears", "cat_ears", "pointy_ears", "horns", "tail", "wings",
    "glasses", "hat", "ribbon", "bow", "necklace", "earrings",
    "sleeveless", "bare_shoulders", "cleavage", "thighs",
    "depth_of_field", "chromatic_aberration", "film_grain",
    "from_above", "from_below", "from_side", "from_behind",
    "arm_up", "arm_down", "hand_on_hip", "crossed_arms",
    "sweat", "blush", "tears", "closed_eyes", "half-closed_eyes",
    "watermark", "signature", "artist_name", "text",
    "gradient", "bokeh", "motion_blur", "silhouette",
])


class LoraScanner:
    """扫描磁盘上的 LoRA 文件并读取元数据"""

    @staticmethod
    def list_all() -> list:
        """返回所有 LoRA 文件的相对路径列表"""
        if not HAS_FOLDER_PATHS:
            return []
        return folder_paths.get_filename_list("loras")

    @staticmethod
    def list_folders() -> dict:
        """返回文件夹层级结构"""
        all_files = LoraScanner.list_all()
        tree = {"all": all_files, "/": {"all": []}}

        for f in all_files:
            parts = f.replace("\\", "/").split("/")
            if len(parts) == 1:
                if f not in tree["/"]["all"]:
                    tree["/"]["all"].append(f)
            else:
                node = tree
                for part in parts[:-1]:
                    if part not in node:
                        node[part] = {"all": []}
                    node = node[part]
                    if f not in node["all"]:
                        node["all"].append(f)
        return tree

    @staticmethod
    def get_full_path(lora_name: str) -> str:
        """获取 LoRA 文件的绝对路径"""
        if not HAS_FOLDER_PATHS:
            return None
        return folder_paths.get_full_path("loras", lora_name)

    @staticmethod
    def exists(lora_name: str) -> bool:
        """检查 LoRA 文件是否存在"""
        path = LoraScanner.get_full_path(lora_name)
        return path is not None and os.path.exists(path)

    @staticmethod
    def get_metadata(lora_name: str) -> dict:
        """
        读取 LoRA 元数据
        优先级: sidecar JSON > safetensors header
        """
        full_path = LoraScanner.get_full_path(lora_name)
        if not full_path:
            return {}

        # 尝试 sidecar 文件
        sidecar = full_path + ".json"
        if os.path.exists(sidecar):
            try:
                with open(sidecar, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass

        # 尝试 safetensors header
        if HAS_COMFY_UTILS and full_path.endswith(".safetensors"):
            try:
                header = comfy.utils.load_torch_file(
                    full_path, safe_load=True, return_metadata=True)
                if isinstance(header, dict) and "__metadata__" in header:
                    meta = header["__metadata__"]
                    return {
                        "base_model": meta.get("ss_base_model_version", ""),
                        "trigger_words": meta.get("ss_tag_frequency", "").split(",")[:5],
                        "description": meta.get("ss_description", ""),
                    }
            except Exception:
                pass

        return {}

    @staticmethod
    def _read_safetensors_header(full_path: str) -> dict:
        """读取 safetensors 文件的 header JSON（不加载权重）"""
        try:
            with open(full_path, "rb") as f:
                header_size_bytes = f.read(8)
                if len(header_size_bytes) < 8:
                    return {}
                header_size = int.from_bytes(header_size_bytes, "little", signed=False)
                if header_size <= 0 or header_size > 100 * 1024 * 1024:
                    return {}
                header_bytes = f.read(header_size)
                if len(header_bytes) < header_size:
                    return {}
                header = json.loads(header_bytes)
                # 后处理：__metadata__ 中的 JSON 字符串需要解析为 dict
                meta = header.get("__metadata__")
                if meta and isinstance(meta, dict):
                    for key, value in meta.items():
                        if isinstance(value, str) and value.startswith("{") and value.endswith("}"):
                            try:
                                meta[key] = json.loads(value)
                            except Exception:
                                pass
                return header
        except Exception:
            return {}

    @staticmethod
    def _compute_sha256(full_path: str) -> str:
        """计算文件的 SHA256 hash（4KB 分块读取）"""
        sha256 = hashlib.sha256()
        try:
            with open(full_path, "rb") as f:
                for block in iter(lambda: f.read(4096), b""):
                    sha256.update(block)
            return sha256.hexdigest()
        except Exception:
            return ""

    @staticmethod
    def _parse_training_words(tag_frequency, max_count: int = 30) -> list:
        """解析 ss_tag_frequency，返回训练词列表（非 common 标签在前）

        ss_tag_frequency 格式为 dict of dicts:
        {"bucket_0": {"tag1": count1, "tag2": count2}, "bucket_1": {...}}
        也可能是 JSON 字符串形式。
        """
        if not tag_frequency:
            return []

        # 如果是字符串，先解析为 JSON
        if isinstance(tag_frequency, str):
            try:
                tag_frequency = json.loads(tag_frequency)
            except (json.JSONDecodeError, ValueError):
                return []

        if not isinstance(tag_frequency, dict):
            return []

        # 遍历所有 bucket，累加每个 tag 的出现次数
        tag_counts = {}
        for bucket_value in tag_frequency.values():
            if isinstance(bucket_value, dict):
                for tag, count in bucket_value.items():
                    tag = str(tag).strip()
                    if tag:
                        try:
                            tag_counts[tag] = tag_counts.get(tag, 0) + int(count)
                        except (ValueError, TypeError):
                            pass

        if not tag_counts:
            return []

        non_common, common = [], []
        for tag, count in tag_counts.items():
            entry = {"word": tag, "count": count}
            if tag.lower() in COMMON_TAGS:
                common.append(entry)
            else:
                non_common.append(entry)
        non_common.sort(key=lambda x: x["count"], reverse=True)
        common.sort(key=lambda x: x["count"], reverse=True)
        return (non_common + common)[:max_count]

    @staticmethod
    def get_lora_info(lora_name: str) -> dict:
        """获取 LoRA 完整信息（hash、训练词等），带 sidecar 缓存"""
        full_path = LoraScanner.get_full_path(lora_name)
        if not full_path or not os.path.exists(full_path):
            return {"error": "文件不存在", "filename": lora_name}

        sidecar_path = full_path + ".pc-info.json"
        _CACHE_VERSION = 2  # 递增此值以强制刷新旧缓存
        if os.path.exists(sidecar_path):
            try:
                file_mtime = os.path.getmtime(full_path)
                with open(sidecar_path, "r", encoding="utf-8") as f:
                    cached = json.load(f)
                if cached.get("_mtime") == file_mtime and cached.get("_cache_version") == _CACHE_VERSION:
                    cached.pop("_mtime", None)
                    cached.pop("_cache_version", None)
                    return cached
            except Exception:
                pass

        filename = os.path.basename(lora_name)
        display_name = os.path.splitext(filename)[0]
        sha256 = ""
        training_words, base_model, clip_skip, description = [], "", "", ""

        if full_path.endswith(".safetensors"):
            header = LoraScanner._read_safetensors_header(full_path)
            meta = header.get("__metadata__", {})
            display_name = meta.get("modelspec.title", "") or meta.get("ss_output_name", "") or display_name
            base_model = meta.get("ss_sd_model_name", "")
            cs = meta.get("ss_clip_skip", "")
            if cs:
                clip_skip = str(cs)
            description = meta.get("ss_description", "")

            # 优先从 metadata 读取 hash（避免全文件计算）
            sha256 = meta.get("_sha256", "") or ""
            if not sha256:
                sha256 = LoraScanner._compute_sha256(full_path)

            # 训练词：优先 ss_tag_frequency，回退到 ss_output_name
            training_words = LoraScanner._parse_training_words(meta.get("ss_tag_frequency"))
            if not training_words:
                output_name = meta.get("ss_output_name", "")
                if output_name:
                    output_name = re.sub(r"[-_]v?[0-9]+$", "", output_name)
                    if output_name:
                        training_words = [{"word": output_name, "count": 0}]
        else:
            sha256 = LoraScanner._compute_sha256(full_path)

        result = {
            "filename": filename,
            "name": display_name,
            "sha256": sha256,
            "sha256_short": (sha256[:8] + "…" + sha256[-4:]) if sha256 else "",
            "base_model": base_model,
            "clip_skip": clip_skip,
            "description": description,
            "training_words": training_words,
            "path": lora_name,
        }

        try:
            cache_data = dict(result)
            cache_data["_mtime"] = os.path.getmtime(full_path)
            cache_data["_cache_version"] = _CACHE_VERSION
            with open(sidecar_path, "w", encoding="utf-8") as f:
                json.dump(cache_data, f, ensure_ascii=False, indent=1)
        except Exception:
            pass

        return result

    @staticmethod
    def search(query: str) -> list:
        """模糊搜索 LoRA 文件名"""
        if not query:
            return LoraScanner.list_all()
        query_lower = query.lower()
        return [f for f in LoraScanner.list_all() if query_lower in f.lower()]

    @staticmethod
    def validate_group(group_data: dict) -> dict:
        """
        验证群组中每个 LoRA 文件是否存在
        返回: {"valid": [...], "missing": [...]}
        """
        result = {"valid": [], "missing": []}
        for item in group_data.get("loras", []):
            lora_name = item.get("lora", "")
            if LoraScanner.exists(lora_name):
                result["valid"].append(item)
            else:
                result["missing"].append(item)
        return result
