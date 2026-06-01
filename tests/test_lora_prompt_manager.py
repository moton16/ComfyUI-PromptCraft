"""
LoRA Prompt 管理器测试
覆盖: CRUD / 批量查询 / 注入数据 / 错误处理
"""

import os
import json
import pytest
from promptcraft.lora_prompt_manager import LoraPromptManager


@pytest.fixture
def prompt_manager(tmp_dir):
    """创建独立的 LoraPromptManager 实例"""
    LoraPromptManager._instance = None

    mgr = LoraPromptManager.__new__(LoraPromptManager)
    mgr._initialized = True
    mgr.user_dir = tmp_dir
    mgr._cache_file = os.path.join(tmp_dir, "lora_prompts.json")
    mgr.prompts_path = mgr._cache_file
    mgr._cache = None
    mgr._cache_mtime = 0

    if not os.path.exists(mgr._cache_file):
        with open(mgr._cache_file, "w", encoding="utf-8") as f:
            json.dump({"version": "1.0.0", "loras": {}}, f)

    def _save_raw(data):
        tmp_path = mgr._cache_file + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        os.replace(tmp_path, mgr._cache_file)

    mgr._save_raw = _save_raw

    yield mgr
    LoraPromptManager._instance = None


class TestLoraPromptManagerCRUD:

    def test_add_group(self, prompt_manager):
        prompt_manager.add_group("lora_a.safetensors", "默认", prompts=["prompt1"], negative="neg1")
        data = prompt_manager.get_lora_prompts("lora_a.safetensors")
        assert len(data["groups"]) == 1
        assert data["groups"][0]["name"] == "默认"
        assert data["groups"][0]["prompts"] == ["prompt1"]
        assert data["groups"][0]["negative"] == "neg1"

    def test_add_duplicate_group_raises(self, prompt_manager):
        prompt_manager.add_group("lora_a.safetensors", "默认")
        with pytest.raises(ValueError, match="已存在"):
            prompt_manager.add_group("lora_a.safetensors", "默认")

    def test_add_multiple_groups(self, prompt_manager):
        prompt_manager.add_group("lora_a.safetensors", "组1")
        prompt_manager.add_group("lora_a.safetensors", "组2")
        data = prompt_manager.get_lora_prompts("lora_a.safetensors")
        assert len(data["groups"]) == 2

    def test_update_group_prompts(self, prompt_manager):
        prompt_manager.add_group("lora_a.safetensors", "默认", prompts=["old"])
        prompt_manager.update_group("lora_a.safetensors", "默认", prompts=["new1", "new2"])
        data = prompt_manager.get_lora_prompts("lora_a.safetensors")
        assert data["groups"][0]["prompts"] == ["new1", "new2"]

    def test_update_group_negative(self, prompt_manager):
        prompt_manager.add_group("lora_a.safetensors", "默认")
        prompt_manager.update_group("lora_a.safetensors", "默认", negative="bad quality")
        data = prompt_manager.get_lora_prompts("lora_a.safetensors")
        assert data["groups"][0]["negative"] == "bad quality"

    def test_update_nonexistent_lora_raises(self, prompt_manager):
        with pytest.raises(ValueError, match="无 prompt 配置"):
            prompt_manager.update_group("ghost.safetensors", "默认", prompts=["x"])

    def test_update_nonexistent_group_raises(self, prompt_manager):
        prompt_manager.add_group("lora_a.safetensors", "默认")
        with pytest.raises(ValueError, match="不存在"):
            prompt_manager.update_group("lora_a.safetensors", "ghost", prompts=["x"])

    def test_delete_group(self, prompt_manager):
        prompt_manager.add_group("lora_a.safetensors", "组1")
        prompt_manager.add_group("lora_a.safetensors", "组2")
        prompt_manager.delete_group("lora_a.safetensors", "组1")
        data = prompt_manager.get_lora_prompts("lora_a.safetensors")
        assert len(data["groups"]) == 1
        assert data["groups"][0]["name"] == "组2"

    def test_delete_last_group_removes_lora_entry(self, prompt_manager):
        prompt_manager.add_group("lora_a.safetensors", "唯一组")
        prompt_manager.delete_group("lora_a.safetensors", "唯一组")
        data = prompt_manager.get_lora_prompts("lora_a.safetensors")
        assert data == {"groups": []}

    def test_delete_nonexistent_group_raises(self, prompt_manager):
        prompt_manager.add_group("lora_a.safetensors", "默认")
        with pytest.raises(ValueError, match="不存在"):
            prompt_manager.delete_group("lora_a.safetensors", "ghost")

    def test_delete_lora(self, prompt_manager):
        prompt_manager.add_group("lora_a.safetensors", "默认")
        prompt_manager.delete_lora("lora_a.safetensors")
        data = prompt_manager.get_lora_prompts("lora_a.safetensors")
        assert data == {"groups": []}

    def test_set_lora_prompts(self, prompt_manager):
        groups = [
            {"name": "g1", "prompts": ["p1"], "negative": ""},
            {"name": "g2", "prompts": ["p2"], "negative": "neg"},
        ]
        prompt_manager.set_lora_prompts("lora_a.safetensors", groups)
        data = prompt_manager.get_lora_prompts("lora_a.safetensors")
        assert len(data["groups"]) == 2


class TestLoraPromptManagerBulkQuery:

    def _setup_data(self, pm):
        pm.add_group("lora_a.safetensors", "默认", prompts=["a_prompt"], negative="a_neg")
        pm.add_group("lora_a.safetensors", "战斗", prompts=["a_battle"])
        pm.add_group("lora_b.safetensors", "默认", prompts=["b_prompt"])

    def test_get_all_for_stack(self, prompt_manager):
        self._setup_data(prompt_manager)
        result = prompt_manager.get_all_for_stack(["lora_a.safetensors", "lora_b.safetensors"])
        assert "lora_a.safetensors" in result
        assert "lora_b.safetensors" in result
        assert len(result["lora_a.safetensors"]["groups"]) == 2

    def test_get_all_for_stack_with_selected_group(self, prompt_manager):
        self._setup_data(prompt_manager)
        result = prompt_manager.get_all_for_stack(
            ["lora_a.safetensors"],
            selected_groups={"lora_a.safetensors": "战斗"}
        )
        assert len(result["lora_a.safetensors"]["groups"]) == 1
        assert result["lora_a.safetensors"]["groups"][0]["name"] == "战斗"

    def test_get_all_for_stack_skip_none_group(self, prompt_manager):
        self._setup_data(prompt_manager)
        result = prompt_manager.get_all_for_stack(
            ["lora_a.safetensors"],
            selected_groups={"lora_a.safetensors": "__none__"}
        )
        assert "lora_a.safetensors" not in result

    def test_get_all_for_stack_unknown_lora(self, prompt_manager):
        result = prompt_manager.get_all_for_stack(["unknown.safetensors"])
        assert "unknown.safetensors" not in result


class TestLoraPromptManagerInjection:

    def test_get_injection_data(self, prompt_manager):
        prompt_manager.add_group("lora_a.safetensors", "默认",
                                  prompts=["neon lights", "cyberpunk"], negative="daylight")
        prompt_manager.add_group("lora_b.safetensors", "默认",
                                  prompts=["anime style"])

        lora_list = [
            {"lora": "lora_a.safetensors", "weight": 0.8},
            {"lora": "lora_b.safetensors", "weight": 0.5},
        ]
        result = prompt_manager.get_injection_data(lora_list)
        assert "neon lights" in result["prompts"]
        assert "cyberpunk" in result["prompts"]
        assert "anime style" in result["prompts"]
        assert "daylight" in result["negatives"]

    def test_get_injection_data_dedup(self, prompt_manager):
        prompt_manager.add_group("lora_a.safetensors", "g1", prompts=["shared prompt"])
        prompt_manager.add_group("lora_b.safetensors", "g2", prompts=["shared prompt"])

        lora_list = [
            {"lora": "lora_a.safetensors", "weight": 0.8},
            {"lora": "lora_b.safetensors", "weight": 0.5},
        ]
        result = prompt_manager.get_injection_data(lora_list)
        assert result["prompts"].count("shared prompt") == 1

    def test_get_injection_data_empty_list(self, prompt_manager):
        result = prompt_manager.get_injection_data([])
        assert result == {"prompts": [], "negatives": []}
