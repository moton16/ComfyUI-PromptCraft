"""
LLM 客户端测试
覆盖: 初始化 / 配置加载 / is_enabled / 思维链参数 / 内容过滤 / 工厂方法
注意: 实际 HTTP 调用需要 mock httpx
"""

import pytest
from unittest.mock import patch, MagicMock
from llm_client import LLMClient


class TestLLMClientInit:

    def test_init_with_service_config(self):
        config = {"enabled": True, "api_url": "http://test.com", "api_key": "sk-test", "model": "gpt-4"}
        client = LLMClient(service_config=config)
        assert client.config == config

    def test_init_with_config_manager(self):
        mock_cm = MagicMock()
        mock_cm.load_llm_config.return_value = {"enabled": False}
        client = LLMClient(config_manager=mock_cm)
        assert client.config["enabled"] is False

    def test_init_default_config(self):
        """无 config_manager 时应使用默认配置"""
        client = LLMClient()
        assert "enabled" in client.config


class TestIsEnabled:

    def test_enabled_with_full_config(self):
        client = LLMClient(service_config={
            "enabled": True,
            "api_url": "https://api.openai.com/v1",
            "api_key": "sk-test12345",
            "model": "gpt-4",
        })
        assert client.is_enabled() is True

    def test_disabled_when_enabled_false(self):
        client = LLMClient(service_config={
            "enabled": False,
            "api_url": "https://api.openai.com/v1",
            "api_key": "sk-test",
        })
        assert client.is_enabled() is False

    def test_disabled_when_no_url(self):
        client = LLMClient(service_config={
            "enabled": True,
            "api_url": "",
            "api_key": "sk-test",
        })
        assert client.is_enabled() is False

    def test_disabled_when_no_key(self):
        client = LLMClient(service_config={
            "enabled": True,
            "api_url": "https://api.openai.com/v1",
            "api_key": "",
        })
        assert client.is_enabled() is False

    def test_disabled_when_url_whitespace(self):
        client = LLMClient(service_config={
            "enabled": True,
            "api_url": "   ",
            "api_key": "sk-test",
        })
        assert client.is_enabled() is False


class TestConfigAccess:

    def test_get_config_value(self):
        client = LLMClient(service_config={"model": "gpt-4", "temperature": 0.8})
        assert client.get_config_value("model") == "gpt-4"
        assert client.get_config_value("temperature") == 0.8

    def test_get_config_value_default(self):
        client = LLMClient(service_config={})
        assert client.get_config_value("nonexistent", "default") == "default"

    def test_set_config_value(self):
        client = LLMClient(service_config={})
        client.set_config_value("model", "claude-4")
        assert client.config["model"] == "claude-4"


class TestThinkingParams:

    @patch('promptcraft.thinking_control.build_thinking_suppression')
    def test_prepare_thinking_params_enabled(self, mock_build):
        mock_build.return_value = {"thinking": {"type": "disabled"}}
        client = LLMClient(service_config={
            "disable_thinking": True,
            "model": "deepseek-v3",
        })
        result = client._prepare_thinking_params("deepseek-v3")
        assert result == {"thinking": {"type": "disabled"}}

    def test_prepare_thinking_params_disabled(self):
        client = LLMClient(service_config={"disable_thinking": False})
        result = client._prepare_thinking_params("deepseek-v3")
        assert result == {}

    @patch('promptcraft.thinking_control.build_thinking_suppression')
    def test_custom_thinking_params_override(self, mock_build):
        mock_build.return_value = {"thinking": {"type": "disabled"}}
        custom = {"enable_thinking": False}
        client = LLMClient(service_config={
            "disable_thinking": True,
            "custom_thinking_params": custom,
        })
        result = client._prepare_thinking_params("deepseek-v3")
        assert "enable_thinking" in result


class TestFilterContent:

    @patch('promptcraft.thinking_control.filter_thinking_content')
    def test_filter_enabled(self, mock_filter):
        mock_filter.return_value = "clean text"
        client = LLMClient(service_config={"filter_thinking_output": True})
        result = client._filter_content("<think>...</think>clean text")
        assert result == "clean text"

    def test_filter_disabled(self):
        client = LLMClient(service_config={"filter_thinking_output": False})
        text = "<think>...</think>clean text"
        result = client._filter_content(text)
        assert result == text


class TestLLMClientFactory:

    @patch('llm_client.LLMClient.__init__', return_value=None)
    def test_for_category(self, mock_init):
        mock_cm = MagicMock()
        mock_cm.get_current_service_config.return_value = {
            "enabled": True,
            "api_url": "http://test.com",
            "api_key": "sk-test",
        }
        client = LLMClient.for_category(mock_cm, "enhance_basic")
        mock_cm.get_current_service_config.assert_called_with("enhance_basic")


class TestSaveConfig:

    def test_save_via_config_manager(self):
        mock_cm = MagicMock()
        mock_cm.load_llm_config.return_value = {}
        mock_cm.save_llm_config.return_value = True
        client = LLMClient(config_manager=mock_cm)

        success, msg = client.save_config({"model": "new-model"})
        assert success is True
        assert client.config["model"] == "new-model"

    def test_save_failure(self):
        mock_cm = MagicMock()
        mock_cm.load_llm_config.return_value = {}
        mock_cm.save_llm_config.return_value = False
        client = LLMClient(config_manager=mock_cm)

        success, msg = client.save_config({"model": "new-model"})
        assert success is False
