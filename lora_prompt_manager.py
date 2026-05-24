"""
LoRA Prompt 管理器 — 每个 LoRA 可存储多组 prompt
复用 config_manager 的用户配置目录存储 lora_prompts.json
"""

import os
from datetime import datetime
from .cache_utils import MtimeCacheMixin


class LoraPromptManager(MtimeCacheMixin):
    """LoRA prompt 组 CRUD 管理器（单例）"""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True

        from .config_manager import config_manager
        self.user_dir = config_manager.user_config_dir
        self._cache_file = os.path.join(self.user_dir, "lora_prompts.json")
        self.prompts_path = self._cache_file

        self._init_mtime_cache()
        self._ensure_file_exists()
        print(f"[PromptCraft] LoRA Prompt 管理器已初始化: {self._cache_file}")

    def _ensure_file_exists(self):
        if not os.path.exists(self._cache_file):
            self._save_raw({"version": "1.0.0", "loras": {}})

    def _save_raw(self, data):
        from .config_manager import config_manager
        config_manager._atomic_write_json(self._cache_file, data)

    # ==================== 加载 ====================

    def load_all(self) -> dict:
        """加载全部 LoRA prompt 配置（带 mtime 缓存）"""
        if not os.path.exists(self._cache_file):
            self._ensure_file_exists()
        return self._load_json_with_cache(key="loras")

    def save_all(self, loras: dict):
        """原子写入全部配置"""
        data = {"version": "1.0.0", "loras": loras}
        self._save_json_and_update_cache(data)

    # ==================== 查询 ====================

    def get_lora_prompts(self, lora_path: str) -> dict:
        """获取单个 LoRA 的 prompt 配置"""
        all_data = self.load_all()
        return all_data.get(lora_path, {"groups": []})

    def get_all_for_stack(self, lora_paths: list, selected_groups: dict = None) -> dict:
        """批量获取栈中所有 LoRA 的 prompt 数据（供节点输出用）
        selected_groups: {lora_path: group_name_or_None} — None 表示全部组
        """
        all_data = self.load_all()
        result = {}
        for path in lora_paths:
            if path in all_data:
                lora_data = all_data[path]
                if selected_groups and path in selected_groups:
                    sel = selected_groups[path]
                    if sel == "__none__":
                        # 不注入任何 prompt，跳过该 LoRA
                        continue
                    elif sel and sel != "__all__":
                        # 只返回选中的组
                        filtered_groups = [
                            g for g in lora_data.get("groups", [])
                            if g["name"] == sel
                        ]
                        if filtered_groups:
                            result[path] = {"groups": filtered_groups}
                    else:
                        result[path] = lora_data
                else:
                    result[path] = lora_data
        return result

    # ==================== 创建/更新 ====================

    def set_lora_prompts(self, lora_path: str, groups: list):
        """设置某个 LoRA 的全部 prompt 组"""
        all_data = self.load_all()
        all_data[lora_path] = {"groups": groups}
        self.save_all(all_data)

    def add_group(self, lora_path: str, name: str,
                  prompts: list = None, negative: str = ""):
        """为某个 LoRA 添加一个 prompt 组"""
        all_data = self.load_all()
        if lora_path not in all_data:
            all_data[lora_path] = {"groups": []}

        for g in all_data[lora_path]["groups"]:
            if g["name"] == name:
                raise ValueError(f"Prompt 组 '{name}' 已存在于该 LoRA 中")

        all_data[lora_path]["groups"].append({
            "name": name,
            "prompts": prompts or [],
            "negative": negative,
        })
        self.save_all(all_data)

    def update_group(self, lora_path: str, group_name: str, **kwargs):
        """更新某个 prompt 组"""
        all_data = self.load_all()
        if lora_path not in all_data:
            raise ValueError(f"LoRA '{lora_path}' 无 prompt 配置")

        for g in all_data[lora_path]["groups"]:
            if g["name"] == group_name:
                for key, value in kwargs.items():
                    if key in ("name", "prompts", "negative"):
                        g[key] = value
                self.save_all(all_data)
                return
        raise ValueError(f"Prompt 组 '{group_name}' 不存在")

    def delete_group(self, lora_path: str, group_name: str):
        """删除某个 prompt 组"""
        all_data = self.load_all()
        if lora_path not in all_data:
            raise ValueError(f"LoRA '{lora_path}' 无 prompt 配置")

        original_len = len(all_data[lora_path]["groups"])
        all_data[lora_path]["groups"] = [
            g for g in all_data[lora_path]["groups"]
            if g["name"] != group_name
        ]
        if len(all_data[lora_path]["groups"]) == original_len:
            raise ValueError(f"Prompt 组 '{group_name}' 不存在")

        # 如果 LoRA 没有任何组了，删除整个条目
        if not all_data[lora_path]["groups"]:
            del all_data[lora_path]

        self.save_all(all_data)

    def delete_lora(self, lora_path: str):
        """删除某个 LoRA 的全部 prompt 配置"""
        all_data = self.load_all()
        if lora_path in all_data:
            del all_data[lora_path]
            self.save_all(all_data)

    # ==================== 注入用 ====================

    def get_injection_data(self, lora_list: list) -> dict:
        """
        获取需要注入到提示词中的数据
        参数: lora_list — [{"lora": "path", "weight": 1.0, ...}, ...]
        返回: {"prompts": ["prompt1", "prompt2"], "negatives": ["neg1"]}
        """
        all_data = self.load_all()
        prompts = []
        negatives = []

        for item in lora_list:
            lora_path = item.get("lora", "")
            if not lora_path or lora_path not in all_data:
                continue

            groups = all_data[lora_path].get("groups", [])
            for group in groups:
                for p in group.get("prompts", []):
                    if p and p not in prompts:
                        prompts.append(p)
                neg = group.get("negative", "")
                if neg and neg not in negatives:
                    negatives.append(neg)

        return {"prompts": prompts, "negatives": negatives}


# 全局单例
lora_prompt_manager = LoraPromptManager()
