"""
Prompt Enhancer Node - ComfyUI 提示词增强器核心节点
基于内置Prompt库随机选择 + 可选LLM细节补充
使用 config_manager 统一管理 SFW/特殊内容 库和 LLM 配置
V1.1.0 — 支持每分类独立随机范围选择（+IS_CHANGED 随机修复）
"""

import json
import random
import os
from pathlib import Path
from .config_manager import config_manager
from .llm_client import LLMClient
from server import PromptServer


class PromptEnhancer:
    """提示词增强器节点"""

    # ==================== 类变量 ====================

    # 不选择的默认值
    NO_SELECTION = "——"
    # 随机选择标记（跟随全局特殊内容开关）
    RANDOM_SELECTION = "🎲 随机选择"
    # 仅在 SFW 库随机
    RANDOM_SFW = "🎲 仅在普通内容库随机"
    # 仅在 NSFW 库随机
    RANDOM_NSFW = "🎲 仅在特殊内容库随机"
    # 子组随机标记前缀
    RANDOM_SUBGROUP_PREFIX = "🎲 随机·"

    # ==================== 库加载 ====================

    @classmethod
    def _load_prompt_library(cls, force_reload=False, is_special=False):
        """加载 SFW 或特殊内容 prompt 库（通过 config_manager）"""
        if is_special:
            return config_manager.load_nsfw_library(force_reload)
        return config_manager.load_sfw_library(force_reload)

    @classmethod
    def _get_llm_client(cls):
        """获取LLM客户端（使用多服务配置，按 enhance 类别）"""
        return LLMClient.for_category(config_manager, "enhance")

    # ==================== 选项构建 ====================

    @classmethod
    def _build_category_full_options(cls, category_key):
        """
        为某个类别构建完整选项列表（SFW + NSFW 全量 + 随机标记）
        用于 INPUT_TYPES 下拉列表（始终包含所有条目，JS 端负责过滤显示）
        支持 subgroups（子组）：为每个子组注入 "🎲 随机·<子组名>" 标记
        
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
    def _build_negative_prompt_options(cls):
        """构建负面提示词选项"""
        library = cls._load_prompt_library()
        negative_prompts = library.get("negative_prompts", {})
        result = [cls.NO_SELECTION]
        result.extend(list(negative_prompts.keys()))
        result.append("自定义")
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
                "用户Prompt": ("STRING", {
                    "multiline": True,
                    "default": "",
                     "placeholder": "输入你的基础Prompt（将拼接在库标签之前）..."
                }),

                # === 主体设定 ===
                "主体人数": (cls._build_trigger_word_options("核心标签"), {"default": cls.NO_SELECTION}),
                "角色类型": (cls._build_trigger_word_options("角色类型"), {"default": cls.NO_SELECTION}),

                # === 核心内容 ===
                "场景类型": (cls._build_category_full_options("场景类型"), {"default": cls.RANDOM_SELECTION}),
                "动作姿态": (cls._build_category_full_options("动作姿态"), {"default": cls.RANDOM_SELECTION}),
                "服饰": (cls._build_category_full_options("服饰"), {"default": cls.RANDOM_SELECTION}),
                "情绪氛围": (cls._build_category_full_options("情绪氛围"), {"default": cls.RANDOM_SELECTION}),

                # === 权重控制 ===
                "权重_场景": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 2.0, "step": 0.1, "display": "number"}),
                "权重_动作": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 2.0, "step": 0.1, "display": "number"}),
                "权重_服饰": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 2.0, "step": 0.1, "display": "number"}),
                "权重_情绪": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 2.0, "step": 0.1, "display": "number"}),

                # === 拍摄与镜头 ===
                "机位角度": (cls._build_category_full_options("机位角度"), {"default": cls.NO_SELECTION}),
                "镜头类型": (cls._build_category_full_options("镜头类型"), {"default": cls.NO_SELECTION}),
                "特效镜头": (cls._build_category_full_options("特效镜头"), {"default": cls.NO_SELECTION}),
                "镜头滤镜": (cls._build_category_full_options("镜头滤镜"), {"default": cls.NO_SELECTION}),

                # === 光影与色彩 ===
                "光源类型": (cls._build_category_full_options("光源类型"), {"default": cls.NO_SELECTION}),
                "光线类型": (cls._build_category_full_options("光线类型"), {"default": cls.NO_SELECTION}),

                # === 风格与质量 ===
                "视觉风格": (cls._build_category_full_options("视觉风格"), {"default": cls.NO_SELECTION}),
                "质量等级": (cls._build_category_full_options("质量等级"), {"default": "标准"}),

                # === 预设与开关 ===
                "预设配置": (cls._build_preset_options(), {"default": cls.NO_SELECTION}),

                # === 语言大模型接入 ===
                "语言大模型接入": ("BOOLEAN", {"default": False}),
                "扩写模式": (["基础扩写", "详细扩写"], {"default": "基础扩写"}),

                # === 特殊内容开关 ===
                "特殊内容": ("BOOLEAN", {"default": False,
                                          "tooltip": "开启后下拉菜单显示NSFW条目；各分类可独立选择随机范围（SFW/NSFW/全量）"}),

                # === 负面提示词 ===
                "负面提示词类型": (cls._build_negative_prompt_options(), {"default": "标准"}),

                # === 大模型提示词 ===
                "大模型提示词": ("STRING", {
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
    RETURN_NAMES = ("正面提示词", "负面提示词", "完整信息")
    FUNCTION = "generate"
    CATEGORY = "Moton PromptCraft"
    OUTPUT_NODE = True

    # ==================== 生成逻辑 ====================

    def __init__(self):
        pass

    @classmethod
    def IS_CHANGED(cls, **kwargs):
        """ComfyUI 缓存控制：任何随机标记都强制重执行，确保每张图 prompt 不同"""
        BASE_MARKERS = (cls.RANDOM_SELECTION, cls.RANDOM_SFW, cls.RANDOM_NSFW)
        category_keys = [
            "场景类型", "动作姿态", "服饰", "情绪氛围",
            "机位角度", "镜头类型",
            "特效镜头", "镜头滤镜", "光源类型", "光线类型",
            "视觉风格"
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
        主生成函数
        每分类独立解析 4 种随机模式：
          ——              → 跳过
          🎲 随机选择       → 跟随全局特殊内容开关决定库
          🎲 仅在SFW库随机  → 强制SFW库
          🎲 仅在NSFW库随机 → 强制NSFW库（需特殊内容开启才生效）
          特定标签          → 从对应库查找映射
        """
        special_enabled = kwargs.get("特殊内容", False)

        # ========== LoRA Prompt 注入（最前端，LLM 不碰） ==========
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

        # 构建prompt元素列表
        prompt_elements = []

        # LoRA prompt 放在最前面
        prompt_elements.extend(lora_prompt_elements)

        # 1. 处理预设配置
        预设配置 = kwargs.get("预设配置", self.NO_SELECTION)
        if 预设配置 and 预设配置 != self.NO_SELECTION:
            sfw = self._load_prompt_library()
            preset_data = sfw.get("presets", {}).get(预设配置, {})
            if preset_data:
                for key in ["场景类型", "动作姿态", "服饰", "情绪氛围"]:
                    if key in preset_data:
                        kwargs[key] = preset_data[key]

        # 3. 主体标签（仅从SFW库查找）
        主体人数 = kwargs.get("主体人数", self.NO_SELECTION)
        if 主体人数 and 主体人数 != self.NO_SELECTION:
            mapped = self._get_mapped_value_sfw("trigger_words", "核心标签", 主体人数)
            if mapped:
                prompt_elements.append(mapped)

        角色类型 = kwargs.get("角色类型", self.NO_SELECTION)
        if 角色类型 and 角色类型 != self.NO_SELECTION:
            mapped = self._get_mapped_value_sfw("trigger_words", "角色类型", 角色类型)
            if mapped:
                prompt_elements.append(mapped)

        # 4. 用户Prompt（放在库标签之前）
        用户prompt = kwargs.get("用户Prompt", "").strip()
        if 用户prompt:
            prompt_elements.append(用户prompt)

        # 5. 核心内容分类
        权重_场景 = kwargs.get("权重_场景", 1.0)
        权重_动作 = kwargs.get("权重_动作", 1.0)
        权重_服饰 = kwargs.get("权重_服饰", 1.0)
        权重_情绪 = kwargs.get("权重_情绪", 1.0)

        core_categories = [
            ("场景类型", 权重_场景),
            ("动作姿态", 权重_动作),
            ("服饰", 权重_服饰),
            ("情绪氛围", 权重_情绪),
        ]

        for cat_key, weight in core_categories:
            en_tag = self._resolve_category_selection(cat_key, kwargs.get(cat_key, self.NO_SELECTION), special_enabled)
            if en_tag:
                prompt_elements.append(self._apply_weight(en_tag, weight))

        # 6. 技术参数
        tech_categories = [
            "机位角度", "镜头类型",
            "特效镜头", "镜头滤镜"
        ]
        for cat_key in tech_categories:
            en_tag = self._resolve_category_selection(cat_key, kwargs.get(cat_key, self.NO_SELECTION), special_enabled)
            if en_tag:
                prompt_elements.append(en_tag)

        # 7. 光影与色彩
        lighting_categories = ["光源类型", "光线类型"]
        for cat_key in lighting_categories:
            en_tag = self._resolve_category_selection(cat_key, kwargs.get(cat_key, self.NO_SELECTION), special_enabled)
            if en_tag:
                prompt_elements.append(en_tag)

        # 8. 视觉风格
        视觉风格 = kwargs.get("视觉风格", self.NO_SELECTION)
        en_tag = self._resolve_category_selection("视觉风格", 视觉风格, special_enabled)
        if en_tag:
            prompt_elements.append(en_tag)

        # 9. 质量等级（仅从SFW库）
        质量等级 = kwargs.get("质量等级", self.NO_SELECTION)
        if 质量等级 and 质量等级 != self.NO_SELECTION and 质量等级 not in (self.RANDOM_SELECTION, self.RANDOM_SFW):
            mapped = self._get_mapped_value_sfw("categories", "质量等级", 质量等级)
            if mapped:
                prompt_elements.append(mapped)

        # ========== 拼接正面提示词 ==========
        if prompt_elements:
            positive_prompt = ", ".join(prompt_elements)
        else:
            positive_prompt = "masterpiece, best quality"

        # ========== 语言大模型接入增强 ==========
        llm_enhanced = False
        llm_client = self._get_llm_client()
        if llm_client.is_enabled():
            if kwargs.get("语言大模型接入", False):
                print(f"[PromptCraft] 正在调用大模型增强...")
                # 发送状态事件到前端：调用中
                PromptServer.instance.send_sync("promptcraft.llm_status", {
                    "status": "calling",
                    "message": "正在调用大模型..."
                })
                扩写模式 = kwargs.get("扩写模式", "基础扩写")
                is_detailed = (扩写模式 == "详细扩写")
                llm_hint = kwargs.get("大模型提示词", "").strip()

                # 保存大模型提示词到持久化存储
                if llm_hint:
                    try:
                        config_manager.save_llm_hint(llm_hint)
                    except Exception:
                        pass

                # LoRA 标记保护：用 /// 包裹 LoRA 标签，LLM 不得修改
                lora_tag_str = ""
                if lora_prompt_elements:
                    lora_tag_str = "///" + ", ".join(lora_prompt_elements) + "///"

                # 使用线程执行 LLM 调用，支持中断检测
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

                thread = threading.Thread(target=_llm_call, args=(result_container,))
                thread.start()

                # 轮询等待结果，同时检查中断
                while thread.is_alive():
                    thread.join(timeout=0.5)
                    if not thread.is_alive():
                        break
                    # 检查 ComfyUI 中断信号
                    try:
                        import nodes
                        nodes.before_node_execution()
                    except KeyboardInterrupt:
                        print("[PromptCraft] ⚠ 用户中断 LLM 调用")
                        PromptServer.instance.send_sync("promptcraft.llm_status", {
                            "status": "interrupted",
                            "message": "LLM调用已中断"
                        })
                        return (positive_prompt, negative_prompt, "LLM调用被用户中断")
                    except Exception:
                        pass

                if 'error' in result_container:
                    print(f"[PromptCraft] LLM调用异常: {result_container['error']}")
                    enhanced = None
                else:
                    enhanced = result_container.get('result')
                if enhanced and enhanced.strip():
                    result = enhanced.strip()
                    # 后验证：检查 LoRA 标签是否被 LLM 改写或丢弃
                    if lora_prompt_elements:
                        result_lower = result.lower()
                        missing = [t for t in lora_prompt_elements if t.lower() not in result_lower]
                        if missing:
                            print(f"[PromptCraft] ⚠ LoRA 标签丢失 {len(missing)}/{len(lora_prompt_elements)} 条，自动补回")
                            # 移除可能残留的标记符号后，把原始 LoRA 标签加回最前面
                            result = result.replace("///", "").strip().lstrip(",").strip()
                            result = ", ".join(lora_prompt_elements) + ", " + result
                        else:
                            print(f"[PromptCraft] ✓ LoRA 标签验证通过")
                            result = result.replace("///", "").strip()
                    positive_prompt = result
                    llm_enhanced = True
                    print(f"[PromptCraft] 大模型增强成功")
                    # 发送状态事件到前端：成功
                    PromptServer.instance.send_sync("promptcraft.llm_status", {
                        "status": "success",
                        "message": "大模型增强成功"
                    })
                else:
                    print(f"[PromptCraft] 大模型增强失败，使用原始prompt")
                    # 发送状态事件到前端：失败
                    PromptServer.instance.send_sync("promptcraft.llm_status", {
                        "status": "error",
                        "message": "大模型增强失败，使用原始prompt"
                    })
            else:
                print(f"[PromptCraft] 节点未开启【语言大模型接入】，跳过增强")
        else:
            print(f"[PromptCraft] 大模型未在设置面板中启用或配置不完整，跳过增强")

        # ========== 生成负面提示词 ==========
        negative_prompt = self._generate_negative(
            kwargs.get("负面提示词类型", "标准")
        )
        # 追加 LoRA 负面提示词
        if lora_negative_elements:
            neg_extra = ", ".join(lora_negative_elements)
            negative_prompt = f"{negative_prompt}, {neg_extra}" if negative_prompt else neg_extra

        # ========== 构建完整信息 ==========
        info_parts = [f"**Positive ({len(positive_prompt)} chars):** {positive_prompt[:200]}..."]
        info_parts.append(f"**Negative:** {negative_prompt[:150]}...")
        if llm_enhanced:
            info_parts.append("**大模型:** ✅ 增强成功")
        info_parts.append(f"**特殊内容:** {'启用' if special_enabled else '禁用'}")

        full_info = "\n".join(info_parts)

        print(f"[PromptCraft] 生成完成 | Positive: {len(positive_prompt)} chars | Negative: {len(negative_prompt)} chars | 特殊内容: {special_enabled}")

        # ========== 自动保存 Prompt 历史 ==========
        try:
            config_manager.add_prompt_history(
                positive_prompt, negative_prompt,
                extra={"llm_enhanced": llm_enhanced, "special": special_enabled}
            )
        except Exception as e:
            print(f"[PromptCraft] 保存历史记录失败: {e}")

        return (positive_prompt, negative_prompt, full_info)

    # ==================== 分类解析 ====================

    @classmethod
    def _resolve_category_selection(cls, cat_key, selected_label, special_enabled):
        """
        解析单个分类的选择，返回英文标签字符串
        处理：
          ➤ ——             → 跳过
          ➤ 🎲 随机选择       → 跟随全局特殊内容开关
          ➤ 🎲 仅在SFW库随机  → 强制SFW库（全量/子组）
          ➤ 🎲 仅在NSFW库随机 → 强制NSFW库（全量/子组）
          ➤ 🎲 随机·<子组名>  → 强制该子组随机（若有全局开关则合并SFW+NSFW）
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

    def _generate_negative(self, negative_type, custom_negative=""):
        """生成负面提示词"""
        library = self._load_prompt_library()

        if negative_type == "自定义":
            saved = config_manager.load_negative_prompt()
            return saved.strip() if saved and saved.strip() else "low quality, worst quality"

        negative_prompts = library.get("negative_prompts", {})
        if negative_type in negative_prompts and negative_type != self.NO_SELECTION:
            return negative_prompts[negative_type]

        return "low quality, worst quality, normal quality"
