"""
Mtime 缓存 Mixin
抽取自 config_manager / lora_group_manager / lora_prompt_manager 的重复缓存模式
"""

import os
import json


class MtimeCacheMixin:
    """基于文件 mtime 的 JSON 缓存 Mixin

    子类需提供:
        self._cache_file: str  — 缓存的 JSON 文件路径
    """

    def _init_mtime_cache(self):
        """初始化缓存状态（在子类 __init__ 中调用）"""
        self._cache = None
        self._cache_mtime = 0

    def _load_json_with_cache(self, key=None, force_reload=False):
        """带 mtime 缓存的 JSON 加载

        参数:
            key: 如果指定，返回 data.get(key, {})；否则返回整个 data
            force_reload: 强制跳过缓存重新加载

        返回:
            dict: 缓存的 JSON 数据
        """
        if not os.path.exists(self._cache_file):
            return {}

        try:
            mtime = os.path.getmtime(self._cache_file)
        except OSError:
            mtime = 0

        if not force_reload and self._cache is not None and mtime == self._cache_mtime:
            if key:
                return self._cache.get(key, {})
            return self._cache

        try:
            with open(self._cache_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            self._cache = data
            self._cache_mtime = mtime
        except Exception as e:
            print(f"[PromptCraft] 加载缓存文件失败 [{self._cache_file}]: {e}")
            self._cache = {}
            self._cache_mtime = 0
            return {}

        if key:
            return self._cache.get(key, {})
        return self._cache

    def _save_json_and_update_cache(self, data):
        """原子写入 JSON 并更新缓存

        子类需提供 self._save_raw(data) 方法
        """
        self._save_raw(data)
        self._cache = data
        try:
            self._cache_mtime = os.path.getmtime(self._cache_file)
        except OSError:
            self._cache_mtime = 0
