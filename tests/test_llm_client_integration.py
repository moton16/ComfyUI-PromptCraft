"""
LLM 客户端集成测试
覆盖: URL 规范化 / 请求头 / enhance_prompt / chat_stream / agent_call / test_connection
所有 HTTP 调用通过 unittest.mock.patch 模拟
"""

import json
from unittest.mock import patch, MagicMock

from llm_client import LLMClient


def _enabled_config(**overrides):
    base = {
        "enabled": True,
        "api_url": "https://api.example.com/v1",
        "api_key": "sk-test-key-12345",
        "model": "gpt-4",
        "temperature": 0.7,
        "max_tokens": 300,
        "system_prompt": "You are a helpful assistant.",
    }
    base.update(overrides)
    return base


def _make_post_response(content="hello", reasoning_content=None):
    msg = {"role": "assistant", "content": content}
    if reasoning_content is not None:
        msg["reasoning_content"] = reasoning_content
    return {"choices": [{"message": msg, "finish_reason": "stop"}]}


# ==================== TestPrepareUrl ====================


class TestPrepareUrl:

    def test_add_scheme_missing(self):
        client = LLMClient(service_config={"api_url": "api.example.com/v1"})
        url = client._prepare_url()
        assert url == "http://api.example.com/v1/chat/completions"

    def test_preserves_https(self):
        client = LLMClient(service_config={"api_url": "https://api.example.com/v1"})
        url = client._prepare_url()
        assert url == "https://api.example.com/v1/chat/completions"

    def test_preserves_http(self):
        client = LLMClient(service_config={"api_url": "http://localhost:8080"})
        url = client._prepare_url()
        assert url == "http://localhost:8080/chat/completions"

    def test_append_chat_completions(self):
        client = LLMClient(service_config={"api_url": "https://api.example.com/v1"})
        url = client._prepare_url()
        assert url.endswith("/chat/completions")

    def test_strip_trailing_slash(self):
        client = LLMClient(service_config={"api_url": "https://api.example.com/v1/"})
        url = client._prepare_url()
        assert url == "https://api.example.com/v1/chat/completions"

    def test_already_has_chat_completions(self):
        client = LLMClient(service_config={"api_url": "https://api.example.com/v1/chat/completions"})
        url = client._prepare_url()
        assert url == "https://api.example.com/v1/chat/completions"

    def test_empty_url(self):
        client = LLMClient(service_config={"api_url": ""})
        url = client._prepare_url()
        assert url == ""

    def test_whitespace_url(self):
        client = LLMClient(service_config={"api_url": "  "})
        url = client._prepare_url()
        assert url == ""


# ==================== TestPrepareHeaders ====================


class TestPrepareHeaders:

    def test_authorization_bearer(self):
        client = LLMClient(service_config={"api_key": "sk-my-secret"})
        headers = client._prepare_headers()
        assert headers["Authorization"] == "Bearer sk-my-secret"

    def test_content_type_json(self):
        client = LLMClient(service_config={"api_key": "sk-test"})
        headers = client._prepare_headers()
        assert headers["Content-Type"] == "application/json"

    def test_empty_api_key(self):
        client = LLMClient(service_config={"api_key": ""})
        headers = client._prepare_headers()
        assert headers["Authorization"] == "Bearer "

    def test_whitespace_stripped(self):
        client = LLMClient(service_config={"api_key": "  sk-spaces  "})
        headers = client._prepare_headers()
        assert headers["Authorization"] == "Bearer sk-spaces"


# ==================== TestEnhancePrompt ====================


class TestEnhancePrompt:

    @patch.object(LLMClient, "_post")
    def test_returns_content(self, mock_post):
        mock_post.return_value = _make_post_response("enhanced prompt here")
        client = LLMClient(service_config=_enabled_config())

        result = client.enhance_prompt("basic prompt")
        assert result == "enhanced prompt here"

    @patch.object(LLMClient, "_post")
    def test_preserves_lora_tags(self, mock_post):
        mock_post.return_value = _make_post_response("enhanced ///tag1/// and ///tag2/// result")
        client = LLMClient(service_config=_enabled_config())

        result = client.enhance_prompt(
            "basic prompt",
            lora_tags="///tag1/// ///tag2///",
        )
        assert "///tag1///" in result
        assert "///tag2///" in result

    @patch.object(LLMClient, "_post")
    def test_includes_llm_hint(self, mock_post):
        mock_post.return_value = _make_post_response("enhanced result")
        client = LLMClient(service_config=_enabled_config())

        client.enhance_prompt("basic prompt", llm_hint="make it cyberpunk")
        call_args = mock_post.call_args
        payload = call_args[1]["payload"] if "payload" in call_args[1] else call_args[0][1]
        user_content = payload["messages"][1]["content"]
        assert "make it cyberpunk" in user_content

    def test_disabled_returns_none(self):
        client = LLMClient(service_config={"enabled": False})
        result = client.enhance_prompt("basic prompt")
        assert result is None

    def test_no_api_key_returns_none(self):
        client = LLMClient(service_config=_enabled_config(api_key=""))
        result = client.enhance_prompt("basic prompt")
        assert result is None

    def test_no_api_url_returns_none(self):
        client = LLMClient(service_config=_enabled_config(api_url=""))
        result = client.enhance_prompt("basic prompt")
        assert result is None

    @patch.object(LLMClient, "_post")
    def test_empty_choices_returns_none(self, mock_post):
        mock_post.return_value = {"choices": []}
        client = LLMClient(service_config=_enabled_config())

        result = client.enhance_prompt("basic prompt")
        assert result is None

    @patch.object(LLMClient, "_post")
    def test_no_choices_key_returns_none(self, mock_post):
        mock_post.return_value = {"error": "something"}
        client = LLMClient(service_config=_enabled_config())

        result = client.enhance_prompt("basic prompt")
        assert result is None

    @patch.object(LLMClient, "_post")
    def test_reasoning_content_fallback(self, mock_post):
        mock_post.return_value = _make_post_response(content="", reasoning_content="reasoned output")
        client = LLMClient(service_config=_enabled_config(filter_thinking_output=False))

        result = client.enhance_prompt("basic prompt")
        assert result == "reasoned output"

    @patch.object(LLMClient, "_post")
    def test_timeout_returns_none(self, mock_post):
        import httpx
        mock_post.side_effect = httpx.TimeoutException("timed out")
        client = LLMClient(service_config=_enabled_config())

        result = client.enhance_prompt("basic prompt")
        assert result is None
        assert "超时" in client.last_error or "timed out" in client.last_error

    @patch.object(LLMClient, "_post")
    def test_http_error_returns_none(self, mock_post):
        import httpx
        response = MagicMock()
        response.status_code = 401
        response.text = "Unauthorized"
        mock_post.side_effect = httpx.HTTPStatusError(
            "401 Unauthorized", request=MagicMock(), response=response
        )
        client = LLMClient(service_config=_enabled_config())

        result = client.enhance_prompt("basic prompt")
        assert result is None
        assert "401" in client.last_error

    @patch.object(LLMClient, "_post")
    def test_strips_whitespace(self, mock_post):
        mock_post.return_value = _make_post_response("  trimmed result  ")
        client = LLMClient(service_config=_enabled_config())

        result = client.enhance_prompt("basic prompt")
        assert result == "trimmed result"

    @patch.object(LLMClient, "_post")
    def test_message_payload_structure(self, mock_post):
        mock_post.return_value = _make_post_response("ok")
        client = LLMClient(service_config=_enabled_config())

        client.enhance_prompt("my prompt", is_detailed=True, llm_hint="hint")
        payload = mock_post.call_args[0][1]

        assert payload["model"] == "gpt-4"
        assert payload["temperature"] == 0.7
        assert payload["max_tokens"] == 300
        assert len(payload["messages"]) == 2
        assert payload["messages"][0]["role"] == "system"
        assert payload["messages"][1]["role"] == "user"
        assert "my prompt" in payload["messages"][1]["content"]


# ==================== TestChatStream ====================


class TestChatStream:

    @patch("httpx.Client")
    def test_stream_yields_content(self, MockClient):
        sse_lines = [
            'data: {"choices":[{"delta":{"content":"Hello"}}]}',
            'data: {"choices":[{"delta":{"content":" World"}}]}',
            'data: [DONE]',
        ]
        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_response.iter_lines.return_value = iter(sse_lines)

        mock_client_instance = MagicMock()
        mock_client_instance.stream.return_value.__enter__ = MagicMock(return_value=mock_response)
        mock_client_instance.stream.return_value.__exit__ = MagicMock(return_value=False)
        MockClient.return_value.__enter__ = MagicMock(return_value=mock_client_instance)
        MockClient.return_value.__exit__ = MagicMock(return_value=False)

        client = LLMClient(service_config=_enabled_config())
        chunks = list(client.chat_stream([{"role": "user", "content": "hi"}]))

        assert "Hello" in chunks
        assert " World" in chunks

    def test_disabled_yields_error(self):
        client = LLMClient(service_config={"enabled": False})
        chunks = list(client.chat_stream([{"role": "user", "content": "hi"}]))
        assert any("Error" in c for c in chunks)

    @patch("httpx.Client")
    def test_stream_empty_sse(self, MockClient):
        sse_lines = ['data: [DONE]']
        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_response.iter_lines.return_value = iter(sse_lines)

        mock_client_instance = MagicMock()
        mock_client_instance.stream.return_value.__enter__ = MagicMock(return_value=mock_response)
        mock_client_instance.stream.return_value.__exit__ = MagicMock(return_value=False)
        MockClient.return_value.__enter__ = MagicMock(return_value=mock_client_instance)
        MockClient.return_value.__exit__ = MagicMock(return_value=False)

        client = LLMClient(service_config=_enabled_config())
        chunks = list(client.chat_stream([{"role": "user", "content": "hi"}]))
        assert chunks == []

    @patch("httpx.Client")
    def test_stream_http_error_yields_error(self, MockClient):
        import httpx
        mock_response = MagicMock()
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "500", request=MagicMock(), response=MagicMock(status_code=500)
        )

        mock_client_instance = MagicMock()
        mock_client_instance.stream.return_value.__enter__ = MagicMock(return_value=mock_response)
        mock_client_instance.stream.return_value.__exit__ = MagicMock(return_value=False)
        MockClient.return_value.__enter__ = MagicMock(return_value=mock_client_instance)
        MockClient.return_value.__exit__ = MagicMock(return_value=False)

        client = LLMClient(service_config=_enabled_config())
        chunks = list(client.chat_stream([{"role": "user", "content": "hi"}]))
        assert any("Error" in c for c in chunks)

    @patch("httpx.Client")
    def test_stream_malformed_json_skipped(self, MockClient):
        sse_lines = [
            'data: not-json',
            'data: {"choices":[{"delta":{"content":"valid"}}]}',
            'data: [DONE]',
        ]
        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_response.iter_lines.return_value = iter(sse_lines)

        mock_client_instance = MagicMock()
        mock_client_instance.stream.return_value.__enter__ = MagicMock(return_value=mock_response)
        mock_client_instance.stream.return_value.__exit__ = MagicMock(return_value=False)
        MockClient.return_value.__enter__ = MagicMock(return_value=mock_client_instance)
        MockClient.return_value.__exit__ = MagicMock(return_value=False)

        client = LLMClient(service_config=_enabled_config())
        chunks = list(client.chat_stream([{"role": "user", "content": "hi"}]))
        assert chunks == ["valid"]


# ==================== TestAgentCall ====================


class TestAgentCall:

    @patch.object(LLMClient, "_post")
    def test_returns_json(self, mock_post):
        agent_json = json.dumps({"operations": [{"action": "lora_add"}]})
        mock_post.return_value = _make_post_response(agent_json)
        client = LLMClient(service_config=_enabled_config())

        result = client.agent_call(
            current_state={"loras": []},
            instruction="add a cyberpunk LoRA",
        )
        assert result is not None
        parsed = json.loads(result)
        assert "operations" in parsed

    def test_disabled_returns_none(self):
        client = LLMClient(service_config={"enabled": False})
        result = client.agent_call(
            current_state={"loras": []},
            instruction="add a cyberpunk LoRA",
        )
        assert result is None

    @patch.object(LLMClient, "_post")
    def test_uses_agent_system_prompt(self, mock_post):
        mock_post.return_value = _make_post_response('{"operations": []}')
        client = LLMClient(service_config=_enabled_config())

        client.agent_call(current_state={}, instruction="query state")
        payload = mock_post.call_args[0][1]

        system_content = payload["messages"][0]["content"]
        assert "ComfyUI" in system_content or "agent" in system_content.lower()

    @patch.object(LLMClient, "_post")
    def test_http_error_returns_none(self, mock_post):
        import httpx
        response = MagicMock()
        response.status_code = 500
        response.text = "Internal Server Error"
        mock_post.side_effect = httpx.HTTPStatusError(
            "500", request=MagicMock(), response=response
        )
        client = LLMClient(service_config=_enabled_config())

        result = client.agent_call(current_state={}, instruction="test")
        assert result is None

    @patch.object(LLMClient, "_post")
    def test_empty_choices_returns_none(self, mock_post):
        mock_post.return_value = {"choices": []}
        client = LLMClient(service_config=_enabled_config())

        result = client.agent_call(current_state={}, instruction="test")
        assert result is None

    @patch.object(LLMClient, "_post")
    def test_agent_context_includes_state(self, mock_post):
        mock_post.return_value = _make_post_response('{"operations": []}')
        client = LLMClient(service_config=_enabled_config())

        state = {"loras": ["style/cyberpunk.safetensors"], "checkpoint": "sdxl"}
        client.agent_call(current_state=state, instruction="toggle the LoRA")
        payload = mock_post.call_args[0][1]

        user_content = payload["messages"][1]["content"]
        assert "cyberpunk" in user_content
        assert "toggle" in user_content.lower()


# ==================== TestTestConnection ====================


class TestTestConnection:

    @patch.object(LLMClient, "_post")
    def test_success(self, mock_post):
        mock_post.return_value = _make_post_response("OK")
        client = LLMClient(service_config=_enabled_config())

        success, message = client.test_connection()
        assert success is True
        assert "成功" in message or "success" in message.lower()

    @patch.object(LLMClient, "_post")
    def test_http_error(self, mock_post):
        import httpx
        response = MagicMock()
        response.status_code = 401
        response.text = "Unauthorized"
        mock_post.side_effect = httpx.HTTPStatusError(
            "401", request=MagicMock(), response=response
        )
        client = LLMClient(service_config=_enabled_config())

        success, message = client.test_connection()
        assert success is False
        assert "401" in message

    def test_disabled(self):
        client = LLMClient(service_config={"enabled": False})
        success, message = client.test_connection()
        assert success is False
        assert "未启用" in message or "disabled" in message.lower()

    @patch.object(LLMClient, "_post")
    def test_timeout(self, mock_post):
        import httpx
        mock_post.side_effect = httpx.TimeoutException("connection timed out")
        client = LLMClient(service_config=_enabled_config())

        success, message = client.test_connection()
        assert success is False
        assert "超时" in message or "timed out" in message.lower()

    @patch.object(LLMClient, "_post")
    def test_success_includes_model(self, mock_post):
        mock_post.return_value = _make_post_response("OK")
        client = LLMClient(service_config=_enabled_config(model="claude-4-sonnet"))

        success, message = client.test_connection()
        assert success is True
        assert "claude-4-sonnet" in message
