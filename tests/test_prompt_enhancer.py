"""
PromptEnhancer 核心节点测试
覆盖: 选项构建 / 随机选择 / 子组收集 / 节点属性
"""

import pytest
from unittest.mock import patch, MagicMock
from promptcraft.prompt_enhancer import PromptEnhancer


class TestNodeProperties:
    """节点元数据测试"""

    def test_no_selection_constant(self):
        assert PromptEnhancer.NO_SELECTION == "——"

    def test_random_selection_constant(self):
        assert "随机" in PromptEnhancer.RANDOM_SELECTION

    def test_random_sfw_constant(self):
        assert "普通" in PromptEnhancer.RANDOM_SFW or "SFW" in PromptEnhancer.RANDOM_SFW

    def test_random_nsfw_constant(self):
        assert "特殊" in PromptEnhancer.RANDOM_NSFW or "NSFW" in PromptEnhancer.RANDOM_NSFW

    def test_subgroup_prefix(self):
        assert "🎲" in PromptEnhancer.RANDOM_SUBGROUP_PREFIX

    def test_has_category_constants(self):
        assert hasattr(PromptEnhancer, 'NO_SELECTION')
        assert hasattr(PromptEnhancer, 'RANDOM_SELECTION')
        assert hasattr(PromptEnhancer, 'RANDOM_SFW')
        assert hasattr(PromptEnhancer, 'RANDOM_NSFW')


class TestCollectSubgroups:
    """子组收集逻辑"""

    def test_no_subgroups(self):
        sfw = {"categories": {"scene": {"options": [{"label": "a"}]}}}
        nsfw = {"categories": {}}
        result = PromptEnhancer._collect_subgroups(sfw, nsfw, "scene")
        assert isinstance(result, dict)

    def test_with_subgroups(self):
        sfw = {
            "categories": {
                "scene": {
                    "options": [{"label": "a"}],
                    "subgroups": {
                        "indoor": {"label": "室内", "options": [{"label": "room"}]},
                        "outdoor": {"label": "室外", "options": [{"label": "park"}]},
                    }
                }
            }
        }
        nsfw = {"categories": {}}
        result = PromptEnhancer._collect_subgroups(sfw, nsfw, "scene")
        assert "indoor" in result
        assert "outdoor" in result

    def test_merge_sfw_nsfw_subgroups(self):
        sfw = {
            "categories": {
                "style": {
                    "options": [],
                    "subgroups": {"anime": {"label": "动漫", "options": []}}
                }
            }
        }
        nsfw = {
            "categories": {
                "style": {
                    "options": [],
                    "subgroups": {"realistic": {"label": "写实", "options": []}}
                }
            }
        }
        result = PromptEnhancer._collect_subgroups(sfw, nsfw, "style")
        assert "anime" in result
        assert "realistic" in result

    def test_empty_category(self):
        sfw = {"categories": {}}
        nsfw = {"categories": {}}
        result = PromptEnhancer._collect_subgroups(sfw, nsfw, "nonexistent")
        assert result == {}


class TestBuildCategoryFullOptions:
    """完整选项列表构建"""

    @patch.object(PromptEnhancer, '_load_prompt_library')
    def test_options_contain_no_selection(self, mock_load):
        mock_load.return_value = {"categories": {"scene": {"options": []}}}
        options = PromptEnhancer._build_category_full_options("scene")
        assert PromptEnhancer.NO_SELECTION in options

    @patch.object(PromptEnhancer, '_load_prompt_library')
    def test_options_contain_random_markers(self, mock_load):
        mock_load.return_value = {"categories": {"scene": {"options": []}}}
        options = PromptEnhancer._build_category_full_options("scene")
        assert PromptEnhancer.RANDOM_SELECTION in options
        assert PromptEnhancer.RANDOM_SFW in options
        assert PromptEnhancer.RANDOM_NSFW in options

    @patch.object(PromptEnhancer, '_load_prompt_library')
    def test_options_contain_library_items(self, mock_load):
        def load_lib(force, is_special=False):
            if is_special:
                return {"categories": {}}
            return {"categories": {"scene": {"options": [
                {"label": "city"}, {"label": "forest"}
            ]}}}
        mock_load.side_effect = load_lib

        options = PromptEnhancer._build_category_full_options("scene")
        assert "city" in options
        assert "forest" in options

    @patch.object(PromptEnhancer, '_load_prompt_library')
    def test_nsfw_dedup(self, mock_load):
        """NSFW 中与 SFW 重复的选项不应重复出现"""
        def load_lib(force, is_special=False):
            if is_special:
                return {"categories": {"scene": {"options": [{"label": "city"}]}}}
            return {"categories": {"scene": {"options": [{"label": "city"}, {"label": "forest"}]}}}
        mock_load.side_effect = load_lib

        options = PromptEnhancer._build_category_full_options("scene")
        assert options.count("city") == 1


class TestRandomSelection:
    """随机选择逻辑"""

    def test_is_changed_exists(self):
        assert hasattr(PromptEnhancer, 'IS_CHANGED')

    def test_random_markers_detected(self):
        random_values = [
            PromptEnhancer.RANDOM_SELECTION,
            PromptEnhancer.RANDOM_SFW,
            PromptEnhancer.RANDOM_NSFW,
        ]
        for val in random_values:
            assert "随机" in val or "🎲" in val


class TestLLMClientFactory:

    @patch('promptcraft.prompt_enhancer.LLMClient')
    @patch('promptcraft.prompt_enhancer.config_manager')
    def test_get_llm_client_basic(self, mock_cm, mock_llm_cls):
        mock_llm_cls.for_category.return_value = MagicMock()
        PromptEnhancer._get_llm_client("基础扩写")
        mock_llm_cls.for_category.assert_called_once()

    @patch('promptcraft.prompt_enhancer.LLMClient')
    @patch('promptcraft.prompt_enhancer.config_manager')
    def test_get_llm_client_detail(self, mock_cm, mock_llm_cls):
        mock_llm_cls.for_category.return_value = MagicMock()
        PromptEnhancer._get_llm_client("详细扩写")
        mock_llm_cls.for_category.assert_called_once()
