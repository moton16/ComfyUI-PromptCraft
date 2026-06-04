"""
PromptEnhancer 核心节点测试
覆盖: 选项构建 / 随机选择 / 子组收集 / 节点属性 / 迁移兼容
"""

import pytest
from unittest.mock import patch, MagicMock
from promptcraft.prompt_enhancer import (
    PromptEnhancer,
    LEGACY_KEY_MAP,
    LEGACY_RANDOM_MAP,
    LEGACY_EXPAND_MAP,
    LIBRARY_KEY_MAP,
    PRESET_KEY_MAP,
)


class TestNodeProperties:
    """节点元数据测试"""

    def test_no_selection_constant(self):
        assert PromptEnhancer.NO_SELECTION == "skip"

    def test_random_selection_constant(self):
        assert PromptEnhancer.RANDOM_SELECTION == "random_all"

    def test_random_sfw_constant(self):
        assert PromptEnhancer.RANDOM_SFW == "random_sfw"

    def test_random_nsfw_constant(self):
        assert PromptEnhancer.RANDOM_NSFW == "random_nsfw"

    def test_subgroup_prefix(self):
        assert PromptEnhancer.RANDOM_SUBGROUP_PREFIX == "random_group_"

    def test_has_category_constants(self):
        assert hasattr(PromptEnhancer, 'NO_SELECTION')
        assert hasattr(PromptEnhancer, 'RANDOM_SELECTION')
        assert hasattr(PromptEnhancer, 'RANDOM_SFW')
        assert hasattr(PromptEnhancer, 'RANDOM_NSFW')


class TestLegacyMigration:
    """旧版中文 key 迁移测试"""

    def test_legacy_key_map_values_unique(self):
        """LEGACY_KEY_MAP 的所有 value 必须唯一"""
        values = list(LEGACY_KEY_MAP.values())
        assert len(values) == len(set(values)), "LEGACY_KEY_MAP has duplicate values"

    def test_prepare_kwargs_migrates_chinese_keys(self):
        """迁移中文 key 到英文"""
        old_kwargs = {
            "用户Prompt": "test prompt",
            "场景类型": "random_all",
            "特殊内容": True,
        }
        result = PromptEnhancer._prepare_kwargs(old_kwargs)
        assert result["user_prompt"] == "test prompt"
        assert result["scene_type"] == "random_all"
        assert result["nsfw_content"] is True

    def test_prepare_kwargs_idempotent(self):
        """英文 key 穿透不变"""
        new_kwargs = {
            "user_prompt": "test prompt",
            "scene_type": "random_all",
            "nsfw_content": True,
        }
        result = PromptEnhancer._prepare_kwargs(new_kwargs)
        assert result["user_prompt"] == "test prompt"
        assert result["scene_type"] == "random_all"
        assert result["nsfw_content"] is True

    def test_prepare_kwargs_migrates_random_markers(self):
        """迁移中文随机标记到英文"""
        old_kwargs = {"scene_type": "🎲 随机选择"}
        result = PromptEnhancer._prepare_kwargs(old_kwargs)
        assert result["scene_type"] == "random_all"

    def test_prepare_kwargs_migrates_expand_mode(self):
        """迁移中文扩写模式到英文"""
        old_kwargs = {"expand_mode": "基础扩写"}
        result = PromptEnhancer._prepare_kwargs(old_kwargs)
        assert result["expand_mode"] == "basic"

    def test_prepare_kwargs_migrates_skip_marker(self):
        """迁移 —— 到 skip"""
        old_kwargs = {"scene_type": "——"}
        result = PromptEnhancer._prepare_kwargs(old_kwargs)
        assert result["scene_type"] == "skip"

    def test_prepare_kwargs_migrates_custom_marker(self):
        """迁移 自定义 到 custom"""
        old_kwargs = {"negative_type": "自定义"}
        result = PromptEnhancer._prepare_kwargs(old_kwargs)
        assert result["negative_type"] == "custom"

    def test_prepare_kwargs_migrates_subgroup_prefix(self):
        """迁移子组随机标记前缀"""
        old_kwargs = {"scene_type": "🎲 随机·indoor"}
        result = PromptEnhancer._prepare_kwargs(old_kwargs)
        assert result["scene_type"] == "random_group_indoor"

    def test_prepare_kwargs_preserves_unknown_keys(self):
        """未知 key 保持不变"""
        old_kwargs = {"future_key": "value", "scene_type": "random_all"}
        result = PromptEnhancer._prepare_kwargs(old_kwargs)
        assert result["future_key"] == "value"

    def test_prepare_kwargs_handles_non_string_values(self):
        """非字符串值不触发值迁移"""
        old_kwargs = {"llm_enabled": True, "weight_scene": 1.5}
        result = PromptEnhancer._prepare_kwargs(old_kwargs)
        assert result["llm_enabled"] is True
        assert result["weight_scene"] == 1.5


class TestLibraryKeyMap:
    """Library JSON key 映射测试"""

    def test_library_key_map_values_unique(self):
        """LIBRARY_KEY_MAP 的所有 value 必须唯一"""
        values = list(LIBRARY_KEY_MAP.values())
        assert len(values) == len(set(values)), "LIBRARY_KEY_MAP has duplicate values"

    def test_preset_key_map_values_unique(self):
        """PRESET_KEY_MAP 的所有 value 必须唯一"""
        values = list(PRESET_KEY_MAP.values())
        assert len(values) == len(set(values)), "PRESET_KEY_MAP has duplicate values"


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

    def test_random_markers_are_protocol_values(self):
        """随机标记是英文协议值"""
        assert PromptEnhancer.RANDOM_SELECTION == "random_all"
        assert PromptEnhancer.RANDOM_SFW == "random_sfw"
        assert PromptEnhancer.RANDOM_NSFW == "random_nsfw"
        assert PromptEnhancer.RANDOM_SUBGROUP_PREFIX == "random_group_"


class TestLLMClientFactory:

    @patch('promptcraft.prompt_enhancer.LLMClient')
    @patch('promptcraft.prompt_enhancer.config_manager')
    def test_get_llm_client_basic(self, mock_cm, mock_llm_cls):
        mock_llm_cls.for_category.return_value = MagicMock()
        PromptEnhancer._get_llm_client("basic")
        mock_llm_cls.for_category.assert_called_once()

    @patch('promptcraft.prompt_enhancer.LLMClient')
    @patch('promptcraft.prompt_enhancer.config_manager')
    def test_get_llm_client_detail(self, mock_cm, mock_llm_cls):
        mock_llm_cls.for_category.return_value = MagicMock()
        PromptEnhancer._get_llm_client("detailed")
        mock_llm_cls.for_category.assert_called_once()


class TestGenerateIntegration:
    """generate() 集成测试"""

    @patch('promptcraft.prompt_enhancer.config_manager')
    @patch('promptcraft.prompt_enhancer.LLMClient')
    @patch('promptcraft.prompt_enhancer.PromptServer')
    def test_generate_with_english_keys(self, mock_server, mock_llm_cls, mock_cm):
        """英文 key 能正常生成"""
        mock_cm.load_sfw_library.return_value = {
            "categories": {
                "scene_type": {"options": [{"label": "city", "en": "city street"}]},
                "action_pose": {"options": [{"label": "standing", "en": "standing"}]},
                "clothing_detail": {"options": []},
                "expression": {"options": []},
                "quality_level": {"options": [{"label": "标准", "en": "detailed, high quality"}]},
                "negative_prompt": {"options": [{"label": "标准", "en": "low quality, worst quality"}]},
            },
            "presets": {},
            "trigger_words": {},
        }
        mock_cm.load_nsfw_library.return_value = {"categories": {}}
        mock_cm.load_llm_hint.return_value = ""
        mock_llm_instance = MagicMock()
        mock_llm_instance.is_enabled.return_value = False
        mock_llm_cls.for_category.return_value = mock_llm_instance

        node = PromptEnhancer()
        result = node.generate(
            user_prompt="test",
            scene_type="random_sfw",
            action_pose="skip",
            clothing_detail="skip",
            expression="skip",
            weight_scene=1.0,
            weight_action=1.0,
            weight_clothing=1.0,
            weight_expression=1.0,
            camera_angle="skip",
            shot_type="skip",
            special_effect="skip",
            lens_filter="skip",
            lighting="skip",
            visual_style="skip",
            quality_level="标准",
            time_setting="skip",
            mood_expression="skip",
            preset="skip",
            llm_enabled=False,
            expand_mode="basic",
            nsfw_content=False,
            negative_type="标准",
            llm_instruction="",
        )
        assert len(result) == 3
        positive, negative, info = result
        assert isinstance(positive, str)
        assert isinstance(negative, str)
        assert len(positive) > 0

    @patch('promptcraft.prompt_enhancer.config_manager')
    @patch('promptcraft.prompt_enhancer.LLMClient')
    @patch('promptcraft.prompt_enhancer.PromptServer')
    def test_generate_with_legacy_chinese_keys(self, mock_server, mock_llm_cls, mock_cm):
        """旧版中文 key 通过迁移也能正常生成"""
        mock_cm.load_sfw_library.return_value = {
            "categories": {
                "scene_type": {"options": [{"label": "city", "en": "city street"}]},
                "action_pose": {"options": [{"label": "standing", "en": "standing"}]},
                "clothing_detail": {"options": []},
                "expression": {"options": []},
                "quality_level": {"options": [{"label": "标准", "en": "detailed, high quality"}]},
                "negative_prompt": {"options": [{"label": "标准", "en": "low quality, worst quality"}]},
            },
            "presets": {},
            "trigger_words": {},
        }
        mock_cm.load_nsfw_library.return_value = {"categories": {}}
        mock_cm.load_llm_hint.return_value = ""
        mock_llm_instance = MagicMock()
        mock_llm_instance.is_enabled.return_value = False
        mock_llm_cls.for_category.return_value = mock_llm_instance

        node = PromptEnhancer()
        # 使用旧版中文 key
        result = node.generate(
            **{
                "用户Prompt": "test",
                "场景类型": "🎲 仅在SFW库随机",
                "动作姿态": "——",
                "服饰细节": "——",
                "表情状态": "——",
                "权重_场景": 1.0,
                "权重_动作": 1.0,
                "权重_服饰细节": 1.0,
                "权重_状态": 1.0,
                "机位角度": "——",
                "镜头类型": "——",
                "特效镜头": "——",
                "镜头滤镜": "——",
                "光线类型": "——",
                "视觉风格": "——",
                "质量等级": "标准",
                "时间设定": "——",
                "情绪表达(忌与表情状态同时随机)": "——",
                "预设配置": "——",
                "语言大模型接入": False,
                "扩写模式": "基础扩写",
                "特殊内容": False,
                "负面提示词类型": "标准",
                "大模型提示词": "",
            }
        )
        assert len(result) == 3
        positive, negative, info = result
        assert isinstance(positive, str)
        assert len(positive) > 0
