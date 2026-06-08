"""
api_handler 装饰器测试
覆盖: 成功响应 / ValueError 处理 / 通用异常处理 / 响应格式
"""

import pytest
import asyncio
import sys
import os
from unittest.mock import MagicMock, patch

# mock aiohttp 必须在 import api_routes 之前（无论是否已安装）
_mock_web = MagicMock()
sys.modules['aiohttp'] = MagicMock()
sys.modules['aiohttp.web'] = _mock_web

# mock ComfyUI 依赖
if 'server' not in sys.modules:
    sys.modules['server'] = MagicMock()
if 'folder_paths' not in sys.modules:
    sys.modules['folder_paths'] = MagicMock()
if 'comfy' not in sys.modules:
    sys.modules['comfy'] = MagicMock()
    sys.modules['comfy.sd'] = MagicMock()
    sys.modules['comfy.utils'] = MagicMock()
    sys.modules['comfy.model_management'] = MagicMock()
if 'nodes' not in sys.modules:
    sys.modules['nodes'] = MagicMock()

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from promptcraft.api_routes import api_handler, get_result_json


class TestGetResultJson:
    """get_result_json 响应格式测试"""

    def test_success_with_data(self):
        result = get_result_json(True, {"key": "value"})
        assert result == {"success": True, "data": {"key": "value"}}

    def test_success_without_data(self):
        result = get_result_json(True)
        assert result == {"success": True}

    def test_failure_with_error(self):
        result = get_result_json(False, error="something broke")
        assert result == {"success": False, "error": "something broke"}

    def test_failure_with_data_and_error(self):
        result = get_result_json(False, {"detail": 42}, error="bad")
        assert result["success"] is False
        assert result["error"] == "bad"
        assert result["data"]["detail"] == 42

    def test_success_true_only(self):
        result = get_result_json(True)
        assert "error" not in result

    def test_error_key_absent_when_none(self):
        result = get_result_json(True, data="ok", error=None)
        assert "error" not in result


class TestApiHandlerDecorator:
    """api_handler 装饰器行为测试"""

    def _run(self, coro):
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(coro)
        finally:
            loop.close()

    def test_decorator_returns_wrapper(self):
        """装饰器返回的是 wrapper 函数，不是原函数"""
        @api_handler("测试")
        async def handler(request):
            return "ok"
        assert callable(handler)

    def test_wrapper_preserves_name(self):
        """装饰器保留原函数名"""
        @api_handler("测试")
        async def my_handler(request):
            return "ok"
        assert my_handler.__name__ == "my_handler"

    def test_wrapper_preserves_docstring(self):
        """装饰器保留原函数 docstring"""
        @api_handler("测试")
        async def handler(request):
            """这是文档"""
            return "ok"
        assert handler.__doc__ == "这是文档"

    def test_successful_return_calls_json_response(self):
        """正常返回时调用 web.json_response"""
        from promptcraft.api_routes import web
        call_count_before = web.json_response.call_count

        @api_handler("测试")
        async def handler(request):
            return {"name": "test"}

        request = MagicMock()
        self._run(handler(request))
        assert web.json_response.call_count > call_count_before

    def test_value_error_calls_json_response_with_400(self):
        """ValueError 时调用 web.json_response(status=400)"""
        from promptcraft.api_routes import web
        call_count_before = web.json_response.call_count

        @api_handler("测试")
        async def handler(request):
            raise ValueError("bad input")

        request = MagicMock()
        self._run(handler(request))
        assert web.json_response.call_count > call_count_before
        last_call = web.json_response.call_args
        assert last_call.kwargs.get("status") == 400 or (len(last_call.args) > 1 and last_call.args[1] == 400)

    def test_generic_error_calls_json_response_with_500(self):
        """通用异常时调用 web.json_response(status=500)"""
        from promptcraft.api_routes import web
        call_count_before = web.json_response.call_count

        @api_handler("测试")
        async def handler(request):
            raise RuntimeError("unexpected")

        request = MagicMock()
        self._run(handler(request))
        assert web.json_response.call_count > call_count_before
        last_call = web.json_response.call_args
        assert last_call.kwargs.get("status") == 500 or (len(last_call.args) > 1 and last_call.args[1] == 500)
