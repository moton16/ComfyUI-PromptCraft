"""
LoRA 群组管理器 — 群组配置的 CRUD 操作
复用 config_manager 的用户配置目录存储 lora_groups.json
"""

import os
from datetime import datetime
from .cache_utils import MtimeCacheMixin


class LoraGroupManager(MtimeCacheMixin):
    """LoRA 群组配置的 CRUD 管理器（单例）"""

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
        self._cache_file = os.path.join(self.user_dir, "lora_groups.json")
        self.groups_path = self._cache_file

        self._init_mtime_cache()
        self._ensure_file_exists()
        print(f"[PromptCraft] LoRA 群组管理器已初始化: {self._cache_file}")

    def _log(self, msg):
        print(f"[PromptCraft] {msg}", flush=True)

    def _ensure_file_exists(self):
        if not os.path.exists(self._cache_file):
            self._save_raw({"version": "1.0.0", "groups": {}})

    def _save_raw(self, data):
        from .config_manager import config_manager
        config_manager._atomic_write_json(self._cache_file, data)

    # ==================== 加载 ====================

    def load_groups(self) -> dict:
        """加载群组配置（带 mtime 缓存）"""
        if not os.path.exists(self._cache_file):
            self._ensure_file_exists()
        return self._load_json_with_cache(key="groups")

    def save_groups(self, groups: dict):
        """原子写入群组配置"""
        data = {"version": "1.0.0", "groups": groups}
        self._save_json_and_update_cache(data)

    # ==================== 查询 ====================

    def get_group_names(self) -> list:
        return list(self.load_groups().keys())

    def get_group(self, name: str) -> dict:
        return self.load_groups().get(name)

    def get_group_summary(self) -> dict:
        """获取群组摘要信息（不含完整 LoRA 列表）"""
        groups = self.load_groups()
        return {name: {
            "label": g.get("label", name),
            "description": g.get("description", ""),
            "count": len(g.get("loras", [])),
            "updated_at": g.get("updated_at", ""),
        } for name, g in groups.items()}

    # ==================== 创建 ====================

    def create_group(self, name: str, description: str = ""):
        groups = self.load_groups()
        if name in groups:
            raise ValueError(f"群组 '{name}' 已存在")
        now = datetime.now().isoformat()
        groups[name] = {
            "label": name,
            "description": description,
            "created_at": now,
            "updated_at": now,
            "loras": []
        }
        self.save_groups(groups)
        self._log(f"创建群组: {name}")

    # ==================== 重命名 ====================

    def rename_group(self, old_name: str, new_name: str):
        groups = self.load_groups()
        if old_name not in groups:
            raise ValueError(f"群组 '{old_name}' 不存在")
        if new_name in groups:
            raise ValueError(f"群组 '{new_name}' 已存在")
        groups[new_name] = groups.pop(old_name)
        groups[new_name]["label"] = new_name
        groups[new_name]["updated_at"] = datetime.now().isoformat()
        self.save_groups(groups)
        self._log(f"重命名群组: {old_name} → {new_name}")

    # ==================== 删除 ====================

    def delete_group(self, name: str):
        groups = self.load_groups()
        if name not in groups:
            raise ValueError(f"群组 '{name}' 不存在")
        del groups[name]
        self.save_groups(groups)
        self._log(f"删除群组: {name}")

    # ==================== 群组内 LoRA 操作 ====================

    def add_lora(self, group_name: str, lora_name: str,
                 weight: float = 1.0, clip_weight: float = 1.0):
        groups = self.load_groups()
        if group_name not in groups:
            raise ValueError(f"群组 '{group_name}' 不存在")
        for item in groups[group_name]["loras"]:
            if item["lora"] == lora_name:
                raise ValueError(f"LoRA '{lora_name}' 已在群组中")
        groups[group_name]["loras"].append({
            "lora": lora_name,
            "weight": weight,
            "clip_weight": clip_weight,
            "enabled": True,
            "note": ""
        })
        groups[group_name]["updated_at"] = datetime.now().isoformat()
        self.save_groups(groups)

    def remove_lora(self, group_name: str, lora_name: str):
        groups = self.load_groups()
        if group_name not in groups:
            raise ValueError(f"群组 '{group_name}' 不存在")
        original_len = len(groups[group_name]["loras"])
        groups[group_name]["loras"] = [
            item for item in groups[group_name]["loras"]
            if item["lora"] != lora_name
        ]
        if len(groups[group_name]["loras"]) == original_len:
            raise ValueError(f"LoRA '{lora_name}' 不在群组 '{group_name}' 中")
        groups[group_name]["updated_at"] = datetime.now().isoformat()
        self.save_groups(groups)

    def update_lora(self, group_name: str, lora_name: str, **kwargs):
        """更新群组中某个 LoRA 的属性"""
        groups = self.load_groups()
        if group_name not in groups:
            raise ValueError(f"群组 '{group_name}' 不存在")
        for item in groups[group_name]["loras"]:
            if item["lora"] == lora_name:
                for key, value in kwargs.items():
                    if key in ("weight", "clip_weight", "enabled", "note"):
                        item[key] = value
                groups[group_name]["updated_at"] = datetime.now().isoformat()
                self.save_groups(groups)
                return
        raise ValueError(f"LoRA '{lora_name}' 不在群组 '{group_name}' 中")

    def reorder_loras(self, group_name: str, ordered_names: list):
        """按指定顺序重排群组内 LoRA"""
        groups = self.load_groups()
        if group_name not in groups:
            raise ValueError(f"群组 '{group_name}' 不存在")
        lora_map = {item["lora"]: item for item in groups[group_name]["loras"]}
        new_list = []
        for name in ordered_names:
            if name in lora_map:
                new_list.append(lora_map[name])
        groups[group_name]["loras"] = new_list
        groups[group_name]["updated_at"] = datetime.now().isoformat()
        self.save_groups(groups)


# 全局单例
lora_group_manager = LoraGroupManager()
