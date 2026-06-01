"""
LoRA 工具函数测试
覆盖: flatten_stack / clear_cache
注意: load_single_lora 依赖 ComfyUI 运行时，只测 flatten_stack 的纯逻辑
"""

import pytest
from unittest.mock import patch, MagicMock


class TestFlattenStack:

    @patch('lora_utils.lora_group_manager')
    @patch('lora_utils.LoraScanner')
    def test_flat_lora_passthrough(self, mock_scanner, mock_group_mgr):
        """普通 LoRA 条目直接透传"""
        from lora_utils import flatten_stack

        items = [
            {"type": "lora", "lora": "a.safetensors", "weight": 0.8, "clip_weight": 0.7, "enabled": True},
            {"type": "lora", "lora": "b.safetensors", "weight": 0.5, "clip_weight": 0.5, "enabled": True},
        ]
        result = flatten_stack(items)
        assert len(result) == 2
        assert result[0]["lora"] == "a.safetensors"
        assert result[1]["lora"] == "b.safetensors"

    @patch('lora_utils.lora_group_manager')
    @patch('lora_utils.LoraScanner')
    def test_group_expansion(self, mock_scanner, mock_group_mgr):
        """群组引用被递归展开为个体 LoRA"""
        from lora_utils import flatten_stack

        mock_group_mgr.get_group.return_value = {
            "loras": [
                {"lora": "x.safetensors", "weight": 0.6, "clip_weight": 0.6, "enabled": True},
                {"lora": "y.safetensors", "weight": 0.4, "clip_weight": 0.4, "enabled": True},
            ]
        }
        mock_scanner.validate_group.return_value = {
            "valid": [
                {"lora": "x.safetensors", "weight": 0.6, "clip_weight": 0.6, "enabled": True},
                {"lora": "y.safetensors", "weight": 0.4, "clip_weight": 0.4, "enabled": True},
            ],
            "missing": [],
        }

        items = [
            {"type": "group", "group_name": "my_group", "weight": 1.0, "clip_weight": 1.0, "enabled": True},
        ]
        result = flatten_stack(items)
        assert len(result) == 2
        assert result[0]["lora"] == "x.safetensors"
        assert result[1]["lora"] == "y.safetensors"

    @patch('lora_utils.lora_group_manager')
    @patch('lora_utils.LoraScanner')
    def test_group_weight_multiplication(self, mock_scanner, mock_group_mgr):
        """群组的 weight 应与 LoRA 自身 weight 相乘"""
        from lora_utils import flatten_stack

        mock_group_mgr.get_group.return_value = {
            "loras": [{"lora": "a.safetensors", "weight": 0.8, "clip_weight": 0.7, "enabled": True}]
        }
        mock_scanner.validate_group.return_value = {
            "valid": [{"lora": "a.safetensors", "weight": 0.8, "clip_weight": 0.7, "enabled": True}],
            "missing": [],
        }

        items = [
            {"type": "group", "group_name": "g", "weight": 0.5, "clip_weight": 0.6, "enabled": True},
        ]
        result = flatten_stack(items)
        assert result[0]["weight"] == pytest.approx(0.8 * 0.5)
        assert result[0]["clip_weight"] == pytest.approx(0.7 * 0.6)

    @patch('lora_utils.lora_group_manager')
    @patch('lora_utils.LoraScanner')
    def test_disabled_group_lora_skipped(self, mock_scanner, mock_group_mgr):
        """群组内 disabled 的 LoRA 应被跳过"""
        from lora_utils import flatten_stack

        mock_group_mgr.get_group.return_value = {
            "loras": [
                {"lora": "a.safetensors", "weight": 0.8, "clip_weight": 0.8, "enabled": True},
                {"lora": "b.safetensors", "weight": 0.5, "clip_weight": 0.5, "enabled": False},
            ]
        }
        mock_scanner.validate_group.return_value = {
            "valid": [
                {"lora": "a.safetensors", "weight": 0.8, "clip_weight": 0.8, "enabled": True},
                {"lora": "b.safetensors", "weight": 0.5, "clip_weight": 0.5, "enabled": False},
            ],
            "missing": [],
        }

        items = [{"type": "group", "group_name": "g", "weight": 1.0, "clip_weight": 1.0, "enabled": True}]
        result = flatten_stack(items)
        assert len(result) == 1
        assert result[0]["lora"] == "a.safetensors"

    @patch('lora_utils.lora_group_manager')
    @patch('lora_utils.LoraScanner')
    def test_nonexistent_group_skipped(self, mock_scanner, mock_group_mgr):
        """不存在的群组应被跳过"""
        from lora_utils import flatten_stack

        mock_group_mgr.get_group.return_value = None

        items = [{"type": "group", "group_name": "ghost", "weight": 1.0, "clip_weight": 1.0, "enabled": True}]
        result = flatten_stack(items)
        assert len(result) == 0

    @patch('lora_utils.lora_group_manager')
    @patch('lora_utils.LoraScanner')
    def test_mixed_items(self, mock_scanner, mock_group_mgr):
        """混合普通 LoRA 和群组引用"""
        from lora_utils import flatten_stack

        mock_group_mgr.get_group.return_value = {
            "loras": [{"lora": "g1.safetensors", "weight": 0.5, "clip_weight": 0.5, "enabled": True}]
        }
        mock_scanner.validate_group.return_value = {
            "valid": [{"lora": "g1.safetensors", "weight": 0.5, "clip_weight": 0.5, "enabled": True}],
            "missing": [],
        }

        items = [
            {"type": "lora", "lora": "direct.safetensors", "weight": 1.0, "clip_weight": 1.0, "enabled": True},
            {"type": "group", "group_name": "g", "weight": 0.8, "clip_weight": 0.8, "enabled": True},
        ]
        result = flatten_stack(items)
        assert len(result) == 2
        assert result[0]["lora"] == "direct.safetensors"
        assert result[1]["lora"] == "g1.safetensors"

    @patch('lora_utils.lora_group_manager')
    @patch('lora_utils.LoraScanner')
    def test_empty_items(self, mock_scanner, mock_group_mgr):
        from lora_utils import flatten_stack
        assert flatten_stack([]) == []


class TestClearCache:

    def test_clear_cache(self):
        from lora_utils import clear_cache, _lora_cache
        _lora_cache["test"] = {"mock": "data"}
        assert len(_lora_cache) > 0
        clear_cache()
        assert len(_lora_cache) == 0
