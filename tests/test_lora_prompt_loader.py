"""
LoRA Prompt Loader 节点测试
覆盖: 节点属性 / _extract_prompt_text / execute
"""

import pytest
from unittest.mock import patch, MagicMock
from promptcraft.lora_prompt_loader import LoraPromptLoader


class TestNodeProperties:

    def test_return_types(self):
        assert LoraPromptLoader.RETURN_TYPES == ("MODEL", "CLIP", "VAE", "STRING", "STRING")

    def test_return_names(self):
        assert LoraPromptLoader.RETURN_NAMES == ("model", "clip", "vae", "positive_text", "negative_text")

    def test_function(self):
        assert LoraPromptLoader.FUNCTION == "execute"

    def test_category(self):
        assert LoraPromptLoader.CATEGORY == "Moton PromptCraft"


class TestExtractPromptText:

    def setup_method(self):
        self.loader = LoraPromptLoader()

    def test_empty_data(self):
        pos, neg = self.loader._extract_prompt_text({})
        assert pos == []
        assert neg == []

    def test_extracts_positive(self):
        prompt_data = {
            "lora_a.safetensors": {
                "groups": [
                    {"name": "默认", "prompts": ["neon lights", "cyberpunk"], "negative": ""}
                ]
            }
        }
        pos, neg = self.loader._extract_prompt_text(prompt_data)
        assert pos == ["neon lights", "cyberpunk"]
        assert neg == []

    def test_extracts_negative(self):
        prompt_data = {
            "lora_a.safetensors": {
                "groups": [
                    {"name": "默认", "prompts": ["prompt1"], "negative": "low quality"}
                ]
            }
        }
        pos, neg = self.loader._extract_prompt_text(prompt_data)
        assert pos == ["prompt1"]
        assert neg == ["low quality"]

    def test_extracts_both(self):
        prompt_data = {
            "lora_a.safetensors": {
                "groups": [
                    {"name": "默认", "prompts": ["neon lights"], "negative": "daylight"}
                ]
            }
        }
        pos, neg = self.loader._extract_prompt_text(prompt_data)
        assert pos == ["neon lights"]
        assert neg == ["daylight"]

    def test_dedup(self):
        prompt_data = {
            "lora_a.safetensors": {
                "groups": [
                    {"name": "默认", "prompts": ["shared prompt"], "negative": "shared neg"}
                ]
            },
            "lora_b.safetensors": {
                "groups": [
                    {"name": "默认", "prompts": ["shared prompt"], "negative": "shared neg"}
                ]
            }
        }
        pos, neg = self.loader._extract_prompt_text(prompt_data)
        assert pos.count("shared prompt") == 1
        assert neg.count("shared neg") == 1

    def test_multiple_groups(self):
        prompt_data = {
            "lora_a.safetensors": {
                "groups": [
                    {"name": "默认", "prompts": ["prompt_a1"], "negative": "neg_a1"},
                    {"name": "战斗", "prompts": ["prompt_a2"], "negative": "neg_a2"},
                ]
            }
        }
        pos, neg = self.loader._extract_prompt_text(prompt_data)
        assert pos == ["prompt_a1", "prompt_a2"]
        assert neg == ["neg_a1", "neg_a2"]

    def test_empty_groups(self):
        prompt_data = {
            "lora_a.safetensors": {"groups": []}
        }
        pos, neg = self.loader._extract_prompt_text(prompt_data)
        assert pos == []
        assert neg == []

    def test_empty_prompts_in_group(self):
        prompt_data = {
            "lora_a.safetensors": {
                "groups": [
                    {"name": "默认", "prompts": [], "negative": ""}
                ]
            }
        }
        pos, neg = self.loader._extract_prompt_text(prompt_data)
        assert pos == []
        assert neg == []


class TestExecute:

    def setup_method(self):
        self.loader = LoraPromptLoader()

    @patch('promptcraft.lora_prompt_loader.lora_prompt_manager')
    @patch('promptcraft.lora_prompt_loader.flatten_stack')
    @patch('promptcraft.lora_prompt_loader.load_single_lora')
    def test_merges_lora_prompt_with_user_text(self, mock_load_lora, mock_flatten, mock_pm):
        mock_model = MagicMock(name="MODEL")
        mock_clip = MagicMock(name="CLIP")
        mock_vae = MagicMock(name="VAE")

        mock_flatten.return_value = [
            {"lora": "a.safetensors", "weight": 0.8, "clip_weight": 0.8, "enabled": True, "selected_group": None}
        ]
        mock_pm.get_all_for_stack.return_value = {
            "a.safetensors": {
                "groups": [
                    {"name": "默认", "prompts": ["neon lights"], "negative": "daylight"}
                ]
            }
        }
        mock_load_lora.return_value = (mock_model, mock_clip)

        result = self.loader.execute(
            checkpoint="None",
            strength_multiplier=1.0,
            positive_text="masterpiece, best quality",
            negative_text="ugly",
            model=mock_model,
            clip=mock_clip,
            vae=mock_vae,
            lora_stack_data='{"items": [{"lora": "a.safetensors", "weight": 0.8, "clip_weight": 0.8, "enabled": true}]}'
        )

        model, clip, vae, final_pos, final_neg = result
        assert "neon lights" in final_pos
        assert "masterpiece, best quality" in final_pos
        assert final_pos == "neon lights, masterpiece, best quality"
        assert "daylight" in final_neg
        assert "ugly" in final_neg
        assert final_neg == "daylight, ugly"

    @patch('promptcraft.lora_prompt_loader.lora_prompt_manager')
    @patch('promptcraft.lora_prompt_loader.flatten_stack')
    @patch('promptcraft.lora_prompt_loader.load_single_lora')
    def test_empty_user_text(self, mock_load_lora, mock_flatten, mock_pm):
        mock_model = MagicMock(name="MODEL")
        mock_clip = MagicMock(name="CLIP")
        mock_vae = MagicMock(name="VAE")

        mock_flatten.return_value = [
            {"lora": "a.safetensors", "weight": 0.8, "clip_weight": 0.8, "enabled": True, "selected_group": None}
        ]
        mock_pm.get_all_for_stack.return_value = {
            "a.safetensors": {
                "groups": [
                    {"name": "默认", "prompts": ["neon lights"], "negative": "daylight"}
                ]
            }
        }
        mock_load_lora.return_value = (mock_model, mock_clip)

        result = self.loader.execute(
            checkpoint="None",
            strength_multiplier=1.0,
            positive_text="",
            negative_text="",
            model=mock_model,
            clip=mock_clip,
            vae=mock_vae,
            lora_stack_data='{"items": []}'
        )

        model, clip, vae, final_pos, final_neg = result
        assert final_pos == "neon lights"
        assert final_neg == "daylight"

    def test_no_model_raises_value_error(self):
        with pytest.raises(ValueError, match="未提供 MODEL"):
            self.loader.execute(
                checkpoint="None",
                strength_multiplier=1.0,
                model=None,
            )

    @patch('promptcraft.lora_prompt_loader.lora_prompt_manager')
    @patch('promptcraft.lora_prompt_loader.flatten_stack')
    @patch('promptcraft.lora_prompt_loader.load_single_lora')
    def test_comma_separated_output(self, mock_load_lora, mock_flatten, mock_pm):
        mock_model = MagicMock(name="MODEL")
        mock_clip = MagicMock(name="CLIP")
        mock_vae = MagicMock(name="VAE")

        mock_flatten.return_value = [
            {"lora": "a.safetensors", "weight": 0.8, "clip_weight": 0.8, "enabled": True, "selected_group": None}
        ]
        mock_pm.get_all_for_stack.return_value = {
            "a.safetensors": {
                "groups": [
                    {"name": "默认", "prompts": ["prompt1", "prompt2"], "negative": "neg1, neg2"}
                ]
            }
        }
        mock_load_lora.return_value = (mock_model, mock_clip)

        result = self.loader.execute(
            checkpoint="None",
            strength_multiplier=1.0,
            positive_text="user_pos",
            negative_text="user_neg",
            model=mock_model,
            clip=mock_clip,
            vae=mock_vae,
            lora_stack_data='{"items": []}'
        )

        model, clip, vae, final_pos, final_neg = result
        assert isinstance(final_pos, str)
        assert isinstance(final_neg, str)
        parts_pos = final_pos.split(", ")
        assert "prompt1" in parts_pos
        assert "prompt2" in parts_pos
        assert "user_pos" in parts_pos

    @patch('promptcraft.lora_prompt_loader.lora_prompt_manager')
    @patch('promptcraft.lora_prompt_loader.flatten_stack')
    @patch('promptcraft.lora_prompt_loader.load_single_lora')
    def test_empty_lora_stack(self, mock_load_lora, mock_flatten, mock_pm):
        mock_model = MagicMock(name="MODEL")
        mock_clip = MagicMock(name="CLIP")
        mock_vae = MagicMock(name="VAE")

        mock_flatten.return_value = []
        mock_pm.get_all_for_stack.return_value = {}

        result = self.loader.execute(
            checkpoint="None",
            strength_multiplier=1.0,
            positive_text="hello",
            negative_text="world",
            model=mock_model,
            clip=mock_clip,
            vae=mock_vae,
            lora_stack_data='{"items": []}'
        )

        model, clip, vae, final_pos, final_neg = result
        assert final_pos == "hello"
        assert final_neg == "world"

    @patch('promptcraft.lora_prompt_loader.lora_prompt_manager')
    @patch('promptcraft.lora_prompt_loader.flatten_stack')
    @patch('promptcraft.lora_prompt_loader.load_single_lora')
    def test_disabled_lora_skipped(self, mock_load_lora, mock_flatten, mock_pm):
        mock_model = MagicMock(name="MODEL")
        mock_clip = MagicMock(name="CLIP")
        mock_vae = MagicMock(name="VAE")

        mock_flatten.return_value = [
            {"lora": "a.safetensors", "weight": 0.8, "clip_weight": 0.8, "enabled": False, "selected_group": None}
        ]
        mock_pm.get_all_for_stack.return_value = {}

        result = self.loader.execute(
            checkpoint="None",
            strength_multiplier=1.0,
            positive_text="test",
            negative_text="",
            model=mock_model,
            clip=mock_clip,
            vae=mock_vae,
            lora_stack_data='{"items": []}'
        )

        model, clip, vae, final_pos, final_neg = result
        mock_load_lora.assert_not_called()
        assert final_pos == "test"
        assert final_neg == ""

    @patch('promptcraft.lora_prompt_loader.lora_prompt_manager')
    @patch('promptcraft.lora_prompt_loader.flatten_stack')
    def test_invalid_json_stack_data(self, mock_flatten, mock_pm):
        mock_model = MagicMock(name="MODEL")
        mock_clip = MagicMock(name="CLIP")
        mock_vae = MagicMock(name="VAE")

        mock_flatten.return_value = []
        mock_pm.get_all_for_stack.return_value = {}

        result = self.loader.execute(
            checkpoint="None",
            strength_multiplier=1.0,
            positive_text="test",
            negative_text="",
            model=mock_model,
            clip=mock_clip,
            vae=mock_vae,
            lora_stack_data='invalid json'
        )

        model, clip, vae, final_pos, final_neg = result
        assert final_pos == "test"
