"""
PromptEnhancer 核心节点测试
覆盖: 选项构建 / 随机选择 / 子组收集 / 节点属性 / 迁移兼容 / 子函数单元测试
"""

from unittest.mock import MagicMock, patch

from promptcraft.legacy_migration import (
    LEGACY_KEY_MAP,
    LIBRARY_KEY_MAP,
    PRESET_KEY_MAP,
)
from promptcraft.prompt_enhancer import LLMInterruptException, PromptEnhancer


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


class TestInjectLoraPrompts:
    """_inject_lora_prompts 单元测试"""

    def test_empty_data(self):
        """空数据返回空列表"""
        pos, neg = PromptEnhancer._inject_lora_prompts({})
        assert pos == []
        assert neg == []

    def test_invalid_json(self):
        """无效 JSON 返回空列表"""
        pos, neg = PromptEnhancer._inject_lora_prompts({"lora_prompt_data": "not json"})
        assert pos == []
        assert neg == []

    def test_empty_json_object(self):
        """空 JSON 对象返回空列表"""
        pos, neg = PromptEnhancer._inject_lora_prompts({"lora_prompt_data": "{}"})
        assert pos == []
        assert neg == []

    def test_valid_lora_data(self):
        """有效 LoRA 数据提取正面/负面提示词"""
        import json
        data = {
            "lora_prompt_data": json.dumps({
                "style/cyber.safetensors": {
                    "groups": [
                        {"name": "默认", "prompts": ["neon lights", "cyberpunk city"], "negative": "daylight"},
                        {"name": "战斗", "prompts": ["energy blast"], "negative": ""},
                    ]
                }
            })
        }
        pos, neg = PromptEnhancer._inject_lora_prompts(data)
        assert "neon lights" in pos
        assert "cyberpunk city" in pos
        assert "energy blast" in pos
        assert "daylight" in neg

    def test_dedup_prompts(self):
        """重复提示词自动去重"""
        import json
        data = {
            "lora_prompt_data": json.dumps({
                "a.safetensors": {"groups": [{"name": "默认", "prompts": ["tag1"], "negative": ""}]},
                "b.safetensors": {"groups": [{"name": "默认", "prompts": ["tag1"], "negative": ""}]},
            })
        }
        pos, _ = PromptEnhancer._inject_lora_prompts(data)
        assert pos.count("tag1") == 1


class TestBuildPrompt:
    """_build_prompt 单元测试"""

    @patch('promptcraft.prompt_enhancer.config_manager')
    def test_empty_kwargs_returns_default(self, mock_cm):
        """空 kwargs 返回默认提示词"""
        mock_cm.load_sfw_library.return_value = {"categories": {}, "presets": {}}
        mock_cm.load_nsfw_library.return_value = {"categories": {}}
        node = PromptEnhancer()
        result = node._build_prompt({}, False, [])
        assert result == "masterpiece, best quality"

    @patch('promptcraft.prompt_enhancer.config_manager')
    def test_user_prompt_included(self, mock_cm):
        """用户提示词被包含在结果中"""
        mock_cm.load_sfw_library.return_value = {"categories": {}, "presets": {}}
        mock_cm.load_nsfw_library.return_value = {"categories": {}}
        node = PromptEnhancer()
        result = node._build_prompt({"user_prompt": "a beautiful sunset"}, False, [])
        assert "a beautiful sunset" in result

    @patch('promptcraft.prompt_enhancer.config_manager')
    def test_lora_elements_prepended(self, mock_cm):
        """LoRA 提示词放在最前面"""
        mock_cm.load_sfw_library.return_value = {"categories": {}, "presets": {}}
        mock_cm.load_nsfw_library.return_value = {"categories": {}}
        node = PromptEnhancer()
        result = node._build_prompt({"user_prompt": "test"}, False, ["lora_tag_1"])
        assert result.startswith("lora_tag_1")


class TestGenerateNegative:
    """_generate_negative 单元测试"""

    @patch('promptcraft.prompt_enhancer.config_manager')
    def test_default_negative(self, mock_cm):
        """默认负面提示词"""
        mock_cm.load_sfw_library.return_value = {"categories": {"negative_prompt": {"options": []}}}
        mock_cm.load_nsfw_library.return_value = {"categories": {}}
        node = PromptEnhancer()
        result = node._generate_negative("标准")
        assert "low quality" in result

    @patch('promptcraft.prompt_enhancer.config_manager')
    def test_lora_negatives_appended(self, mock_cm):
        """LoRA 负面提示词被追加"""
        mock_cm.load_sfw_library.return_value = {"categories": {"negative_prompt": {"options": []}}}
        mock_cm.load_nsfw_library.return_value = {"categories": {}}
        node = PromptEnhancer()
        result = node._generate_negative("标准", ["daylight", "nature"])
        assert "daylight" in result
        assert "nature" in result


class TestBuildInfo:
    """_build_info 单元测试"""

    def test_basic_info(self):
        """基本信息包含 positive 和 negative"""
        info = PromptEnhancer._build_info("test prompt", "neg prompt", False, False)
        assert "test prompt" in info
        assert "neg prompt" in info

    def test_llm_enhanced_flag(self):
        """LLM 增强标记显示"""
        info = PromptEnhancer._build_info("p", "n", True, False)
        assert "✅" in info

    def test_special_enabled_flag(self):
        """特殊内容标记显示"""
        info = PromptEnhancer._build_info("p", "n", False, True)
        assert "启用" in info


class TestLLMInterruptException:
    """LLMInterruptException 测试"""

    def test_exception_carries_prompt(self):
        """异常携带当前正面提示词"""
        exc = LLMInterruptException("test prompt")
        assert exc.positive_prompt == "test prompt"

    def test_is_exception(self):
        """是 Exception 子类"""
        assert issubclass(LLMInterruptException, Exception)


class TestApplyWeight:
    """_apply_weight 权重语法测试

    V1.4.0: 统一为 (tag:weight) 冒号语法，删除多层括号/中括号旧语法。
    """

    def test_weight_1_returns_bare_tag(self):
        """weight=1.0 返回裸标签"""
        assert PromptEnhancer()._apply_weight("tag", 1.0) == "tag"

    def test_weight_gt_1_wraps_in_parens(self):
        """weight>1.0 返回 (tag:weight) 格式"""
        result = PromptEnhancer()._apply_weight("tag", 1.5)
        assert result.startswith("(")
        assert result.endswith(")")
        assert "tag" in result
        assert "1.5" in result

    def test_weight_lt_1_wraps_in_parens_colon_syntax(self):
        """V1.4.0: 0<weight<1 返回 (tag:weight) 冒号语法，不再使用 [tag]"""
        result = PromptEnhancer()._apply_weight("tag", 0.5)
        assert result.startswith("(")
        assert result.endswith(")")
        assert "tag" in result
        assert "0.5" in result or "0.50" in result

    def test_weight_clamped_to_valid_range(self):
        """V1.4.0: 权重钳制到 [0.1, 10.0] 避免极端值"""
        # 0 < weight < 0.1 → 钳制到 0.1
        r_min = PromptEnhancer()._apply_weight("tag", 0.05)
        assert "0.10" in r_min or "0.1" in r_min
        # weight > 10 → 钳制到 10.0
        r_max = PromptEnhancer()._apply_weight("tag", 15.0)
        assert "10.00" in r_max or "10.0" in r_max

    def test_weight_zero_returns_empty(self):
        """weight=0.0 返回空字符串"""
        assert PromptEnhancer()._apply_weight("tag", 0.0) == ""

    def test_weight_negative_returns_empty(self):
        """weight 为负数返回空字符串"""
        assert PromptEnhancer()._apply_weight("tag", -0.5) == ""
        assert PromptEnhancer()._apply_weight("tag", -1.0) == ""


class TestRandomPick:
    """_random_pick 随机抽取测试"""

    def test_empty_libraries_returns_empty(self):
        """空库列表返回空字符串"""
        result = PromptEnhancer._random_pick("scene_type", [])
        assert result == ""

    def test_single_item_returns_it(self):
        """单个选项时返回该选项的 en 值"""
        lib = {"categories": {"scene_type": {"options": [{"label": "city", "en": "city street"}]}}}
        result = PromptEnhancer._random_pick("scene_type", [lib])
        assert result == "city street"

    def test_returns_from_list(self):
        """多选项时返回其中之一"""
        lib = {"categories": {"scene_type": {"options": [
            {"label": "city", "en": "city street"},
            {"label": "forest", "en": "forest"},
        ]}}}
        result = PromptEnhancer._random_pick("scene_type", [lib])
        assert result in ("city street", "forest")

    def test_merges_multiple_libraries(self):
        """合并多个库的选项"""
        lib1 = {"categories": {"scene_type": {"options": [{"label": "city", "en": "city street"}]}}}
        lib2 = {"categories": {"scene_type": {"options": [{"label": "forest", "en": "forest"}]}}}
        results = {PromptEnhancer._random_pick("scene_type", [lib1, lib2]) for _ in range(20)}
        assert "city street" in results
        assert "forest" in results

    def test_subgroup_pick(self):
        """子组随机抽取"""
        lib = {"categories": {"scene_type": {"subgroups": {
            "indoor": {"options": [{"label": "room", "en": "room"}]},
        }}}}
        result = PromptEnhancer._random_pick("scene_type", [lib], subgroup_key="indoor")
        assert result == "room"

    def test_empty_category_returns_empty(self):
        """不存在的分类返回空字符串"""
        lib = {"categories": {"scene_type": {"options": []}}}
        assert PromptEnhancer._random_pick("nonexistent", [lib]) == ""


class TestMergeLibs:
    """_merge_libs 库合并测试"""

    def test_merge_basic(self):
        """合并 SFW + NSFW 基本选项"""
        sfw = {"categories": {"scene": {"options": [{"label": "city", "en": "city street"}]}}}
        nsfw = {"categories": {"scene": {"options": [{"label": "bedroom", "en": "bedroom"}]}}}
        merged = PromptEnhancer._merge_libs(sfw, nsfw)
        labels = [o["label"] for o in merged["categories"]["scene"]["options"]]
        assert "city" in labels
        assert "bedroom" in labels

    def test_nsfw_only_adds_new_categories(self):
        """NSFW 独有分类被添加"""
        sfw = {"categories": {"scene": {"options": []}}}
        nsfw = {"categories": {"extra_cat": {"options": [{"label": "x", "en": "x"}]}}}
        merged = PromptEnhancer._merge_libs(sfw, nsfw)
        assert "scene" in merged["categories"]
        assert "extra_cat" in merged["categories"]

    def test_dedup_same_label(self):
        """相同 label 不重复"""
        sfw = {"categories": {"scene": {"options": [{"label": "city", "en": "city street"}]}}}
        nsfw = {"categories": {"scene": {"options": [{"label": "city", "en": "city street"}]}}}
        merged = PromptEnhancer._merge_libs(sfw, nsfw)
        count = sum(1 for o in merged["categories"]["scene"]["options"] if o["label"] == "city")
        assert count == 1

    def test_merge_subgroups(self):
        """合并子组"""
        sfw = {"categories": {"scene": {"subgroups": {"indoor": {"options": [{"label": "room", "en": "room"}]}}}}}
        nsfw = {"categories": {"scene": {"subgroups": {"outdoor": {"options": [{"label": "park", "en": "park"}]}}}}}
        merged = PromptEnhancer._merge_libs(sfw, nsfw)
        assert "indoor" in merged["categories"]["scene"]["subgroups"]
        assert "outdoor" in merged["categories"]["scene"]["subgroups"]

    def test_nsfw_empty_categories(self):
        """NSFW 无 categories 时返回 SFW 原样"""
        sfw = {"categories": {"scene": {"options": []}}}
        nsfw = {"categories": {}}
        merged = PromptEnhancer._merge_libs(sfw, nsfw)
        assert "scene" in merged["categories"]


class TestInputTypes:
    """INPUT_TYPES() 字段完整性测试"""

    @patch.object(PromptEnhancer, '_build_trigger_word_options', return_value=["skip"])
    @patch.object(PromptEnhancer, '_build_category_full_options', return_value=["skip", "random_all"])
    @patch.object(PromptEnhancer, '_build_preset_options', return_value=["skip"])
    @patch('promptcraft.prompt_enhancer.config_manager')
    def test_has_required_fields(self, mock_cm, mock_preset, mock_cat, mock_tw):
        """INPUT_TYPES 包含所有必需字段"""
        mock_cm.load_llm_hint.return_value = ""
        result = PromptEnhancer.INPUT_TYPES()
        assert "required" in result
        req = result["required"]
        for key in ["user_prompt", "scene_type", "action_pose", "clothing_detail", "expression",
                     "weight_scene", "weight_action", "weight_clothing", "weight_expression",
                     "camera_angle", "shot_type", "special_effect", "lens_filter",
                     "lighting", "visual_style", "quality_level", "time_setting",
                     "mood_expression", "preset", "llm_enabled", "expand_mode",
                     "nsfw_content", "negative_type", "llm_instruction", "subject_count"]:
            assert key in req, f"Missing required field: {key}"

    @patch.object(PromptEnhancer, '_build_trigger_word_options', return_value=["skip"])
    @patch.object(PromptEnhancer, '_build_category_full_options', return_value=["skip"])
    @patch.object(PromptEnhancer, '_build_preset_options', return_value=["skip"])
    @patch('promptcraft.prompt_enhancer.config_manager')
    def test_optional_lora_field(self, mock_cm, mock_preset, mock_cat, mock_tw):
        """INPUT_TYPES 包含可选 lora_prompt_data 字段"""
        mock_cm.load_llm_hint.return_value = ""
        result = PromptEnhancer.INPUT_TYPES()
        assert "optional" in result
        assert "lora_prompt_data" in result["optional"]

    @patch.object(PromptEnhancer, '_build_trigger_word_options', return_value=["skip"])
    @patch.object(PromptEnhancer, '_build_category_full_options', return_value=["skip"])
    @patch.object(PromptEnhancer, '_build_preset_options', return_value=["skip"])
    @patch('promptcraft.prompt_enhancer.config_manager')
    def test_weight_fields_are_float(self, mock_cm, mock_preset, mock_cat, mock_tw):
        """权重字段类型为 FLOAT"""
        mock_cm.load_llm_hint.return_value = ""
        result = PromptEnhancer.INPUT_TYPES()
        for key in ["weight_scene", "weight_action", "weight_clothing", "weight_expression"]:
            assert result["required"][key][0] == "FLOAT"
