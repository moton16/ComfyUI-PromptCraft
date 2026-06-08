"""
Legacy Migration Maps — 旧版中文 key 迁移映射表
V1.4.0 中文变量名 → 英文标识符改造时遗留的兼容映射。
用于将旧 workflow 中保存的中文 key 和中文协议值迁移到英文。

从 prompt_enhancer.py 独立出来，降低核心模块的认知复杂度。
"""

# ==================== INPUT_TYPES key 迁移 ====================
# 旧 workflow 中保存的中文参数名 → 英文参数名
LEGACY_KEY_MAP = {
    "用户Prompt": "user_prompt",
    "主体人数": "subject_count",
    "场景类型": "scene_type",
    "动作姿态": "action_pose",
    "服饰细节": "clothing_detail",
    "表情状态": "expression",
    "权重_场景": "weight_scene",
    "权重_动作": "weight_action",
    "权重_服饰细节": "weight_clothing",
    "权重_状态": "weight_expression",
    "机位角度": "camera_angle",
    "镜头类型": "shot_type",
    "特效镜头": "special_effect",
    "镜头滤镜": "lens_filter",
    "光线类型": "lighting",
    "视觉风格": "visual_style",
    "质量等级": "quality_level",
    "时间设定": "time_setting",
    "情绪表达(忌与表情状态同时随机)": "mood_expression",
    "预设配置": "preset",
    "语言大模型接入": "llm_enabled",
    "扩写模式": "expand_mode",
    "特殊内容": "nsfw_content",
    "负面提示词类型": "negative_type",
    "大模型提示词": "llm_instruction",
}

# ==================== 随机标记值迁移 ====================
# 旧版中文随机标记 → 英文协议值
LEGACY_RANDOM_MAP = {
    "🎲 随机选择": "random_all",
    "🎲 仅在普通内容库随机": "random_sfw",
    "🎲 仅在SFW库随机": "random_sfw",
    "🎲 仅在特殊内容库随机": "random_nsfw",
    "——": "skip",
    "自定义": "custom",
}

# ==================== 扩写模式值迁移 ====================
LEGACY_EXPAND_MAP = {
    "基础扩写": "basic",
    "详细扩写": "detailed",
    "普通扩写": "standard",
}

# ==================== 子组随机标记前缀迁移 ====================
LEGACY_SUBGROUP_PREFIX_MAP = {
    "🎲 随机·": "random_group_",
}

# ==================== Library JSON category key 迁移 ====================
# 仅用于测试验证唯一性，运行时由 config_manager 直接使用英文 key
LIBRARY_KEY_MAP = {
    "场景类型": "scene_type",
    "动作姿态": "action_pose",
    "服饰细节": "clothing_detail",
    "表情状态": "expression",
    "机位角度": "camera_angle",
    "镜头类型": "shot_type",
    "特效镜头": "special_effect",
    "镜头滤镜": "lens_filter",
    "光线类型": "lighting",
    "视觉风格": "visual_style",
    "质量等级": "quality_level",
    "负面提示词": "negative_prompt",
    "时间设定": "time_setting",
    "情绪表达": "mood_expression",
}

# ==================== Preset 内部 key 迁移 ====================
# 仅用于测试验证唯一性，运行时由 config_manager 直接使用英文 key
PRESET_KEY_MAP = {
    "场景类型": "scene_type",
    "动作姿态": "action_pose",
    "服饰细节": "clothing_detail",
    "表情状态": "expression",
}
