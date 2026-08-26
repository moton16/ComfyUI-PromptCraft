"""
ConfigManager V1.4.0 修复点测试
覆盖:
- set_current_service 校验 service_id 存在（V1-BE-01）
- _load_json_cached 加载失败不缓存（V0-DATA-02）
- reorder_loras 未在 order 中的 LoRA 追加末尾（V0-DATA-04）
"""

import os

import pytest
from promptcraft.config_manager import ConfigManager
from promptcraft.lora_group_manager import LoraGroupManager


@pytest.fixture
def isolated_config_mgr(tmp_dir):
    """创建独立的 ConfigManager 实例（绕过模块级单例，覆盖路径到临时目录）

    参考 tests/conftest.py 与现有 test_config_manager.py 的 mock 模式：
    用 object.__new__ 绕过 __init__，再设 _initialized 阻止重入。
    """
    data_dir = os.path.join(tmp_dir, "data")
    os.makedirs(data_dir, exist_ok=True)

    mgr = object.__new__(ConfigManager)
    mgr._initialized = True
    mgr.plugin_dir = tmp_dir
    mgr.templates_dir = data_dir
    mgr.user_config_dir = os.path.join(tmp_dir, "user_config")
    os.makedirs(mgr.user_config_dir, exist_ok=True)

    mgr.llm_config_path = os.path.join(mgr.user_config_dir, "llm_config.json")
    mgr.llm_services_path = os.path.join(mgr.user_config_dir, "llm_services.json")
    mgr.sfw_library_path = os.path.join(mgr.user_config_dir, "sfw_prompts.json")
    mgr.nsfw_library_path = os.path.join(mgr.user_config_dir, "nsfw_prompts.json")
    mgr.llm_system_prompt_path = os.path.join(mgr.user_config_dir, "llm_system_prompt.json")
    mgr.negative_prompt_path = os.path.join(mgr.user_config_dir, "negative_prompt.json")
    mgr.prompt_history_path = os.path.join(mgr.user_config_dir, "prompt_history.json")
    mgr.lora_favorites_path = os.path.join(mgr.user_config_dir, "lora_favorites.json")
    mgr.llm_hint_path = os.path.join(mgr.user_config_dir, "llm_hint.json")

    # 清除所有缓存
    mgr._sfw_cache = None
    mgr._sfw_cache_mtime = 0
    mgr._nsfw_cache = None
    mgr._nsfw_cache_mtime = 0
    mgr._llm_config_cache = None
    mgr._llm_system_prompt_cache = None
    mgr._svc_cache = None
    mgr._history_cache = None
    mgr._llm_hint_cache = None
    mgr._favorites_cache = None

    yield mgr


@pytest.fixture
def isolated_lora_group_mgr(tmp_dir):
    """创建独立的 LoraGroupManager 实例，重定向 _cache_file 到临时目录"""
    mgr = object.__new__(LoraGroupManager)
    mgr._initialized = True
    mgr._cache_file = os.path.join(tmp_dir, "lora_groups.json")
    mgr.groups_path = mgr._cache_file
    # 初始化 MtimeCacheMixin 状态
    mgr._cache = None
    mgr._cache_mtime = 0
    yield mgr


# ==================== V1-BE-01: set_current_service 校验 service_id ====================


class TestSetCurrentServiceValidatesId:
    """V1-BE-01: set_current_service 应校验 service_id 存在，避免写入悬空引用"""

    def test_set_current_service_validates_id(self, isolated_config_mgr):
        # 准备一个只含 1 个服务的 services config
        services = {
            "version": "3.0.0",
            "services": [
                {
                    "id": "svc_existing",
                    "name": "Existing",
                    "api_url": "",
                    "api_key": "",
                    "model": "",
                }
            ],
            "current": {
                "enhance_basic": {"service_id": "svc_existing", "model": ""},
                "enhance_detail": {"service_id": "svc_existing", "model": ""},
                "enhance_normal": {"service_id": "svc_existing", "model": ""},
                "agent": {"service_id": "svc_existing", "model": ""},
            },
        }
        isolated_config_mgr._atomic_write_json(
            isolated_config_mgr.llm_services_path, services
        )

        # 不存在的 service_id 返回 False
        result_invalid = isolated_config_mgr.set_current_service(
            "agent", "svc_nonexistent"
        )
        assert result_invalid is False

        # 存在的 service_id 返回 True
        result_valid = isolated_config_mgr.set_current_service(
            "agent", "svc_existing"
        )
        assert result_valid is True


# ==================== V0-DATA-02: _load_json_cached 加载失败不缓存 ====================


class TestLoadJsonCachedFailureNoCache:
    """V0-DATA-02: 加载失败时返回默认值但不缓存，下次访问重试"""

    def test_load_json_cached_failure_no_cache(self, isolated_config_mgr, tmp_dir):
        # 指向一个不存在的文件，触发加载失败
        bad_path = os.path.join(tmp_dir, "nonexistent.json")

        default_value = {"default": True}
        result = isolated_config_mgr._load_json_cached(
            bad_path,
            "_test_cache",
            lambda: default_value,
        )
        # 加载失败时返回默认值
        assert result == default_value
        # 但不缓存失败结果（getattr 返回 None）
        assert getattr(isolated_config_mgr, "_test_cache", None) is None


# ==================== V0-DATA-04: reorder_loras 未在 order 中的 LoRA 追加末尾 ====================


class TestReorderLorasAppendsUnordered:
    """V0-DATA-04: reorder_loras 未在 ordered_names 中的 LoRA 追加到末尾，不静默丢弃"""

    def test_reorder_loras_appends_unordered(self, isolated_lora_group_mgr):
        # 准备初始群组数据：3 个 LoRA (a, b, c)
        groups = {
            "group_a": {
                "label": "group_a",
                "description": "",
                "loras": [
                    {"lora": "a.safetensors", "weight": 1.0, "clip_weight": 1.0, "enabled": True, "note": ""},
                    {"lora": "b.safetensors", "weight": 1.0, "clip_weight": 1.0, "enabled": True, "note": ""},
                    {"lora": "c.safetensors", "weight": 1.0, "clip_weight": 1.0, "enabled": True, "note": ""},
                ],
            }
        }
        isolated_lora_group_mgr.save_groups(groups)

        # 只指定 c 在前
        isolated_lora_group_mgr.reorder_loras("group_a", ["c.safetensors"])

        # 验证：c 在第一位，a/b 追加末尾（顺序保留原相对顺序）
        result = isolated_lora_group_mgr.load_groups()
        lora_names = [item["lora"] for item in result["group_a"]["loras"]]
        assert lora_names[0] == "c.safetensors"
        assert "a.safetensors" in lora_names[1:]
        assert "b.safetensors" in lora_names[1:]
        # 不丢任何 LoRA
        assert len(lora_names) == 3
        # 未在 order 中的 LoRA 保持原相对顺序（a 在 b 前）
        assert lora_names.index("a.safetensors") < lora_names.index("b.safetensors")
