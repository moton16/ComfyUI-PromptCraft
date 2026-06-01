"""
LoRA 群组管理器测试
覆盖: CRUD 操作 / LoRA 增删改查 / 重排序 / 错误处理
"""

import os
import json
import pytest
from unittest.mock import patch, MagicMock, PropertyMock
from promptcraft.lora_group_manager import LoraGroupManager


@pytest.fixture
def group_manager(tmp_dir):
    """创建独立的 LoraGroupManager 实例"""
    # 重置单例
    LoraGroupManager._instance = None

    # 创建实例（绕过 __init__ 中的 config_manager 依赖）
    mgr = LoraGroupManager.__new__(LoraGroupManager)
    mgr._initialized = True
    mgr.user_dir = tmp_dir
    mgr._cache_file = os.path.join(tmp_dir, "lora_groups.json")
    mgr.groups_path = mgr._cache_file
    mgr._cache = None
    mgr._cache_mtime = 0

    # 确保文件存在
    if not os.path.exists(mgr._cache_file):
        with open(mgr._cache_file, "w", encoding="utf-8") as f:
            json.dump({"version": "1.0.0", "groups": {}}, f)

    # 覆盖 _save_raw 为直接写入
    def _save_raw(data):
        tmp_path = mgr._cache_file + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        os.replace(tmp_path, mgr._cache_file)

    mgr._save_raw = _save_raw

    yield mgr
    LoraGroupManager._instance = None


class TestLoraGroupManagerCRUD:

    def test_create_group(self, group_manager):
        group_manager.create_group("test_group", "测试群组")
        names = group_manager.get_group_names()
        assert "test_group" in names

    def test_create_duplicate_raises(self, group_manager):
        group_manager.create_group("dup_test")
        with pytest.raises(ValueError, match="已存在"):
            group_manager.create_group("dup_test")

    def test_rename_group(self, group_manager):
        group_manager.create_group("old_name")
        group_manager.rename_group("old_name", "new_name")
        names = group_manager.get_group_names()
        assert "old_name" not in names
        assert "new_name" in names

    def test_rename_nonexistent_raises(self, group_manager):
        with pytest.raises(ValueError, match="不存在"):
            group_manager.rename_group("ghost", "new")

    def test_rename_to_existing_raises(self, group_manager):
        group_manager.create_group("group_a")
        group_manager.create_group("group_b")
        with pytest.raises(ValueError, match="已存在"):
            group_manager.rename_group("group_a", "group_b")

    def test_delete_group(self, group_manager):
        group_manager.create_group("to_delete")
        group_manager.delete_group("to_delete")
        assert "to_delete" not in group_manager.get_group_names()

    def test_delete_nonexistent_raises(self, group_manager):
        with pytest.raises(ValueError, match="不存在"):
            group_manager.delete_group("ghost")

    def test_get_group(self, group_manager):
        group_manager.create_group("my_group", "desc")
        data = group_manager.get_group("my_group")
        assert data is not None
        assert data["description"] == "desc"
        assert data["loras"] == []

    def test_get_nonexistent_group_returns_none(self, group_manager):
        assert group_manager.get_group("nonexistent") is None


class TestLoraGroupManagerLoRAOperations:

    def _create_group_with_lora(self, mgr, group="test", lora="a.safetensors"):
        mgr.create_group(group)
        mgr.add_lora(group, lora, weight=0.8, clip_weight=0.7)
        return mgr

    def test_add_lora(self, group_manager):
        self._create_group_with_lora(group_manager)
        data = group_manager.get_group("test")
        assert len(data["loras"]) == 1
        assert data["loras"][0]["lora"] == "a.safetensors"
        assert data["loras"][0]["weight"] == 0.8
        assert data["loras"][0]["clip_weight"] == 0.7
        assert data["loras"][0]["enabled"] is True

    def test_add_duplicate_lora_raises(self, group_manager):
        self._create_group_with_lora(group_manager)
        with pytest.raises(ValueError, match="已在群组中"):
            group_manager.add_lora("test", "a.safetensors")

    def test_add_lora_to_nonexistent_group_raises(self, group_manager):
        with pytest.raises(ValueError, match="不存在"):
            group_manager.add_lora("ghost", "a.safetensors")

    def test_remove_lora(self, group_manager):
        self._create_group_with_lora(group_manager)
        group_manager.remove_lora("test", "a.safetensors")
        data = group_manager.get_group("test")
        assert len(data["loras"]) == 0

    def test_remove_nonexistent_lora_raises(self, group_manager):
        group_manager.create_group("test")
        with pytest.raises(ValueError, match="不在群组"):
            group_manager.remove_lora("test", "ghost.safetensors")

    def test_update_lora_weight(self, group_manager):
        self._create_group_with_lora(group_manager)
        group_manager.update_lora("test", "a.safetensors", weight=1.5)
        data = group_manager.get_group("test")
        assert data["loras"][0]["weight"] == 1.5

    def test_update_lora_enabled(self, group_manager):
        self._create_group_with_lora(group_manager)
        group_manager.update_lora("test", "a.safetensors", enabled=False)
        data = group_manager.get_group("test")
        assert data["loras"][0]["enabled"] is False

    def test_update_lora_note(self, group_manager):
        self._create_group_with_lora(group_manager)
        group_manager.update_lora("test", "a.safetensors", note="备注文字")
        data = group_manager.get_group("test")
        assert data["loras"][0]["note"] == "备注文字"

    def test_update_nonexistent_lora_raises(self, group_manager):
        group_manager.create_group("test")
        with pytest.raises(ValueError, match="不在群组"):
            group_manager.update_lora("test", "ghost.safetensors", weight=2.0)

    def test_reorder_loras(self, group_manager):
        group_manager.create_group("test")
        group_manager.add_lora("test", "c.safetensors")
        group_manager.add_lora("test", "a.safetensors")
        group_manager.add_lora("test", "b.safetensors")

        group_manager.reorder_loras("test", ["a.safetensors", "b.safetensors", "c.safetensors"])
        data = group_manager.get_group("test")
        names = [item["lora"] for item in data["loras"]]
        assert names == ["a.safetensors", "b.safetensors", "c.safetensors"]


class TestLoraGroupManagerSummary:

    def test_group_summary(self, group_manager):
        group_manager.create_group("g1", "描述1")
        group_manager.add_lora("g1", "a.safetensors")
        group_manager.add_lora("g1", "b.safetensors")

        summary = group_manager.get_group_summary()
        assert "g1" in summary
        assert summary["g1"]["count"] == 2
        assert summary["g1"]["description"] == "描述1"
