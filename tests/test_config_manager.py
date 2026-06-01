"""
配置管理器测试
覆盖: 原子写入 / 模板复制 / SFW/NSFW 库 CRUD / LLM 配置 / Prompt 历史 / LoRA 收藏
"""

import os
import json
import pytest
from unittest.mock import patch, MagicMock
from promptcraft.config_manager import ConfigManager


@pytest.fixture
def config_mgr(tmp_dir):
    """创建独立的 ConfigManager 实例（重置单例 + 覆盖路径）"""
    # 重置单例
    ConfigManager._instance = None

    # 准备模板数据目录
    data_dir = os.path.join(tmp_dir, "data")
    os.makedirs(data_dir, exist_ok=True)

    # 写入模板文件
    sfw_template = {"version": "1.0.0", "categories": {"scene": {"label": "场景", "options": []}}}
    with open(os.path.join(data_dir, "sfw_prompts.json"), "w", encoding="utf-8") as f:
        json.dump(sfw_template, f)

    nsfw_template = {"version": "1.2.0", "enabled": True, "categories": {}}
    with open(os.path.join(data_dir, "nsfw_prompts.json"), "w", encoding="utf-8") as f:
        json.dump(nsfw_template, f)

    llm_template = {"version": "1.0.0", "enabled": False, "provider": "openai_compatible"}
    with open(os.path.join(data_dir, "llm_config.json"), "w", encoding="utf-8") as f:
        json.dump(llm_template, f)

    # 创建实例并覆盖路径
    mgr = ConfigManager.__new__(ConfigManager)
    mgr._initialized = True
    mgr.plugin_dir = tmp_dir
    mgr.templates_dir = data_dir
    mgr.user_config_dir = os.path.join(tmp_dir, "user_config")
    os.makedirs(mgr.user_config_dir, exist_ok=True)

    mgr.sfw_template_path = os.path.join(data_dir, "sfw_prompts.json")
    mgr.nsfw_template_path = os.path.join(data_dir, "nsfw_prompts.json")
    mgr.llm_template_path = os.path.join(data_dir, "llm_config.json")
    mgr.old_library_path = os.path.join(data_dir, "default_prompts.json")

    mgr.llm_config_path = os.path.join(mgr.user_config_dir, "llm_config.json")
    mgr.llm_services_path = os.path.join(mgr.user_config_dir, "llm_services.json")
    mgr.sfw_library_path = os.path.join(mgr.user_config_dir, "sfw_prompts.json")
    mgr.nsfw_library_path = os.path.join(mgr.user_config_dir, "nsfw_prompts.json")
    mgr.llm_system_prompt_path = os.path.join(mgr.user_config_dir, "llm_system_prompt.json")
    mgr.negative_prompt_path = os.path.join(mgr.user_config_dir, "negative_prompt.json")
    mgr.prompt_history_path = os.path.join(mgr.user_config_dir, "prompt_history.json")
    mgr.lora_favorites_path = os.path.join(mgr.user_config_dir, "lora_favorites.json")
    mgr.llm_hint_path = os.path.join(mgr.user_config_dir, "llm_hint.json")

    # 清除缓存
    mgr._sfw_cache = None
    mgr._sfw_cache_mtime = 0
    mgr._nsfw_cache = None
    mgr._nsfw_cache_mtime = 0
    mgr._llm_config_cache = None
    mgr._llm_system_prompt_cache = None

    yield mgr
    ConfigManager._instance = None


class TestAtomicWrite:

    def test_write_creates_file(self, config_mgr):
        path = os.path.join(config_mgr.user_config_dir, "test.json")
        result = config_mgr._atomic_write_json(path, {"key": "value"})
        assert result is True
        assert os.path.exists(path)

    def test_write_content_correct(self, config_mgr):
        path = os.path.join(config_mgr.user_config_dir, "test.json")
        data = {"nested": {"a": 1, "b": [2, 3]}}
        config_mgr._atomic_write_json(path, data)
        with open(path, "r", encoding="utf-8") as f:
            loaded = json.load(f)
        assert loaded == data

    def test_write_unicode(self, config_mgr):
        path = os.path.join(config_mgr.user_config_dir, "test.json")
        data = {"中文键": "中文值", "emoji": "🎨"}
        config_mgr._atomic_write_json(path, data)
        with open(path, "r", encoding="utf-8") as f:
            loaded = json.load(f)
        assert loaded["中文键"] == "中文值"

    def test_overwrite_existing(self, config_mgr):
        path = os.path.join(config_mgr.user_config_dir, "test.json")
        config_mgr._atomic_write_json(path, {"v": 1})
        config_mgr._atomic_write_json(path, {"v": 2})
        with open(path, "r", encoding="utf-8") as f:
            loaded = json.load(f)
        assert loaded["v"] == 2


class TestTemplateCopy:

    def test_copy_when_missing(self, config_mgr):
        target = os.path.join(config_mgr.user_config_dir, "copy_test.json")
        template = os.path.join(config_mgr.templates_dir, "sfw_prompts.json")
        result = config_mgr._copy_template_if_missing(template, target)
        assert result is True
        assert os.path.exists(target)

    def test_skip_when_exists(self, config_mgr):
        target = os.path.join(config_mgr.user_config_dir, "existing.json")
        with open(target, "w") as f:
            json.dump({"custom": True}, f)
        template = os.path.join(config_mgr.templates_dir, "sfw_prompts.json")
        result = config_mgr._copy_template_if_missing(template, target)
        assert result is True
        with open(target, "r") as f:
            assert json.load(f)["custom"] is True


class TestSFWLibrary:

    def test_load_sfw_library(self, config_mgr):
        config_mgr._init_config_files()
        lib = config_mgr.load_sfw_library()
        assert "version" in lib
        assert "categories" in lib

    def test_save_sfw_library(self, config_mgr):
        config_mgr._init_config_files()
        lib = config_mgr.load_sfw_library()
        lib["categories"]["new_cat"] = {"label": "新分类", "options": []}
        config_mgr.save_sfw_library(lib)
        reloaded = config_mgr.load_sfw_library(force_reload=True)
        assert "new_cat" in reloaded["categories"]


class TestNSFWLibrary:

    def test_load_nsfw_library(self, config_mgr):
        config_mgr._init_config_files()
        lib = config_mgr.load_nsfw_library()
        assert "version" in lib


class TestLLMConfig:

    def test_load_llm_config(self, config_mgr):
        config_mgr._init_config_files()
        llm = config_mgr.load_llm_config()
        assert "version" in llm

    def test_save_llm_config(self, config_mgr):
        config_mgr._init_config_files()
        llm = config_mgr.load_llm_config()
        llm["enabled"] = True
        llm["api_key"] = "sk-test"
        config_mgr.save_llm_config(llm)
        reloaded = config_mgr.load_llm_config(force_reload=True)
        assert reloaded["enabled"] is True
        assert reloaded["api_key"] == "sk-test"


class TestServicesConfig:

    def test_migrate_or_create_services(self, config_mgr):
        config_mgr._init_config_files()
        assert os.path.exists(config_mgr.llm_services_path)

    def test_load_services(self, config_mgr):
        config_mgr._init_config_files()
        services = config_mgr.load_services_config()
        assert isinstance(services, dict)


class TestNegativePrompt:

    def test_default_negative_prompt(self, config_mgr):
        config_mgr._init_config_files()
        neg = config_mgr.load_negative_prompt()
        assert isinstance(neg, str)

    def test_save_negative_prompt(self, config_mgr):
        config_mgr._init_config_files()
        config_mgr.save_negative_prompt("bad quality, worst quality")
        reloaded = config_mgr.load_negative_prompt()
        assert "bad quality" in reloaded


class TestPromptHistory:

    def test_empty_history(self, config_mgr):
        config_mgr._init_config_files()
        history = config_mgr.load_prompt_history()
        assert isinstance(history, dict)

    def test_add_to_history(self, config_mgr):
        config_mgr._init_config_files()
        config_mgr.add_prompt_history("test prompt 1")
        config_mgr.add_prompt_history("test prompt 2")
        history = config_mgr.load_prompt_history()
        # 历史记录是 dict 格式 {"entries": [...], ...}
        assert isinstance(history, dict)


class TestLoraFavorites:

    def test_empty_favorites(self, config_mgr):
        config_mgr._init_config_files()
        favs = config_mgr.load_lora_favorites()
        assert isinstance(favs, list)

    def test_toggle_favorite(self, config_mgr):
        config_mgr._init_config_files()
        config_mgr.toggle_lora_favorite("test/lora.safetensors")
        favs = config_mgr.load_lora_favorites()
        assert "test/lora.safetensors" in favs

    def test_is_favorite(self, config_mgr):
        config_mgr._init_config_files()
        config_mgr.toggle_lora_favorite("test/lora.safetensors")
        assert config_mgr.is_lora_favorite("test/lora.safetensors") is True


class TestMaskApiKey:

    def test_mask_long_key(self):
        masked = ConfigManager._mask_key("sk-1234567890abcdef")
        assert masked.startswith("sk-1")
        assert masked.endswith("cdef")
        assert "*" in masked

    def test_mask_short_key(self):
        # 短密钥（<=8字符）返回 "****"
        assert ConfigManager._mask_key("short") == "****"

    def test_mask_empty_key(self):
        assert ConfigManager._mask_key("") == ""
