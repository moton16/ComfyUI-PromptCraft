"""
ModelLoraGroupLoader 节点测试
覆盖: 节点属性 / execute() 流程 / IS_CHANGED 哈希确定性
"""

import json
from unittest.mock import MagicMock, patch

import pytest
from promptcraft.model_lora_loader import ModelLoraGroupLoader


class TestNodeProperties:
    """节点元数据验证"""

    def test_return_types(self):
        assert ModelLoraGroupLoader.RETURN_TYPES == ("MODEL", "CLIP", "VAE", "STRING")

    def test_return_names(self):
        assert ModelLoraGroupLoader.RETURN_NAMES == ("model", "clip", "vae", "lora_prompt_data")

    def test_function(self):
        assert ModelLoraGroupLoader.FUNCTION == "execute"

    def test_category(self):
        assert ModelLoraGroupLoader.CATEGORY == "Moton PromptCraft"

    def test_description_non_empty(self):
        assert isinstance(ModelLoraGroupLoader.DESCRIPTION, str)
        assert len(ModelLoraGroupLoader.DESCRIPTION) > 0

    def test_input_types_has_required_fields(self):
        spec = ModelLoraGroupLoader.INPUT_TYPES()
        assert "checkpoint" in spec["required"]
        assert "strength_multiplier" in spec["required"]
        assert "model" in spec.get("optional", {})


class TestExecute:
    """execute() 行为测试"""

    def test_execute_with_model_no_checkpoint(self):
        """传入 model（无 checkpoint），直接返回"""
        mock_model = MagicMock(name="model")
        mock_clip = MagicMock(name="clip")
        mock_vae = MagicMock(name="vae")

        node = ModelLoraGroupLoader()
        result = node.execute(
            checkpoint="None",
            strength_multiplier=1.0,
            model=mock_model,
            clip=mock_clip,
            vae=mock_vae,
            lora_stack_data="{}",
        )
        model_out, clip_out, vae_out, prompt_json = result
        assert model_out is mock_model
        assert clip_out is mock_clip
        assert vae_out is mock_vae
        assert prompt_json == "{}"

    def test_execute_no_model_raises(self):
        """未提供 model 且 checkpoint 为 None 时抛出 ValueError"""
        node = ModelLoraGroupLoader()
        with pytest.raises(ValueError, match="未提供 MODEL"):
            node.execute(
                checkpoint="None",
                strength_multiplier=1.0,
                model=None,
                lora_stack_data="{}",
            )

    def test_execute_with_checkpoint_loads_via_comfy(self):
        """传入 checkpoint 时通过 comfy 加载底模"""
        import promptcraft.model_lora_loader as mlr

        mock_model = MagicMock(name="loaded_model")
        mock_clip = MagicMock(name="loaded_clip")
        mock_vae = MagicMock(name="loaded_vae")

        mock_out = MagicMock()
        mock_out.__getitem__ = MagicMock(side_effect=lambda i: [mock_model, mock_clip, mock_vae][i])

        mock_sd = MagicMock()
        mock_sd.load_checkpoint_guess_config.return_value = mock_out
        mock_fp = MagicMock()
        mock_fp.get_full_path_or_raise.return_value = "/mock/ckpt.safetensors"
        mock_fp.get_folder_paths.return_value = "/mock/embeddings"

        node = ModelLoraGroupLoader()
        with patch.object(mlr, "HAS_COMFY", True), \
             patch.object(mlr, "comfy", MagicMock(sd=mock_sd)), \
             patch("promptcraft.model_lora_loader.folder_paths", mock_fp):
            result = node.execute(
                checkpoint="model_v1.safetensors",
                strength_multiplier=1.0,
                lora_stack_data="{}",
            )
        model_out, clip_out, vae_out, prompt_json = result
        assert model_out is mock_model
        assert clip_out is mock_clip
        assert vae_out is mock_vae
        mock_sd.load_checkpoint_guess_config.assert_called_once()

    @patch("promptcraft.model_lora_loader.lora_prompt_manager")
    @patch("promptcraft.model_lora_loader.flatten_stack")
    @patch("promptcraft.model_lora_loader.load_single_lora")
    def test_execute_applies_lora(self, mock_load_lora, mock_flatten, mock_pm):
        """有 LoRA items 时逐个调用 load_single_lora"""
        mock_model = MagicMock(name="model")
        mock_clip = MagicMock(name="clip")
        mock_vae = MagicMock(name="vae")

        mock_flatten.return_value = [
            {"lora": "style/neon.safetensors", "weight": 0.8, "clip_weight": 0.7, "enabled": True, "selected_group": None},
        ]
        mock_pm.get_all_for_stack.return_value = {"style/neon.safetensors": {}}
        mock_load_lora.return_value = (MagicMock(name="model_out"), MagicMock(name="clip_out"))

        node = ModelLoraGroupLoader()
        stack = json.dumps({"items": [{"type": "individual", "lora": "style/neon.safetensors", "weight": 0.8, "clip_weight": 0.7, "enabled": True}]})
        node.execute(
            checkpoint="None",
            strength_multiplier=1.0,
            model=mock_model,
            clip=mock_clip,
            vae=mock_vae,
            lora_stack_data=stack,
        )
        mock_load_lora.assert_called_once()
        call_args = mock_load_lora.call_args
        assert call_args[0][2] == "style/neon.safetensors"

    @patch("promptcraft.model_lora_loader.lora_prompt_manager")
    @patch("promptcraft.model_lora_loader.flatten_stack")
    @patch("promptcraft.model_lora_loader.load_single_lora")
    def test_execute_skips_disabled_lora(self, mock_load_lora, mock_flatten, mock_pm):
        """enabled=False 的 LoRA 不调用 load_single_lora"""
        mock_model = MagicMock(name="model")
        mock_clip = MagicMock(name="clip")

        mock_flatten.return_value = [
            {"lora": "disabled.safetensors", "weight": 1.0, "clip_weight": 1.0, "enabled": False, "selected_group": None},
        ]
        mock_pm.get_all_for_stack.return_value = {}

        node = ModelLoraGroupLoader()
        stack = json.dumps({"items": [{"type": "individual", "lora": "disabled.safetensors", "weight": 1.0, "clip_weight": 1.0, "enabled": False}]})
        node.execute(
            checkpoint="None",
            strength_multiplier=1.0,
            model=mock_model,
            clip=mock_clip,
            vae=MagicMock(),
            lora_stack_data=stack,
        )
        mock_load_lora.assert_not_called()

    def test_execute_invalid_json_fallback(self):
        """无效 JSON 作为 lora_stack_data 时不报错，返回原始 model"""
        mock_model = MagicMock(name="model")
        mock_clip = MagicMock(name="clip")
        mock_vae = MagicMock(name="vae")

        node = ModelLoraGroupLoader()
        result = node.execute(
            checkpoint="None",
            strength_multiplier=1.0,
            model=mock_model,
            clip=mock_clip,
            vae=mock_vae,
            lora_stack_data="not valid json {{{",
        )
        model_out, clip_out, vae_out, prompt_json = result
        assert model_out is mock_model
        assert clip_out is mock_clip
        assert vae_out is mock_vae
        assert prompt_json == "{}"

    @patch("promptcraft.model_lora_loader.lora_prompt_manager")
    @patch("promptcraft.model_lora_loader.flatten_stack")
    @patch("promptcraft.model_lora_loader.load_single_lora")
    def test_execute_strength_multiplier_affects_weights(self, mock_load_lora, mock_flatten, mock_pm):
        """strength_multiplier 乘以每个 LoRA 的 weight/clip_weight"""
        mock_model = MagicMock(name="model")
        mock_clip = MagicMock(name="clip")

        mock_flatten.return_value = [
            {"lora": "a.safetensors", "weight": 0.5, "clip_weight": 0.4, "enabled": True, "selected_group": None},
        ]
        mock_pm.get_all_for_stack.return_value = {}
        mock_load_lora.return_value = (MagicMock(), MagicMock())

        node = ModelLoraGroupLoader()
        stack = json.dumps({"items": [{"type": "individual", "lora": "a.safetensors", "weight": 0.5, "clip_weight": 0.4, "enabled": True}]})
        node.execute(
            checkpoint="None",
            strength_multiplier=2.0,
            model=mock_model,
            clip=mock_clip,
            vae=MagicMock(),
            lora_stack_data=stack,
        )
        call_args = mock_load_lora.call_args
        assert call_args[0][3] == pytest.approx(0.5 * 2.0)
        assert call_args[0][4] == pytest.approx(0.4 * 2.0)

    @patch("promptcraft.model_lora_loader.lora_prompt_manager")
    @patch("promptcraft.model_lora_loader.flatten_stack")
    def test_execute_empty_items_returns_early(self, mock_flatten, mock_pm):
        """items 为空列表时直接返回原始 model"""
        mock_model = MagicMock(name="model")

        mock_flatten.return_value = []

        node = ModelLoraGroupLoader()
        stack = json.dumps({"items": []})
        result = node.execute(
            checkpoint="None",
            strength_multiplier=1.0,
            model=mock_model,
            clip=MagicMock(),
            vae=MagicMock(),
            lora_stack_data=stack,
        )
        assert result[0] is mock_model

    @patch("promptcraft.model_lora_loader.lora_prompt_manager")
    @patch("promptcraft.model_lora_loader.flatten_stack")
    @patch("promptcraft.model_lora_loader.load_single_lora")
    def test_execute_clip_none_skips_clip_strength(self, mock_load_lora, mock_flatten, mock_pm):
        """clip 为 None 时，clip strength 设为 0"""
        mock_model = MagicMock(name="model")

        mock_flatten.return_value = [
            {"lora": "a.safetensors", "weight": 1.0, "clip_weight": 0.8, "enabled": True, "selected_group": None},
        ]
        mock_pm.get_all_for_stack.return_value = {}
        mock_load_lora.return_value = (MagicMock(), MagicMock())

        node = ModelLoraGroupLoader()
        stack = json.dumps({"items": [{"type": "individual", "lora": "a.safetensors", "weight": 1.0, "clip_weight": 0.8, "enabled": True}]})
        node.execute(
            checkpoint="None",
            strength_multiplier=1.0,
            model=mock_model,
            clip=None,
            vae=MagicMock(),
            lora_stack_data=stack,
        )
        call_args = mock_load_lora.call_args
        assert call_args[0][4] == 0

    @patch("promptcraft.model_lora_loader.lora_prompt_manager")
    @patch("promptcraft.model_lora_loader.flatten_stack")
    @patch("promptcraft.model_lora_loader.load_single_lora")
    def test_execute_zero_weight_lora_skipped(self, mock_load_lora, mock_flatten, mock_pm):
        """weight 和 clip_weight 均为 0 时跳过加载"""
        mock_model = MagicMock(name="model")
        mock_clip = MagicMock(name="clip")

        mock_flatten.return_value = [
            {"lora": "zero.safetensors", "weight": 0.0, "clip_weight": 0.0, "enabled": True, "selected_group": None},
        ]
        mock_pm.get_all_for_stack.return_value = {}

        node = ModelLoraGroupLoader()
        stack = json.dumps({"items": [{"type": "individual", "lora": "zero.safetensors", "weight": 0.0, "clip_weight": 0.0, "enabled": True}]})
        node.execute(
            checkpoint="None",
            strength_multiplier=1.0,
            model=mock_model,
            clip=mock_clip,
            vae=MagicMock(),
            lora_stack_data=stack,
        )
        mock_load_lora.assert_not_called()

    @patch("promptcraft.model_lora_loader.lora_prompt_manager")
    @patch("promptcraft.model_lora_loader.flatten_stack")
    @patch("promptcraft.model_lora_loader.load_single_lora")
    def test_execute_returns_prompt_json(self, mock_load_lora, mock_flatten, mock_pm):
        """返回值中 prompt_json 包含 prompt 数据"""
        mock_model = MagicMock(name="model")
        mock_clip = MagicMock(name="clip")
        mock_vae = MagicMock(name="vae")

        prompt_data = {"style/neon.safetensors": {"groups": [{"name": "默认", "prompts": ["neon"]}]}}

        mock_flatten.return_value = [
            {"lora": "style/neon.safetensors", "weight": 1.0, "clip_weight": 1.0, "enabled": True, "selected_group": None},
        ]
        mock_pm.get_all_for_stack.return_value = prompt_data
        mock_load_lora.return_value = (MagicMock(), MagicMock())

        node = ModelLoraGroupLoader()
        stack = json.dumps({"items": [{"type": "individual", "lora": "style/neon.safetensors", "weight": 1.0, "clip_weight": 1.0, "enabled": True}]})
        result = node.execute(
            checkpoint="None",
            strength_multiplier=1.0,
            model=mock_model,
            clip=mock_clip,
            vae=mock_vae,
            lora_stack_data=stack,
        )
        result_json = json.loads(result[3])
        assert "style/neon.safetensors" in result_json


class TestISChanged:
    """IS_CHANGED 哈希测试"""

    @patch("promptcraft.model_lora_loader.os.path.exists", return_value=False)
    def test_deterministic_hash(self, _mock_exists):
        """相同输入返回相同哈希"""
        h1 = ModelLoraGroupLoader.IS_CHANGED("ckpt.safetensors", 1.0, lora_stack_data="{}")
        h2 = ModelLoraGroupLoader.IS_CHANGED("ckpt.safetensors", 1.0, lora_stack_data="{}")
        assert h1 == h2

    @patch("promptcraft.model_lora_loader.os.path.exists", return_value=False)
    def test_varies_with_checkpoint(self, _mock_exists):
        """不同 checkpoint 产生不同哈希"""
        h1 = ModelLoraGroupLoader.IS_CHANGED("a.safetensors", 1.0, lora_stack_data="{}")
        h2 = ModelLoraGroupLoader.IS_CHANGED("b.safetensors", 1.0, lora_stack_data="{}")
        assert h1 != h2

    @patch("promptcraft.model_lora_loader.os.path.exists", return_value=False)
    def test_varies_with_strength(self, _mock_exists):
        """不同 strength_multiplier 产生不同哈希"""
        h1 = ModelLoraGroupLoader.IS_CHANGED("ckpt.safetensors", 1.0, lora_stack_data="{}")
        h2 = ModelLoraGroupLoader.IS_CHANGED("ckpt.safetensors", 0.5, lora_stack_data="{}")
        assert h1 != h2

    @patch("promptcraft.model_lora_loader.os.path.exists", return_value=False)
    def test_varies_with_stack_data(self, _mock_exists):
        """不同 lora_stack_data 产生不同哈希"""
        h1 = ModelLoraGroupLoader.IS_CHANGED("ckpt.safetensors", 1.0, lora_stack_data="{}")
        h2 = ModelLoraGroupLoader.IS_CHANGED("ckpt.safetensors", 1.0, lora_stack_data='{"items":[]}')
        assert h1 != h2

    @patch("promptcraft.model_lora_loader.os.path.exists", return_value=True)
    @patch("promptcraft.model_lora_loader.os.path.getmtime", return_value=1000.0)
    def test_includes_groups_mtime(self, _mock_mtime, _mock_exists):
        """groups_path 存在时哈希包含 mtime"""
        h1 = ModelLoraGroupLoader.IS_CHANGED("ckpt.safetensors", 1.0, lora_stack_data="{}")

        with patch("promptcraft.model_lora_loader.os.path.getmtime", return_value=2000.0):
            h2 = ModelLoraGroupLoader.IS_CHANGED("ckpt.safetensors", 1.0, lora_stack_data="{}")
        assert h1 != h2

    @patch("promptcraft.model_lora_loader.os.path.exists", return_value=False)
    def test_hash_is_hex_string(self, _mock_exists):
        """哈希结果是合法的十六进制字符串"""
        h = ModelLoraGroupLoader.IS_CHANGED("ckpt.safetensors", 1.0, lora_stack_data="{}")
        assert isinstance(h, str)
        int(h, 16)

    @patch("promptcraft.model_lora_loader._clear_lora_cache")
    def test_clear_cache_calls_utils(self, mock_clear):
        """clear_cache 调用 lora_utils.clear_cache"""
        ModelLoraGroupLoader.clear_cache()
        mock_clear.assert_called_once()
