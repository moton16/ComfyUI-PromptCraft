"""
LoRA 群组管理器 — 群组配置的 CRUD 操作
复用 config_manager 的用户配置目录存储 lora_groups.json
"""

import os
import threading
from datetime import datetime
from typing import Optional

from .cache_utils import MtimeCacheMixin


class LoraGroupManager(MtimeCacheMixin):
    """LoRA 群组配置的 CRUD 管理器（模块级单例 + Lock 线程安全初始化）"""

    _init_lock = threading.Lock()

    def __init__(self):
        if getattr(self, "_initialized", False):
            return
        with self._init_lock:
            if getattr(self, "_initialized", False):
                return
            # Phase 3 #19: _do_init 异常时不设 _initialized，下次调用可重试
            try:
                self._do_init()
            except Exception as e:
                print(f"[PromptCraft] LoraGroupManager 初始化失败: {e}", flush=True)
                raise
            self._initialized = True

    def _do_init(self):
        """首次初始化逻辑（由 __init__ 在 Lock 保护下调用一次）"""

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
        return config_manager._atomic_write_json(self._cache_file, data)

    # ==================== 加载 ====================

    def load_groups(self) -> dict:
        """加载群组配置（带 mtime 缓存）"""
        if not os.path.exists(self._cache_file):
            self._ensure_file_exists()
        return self._load_json_with_cache(key="groups")

    def save_groups(self, groups: dict):
        """原子写入群组配置"""
        data = {"version": "1.0.0", "groups": groups}
        ok = self._save_json_and_update_cache(data)
        if not ok:
            # 写入失败：失效缓存，避免内存与磁盘不一致
            self._cache = None
            self._cache_mtime = 0

    # ==================== 查询 ====================

    def get_group_names(self) -> list:
        return list(self.load_groups().keys())

    def get_group(self, name: str) -> Optional[dict]:
        return self.load_groups().get(name)

    def get_group_summary(self) -> dict:
        """获取群组摘要信息（不含完整 LoRA 列表）"""
        groups = self.load_groups()
        result = {}
        for name, g in groups.items():
            if not isinstance(g, dict):
                continue
            result[name] = {
                "label": g.get("label", name),
                "description": g.get("description", ""),
                "count": len(g.get("loras", [])),
                "updated_at": g.get("updated_at", ""),
            }
        return result

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
        group_data = groups.get(group_name)
        if not isinstance(group_data, dict):
            raise ValueError(f"群组 '{group_name}' 不存在")
        loras = group_data.get("loras")
        if not isinstance(loras, list):
            loras = []
            group_data["loras"] = loras
        for item in loras:
            if isinstance(item, dict) and item.get("lora") == lora_name:
                raise ValueError(f"LoRA '{lora_name}' 已在群组中")
        loras.append({
            "lora": lora_name,
            "weight": weight,
            "clip_weight": clip_weight,
            "enabled": True,
            "note": ""
        })
        group_data["updated_at"] = datetime.now().isoformat()
        self.save_groups(groups)

    def remove_lora(self, group_name: str, lora_name: str):
        groups = self.load_groups()
        group_data = groups.get(group_name)
        if not isinstance(group_data, dict):
            raise ValueError(f"群组 '{group_name}' 不存在")
        loras = group_data.get("loras")
        if not isinstance(loras, list):
            raise ValueError(f"LoRA '{lora_name}' 不在群组 '{group_name}' 中")
        original_len = len(loras)
        group_data["loras"] = [
            item for item in loras
            if not (isinstance(item, dict) and item.get("lora") == lora_name)
        ]
        if len(group_data["loras"]) == original_len:
            raise ValueError(f"LoRA '{lora_name}' 不在群组 '{group_name}' 中")
        group_data["updated_at"] = datetime.now().isoformat()
        self.save_groups(groups)

    def update_lora(self, group_name: str, lora_name: str, **kwargs):
        """更新群组中某个 LoRA 的属性"""
        groups = self.load_groups()
        group_data = groups.get(group_name)
        if not isinstance(group_data, dict):
            raise ValueError(f"群组 '{group_name}' 不存在")
        for item in group_data.get("loras", []):
            if isinstance(item, dict) and item.get("lora") == lora_name:
                for key, value in kwargs.items():
                    if key in ("weight", "clip_weight", "enabled", "note"):
                        item[key] = value
                group_data["updated_at"] = datetime.now().isoformat()
                self.save_groups(groups)
                return
        raise ValueError(f"LoRA '{lora_name}' 不在群组 '{group_name}' 中")

    def reorder_loras(self, group_name: str, ordered_names: list):
        """按指定顺序重排群组内 LoRA

        V0-DATA-04: 未在 ordered_names 中的 LoRA 追加到末尾（不静默丢弃）。
        ordered_names 中不存在于群组的条目被忽略。
        """
        groups = self.load_groups()
        group_data = groups.get(group_name)
        if not isinstance(group_data, dict):
            raise ValueError(f"群组 '{group_name}' 不存在")
        loras = group_data.get("loras")
        if not isinstance(loras, list):
            raise ValueError(f"群组 '{group_name}' 的 LoRA 列表无效")
        lora_map = {
            item["lora"]: item for item in loras
            if isinstance(item, dict) and item.get("lora")
        }
        new_list = []
        seen = set()
        # 按 ordered_names 顺序追加存在的 LoRA
        for name in ordered_names:
            if name in lora_map and name not in seen:
                new_list.append(lora_map[name])
                seen.add(name)
        # V0-DATA-04: 未在 ordered_names 中的 LoRA 追加到末尾，保留不丢
        for name, item in lora_map.items():
            if name not in seen:
                new_list.append(item)
        group_data["loras"] = new_list
        group_data["updated_at"] = datetime.now().isoformat()
        self.save_groups(groups)


# 全局单例
lora_group_manager = LoraGroupManager()
