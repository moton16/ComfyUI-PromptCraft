"""
LLM 客户端集成测试
覆盖: URL 规范化 / 请求头 / enhance_prompt / chat_stream / agent_call / test_connection
V1.4.0: LLMClient 已从 httpx 同步改为 aiohttp 全异步，所有调用通过 asyncio.run 执行
"""

import asyncio
import json
from unittest.mock import AsyncMock, MagicMock, patch

import aiohttp

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


def _make_client_response_error(status=401, message="Unauthorized"):
    """构造 aiohttp.ClientResponseError"""
    return aiohttp.ClientResponseError(
        request_info=MagicMock(),
        history=(),
        status=status,
        message=message,
    )


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

        result = asyncio.run(client.enhance_prompt("basic prompt"))
        assert result == "enhanced prompt here"

    @patch.object(LLMClient, "_post")
    def test_preserves_lora_tags(self, mock_post):
        mock_post.return_value = _make_post_response("enhanced ///tag1/// and ///tag2/// result")
        client = LLMClient(service_config=_enabled_config())

        result = asyncio.run(client.enhance_prompt(
            "basic prompt",
            lora_tags="///tag1/// ///tag2///",
        ))
        assert "///tag1///" in result
        assert "///tag2///" in result

    @patch.object(LLMClient, "_post")
    def test_includes_llm_hint(self, mock_post):
        mock_post.return_value = _make_post_response("enhanced result")
        client = LLMClient(service_config=_enabled_config())

        asyncio.run(client.enhance_prompt("basic prompt", llm_hint="make it cyberpunk"))
        call_args = mock_post.call_args
        payload = call_args[1]["payload"] if "payload" in call_args[1] else call_args[0][1]
        user_content = payload["messages"][1]["content"]
        assert "make it cyberpunk" in user_content

    def test_disabled_returns_none(self):
        client = LLMClient(service_config={"enabled": False})
        result = asyncio.run(client.enhance_prompt("basic prompt"))
        assert result is None

    def test_no_api_key_returns_none(self):
        client = LLMClient(service_config=_enabled_config(api_key=""))
        result = asyncio.run(client.enhance_prompt("basic prompt"))
        assert result is None

    def test_no_api_url_returns_none(self):
        client = LLMClient(service_config=_enabled_config(api_url=""))
        result = asyncio.run(client.enhance_prompt("basic prompt"))
        assert result is None

    @patch.object(LLMClient, "_post")
    def test_empty_choices_returns_none(self, mock_post):
        mock_post.return_value = {"choices": []}
        client = LLMClient(service_config=_enabled_config())

        result = asyncio.run(client.enhance_prompt("basic prompt"))
        assert result is None

    @patch.object(LLMClient, "_post")
    def test_no_choices_key_returns_none(self, mock_post):
        mock_post.return_value = {"error": "something"}
        client = LLMClient(service_config=_enabled_config())

        result = asyncio.run(client.enhance_prompt("basic prompt"))
        assert result is None

    @patch.object(LLMClient, "_post")
    def test_reasoning_content_fallback(self, mock_post):
        mock_post.return_value = _make_post_response(content="", reasoning_content="reasoned output")
        client = LLMClient(service_config=_enabled_config(filter_thinking_output=False))

        result = asyncio.run(client.enhance_prompt("basic prompt"))
        assert result == "reasoned output"

    @patch.object(LLMClient, "_post")
    def test_timeout_returns_none(self, mock_post):
        mock_post.side_effect = asyncio.TimeoutError("timed out")
        client = LLMClient(service_config=_enabled_config())

        result = asyncio.run(client.enhance_prompt("basic prompt"))
        assert result is None
        assert "超时" in client.last_error or "timed out" in client.last_error.lower()

    @patch.object(LLMClient, "_post")
    def test_http_error_returns_none(self, mock_post):
        mock_post.side_effect = _make_client_response_error(status=401, message="Unauthorized")
        client = LLMClient(service_config=_enabled_config())

        result = asyncio.run(client.enhance_prompt("basic prompt"))
        assert result is None
        assert "401" in client.last_error

    @patch.object(LLMClient, "_post")
    def test_strips_whitespace(self, mock_post):
        mock_post.return_value = _make_post_response("  trimmed result  ")
        client = LLMClient(service_config=_enabled_config())

        result = asyncio.run(client.enhance_prompt("basic prompt"))
        assert result == "trimmed result"

    @patch.object(LLMClient, "_post")
    def test_message_payload_structure(self, mock_post):
        mock_post.return_value = _make_post_response("ok")
        client = LLMClient(service_config=_enabled_config())

        asyncio.run(client.enhance_prompt("my prompt", is_detailed=True, llm_hint="hint"))
        payload = mock_post.call_args[0][1]

        assert payload["model"] == "gpt-4"
        assert payload["temperature"] == 0.7
        assert payload["max_tokens"] == 300
        assert len(payload["messages"]) == 2
        assert payload["messages"][0]["role"] == "system"
        assert payload["messages"][1]["role"] == "user"
        assert "my prompt" in payload["messages"][1]["content"]


# ==================== TestChatStream ====================


def _build_mock_session(sse_lines):
    """构造一个 mock aiohttp.ClientSession，使 chat_stream 能消费 SSE 行

    sse_lines 中的每一项会被编码为 utf-8 字节（带换行，符合真实 SSE 协议——
    真实 aiohttp StreamReader 以传输 chunk 产出，不保证以 \\n 结尾，必须自行切行），
    作为 response.content 的 async iterable 一项。
    """
    async def _aiter():
        for line in sse_lines:
            yield (line + "\n").encode("utf-8")

    mock_response = AsyncMock()
    mock_response.raise_for_status = MagicMock()
    mock_response.content = _aiter()

    mock_session_instance = MagicMock()
    mock_post_cm = AsyncMock()
    mock_post_cm.__aenter__.return_value = mock_response
    mock_post_cm.__aexit__.return_value = None
    mock_session_instance.post.return_value = mock_post_cm

    mock_session_ctx = AsyncMock()
    mock_session_ctx.__aenter__.return_value = mock_session_instance
    mock_session_ctx.__aexit__.return_value = None
    return mock_session_ctx


class TestChatStream:

    @patch("aiohttp.TCPConnector")
    @patch("aiohttp.ClientSession")
    def test_stream_yields_content(self, MockSession, MockConnector):
        sse_lines = [
            'data: {"choices":[{"delta":{"content":"Hello"}}]}',
            'data: {"choices":[{"delta":{"content":" World"}}]}',
            'data: [DONE]',
        ]
        MockSession.return_value = _build_mock_session(sse_lines)

        client = LLMClient(service_config=_enabled_config())

        async def _collect():
            return [chunk async for chunk in client.chat_stream([{"role": "user", "content": "hi"}])]

        chunks = asyncio.run(_collect())
        assert "Hello" in chunks
        assert " World" in chunks

    def test_disabled_yields_error(self):
        client = LLMClient(service_config={"enabled": False})

        async def _collect():
            return [chunk async for chunk in client.chat_stream([{"role": "user", "content": "hi"}])]

        chunks = asyncio.run(_collect())
        assert any("Error" in c for c in chunks)

    @patch("aiohttp.TCPConnector")
    @patch("aiohttp.ClientSession")
    def test_stream_empty_sse(self, MockSession, MockConnector):
        sse_lines = ['data: [DONE]']
        MockSession.return_value = _build_mock_session(sse_lines)

        client = LLMClient(service_config=_enabled_config())

        async def _collect():
            return [chunk async for chunk in client.chat_stream([{"role": "user", "content": "hi"}])]

        chunks = asyncio.run(_collect())
        assert chunks == []

    @patch("aiohttp.TCPConnector")
    @patch("aiohttp.ClientSession")
    def test_stream_http_error_yields_error(self, MockSession, MockConnector):
        # 用 MagicMock 而非 AsyncMock，确保 raise_for_status 是同步调用并立即抛 side_effect
        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_response.raise_for_status.side_effect = _make_client_response_error(
            status=500, message="Internal Server Error"
        )
        # 让 async for 直接返回（不产生任何行，因为 raise_for_status 会先抛出）
        async def _empty():
            return
            yield  # 让 Python 把它识别为 async generator
        mock_response.content = _empty()

        mock_session_instance = MagicMock()
        mock_post_cm = AsyncMock()
        mock_post_cm.__aenter__.return_value = mock_response
        mock_post_cm.__aexit__.return_value = None
        mock_session_instance.post.return_value = mock_post_cm

        mock_session_ctx = AsyncMock()
        mock_session_ctx.__aenter__.return_value = mock_session_instance
        mock_session_ctx.__aexit__.return_value = None
        MockSession.return_value = mock_session_ctx

        client = LLMClient(service_config=_enabled_config())

        async def _collect():
            return [chunk async for chunk in client.chat_stream([{"role": "user", "content": "hi"}])]

        chunks = asyncio.run(_collect())
        assert any("Error" in c for c in chunks)

    @patch("aiohttp.TCPConnector")
    @patch("aiohttp.ClientSession")
    def test_stream_malformed_json_skipped(self, MockSession, MockConnector):
        sse_lines = [
            'data: not-json',
            'data: {"choices":[{"delta":{"content":"valid"}}]}',
            'data: [DONE]',
        ]
        MockSession.return_value = _build_mock_session(sse_lines)

        client = LLMClient(service_config=_enabled_config())

        async def _collect():
            return [chunk async for chunk in client.chat_stream([{"role": "user", "content": "hi"}])]

        chunks = asyncio.run(_collect())
        assert chunks == ["valid"]


def _build_mock_chunk_session(chunks):
    """构造 mock session，response.content 按任意字节 chunk 产出（模拟真实传输层）"""
    async def _aiter():
        for c in chunks:
            yield c

    mock_response = AsyncMock()
    mock_response.raise_for_status = MagicMock()
    mock_response.content = _aiter()

    mock_session_instance = MagicMock()
    mock_post_cm = AsyncMock()
    mock_post_cm.__aenter__.return_value = mock_response
    mock_post_cm.__aexit__.return_value = None
    mock_session_instance.post.return_value = mock_post_cm

    mock_session_ctx = AsyncMock()
    mock_session_ctx.__aenter__.return_value = mock_session_instance
    mock_session_ctx.__aexit__.return_value = None
    return mock_session_ctx


class TestChatStreamChunking:

    @patch("aiohttp.TCPConnector")
    @patch("aiohttp.ClientSession")
    def test_multiline_chunk_no_content_loss(self, MockSession, MockConnector):
        """一条传输 chunk 含多条 data 事件（真实场景拼块）时不丢内容"""
        chunk_bytes = (
            'data: {"choices":[{"delta":{"content":"Hello"}}]}\n'
            'data: {"choices":[{"delta":{"content":" World"}}]}\n'
            'data: [DONE]\n'
        ).encode("utf-8")
        MockSession.return_value = _build_mock_chunk_session([chunk_bytes])

        client = LLMClient(service_config=_enabled_config())

        async def _collect():
            return [chunk async for chunk in client.chat_stream([{"role": "user", "content": "hi"}])]

        chunks = asyncio.run(_collect())
        assert chunks == ["Hello", " World"]

    @patch("aiohttp.TCPConnector")
    @patch("aiohttp.ClientSession")
    def test_split_line_chunk_parsed(self, MockSession, MockConnector):
        """一条 SSE 事件被拆成两个传输 chunk（真实场景拆块）时也能正确解析"""
        full = 'data: {"choices":[{"delta":{"content":"split"}}]}\n'
        mid = len(full) // 2
        MockSession.return_value = _build_mock_chunk_session([
            full[:mid].encode("utf-8"),
            full[mid:].encode("utf-8"),
        ])

        client = LLMClient(service_config=_enabled_config())

        async def _collect():
            return [chunk async for chunk in client.chat_stream([{"role": "user", "content": "hi"}])]

        chunks = asyncio.run(_collect())
        assert chunks == ["split"]

    @patch("aiohttp.TCPConnector")
    @patch("aiohttp.ClientSession")
    def test_thinking_mixed_chunk_keeps_trailing_text(self, MockSession, MockConnector):
        """同一 chunk 含思维链开始标签 + 后续正文时，只丢弃标签内容不丢正文"""
        sse_lines = [
            'data: {"choices":[{"delta":{"content":"<thinking>secret</thinking>visible"}}]}',
            'data: [DONE]',
        ]
        MockSession.return_value = _build_mock_session(sse_lines)

        client = LLMClient(service_config=_enabled_config())

        async def _collect():
            return [chunk async for chunk in client.chat_stream([{"role": "user", "content": "hi"}])]

        chunks = asyncio.run(_collect())
        assert chunks == ["visible"]

    @patch("aiohttp.TCPConnector")
    @patch("aiohttp.ClientSession")
    def test_thinking_split_across_chunks(self, MockSession, MockConnector):
        """思维链标签跨多个 chunk 时跨 chunk 状态正确"""
        sse_lines = [
            'data: {"choices":[{"delta":{"content":"before<think>"}}]}',
            'data: {"choices":[{"delta":{"content":"secret"}}]}',
            'data: {"choices":[{"delta":{"content":"</think>after"}}]}',
            'data: [DONE]',
        ]
        MockSession.return_value = _build_mock_session(sse_lines)

        client = LLMClient(service_config=_enabled_config())

        async def _collect():
            return [chunk async for chunk in client.chat_stream([{"role": "user", "content": "hi"}])]

        chunks = asyncio.run(_collect())
        assert chunks == ["before", "after"]


class TestAgentCall:

    @patch.object(LLMClient, "_post")
    def test_returns_json(self, mock_post):
        agent_json = json.dumps({"operations": [{"action": "lora_add"}]})
        mock_post.return_value = _make_post_response(agent_json)
        client = LLMClient(service_config=_enabled_config())

        result = asyncio.run(client.agent_call(
            current_state={"loras": []},
            instruction="add a cyberpunk LoRA",
        ))
        assert result is not None
        parsed = json.loads(result)
        assert "operations" in parsed

    def test_disabled_returns_none(self):
        client = LLMClient(service_config={"enabled": False})
        result = asyncio.run(client.agent_call(
            current_state={"loras": []},
            instruction="add a cyberpunk LoRA",
        ))
        assert result is None

    @patch.object(LLMClient, "_post")
    def test_uses_agent_system_prompt(self, mock_post):
        mock_post.return_value = _make_post_response('{"operations": []}')
        client = LLMClient(service_config=_enabled_config())

        asyncio.run(client.agent_call(current_state={}, instruction="query state"))
        payload = mock_post.call_args[0][1]

        system_content = payload["messages"][0]["content"]
        assert "ComfyUI" in system_content or "agent" in system_content.lower()

    @patch.object(LLMClient, "_post")
    def test_http_error_returns_none(self, mock_post):
        mock_post.side_effect = _make_client_response_error(status=500, message="Internal Server Error")
        client = LLMClient(service_config=_enabled_config())

        result = asyncio.run(client.agent_call(current_state={}, instruction="test"))
        assert result is None

    @patch.object(LLMClient, "_post")
    def test_empty_choices_returns_none(self, mock_post):
        mock_post.return_value = {"choices": []}
        client = LLMClient(service_config=_enabled_config())

        result = asyncio.run(client.agent_call(current_state={}, instruction="test"))
        assert result is None

    @patch.object(LLMClient, "_post")
    def test_agent_context_includes_state(self, mock_post):
        mock_post.return_value = _make_post_response('{"operations": []}')
        client = LLMClient(service_config=_enabled_config())

        state = {"loras": ["style/cyberpunk.safetensors"], "checkpoint": "sdxl"}
        asyncio.run(client.agent_call(current_state=state, instruction="toggle the LoRA"))
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

        success, message = asyncio.run(client.test_connection())
        assert success is True
        assert "成功" in message or "success" in message.lower()

    @patch.object(LLMClient, "_post")
    def test_http_error(self, mock_post):
        mock_post.side_effect = _make_client_response_error(status=401, message="Unauthorized")
        client = LLMClient(service_config=_enabled_config())

        success, message = asyncio.run(client.test_connection())
        assert success is False
        assert "401" in message

    def test_disabled(self):
        client = LLMClient(service_config={"enabled": False})
        success, message = asyncio.run(client.test_connection())
        assert success is False
        assert "未启用" in message or "disabled" in message.lower()

    @patch.object(LLMClient, "_post")
    def test_timeout(self, mock_post):
        mock_post.side_effect = asyncio.TimeoutError("connection timed out")
        client = LLMClient(service_config=_enabled_config())

        success, message = asyncio.run(client.test_connection())
        assert success is False
        assert "超时" in message or "timed out" in message.lower()

    @patch.object(LLMClient, "_post")
    def test_success_includes_model(self, mock_post):
        mock_post.return_value = _make_post_response("OK")
        client = LLMClient(service_config=_enabled_config(model="claude-4-sonnet"))

        success, message = asyncio.run(client.test_connection())
        assert success is True
        assert "claude-4-sonnet" in message
