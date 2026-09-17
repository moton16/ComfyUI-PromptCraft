"""
配置管理器 - 管理 Prompt Enhancer 的所有设置
支持 ComfyUI 用户目录持久化存储和前端设置面板
参考 prompt-assistant 的 config_manager.py 设计模式
"""

import json
import os
import shutil
import tempfile
import threading
from typing import Optional

try:
    import folder_paths
    HAS_FOLDER_PATHS = True
except ImportError:
    HAS_FOLDER_PATHS = False


class ConfigManager:
    """Prompt Enhancer 配置管理器（模块级单例 + Lock 线程安全初始化）"""

    _init_lock = threading.Lock()
    # 缓存读改写锁（RLock 可重入，保护 API 线程与节点 worker 线程并发读写）
    _cache_lock = threading.RLock()

    def __init__(self):
        if getattr(self, "_initialized", False):
            return
        with self._init_lock:
            if getattr(self, "_initialized", False):
                return
            # Phase 3 #19: _do_init 异常时不设 _initialized，下次调用可重试
            # （_do_init 的副作用均为幂等：makedirs/_init_config_files/_check_bak_files）
            try:
                self._do_init()
            except Exception as e:
                print(f"[PromptCraft] ConfigManager 初始化失败: {e}", flush=True)
                raise
            self._initialized = True

    def _do_init(self):
        """首次初始化逻辑（由 __init__ 在 Lock 保护下调用一次）"""

        # 插件目录（内置模板）
        self.plugin_dir = os.path.dirname(os.path.abspath(__file__))
        self.templates_dir = os.path.join(self.plugin_dir, "data")

        # ComfyUI 用户配置目录（持久化存储）
        if HAS_FOLDER_PATHS:
            try:
                user_dir = folder_paths.get_user_directory()
                if user_dir and os.path.isdir(user_dir):
                    self.user_config_dir = os.path.join(user_dir, "default", "prompt_enhancer")
                else:
                    self.user_config_dir = os.path.join(self.plugin_dir, "data")
            except Exception:
                self.user_config_dir = os.path.join(self.plugin_dir, "data")
        else:
            self.user_config_dir = os.path.join(self.plugin_dir, "data")

        # 确保用户配置目录存在
        os.makedirs(self.user_config_dir, exist_ok=True)

        # 配置文件路径（用户可编辑）
        self.llm_config_path = os.path.join(self.user_config_dir, "llm_config.json")
        self.llm_services_path = os.path.join(self.user_config_dir, "llm_services.json")
        self.sfw_library_path = os.path.join(self.user_config_dir, "sfw_prompts.json")
        self.nsfw_library_path = os.path.join(self.user_config_dir, "nsfw_prompts.json")
        self.llm_system_prompt_path = os.path.join(self.user_config_dir, "llm_system_prompt.json")
        self.negative_prompt_path = os.path.join(self.user_config_dir, "negative_prompt.json")
        self.prompt_history_path = os.path.join(self.user_config_dir, "prompt_history.json")
        self.lora_favorites_path = os.path.join(self.user_config_dir, "lora_favorites.json")
        self.llm_hint_path = os.path.join(self.user_config_dir, "llm_hint.json")

        # 内置模板路径（只读，用于初始化）
        self.sfw_template_path = os.path.join(self.templates_dir, "sfw_prompts.json")
        self.nsfw_template_path = os.path.join(self.templates_dir, "nsfw_prompts.json")
        self.llm_template_path = os.path.join(self.templates_dir, "llm_config.json")
        # 兼容旧版文件名
        self.old_library_path = os.path.join(self.templates_dir, "default_prompts.json")

        # 初始化配置文件（不存在时从模板复制）
        self._init_config_files()

        # 缓存（含 mtime 用于自动失效）
        self._sfw_cache = None
        self._sfw_cache_mtime = 0
        self._nsfw_cache = None
        self._nsfw_cache_mtime = 0
        self._llm_config_cache = None
        self._llm_system_prompt_cache = None
        self._svc_cache = None
        self._history_cache = None
        self._llm_hint_cache = None
        self._favorites_cache = None

        print("[PromptCraft] 配置管理器已初始化")
        print(f"[PromptCraft]   用户配置目录: {self.user_config_dir}")
        print(f"[PromptCraft]   内置模板目录: {self.templates_dir}")

        # 启动时检测 *.bak 文件存在则 log 提示（Choice 4: 日志提示，不弹窗）
        self._check_bak_files()

        # V1-BE-04: 一次性迁移旧版权重语法到冒号语法（幂等）
        try:
            from .migrate_legacy_prompts import run_migration
            run_migration(self.user_config_dir)
        except Exception as e:
            print(f"[PromptCraft] 权重语法迁移失败（非致命）: {e}")

    # ==================== 工具方法 ====================

    def _log(self, msg: str):
        print(f"[PromptCraft] {msg}", flush=True)

    def _atomic_write_json(self, file_path: str, data) -> bool:
        """原子性写入 JSON 文件（先写临时文件再 os.replace 原子覆盖）"""
        temp_fd = None
        temp_path = None
        try:
            with self._cache_lock:
                temp_fd, temp_path = tempfile.mkstemp(
                    dir=os.path.dirname(file_path), suffix='.tmp', prefix='.tmp_')
                with os.fdopen(temp_fd, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                    f.flush()
                    try:
                        os.fsync(f.fileno())
                    except OSError:
                        pass  # 某些文件系统（网络盘）不支持 fsync，忽略
                    temp_fd = None
                # Windows 上 shutil.move 会回退为非原子的 copy2+unlink（先截断目标再拷贝），
                # 崩溃/断电时可能留下半截 JSON；os.replace 在 Windows 与 POSIX 均为原子覆盖
                os.replace(temp_path, file_path)
                temp_path = None
                return True
        except Exception as e:
            self._log(f"写入文件失败 [{os.path.basename(file_path)}]: {e}")
            return False
        finally:
            if temp_fd is not None:
                try:
                    os.close(temp_fd)
                except Exception:
                    pass
            if temp_path is not None and os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                except Exception:
                    pass

    def _load_json_cached(self, file_path: str, cache_attr: str,
                          default_factory, force_reload: bool = False):
        """通用 JSON 缓存加载（消除 6+ 处重复模式）

        Args:
            file_path: JSON 文件路径
            cache_attr: 缓存属性名（如 '_llm_config_cache'）
            default_factory: 加载失败时的默认值工厂（无参 callable）
            force_reload: 是否强制跳过缓存

        V0-DATA-02: 加载失败时不写缓存（保留 None），下次访问重试。
        """
        with self._cache_lock:
            if not force_reload and getattr(self, cache_attr, None) is not None:
                return getattr(self, cache_attr)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                setattr(self, cache_attr, data)
            except Exception as e:
                self._log(f"加载配置失败 [{os.path.basename(file_path)}]: {e}")
                # V0-DATA-02: 不缓存失败结果，下次访问重试（返回默认值但不持久化）
                return default_factory()
            return getattr(self, cache_attr)

    def _copy_template_if_missing(self, template_path: str, target_path: str) -> bool:
        """如果目标文件不存在，从模板复制"""
        if os.path.exists(target_path):
            return True
        if os.path.exists(template_path):
            try:
                with open(template_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                return self._atomic_write_json(target_path, data)
            except Exception as e:
                self._log(f"从模板复制失败: {e}")
                return False
        return False

    @staticmethod
    def _parse_version(v: str) -> tuple:
        """将 '1.4.0' 转为 (1, 4, 0) 用于比较；非法/空值视为 (0,)

        '1.0.0-beta' 这类带后缀版本解析为 (1, 0, 0)，避免被误判为旧版本
        """
        try:
            parts = str(v).split('.')
            nums = []
            for p in parts:
                digits = ''.join(ch for ch in p if ch.isdigit())
                nums.append(int(digits) if digits else 0)
            return tuple(nums)
        except Exception:
            return (0,)

    def _sync_template_to_user(self, template_path: str, user_path: str, label: str) -> bool:
        """将模板同步到用户目录（基于 _template_version 字段比较 + 备份机制）

        - 用户文件不存在：直接复制模板（首次创建，无需备份）
        - 用户文件无 _template_version：视为 "0.0.0"，强制同步 + 备份
        - 用户版本 < 模板版本：备份用户文件到 *.bak 后覆盖
        - 用户版本 >= 模板版本：不同步（用户已是最新或更高）
        """
        if not os.path.exists(template_path):
            return False
        try:
            with open(template_path, 'r', encoding='utf-8') as f:
                template_data = json.load(f)
            template_ver = self._parse_version(template_data.get('_template_version', '0.0.0'))

            if not os.path.exists(user_path):
                # 首次创建，直接复制模板
                success = self._atomic_write_json(user_path, template_data)
                if success:
                    self._log(f"🔄 内置模板已初始化: {label} → {os.path.basename(user_path)}")
                return success

            # 用户文件已存在，读 _template_version 比较
            try:
                with open(user_path, 'r', encoding='utf-8') as f:
                    user_data = json.load(f)
            except Exception:
                user_data = {}
            user_ver = self._parse_version(user_data.get('_template_version', '0.0.0'))

            if user_ver >= template_ver:
                return False  # 用户文件已是最新，不需同步

            # 模板更新，备份用户文件到 *.bak 后覆盖
            try:
                shutil.copy2(user_path, user_path + ".bak")
                self._log(f"📦 已备份旧配置: {os.path.basename(user_path)} → {os.path.basename(user_path)}.bak")
            except Exception as e:
                self._log(f"⚠️ 备份 {label} 失败（跳过覆盖以防数据丢失）: {e}")
                return False

            success = self._atomic_write_json(user_path, template_data)
            if success:
                self._log(f"🔄 内置模板已升级同步: {label} → {os.path.basename(user_path)} (v{user_ver} → v{template_ver})")
            return success
        except Exception as e:
            self._log(f"⚠️ 同步 {label} 失败: {e}")
            return False

    def _check_bak_files(self):
        """启动时检测 *.bak / *.prompt.bak 文件存在则 log 提示（Choice 4: 日志提示，不弹窗）"""
        try:
            for fname in os.listdir(self.user_config_dir):
                # Bug fix: 同时检测模板备份 *.bak 和迁移备份 *.prompt.bak
                if fname.endswith('.bak'):
                    self._log(
                        f"ℹ️ 检测到备份文件 {fname}（上次升级/迁移时自动生成）。"
                        f"如需恢复旧配置，请手动将 {fname} 重命名为 {fname.replace('.prompt.bak', '').replace('.bak', '')}"
                    )
        except Exception:
            pass

    def _init_config_files(self):
        """初始化配置文件：模板变更时自动覆盖用户目录，确保下拉框始终反映最新模板"""
        # 1. SFW Prompt 库 — 模板优先同步
        if os.path.exists(self.sfw_template_path):
            self._sync_template_to_user(self.sfw_template_path, self.sfw_library_path, "SFW库")
        elif os.path.exists(self.old_library_path):
            self._sync_template_to_user(self.old_library_path, self.sfw_library_path, "SFW库(旧版)")
        # 兜底：都不存在则创建空库
        if not os.path.exists(self.sfw_library_path):
            self._atomic_write_json(self.sfw_library_path, self._get_default_sfw_library())

        # 2. NSFW Prompt 库 — 模板优先同步
        if os.path.exists(self.nsfw_template_path):
            self._sync_template_to_user(self.nsfw_template_path, self.nsfw_library_path, "NSFW库")
        # 兜底
        if not os.path.exists(self.nsfw_library_path):
            self._atomic_write_json(self.nsfw_library_path, self._get_default_nsfw_library())

        # 3. LLM 配置 — 仅首次复制（用户可能修改了 API Key，不覆盖）
        if not os.path.exists(self.llm_config_path) and os.path.exists(self.llm_template_path):
            self._copy_template_if_missing(self.llm_template_path, self.llm_config_path)
        if not os.path.exists(self.llm_config_path):
            self._atomic_write_json(self.llm_config_path, self._get_default_llm_config())

        # 4. LLM System Prompt 配置 — 仅首次复制
        if not os.path.exists(self.llm_system_prompt_path):
            self._atomic_write_json(self.llm_system_prompt_path, self._get_default_llm_system_prompt())

        # 5. 多服务 LLM 配置 — 迁移旧配置或创建默认
        if not os.path.exists(self.llm_services_path):
            self._migrate_or_create_services_config()

    # ==================== 默认值工厂 ====================

    @staticmethod
    def _get_default_sfw_library() -> dict:
        # _template_version 与 data/sfw_prompts.json 保持一致，避免兜底空库被误判为旧版反复覆盖
        return {"version": "1.0.0", "_template_version": "1.4.0", "description": "SFW Prompt库", "categories": {}, "negative_prompts": {}, "presets": {}, "trigger_words": {}}

    @staticmethod
    def _get_default_nsfw_library() -> dict:
        return {
            "version": "1.2.0",
            "description": "特殊内容 Prompt扩展库 - 启用后各分类选项会追加入SFW库对应分类",
            "enabled": True,
            "categories": {}
        }

    @staticmethod
    def _get_default_llm_config() -> dict:
        return {
            "version": "1.0.0", "enabled": False, "provider": "openai_compatible",
            "api_url": "", "api_key": "", "model": "", "temperature": 0.7, "max_tokens": 300,
            "system_prompt": "", "alternative_models": []
        }

    @staticmethod
    def _get_default_llm_system_prompt() -> dict:
        lora_rule = " Content wrapped in triple-slash markers (///...///) are immutable LoRA trigger words — you MUST copy them verbatim into your output in their original position without any modification, reordering, or omission."
        return {
            "version": "1.0.0",
            "sfw_rules": "You are a professional prompt engineer for AI image generation. Enhance the user's base prompt with rich details. Output ONLY comma-separated English tags." + lora_rule,
            "nsfw_rules": "You are a professional prompt engineer. Enhance the prompt including special content details. Output ONLY comma-separated English tags." + lora_rule,
            "sfw_enabled": True,
            "nsfw_enabled": False
        }

    # ==================== SFW Prompt 库 CRUD ====================

    def load_sfw_library(self, force_reload: bool = False) -> dict:
        with self._cache_lock:
            # 自动检测文件 mtime 变化，透明失效缓存
            if not force_reload and self._sfw_cache is not None:
                try:
                    current_mtime = os.path.getmtime(self.sfw_library_path)
                    if current_mtime <= self._sfw_cache_mtime:
                        return self._sfw_cache
                except OSError:
                    pass
            try:
                with open(self.sfw_library_path, 'r', encoding='utf-8') as f:
                    self._sfw_cache = json.load(f)
                self._sfw_cache_mtime = os.path.getmtime(self.sfw_library_path)
            except Exception as e:
                self._log(f"加载 SFW 库失败: {e}")
                self._sfw_cache = self._get_default_sfw_library()
                self._sfw_cache_mtime = 0
            # 自动修复空库：若用户库为空但模板存在，从模板恢复
            if not self._sfw_cache.get("categories") and os.path.exists(self.sfw_template_path):
                try:
                    with open(self.sfw_template_path, 'r', encoding='utf-8') as f:
                        template = json.load(f)
                    if template.get("categories"):
                        self._log("⚠️ SFW 库 categories 为空，从内置模板自动恢复")
                        self._sfw_cache = template
                        self._atomic_write_json(self.sfw_library_path, template)
                        self._sfw_cache_mtime = os.path.getmtime(self.sfw_library_path)
                except Exception:
                    pass
            return self._sfw_cache

    def save_sfw_library(self, data: dict) -> bool:
        success = self._atomic_write_json(self.sfw_library_path, data)
        if success:
            self._sfw_cache = data
            try:
                self._sfw_cache_mtime = os.path.getmtime(self.sfw_library_path)
            except OSError:
                self._sfw_cache_mtime = 0
        return success

    # ==================== NSFW Prompt 库 CRUD ====================

    def load_nsfw_library(self, force_reload: bool = False) -> dict:
        with self._cache_lock:
            # 自动检测文件 mtime 变化，透明失效缓存
            if not force_reload and self._nsfw_cache is not None:
                try:
                    current_mtime = os.path.getmtime(self.nsfw_library_path)
                    if current_mtime <= self._nsfw_cache_mtime:
                        return self._nsfw_cache
                except OSError:
                    pass
            try:
                with open(self.nsfw_library_path, 'r', encoding='utf-8') as f:
                    self._nsfw_cache = json.load(f)
                self._nsfw_cache_mtime = os.path.getmtime(self.nsfw_library_path)
            except Exception as e:
                self._log(f"加载 NSFW 库失败: {e}")
                self._nsfw_cache = self._get_default_nsfw_library()
            # 自动修复空库：若用户库 categories 为空但模板存在，从模板恢复
            if not self._nsfw_cache.get("categories") and os.path.exists(self.nsfw_template_path):
                try:
                    with open(self.nsfw_template_path, 'r', encoding='utf-8') as f:
                        template = json.load(f)
                    if template.get("categories"):
                        self._log("⚠️ NSFW 库 categories 为空，从内置模板自动恢复")
                        self._nsfw_cache = template
                        self._atomic_write_json(self.nsfw_library_path, template)
                except Exception:
                    pass
            return self._nsfw_cache

    def save_nsfw_library(self, data: dict) -> bool:
        success = self._atomic_write_json(self.nsfw_library_path, data)
        if success:
            self._nsfw_cache = data
            try:
                self._nsfw_cache_mtime = os.path.getmtime(self.nsfw_library_path)
            except OSError:
                self._nsfw_cache_mtime = 0
        return success

    # ==================== LLM 配置 CRUD ====================

    def load_llm_config(self, force_reload: bool = False) -> dict:
        return self._load_json_cached(
            self.llm_config_path, '_llm_config_cache',
            self._get_default_llm_config, force_reload)

    def save_llm_config(self, data: dict) -> bool:
        success = self._atomic_write_json(self.llm_config_path, data)
        if success:
            self._llm_config_cache = data
        return success

    # ==================== LLM System Prompt CRUD ====================

    def load_llm_system_prompt(self, force_reload: bool = False) -> dict:
        return self._load_json_cached(
            self.llm_system_prompt_path, '_llm_system_prompt_cache',
            self._get_default_llm_system_prompt, force_reload)

    def save_llm_system_prompt(self, data: dict) -> bool:
        success = self._atomic_write_json(self.llm_system_prompt_path, data)
        if success:
            self._llm_system_prompt_cache = data
        return success

    # ==================== 获取有效 system prompt ====================

    def get_effective_system_prompt(self, is_nsfw: bool = False) -> str:
        """获取当前生效的 system prompt"""
        sp = self.load_llm_system_prompt()
        if is_nsfw and sp.get("nsfw_enabled", False):
            return sp.get("nsfw_rules", "")
        return sp.get("sfw_rules", "")

    # ==================== 负面 Prompt 编辑器 CRUD ====================

    def load_negative_prompt(self) -> str:
        """加载用户自定义负面提示词"""
        try:
            if os.path.exists(self.negative_prompt_path):
                with open(self.negative_prompt_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return data.get("content", "")
        except Exception as e:
            self._log(f"加载负面提示词失败: {e}")
        return ""

    def save_negative_prompt(self, content: str) -> bool:
        """保存用户自定义负面提示词"""
        try:
            data = {"content": content, "version": "1.0.0"}
            return self._atomic_write_json(self.negative_prompt_path, data)
        except Exception as e:
            self._log(f"保存负面提示词失败: {e}")
            return False

    # ==================== 多服务 LLM 配置 CRUD ====================

    @staticmethod
    def _get_default_services_config() -> dict:
        return {
            "version": "3.0.0",
            "services": [
                {
                    "id": "default",
                    "name": "默认服务",
                    "api_url": "",
                    "api_key": "",
                    "model": "",
                    "temperature": 0.7,
                    "max_tokens": 300,
                }
            ],
            "current": {
                "enhance_basic": {"service_id": "default", "model": ""},
                "enhance_detail": {"service_id": "default", "model": ""},
                "enhance_normal": {"service_id": "default", "model": ""},
                "agent": {"service_id": "default", "model": ""},
            }
        }

    def _migrate_or_create_services_config(self):
        """从旧 llm_config.json 迁移或创建默认多服务配置"""
        if os.path.exists(self.llm_config_path):
            try:
                with open(self.llm_config_path, 'r', encoding='utf-8') as f:
                    old = json.load(f)
                svc = self._get_default_services_config()
                svc["services"][0]["api_url"] = old.get("api_url", "")
                svc["services"][0]["api_key"] = old.get("api_key", "")
                svc["services"][0]["model"] = old.get("model", "")
                svc["services"][0]["temperature"] = old.get("temperature", 0.7)
                svc["services"][0]["max_tokens"] = old.get("max_tokens", 300)
                self._atomic_write_json(self.llm_services_path, svc)
                self._log("已从 llm_config.json 迁移到 llm_services.json")
                return
            except Exception as e:
                self._log(f"迁移服务配置失败: {e}")
        # 兜底：创建默认
        self._atomic_write_json(self.llm_services_path, self._get_default_services_config())

    def load_services_config(self, force_reload=False) -> dict:
        with self._cache_lock:
            if not force_reload and self._svc_cache is not None:
                return self._svc_cache
            try:
                with open(self.llm_services_path, 'r', encoding='utf-8') as f:
                    self._svc_cache = json.load(f)
            except Exception as e:
                self._log(f"加载服务配置失败: {e}")
                self._svc_cache = self._get_default_services_config()
            # 迁移旧版 current 结构（enhance → enhance_basic）
            current = self._svc_cache.get("current", {})
            if "enhance" in current and "enhance_basic" not in current:
                enhance_val = current.pop("enhance")
                current["enhance_basic"] = enhance_val
                current.setdefault("enhance_detail", {"service_id": enhance_val.get("service_id", "default"), "model": ""})
                current.setdefault("enhance_normal", {"service_id": enhance_val.get("service_id", "default"), "model": ""})
                self._svc_cache["current"] = current
                self._atomic_write_json(self.llm_services_path, self._svc_cache)
                self._log("已迁移 enhance → enhance_basic/enhance_detail/enhance_normal")
            return self._svc_cache

    def save_services_config(self, data: dict) -> bool:
        success = self._atomic_write_json(self.llm_services_path, data)
        if success:
            self._svc_cache = data
        return success

    @staticmethod
    def _mask_key(key: str) -> str:
        if not key:
            return ""
        if len(key) <= 8:
            return "****"
        return key[:4] + "****" + key[-4:]

    def get_all_services(self) -> list:
        cfg = self.load_services_config()
        result = []
        for svc in cfg.get("services", []):
            masked = {**svc, "api_key": self._mask_key(svc.get("api_key", ""))}
            result.append(masked)
        return result

    def create_service(self, name: str, api_url: str = "", api_key: str = "") -> str:
        import uuid
        cfg = self.load_services_config()
        svc_id = f"svc_{uuid.uuid4().hex[:8]}"
        cfg["services"].append({
            "id": svc_id,
            "name": name or "新服务",
            "api_url": api_url,
            "api_key": api_key,
            "model": "",
            "temperature": 0.7,
            "max_tokens": 300,
            "disable_thinking": True,
            "filter_thinking_output": True,
        })
        self.save_services_config(cfg)
        return svc_id

    def update_service(self, service_id: str, updates: dict) -> bool:
        cfg = self.load_services_config()
        for svc in cfg["services"]:
            if svc["id"] == service_id:
                # V1-BE-12: 数值字段类型/范围校验
                for num_key, cast, lo, hi, label in (
                    ("temperature", float, 0.0, 2.0, "temperature"),
                    ("max_tokens", int, 1, 8192, "max_tokens"),
                ):
                    if num_key in updates and updates[num_key] is not None:
                        try:
                            val = cast(updates[num_key])
                            updates[num_key] = max(lo, min(hi, val))
                        except (TypeError, ValueError):
                            raise ValueError(f"{label} 必须为数字")
                # V1-BE-12: 掩码 api_key 不回写，防止前端把 GET 返回的掩码覆盖真实 key
                if "api_key" in updates and isinstance(updates["api_key"], str) and "****" in updates["api_key"]:
                    updates = {**updates}
                    updates.pop("api_key")
                for k in ("name", "api_url", "api_key", "model", "temperature", "max_tokens", "disable_thinking", "filter_thinking_output", "aggressive_thinking_control", "custom_thinking_params"):
                    if k in updates:
                        svc[k] = updates[k]
                self.save_services_config(cfg)
                return True
        return False

    def delete_service(self, service_id: str) -> bool:
        cfg = self.load_services_config()
        if len(cfg["services"]) <= 1:
            return False  # 至少保留一个
        cfg["services"] = [s for s in cfg["services"] if s["id"] != service_id]
        # 清除 current 引用
        for cat in cfg.get("current", {}).values():
            if cat.get("service_id") == service_id:
                cat["service_id"] = cfg["services"][0]["id"]
                cat["model"] = ""
        self.save_services_config(cfg)
        return True

    def set_current_service(self, category: str, service_id: str, model: str = "") -> bool:
        # 兼容前端发送的 'enhance' → 映射到 'enhance_basic'
        if category == "enhance":
            category = "enhance_basic"
        if category not in ("enhance_basic", "enhance_detail", "enhance_normal", "agent"):
            return False
        cfg = self.load_services_config()
        # V1-BE-01: 校验 service_id 存在，避免写入悬空引用
        valid_ids = {svc["id"] for svc in cfg.get("services", [])}
        if service_id not in valid_ids:
            self._log(f"设置当前服务失败: service_id '{service_id}' 不存在")
            return False
        cfg["current"][category] = {"service_id": service_id, "model": model}
        self.save_services_config(cfg)
        return True

    def get_current_service_config(self, category: str) -> dict:
        """获取指定类别的当前服务完整配置"""
        cfg = self.load_services_config()
        cur = cfg.get("current", {}).get(category, {})
        svc_id = cur.get("service_id", "")
        for svc in cfg.get("services", []):
            if svc["id"] == svc_id:
                return {
                    "enabled": True,
                    "api_url": svc.get("api_url", ""),
                    "api_key": svc.get("api_key", ""),
                    "model": cur.get("model") or svc.get("model", ""),
                    "temperature": svc.get("temperature", 0.7),
                    "max_tokens": svc.get("max_tokens", 300),
                    "disable_thinking": svc.get("disable_thinking", True),
                    "filter_thinking_output": svc.get("filter_thinking_output", True),
                    "aggressive_thinking_control": svc.get("aggressive_thinking_control", False),
                    "custom_thinking_params": svc.get("custom_thinking_params", None),
                }
        # 回退到旧配置
        return self.load_llm_config()

    async def test_service_connection(self, service_id: str) -> tuple:
        """测试指定服务的连接（异步）"""
        cfg = self.load_services_config()
        for svc in cfg.get("services", []):
            if svc["id"] == service_id:
                from .llm_client import LLMClient
                test_cfg = {**svc, "enabled": True}
                client = LLMClient(service_config=test_cfg)
                return await client.test_connection()
        return False, "服务不存在"

    # ==================== Prompt 历史记录 CRUD ====================

    def load_prompt_history(self, force_reload: bool = False) -> dict:
        """加载 prompt 历史记录配置"""
        return self._load_json_cached(
            self.prompt_history_path, '_history_cache',
            self._get_default_prompt_history, force_reload)

    def save_prompt_history(self, data: dict) -> bool:
        success = self._atomic_write_json(self.prompt_history_path, data)
        if success:
            self._history_cache = data
        return success

    @staticmethod
    def _get_default_prompt_history() -> dict:
        return {
            "version": "1.0.0",
            "limit": 50,
            "entries": []
        }

    def add_prompt_history(self, positive_prompt: str, negative_prompt: str = "", extra: Optional[dict] = None) -> bool:
        """添加一条 prompt 历史记录，自动裁剪到限制"""
        import time
        import uuid
        data = self.load_prompt_history()
        entry = {
            # 追加随机后缀，避免同一毫秒内多条记录 ID 冲突（冲突会导致删除误删）
            "id": f"h_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}",
            "timestamp": int(time.time()),
            "positive": positive_prompt,
            "negative": negative_prompt,
        }
        if extra:
            entry["extra"] = extra
        data["entries"].insert(0, entry)
        # 裁剪到限制
        limit = data.get("limit", 50)
        if limit > 0 and len(data["entries"]) > limit:
            data["entries"] = data["entries"][:limit]
        return self.save_prompt_history(data)

    def delete_prompt_history(self, entry_id: str) -> bool:
        data = self.load_prompt_history()
        data["entries"] = [e for e in data["entries"] if e.get("id") != entry_id]
        return self.save_prompt_history(data)

    def clear_prompt_history(self) -> bool:
        data = self.load_prompt_history()
        data["entries"] = []
        return self.save_prompt_history(data)

    def set_history_limit(self, limit: int) -> bool:
        data = self.load_prompt_history()
        data["limit"] = limit
        # 裁剪现有条目
        if limit > 0 and len(data["entries"]) > limit:
            data["entries"] = data["entries"][:limit]
        return self.save_prompt_history(data)

    # ==================== LoRA 收藏 CRUD ====================

    # ==================== 大模型提示词记忆 CRUD ====================

    def load_llm_hint(self, force_reload: bool = False) -> str:
        """加载用户保存的大模型提示词"""
        if not force_reload and hasattr(self, '_llm_hint_cache') and self._llm_hint_cache is not None:
            return self._llm_hint_cache
        try:
            if os.path.exists(self.llm_hint_path):
                with open(self.llm_hint_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self._llm_hint_cache = data.get("hint", "")
            else:
                self._llm_hint_cache = ""
        except Exception as e:
            self._log(f"加载大模型提示词失败: {e}")
            self._llm_hint_cache = ""
        return self._llm_hint_cache

    def save_llm_hint(self, hint: str) -> bool:
        """保存用户的大模型提示词"""
        try:
            data = {"hint": hint, "version": "1.0.0"}
            success = self._atomic_write_json(self.llm_hint_path, data)
            if success:
                self._llm_hint_cache = hint
            return success
        except Exception as e:
            self._log(f"保存大模型提示词失败: {e}")
            return False

    def load_lora_favorites(self, force_reload: bool = False) -> list:
        with self._cache_lock:
            if not force_reload and hasattr(self, '_favorites_cache') and self._favorites_cache is not None:
                return self._favorites_cache
            try:
                if os.path.exists(self.lora_favorites_path):
                    with open(self.lora_favorites_path, 'r', encoding='utf-8') as f:
                        self._favorites_cache = json.load(f)
                else:
                    self._favorites_cache = []
            except Exception as e:
                self._log(f"加载 LoRA 收藏失败: {e}")
                self._favorites_cache = []
            return self._favorites_cache

    def save_lora_favorites(self, favorites: list) -> bool:
        success = self._atomic_write_json(self.lora_favorites_path, favorites)
        if success:
            self._favorites_cache = favorites
        return success

    def toggle_lora_favorite(self, lora_path: str) -> bool:
        """切换 LoRA 收藏状态，返回是否已收藏"""
        with self._cache_lock:
            # 复制后再修改，避免直接改动缓存引用（保存失败时内存与磁盘不一致）
            favorites = list(self.load_lora_favorites())
            if lora_path in favorites:
                favorites.remove(lora_path)
                self.save_lora_favorites(favorites)
                return False
            else:
                favorites.append(lora_path)
                favorites.sort()
                self.save_lora_favorites(favorites)
                return True

    def is_lora_favorite(self, lora_path: str) -> bool:
        favorites = self.load_lora_favorites()
        return lora_path in favorites

    # ==================== 获取全部配置摘要（给前端） ====================

    def get_all_settings(self) -> dict:
        """获取全部配置摘要（不含 API Key 明文）"""
        llm = self.load_llm_config()
        sp = self.load_llm_system_prompt()
        sfw = self.load_sfw_library()
        nsfw = self.load_nsfw_library()

        # API Key 掩码处理（复用 _mask_key，避免重复实现）
        api_key = llm.get("api_key", "")
        api_key_masked = self._mask_key(api_key)

        return {
            "llm": {
                "enabled": llm.get("enabled", False),
                "provider": llm.get("provider", ""),
                "api_url": llm.get("api_url", ""),
                "api_key_masked": api_key_masked,
                "api_key_exists": bool(api_key),
                "model": llm.get("model", ""),
                "temperature": llm.get("temperature", 0.7),
                "max_tokens": llm.get("max_tokens", 300),
                "alternative_models": llm.get("alternative_models", [])
            },
            "system_prompt": {
                "sfw_rules": sp.get("sfw_rules", ""),
                "nsfw_rules": sp.get("nsfw_rules", ""),
                "sfw_enabled": sp.get("sfw_enabled", True),
                "nsfw_enabled": sp.get("nsfw_enabled", False)
            },
            "sfw_library": {
                "version": sfw.get("version", ""),
                "category_count": len(sfw.get("categories", {})),
                "preset_count": len(sfw.get("presets", {})),
                "negative_count": len(sfw.get("negative_prompts", {})),
                "categories": sfw.get("categories", {}),
                "presets": sfw.get("presets", {}),
                "negative_prompts": sfw.get("negative_prompts", {}),
                "trigger_words": sfw.get("trigger_words", {})
            },
            "nsfw_library": {
                "version": nsfw.get("version", ""),
                "enabled": nsfw.get("enabled", False),
                "description": nsfw.get("description", ""),
                "categories": nsfw.get("categories", {})
            }
        }

    # ==================== 思维链控制规则 CRUD ====================

    def get_custom_thinking_rules(self) -> list:
        """获取用户自定义思维链控制规则"""
        try:
            config_path = os.path.join(self.user_config_dir, "custom_thinking_rules.json")
            if os.path.exists(config_path):
                with open(config_path, "r", encoding="utf-8") as f:
                    rules = json.load(f)
                    if isinstance(rules, list):
                        return rules
        except Exception as e:
            self._log(f"加载自定义思维链规则失败: {e}")
        return []

    def save_custom_thinking_rules(self, rules: list) -> bool:
        """保存用户自定义思维链控制规则"""
        config_path = os.path.join(self.user_config_dir, "custom_thinking_rules.json")
        return self._atomic_write_json(config_path, rules)

    def add_custom_thinking_rule(self, rule: dict) -> bool:
        """添加一条自定义思维链控制规则"""
        rules = self.get_custom_thinking_rules()

        # 验证规则格式
        from .thinking_control import validate_custom_rule
        is_valid, error_msg = validate_custom_rule(rule)
        if not is_valid:
            self._log(f"添加自定义规则失败: {error_msg}")
            return False

        # 检查是否已存在同名规则
        existing_names = [r.get("name") for r in rules]
        if rule.get("name") in existing_names:
            # 更新已有规则
            rules = [r if r.get("name") != rule.get("name") else rule for r in rules]
        else:
            rules.append(rule)

        return self.save_custom_thinking_rules(rules)

    def delete_custom_thinking_rule(self, rule_name: str) -> bool:
        """删除一条自定义思维链控制规则"""
        rules = self.get_custom_thinking_rules()
        rules = [r for r in rules if r.get("name") != rule_name]
        return self.save_custom_thinking_rules(rules)

    def get_custom_thinking_params(self) -> dict:
        """获取用户自定义思维链控制参数（全局覆盖）"""
        try:
            config_path = os.path.join(self.user_config_dir, "custom_thinking_params.json")
            if os.path.exists(config_path):
                with open(config_path, "r", encoding="utf-8") as f:
                    params = json.load(f)
                    if isinstance(params, dict):
                        return params
        except Exception as e:
            self._log(f"加载自定义思维链参数失败: {e}")
        return {}

    def save_custom_thinking_params(self, params: dict) -> bool:
        """保存用户自定义思维链控制参数（全局覆盖）"""
        config_path = os.path.join(self.user_config_dir, "custom_thinking_params.json")
        return self._atomic_write_json(config_path, params)

    # ==================== 兼容旧 API（prompt_enhancer.py 调用） ====================

    def get_sfw_library_path(self) -> str:
        return self.sfw_library_path

    def get_nsfw_library_path(self) -> str:
        return self.nsfw_library_path

    def get_llm_config_path(self) -> str:
        return self.llm_config_path


# 全局单例
config_manager = ConfigManager()
