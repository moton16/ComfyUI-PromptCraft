"""
Prompt Enhancer Node - ComfyUI 提示词增强器核心节点
基于内置Prompt库随机选择 + 可选LLM细节补充
使用 config_manager 统一管理 SFW/特殊内容 库和 LLM 配置
V1.1.0 — 支持每分类独立随机范围选择（+IS_CHANGED 随机修复）
V1.4.0 — 中文变量名 → 英文标识符改造，支持 nodeDefs.json 双语翻译
"""

import json
import random
from .config_manager import config_manager
from .llm_client import LLMClient
from .legacy_migration import (
    LEGACY_KEY_MAP, LEGACY_RANDOM_MAP, LEGACY_EXPAND_MAP,
    LEGACY_SUBGROUP_PREFIX_MAP,
)
from server import PromptServer


class LLMInterruptException(Exception):
    """用户中断 LLM 调用时抛出，由 generate() 捕获并返回部分结果"""
    def __init__(self, positive_prompt):
        self.positive_prompt = positive_prompt


class PromptEnhancer:
    """提示词增强器节点"""

    # ==================== 类变量（协议标识符，英文） ====================

    # 不选择的默认值
    NO_SELECTION = "skip"
    # 随机选择标记（跟随全局特殊内容开关）
    RANDOM_SELECTION = "random_all"
    # 仅在 SFW 库随机
    RANDOM_SFW = "random_sfw"
    # 仅在 NSFW 库随机
    RANDOM_NSFW = "random_nsfw"
    # 子组随机标记前缀
    RANDOM_SUBGROUP_PREFIX = "random_group_"

    # ==================== 迁移方法 ====================

    @staticmethod
    def _prepare_kwargs(kwargs):
        """迁移旧版中文 key 数据到英文 key。幂等：英文 key 直接穿透。"""
        migrated = {}
        for k, v in kwargs.items():
            new_key = LEGACY_KEY_MAP.get(k, k)
            # 迁移随机标记值和扩写模式值
            if isinstance(v, str):
                v = LEGACY_RANDOM_MAP.get(v, v)
                v = LEGACY_EXPAND_MAP.get(v, v)
                # 迁移子组随机标记前缀
                for old_prefix, new_prefix in LEGACY_SUBGROUP_PREFIX_MAP.items():
                    if v.startswith(old_prefix):
                        v = new_prefix + v[len(old_prefix):]
                        break
            migrated[new_key] = v
        return migrated

    # ==================== 库加载 ====================

    @classmethod
    def _load_prompt_library(cls, force_reload=False, is_special=False):
        """加载 SFW 或特殊内容 prompt 库（通过 config_manager）"""
        if is_special:
            return config_manager.load_nsfw_library(force_reload)
        return config_manager.load_sfw_library(force_reload)

    @classmethod
    def _get_llm_client(cls, mode="basic"):
        """获取LLM客户端（按扩写模式选择对应的服务类别）"""
        category_map = {
            "basic": "enhance_basic",
            "detailed": "enhance_detail",
            "standard": "enhance_normal",
        }
        category = category_map.get(mode, "enhance_basic")
        return LLMClient.for_category(config_manager, category)

    # ==================== 选项构建 ====================

    @classmethod
    def _build_category_full_options(cls, category_key):
        """
        为某个类别构建完整选项列表（SFW + NSFW 全量 + 随机标记）
        用于 INPUT_TYPES 下拉列表（始终包含所有条目，JS 端负责过滤显示）
        支持 subgroups（子组）：为每个子组注入 "random_group_<子组名>" 标记

        模板同步在启动时由 config_manager._init_config_files() 完成。
        此处不再重复同步，以免覆盖用户在运行时通过库编辑器添加的自定义内容（如 subgroups 子组）。
        """

        sfw = cls._load_prompt_library(False, False)
        nsfw = cls._load_prompt_library(False, True)

        # 收集子组信息（合并 SFW + NSFW 的子组）
        subgroups = cls._collect_subgroups(sfw, nsfw, category_key)

        sfw_options = []
        sfw_cat = sfw.get("categories", {}).get(category_key, {})
        for opt in sfw_cat.get("options", []):
            sfw_options.append(opt.get("label", ""))

        nsfw_options = []
        nsfw_cat = nsfw.get("categories", {}).get(category_key, {})
        for opt in nsfw_cat.get("options", []):
            lbl = opt.get("label", "")
            if lbl and lbl not in sfw_options:
                nsfw_options.append(lbl)

        # 展开 subgroups 中的选项（含 NSFW 子组），使用户可单独选择子组内具体项
        subgroup_options = []
        for sg_key, sg_data in subgroups.items():
            for opt in sg_data.get("options", []):
                lbl = opt.get("label", "")
                if lbl and lbl not in sfw_options and lbl not in nsfw_options and lbl not in subgroup_options:
                    subgroup_options.append(lbl)

        result = [cls.NO_SELECTION,
                   cls.RANDOM_SELECTION,
                   cls.RANDOM_SFW,
                   cls.RANDOM_NSFW]

        # 注入子组随机标记（如果有子组）
        for sg_key in subgroups.keys():
            result.append(f"{cls.RANDOM_SUBGROUP_PREFIX}{sg_key}")

        result.extend(sfw_options)
        result.extend(nsfw_options)
        result.extend(subgroup_options)
        return result

    @classmethod
    def _collect_subgroups(cls, sfw, nsfw, category_key):
        """收集某个 category 在 SFW + NSFW 库中的所有子组（合并去重）"""
        subgroups = {}
        sfw_cat = sfw.get("categories", {}).get(category_key, {})
        nsfw_cat = nsfw.get("categories", {}).get(category_key, {})

        for cat in (sfw_cat, nsfw_cat):
            for sg_key, sg_data in cat.get("subgroups", {}).items():
                if sg_key not in subgroups:
                    subgroups[sg_key] = {
                        "label": sg_data.get("label", sg_key),
                        "options": []
                    }
                # 合并 options（避免重复）
                existing_labels = {o["label"] for o in subgroups[sg_key]["options"]}
                for opt in sg_data.get("options", []):
                    if opt["label"] not in existing_labels:
                        subgroups[sg_key]["options"].append(opt)
                        existing_labels.add(opt["label"])

        return subgroups

    @classmethod
    def _build_preset_options(cls):
        """构建预设配置选项列表"""
        library = cls._load_prompt_library()
        presets = library.get("presets", {})
        result = [cls.NO_SELECTION]
        result.extend(list(presets.keys()))
        return result

    @classmethod
    def _build_trigger_word_options(cls, group_key):
        """构建触发词选项"""
        library = cls._load_prompt_library()
        trigger_words = library.get("trigger_words", {}).get(group_key, [])
        result = [cls.NO_SELECTION]
        for tw in trigger_words:
            result.append(tw.get("label", ""))
        return result

    # ==================== ComfyUI 节点接口 ====================

    @classmethod
    def INPUT_TYPES(cls):
        """定义节点输入类型 — 下拉选项始终包含全量（SFW+NSFW），JS 端动态过滤"""
        return {
            "required": {
                # === 用户基础输入 ===
                "user_prompt": ("STRING", {
                    "multiline": True,
                    "default": "",
                     "placeholder": "输入你的基础Prompt（将拼接在库标签之前）..."
                }),

                # === 主体设定 ===
                "subject_count": (cls._build_trigger_word_options("核心标签"), {"default": cls.NO_SELECTION}),

                # === 核心内容 ===
                "scene_type": (cls._build_category_full_options("scene_type"), {"default": cls.RANDOM_SELECTION}),
                "action_pose": (cls._build_category_full_options("action_pose"), {"default": cls.RANDOM_SELECTION}),
                "clothing_detail": (cls._build_category_full_options("clothing_detail"), {"default": cls.RANDOM_SELECTION}),
                "expression": (cls._build_category_full_options("expression"), {"default": cls.RANDOM_SELECTION}),

                # === 权重控制 ===
                "weight_scene": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 2.0, "step": 0.1, "display": "number"}),
                "weight_action": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 2.0, "step": 0.1, "display": "number"}),
                "weight_clothing": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 2.0, "step": 0.1, "display": "number"}),
                "weight_expression": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 2.0, "step": 0.1, "display": "number"}),

                # === 拍摄与镜头 ===
                "camera_angle": (cls._build_category_full_options("camera_angle"), {"default": cls.NO_SELECTION}),
                "shot_type": (cls._build_category_full_options("shot_type"), {"default": cls.NO_SELECTION}),
                "special_effect": (cls._build_category_full_options("special_effect"), {"default": cls.NO_SELECTION}),
                "lens_filter": (cls._build_category_full_options("lens_filter"), {"default": cls.NO_SELECTION}),

                # === 光影与色彩 ===
                "lighting": (cls._build_category_full_options("lighting"), {"default": cls.NO_SELECTION}),

                # === 风格与质量 ===
                "visual_style": (cls._build_category_full_options("visual_style"), {"default": cls.NO_SELECTION}),
                "quality_level": (cls._build_category_full_options("quality_level"), {"default": "标准"}),
                "time_setting": (cls._build_category_full_options("time_setting"), {"default": cls.NO_SELECTION}),
                "mood_expression": (cls._build_category_full_options("mood_expression"), {"default": cls.NO_SELECTION}),

                # === 预设与开关 ===
                "preset": (cls._build_preset_options(), {"default": cls.NO_SELECTION}),

                # === 语言大模型接入 ===
                "llm_enabled": ("BOOLEAN", {"default": False}),
                "expand_mode": (["basic", "detailed", "standard"], {"default": "basic"}),

                # === 特殊内容开关 ===
                "nsfw_content": ("BOOLEAN", {"default": False,
                                          "tooltip": "开启后下拉菜单显示NSFW条目；各分类可独立选择随机范围（SFW/NSFW/全量）"}),

                # === 负面提示词 ===
                "negative_type": (cls._build_category_full_options("negative_prompt"), {"default": "标准"}),

                # === 大模型提示词 ===
                "llm_instruction": ("STRING", {
                    "multiline": True,
                    "default": config_manager.load_llm_hint(),
                    "placeholder": "输入对LLM大模型的特殊要求（仅在启用语言大模型时生效）..."
                }),
            },
            "optional": {
                "lora_prompt_data": ("STRING", {"forceInput": True}),
            },
        }

    RETURN_TYPES = ("STRING", "STRING", "STRING")
    RETURN_NAMES = ("positive_prompt", "negative_prompt", "full_info")
    FUNCTION = "generate"
    CATEGORY = "Moton PromptCraft"
    OUTPUT_NODE = True

    # ==================== 生成逻辑 ====================

    def __init__(self):
        pass

    @classmethod
    def IS_CHANGED(cls, **kwargs):
        """ComfyUI 缓存控制：任何随机标记都强制重执行，确保每张图 prompt 不同"""
        kwargs = cls._prepare_kwargs(kwargs)
        BASE_MARKERS = (cls.RANDOM_SELECTION, cls.RANDOM_SFW, cls.RANDOM_NSFW)
        category_keys = [
            "scene_type", "action_pose", "clothing_detail", "expression",
            "camera_angle", "shot_type",
            "special_effect", "lens_filter", "lighting",
            "visual_style", "time_setting", "mood_expression"
        ]

        def _is_random_marker(val):
            if not isinstance(val, str):
                return False
            if val in BASE_MARKERS:
                return True
            if val.startswith(cls.RANDOM_SUBGROUP_PREFIX):
                return True
            return False

        has_random = any(_is_random_marker(kwargs.get(k)) for k in category_keys)
        if has_random:
            return random.random()
        return hash(str(sorted(kwargs.items())))

    def generate(self, **kwargs):
        """
        主生成函数（调度器）
        每分类独立解析 4 种随机模式：
          skip              → 跳过
          random_all        → 跟随全局特殊内容开关决定库
          random_sfw        → 强制SFW库
          random_nsfw       → 强制NSFW库（需特殊内容开启才生效）
          特定标签          → 从对应库查找映射
        """
        kwargs = self._prepare_kwargs(kwargs)
        special_enabled = kwargs.get("nsfw_content", False)

        lora_pos, lora_neg = self._inject_lora_prompts(kwargs)
        positive_prompt = self._build_prompt(kwargs, special_enabled, lora_pos)

        try:
            positive_prompt, llm_enhanced = self._enhance_with_llm(
                positive_prompt, kwargs, lora_pos
            )
        except LLMInterruptException as e:
            return (e.positive_prompt, "", "LLM调用被用户中断")

        negative_prompt = self._generate_negative(
            kwargs.get("negative_type", "标准"), lora_neg
        )

        full_info = self._build_info(positive_prompt, negative_prompt, llm_enhanced, special_enabled)
        self._save_history(positive_prompt, negative_prompt, llm_enhanced, special_enabled)

        return (positive_prompt, negative_prompt, full_info)

    # ==================== generate() 子函数 ====================

    @staticmethod
    def _inject_lora_prompts(kwargs):
        """从 lora_prompt_data JSON 中提取 LoRA 正面/负面提示词。"""
        lora_prompt_elements = []
        lora_negative_elements = []
        lora_prompt_raw = kwargs.get("lora_prompt_data", "")
        if lora_prompt_raw and lora_prompt_raw.strip() and lora_prompt_raw != "{}":
            try:
                lora_data = json.loads(lora_prompt_raw)
                for lora_info in lora_data.values():
                    for group in lora_info.get("groups", []):
                        for p in group.get("prompts", []):
                            if p and p not in lora_prompt_elements:
                                lora_prompt_elements.append(p)
                        neg = group.get("negative", "")
                        if neg and neg not in lora_negative_elements:
                            lora_negative_elements.append(neg)
                if lora_prompt_elements:
                    print(f"[PromptCraft] LoRA Prompt 注入: {len(lora_prompt_elements)} 条提示词")
            except (json.JSONDecodeError, TypeError, AttributeError):
                pass
        return lora_prompt_elements, lora_negative_elements

    def _build_prompt(self, kwargs, special_enabled, lora_prompt_elements):
        """构建正面提示词：预设 → 主体 → 用户输入 → 各分类标签。"""
        prompt_elements = []
        prompt_elements.extend(lora_prompt_elements)

        # 预设配置覆盖
        preset_name = kwargs.get("preset", self.NO_SELECTION)
        if preset_name and preset_name != self.NO_SELECTION:
            sfw = self._load_prompt_library()
            preset_data = sfw.get("presets", {}).get(preset_name, {})
            if preset_data:
                for key in ["scene_type", "action_pose", "clothing_detail", "expression"]:
                    if key in preset_data:
                        kwargs[key] = preset_data[key]

        # 主体标签
        subject_count = kwargs.get("subject_count", self.NO_SELECTION)
        if subject_count and subject_count != self.NO_SELECTION:
            mapped = self._get_mapped_value_sfw("trigger_words", "核心标签", subject_count)
            if mapped:
                prompt_elements.append(mapped)

        # 用户 Prompt
        user_prompt = kwargs.get("user_prompt", "").strip()
        if user_prompt:
            prompt_elements.append(user_prompt)

        # 核心内容分类（带权重）
        for cat_key, weight_key in [
            ("scene_type", "weight_scene"), ("action_pose", "weight_action"),
            ("clothing_detail", "weight_clothing"), ("expression", "weight_expression"),
        ]:
            en_tag = self._resolve_category_selection(cat_key, kwargs.get(cat_key, self.NO_SELECTION), special_enabled)
            if en_tag:
                prompt_elements.append(self._apply_weight(en_tag, kwargs.get(weight_key, 1.0)))

        # 技术参数
        for cat_key in ["camera_angle", "shot_type", "special_effect", "lens_filter"]:
            en_tag = self._resolve_category_selection(cat_key, kwargs.get(cat_key, self.NO_SELECTION), special_enabled)
            if en_tag:
                prompt_elements.append(en_tag)

        # 光影与色彩
        en_tag = self._resolve_category_selection("lighting", kwargs.get("lighting", self.NO_SELECTION), special_enabled)
        if en_tag:
            prompt_elements.append(en_tag)

        # 视觉风格
        en_tag = self._resolve_category_selection("visual_style", kwargs.get("visual_style", self.NO_SELECTION), special_enabled)
        if en_tag:
            prompt_elements.append(en_tag)

        # 质量等级（仅 SFW 库）
        quality_level = kwargs.get("quality_level", self.NO_SELECTION)
        if quality_level and quality_level != self.NO_SELECTION and quality_level not in (self.RANDOM_SELECTION, self.RANDOM_SFW):
            mapped = self._get_mapped_value_sfw("categories", "quality_level", quality_level)
            if mapped:
                prompt_elements.append(mapped)

        # 时间设定
        en_tag = self._resolve_category_selection("time_setting", kwargs.get("time_setting", self.NO_SELECTION), special_enabled)
        if en_tag:
            prompt_elements.append(en_tag)

        # 情绪表达
        en_tag = self._resolve_category_selection("mood_expression", kwargs.get("mood_expression", self.NO_SELECTION), special_enabled)
        if en_tag:
            prompt_elements.append(en_tag)

        return ", ".join(prompt_elements) if prompt_elements else "masterpiece, best quality"

    def _enhance_with_llm(self, positive_prompt, kwargs, lora_prompt_elements):
        """
        调用 LLM 增强正面提示词。
        返回 (enhanced_prompt, llm_enhanced)。
        用户中断时抛出 LLMInterruptException。
        """
        llm_enhanced = False
        expand_mode = kwargs.get("expand_mode", "basic")
        llm_client = self._get_llm_client(expand_mode)

        if not llm_client.is_enabled():
            print("[PromptCraft] 大模型未在设置面板中启用或配置不完整，跳过增强")
            return positive_prompt, llm_enhanced

        if not kwargs.get("llm_enabled", False):
            print("[PromptCraft] 节点未开启【语言大模型接入】，跳过增强")
            return positive_prompt, llm_enhanced

        print(f"[PromptCraft] 正在调用大模型增强（{expand_mode}）...")
        PromptServer.instance.send_sync("promptcraft.llm_status", {
            "status": "calling", "messageKey": "llm.status_calling"
        })

        is_detailed = (expand_mode == "detailed")
        llm_hint = kwargs.get("llm_instruction", "").strip()

        if llm_hint:
            try:
                config_manager.save_llm_hint(llm_hint)
            except Exception:
                pass

        lora_tag_str = ""
        if lora_prompt_elements:
            lora_tag_str = "///" + ", ".join(lora_prompt_elements) + "///"

        import threading
        result_container = {}

        def _llm_call(container):
            try:
                container['result'] = llm_client.enhance_prompt(
                    positive_prompt, is_detailed=is_detailed, llm_hint=llm_hint,
                    lora_tags=lora_tag_str
                )
            except Exception as e:
                container['error'] = str(e)

        # daemon=True: 用户中断时线程不阻塞进程退出
        thread = threading.Thread(target=_llm_call, args=(result_container,), daemon=True)
        thread.start()

        while thread.is_alive():
            thread.join(timeout=0.5)
            if not thread.is_alive():
                break
            try:
                import nodes
                nodes.before_node_execution()
            except KeyboardInterrupt:
                print("[PromptCraft] ⚠ 用户中断 LLM 调用")
                PromptServer.instance.send_sync("promptcraft.llm_status", {
                    "status": "interrupted", "messageKey": "llm.status_interrupted"
                })
                raise LLMInterruptException(positive_prompt)
            except Exception:
                pass

        if 'error' in result_container:
            print(f"[PromptCraft] LLM调用异常: {result_container['error']}")
            enhanced = None
        else:
            enhanced = result_container.get('result')

        if enhanced and enhanced.strip():
            result = enhanced.strip()
            if lora_prompt_elements:
                result_lower = result.lower()
                missing = [t for t in lora_prompt_elements if t.lower() not in result_lower]
                if missing:
                    print(f"[PromptCraft] ⚠ LoRA 标签丢失 {len(missing)}/{len(lora_prompt_elements)} 条，自动补回")
                    result = result.replace("///", "").strip().lstrip(",").strip()
                    result = ", ".join(lora_prompt_elements) + ", " + result
                else:
                    print("[PromptCraft] ✓ LoRA 标签验证通过")
                    result = result.replace("///", "").strip()
            positive_prompt = result
            llm_enhanced = True
            print("[PromptCraft] 大模型增强成功")
            PromptServer.instance.send_sync("promptcraft.llm_status", {
                "status": "success", "messageKey": "llm.status_success"
            })
        else:
            print("[PromptCraft] 大模型增强失败，使用原始prompt")
            PromptServer.instance.send_sync("promptcraft.llm_status", {
                "status": "error", "messageKey": "llm.status_failed"
            })

        return positive_prompt, llm_enhanced

    @staticmethod
    def _save_history(positive_prompt, negative_prompt, llm_enhanced, special_enabled):
        """保存 Prompt 历史记录。"""
        try:
            config_manager.add_prompt_history(
                positive_prompt, negative_prompt,
                extra={"llm_enhanced": llm_enhanced, "special": special_enabled}
            )
        except Exception as e:
            print(f"[PromptCraft] 保存历史记录失败: {e}")

    @staticmethod
    def _build_info(positive_prompt, negative_prompt, llm_enhanced, special_enabled):
        """构建生成结果的摘要信息。"""
        pos_preview = positive_prompt[:200]
        pos_suffix = "..." if len(positive_prompt) > 200 else ""
        neg_preview = negative_prompt[:150]
        neg_suffix = "..." if len(negative_prompt) > 150 else ""
        info_parts = [f"**Positive ({len(positive_prompt)} chars):** {pos_preview}{pos_suffix}"]
        info_parts.append(f"**Negative:** {neg_preview}{neg_suffix}")
        if llm_enhanced:
            info_parts.append("**大模型:** ✅ 增强成功")
        info_parts.append(f"**特殊内容:** {'启用' if special_enabled else '禁用'}")
        full_info = "\n".join(info_parts)
        print(f"[PromptCraft] 生成完成 | Positive: {len(positive_prompt)} chars | Negative: {len(negative_prompt)} chars | 特殊内容: {special_enabled}")
        return full_info

    # ==================== 分类解析 ====================

    @classmethod
    def _resolve_category_selection(cls, cat_key, selected_label, special_enabled):
        """
        解析单个分类的选择，返回英文标签字符串
        处理：
          ➤ skip             → 跳过
          ➤ random_all       → 跟随全局特殊内容开关
          ➤ random_sfw       → 强制SFW库（全量/子组）
          ➤ random_nsfw      → 强制NSFW库（全量/子组）
          ➤ random_group_<子组名> → 强制该子组随机（若有全局开关则合并SFW+NSFW）
          ➤ 特定标签          → 从对应库查找映射（含子组）
        """
        if not selected_label or selected_label == cls.NO_SELECTION:
            return ""

        # 子组随机标记
        if selected_label.startswith(cls.RANDOM_SUBGROUP_PREFIX):
            subgroup_key = selected_label[len(cls.RANDOM_SUBGROUP_PREFIX):]
            libs = [cls._load_prompt_library(False, False)]
            if special_enabled:
                libs.append(cls._load_prompt_library(False, True))
            return cls._random_pick(cat_key, libs, subgroup_key)

        # 随机选择 — 跟随全局开关
        if selected_label == cls.RANDOM_SELECTION:
            libs = [cls._load_prompt_library(False, False)]
            if special_enabled:
                libs.append(cls._load_prompt_library(False, True))
            return cls._random_pick(cat_key, libs)

        # 强制仅SFW
        if selected_label == cls.RANDOM_SFW:
            libs = [cls._load_prompt_library(False, False)]
            return cls._random_pick(cat_key, libs)

        # 强制仅NSFW
        if selected_label == cls.RANDOM_NSFW:
            libs = [cls._load_prompt_library(False, True)]
            return cls._random_pick(cat_key, libs)

        # 特定标签 — 双库查找（含子组）
        sfw = cls._load_prompt_library(False, False)
        result = cls._find_label_in_library(sfw, "categories", cat_key, selected_label)
        if result:
            return result
        nsfw = cls._load_prompt_library(False, True)
        return cls._find_label_in_library(nsfw, "categories", cat_key, selected_label)

    @classmethod
    def _random_pick(cls, cat_key, libraries, subgroup_key=None):
        """
        从指定库列表中随机抽取一个英文标签
        libraries: list of dict (可多个库)
        subgroup_key: 若指定，仅从子组 options 中抽取；否则从 category.options 全量抽取
        """
        all_options = []
        for lib in libraries:
            category = lib.get("categories", {}).get(cat_key, {})
            if subgroup_key:
                sg = category.get("subgroups", {}).get(subgroup_key, {})
                options = sg.get("options", [])
            else:
                options = list(category.get("options", []))
                # 合并子组 options（随机模式下全量参与抽取）
                for sg_data in category.get("subgroups", {}).values():
                    options.extend(sg_data.get("options", []))
            # 合并所有库的 options（去重）
            existing_labels = {o["label"] for o in all_options}
            for opt in options:
                if opt["label"] not in existing_labels:
                    all_options.append(opt)
                    existing_labels.add(opt["label"])
        if all_options:
            chosen = random.choice(all_options)
            return chosen.get("en", "")
        return ""

    @classmethod
    def _merge_libs(cls, sfw, nsfw):
        """合并 SFW + NSFW 库（保留 options 和 subgroups）"""
        import copy
        merged = copy.deepcopy(sfw)
        sp_cats = nsfw.get("categories", {})
        if sp_cats:
            merged_cats = merged.setdefault("categories", {})
            for cat_key, sp_data in sp_cats.items():
                if cat_key not in merged_cats:
                    merged_cats[cat_key] = copy.deepcopy(sp_data)
                    continue
                sfw_cat = merged_cats[cat_key]
                # 合并 options
                nsfw_opts = sp_data.get("options", [])
                if nsfw_opts:
                    sfw_opts = sfw_cat.setdefault("options", [])
                    sfw_labels = {o["label"] for o in sfw_opts}
                    for o in nsfw_opts:
                        if o["label"] not in sfw_labels:
                            sfw_opts.append(o)
                            sfw_labels.add(o["label"])
                # 合并 subgroups
                nsfw_subs = sp_data.get("subgroups", {})
                if nsfw_subs:
                    sfw_subs = sfw_cat.setdefault("subgroups", {})
                    for sg_key, sg_data in nsfw_subs.items():
                        if sg_key not in sfw_subs:
                            sfw_subs[sg_key] = copy.deepcopy(sg_data)
                        else:
                            sfw_sg_opts = sfw_subs[sg_key].setdefault("options", [])
                            sfw_sg_labels = {o["label"] for o in sfw_sg_opts}
                            for o in sg_data.get("options", []):
                                if o["label"] not in sfw_sg_labels:
                                    sfw_sg_opts.append(o)
                                    sfw_sg_labels.add(o["label"])
        return merged

    # ==================== 辅助方法 ====================

    def _get_mapped_value_sfw(self, section, category_key, label):
        """仅从 SFW 库查找标签映射"""
        library = self._load_prompt_library(False, False)
        return self._find_label_in_library(library, section, category_key, label)

    def _get_mapped_value_dual(self, section, category_key, label):
        """从 SFW + NSFW 双库查找标签映射"""
        sfw = self._load_prompt_library(False, False)
        result = self._find_label_in_library(sfw, section, category_key, label)
        if result:
            return result
        nsfw = self._load_prompt_library(False, True)
        return self._find_label_in_library(nsfw, section, category_key, label)

    @staticmethod
    def _find_label_in_library(library, section, category_key, label):
        """在指定库中查找标签对应的 en 值（先查 options，再查 subgroups）"""
        if section == "categories":
            category = library.get("categories", {}).get(category_key, {})
            # 先查 category 层的 options
            for opt in category.get("options", []):
                if opt.get("label") == label:
                    return opt.get("en", "")
            # 再查所有子组的 options
            for sg_data in category.get("subgroups", {}).values():
                for opt in sg_data.get("options", []):
                    if opt.get("label") == label:
                        return opt.get("en", "")
        elif section == "trigger_words":
            trigger_groups = library.get("trigger_words", {})
            for tag in trigger_groups.get(category_key, []):
                if tag.get("label") == label:
                    return tag.get("en", "")
        return ""

    def _apply_weight(self, tag, weight):
        """给标签应用权重（使用SD的()权重语法）"""
        if weight == 1.0:
            return tag
        if weight <= 0:
            return ""
        if weight > 1.0:
            bracket_count = max(1, round(weight * 2) - 1)
            brackets = "(" * bracket_count
            end_brackets = ")" * bracket_count
            return f"{brackets}{tag}:{weight:.1f}{end_brackets}"
        else:
            bracket_count = max(1, round((1.0 / weight)))
            brackets = "[" * bracket_count
            end_brackets = "]" * bracket_count
            return f"{brackets}{tag}{end_brackets}"

    def _generate_negative(self, negative_type, lora_negative_elements=None):
        """生成负面提示词 — 从双库 categories.negative_prompt 中查找，追加 LoRA 负面提示词"""
        if not negative_type or negative_type == self.NO_SELECTION:
            negative_prompt = "low quality, worst quality, normal quality"
        else:
            negative_prompt = "low quality, worst quality, normal quality"
            found = False
            for lib in [self._load_prompt_library(False, False), self._load_prompt_library(False, True)]:
                if found:
                    break
                cat = lib.get("categories", {}).get("negative_prompt", {})
                for opt in cat.get("options", []):
                    if opt.get("label") == negative_type:
                        negative_prompt = opt.get("en", "low quality, worst quality")
                        found = True
                        break

        if lora_negative_elements:
            neg_extra = ", ".join(lora_negative_elements)
            negative_prompt = f"{negative_prompt}, {neg_extra}" if negative_prompt else neg_extra

        return negative_prompt
