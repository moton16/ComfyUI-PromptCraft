"""
api_handler 装饰器测试
覆盖: 成功响应 / ValueError 处理 / 通用异常处理 / 响应格式

V1.4.0: aiohttp 已成为运行时依赖，不再用 sys.modules 级别 mock。
       改为 patch promptcraft.api_routes.web 模块属性。
"""

import asyncio
from unittest.mock import MagicMock, patch

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
        mock_web = MagicMock()
        with patch("promptcraft.api_routes.web", mock_web):
            @api_handler("测试")
            async def handler(request):
                return {"name": "test"}

            request = MagicMock()
            self._run(handler(request))
            assert mock_web.json_response.call_count > 0

    def test_value_error_calls_json_response_with_400(self):
        """ValueError 时调用 web.json_response(status=400)"""
        mock_web = MagicMock()
        with patch("promptcraft.api_routes.web", mock_web):
            @api_handler("测试")
            async def handler(request):
                raise ValueError("bad input")

            request = MagicMock()
            self._run(handler(request))
            assert mock_web.json_response.call_count > 0
            last_call = mock_web.json_response.call_args
            assert last_call.kwargs.get("status") == 400 or (
                len(last_call.args) > 1 and last_call.args[1] == 400
            )

    def test_generic_error_calls_json_response_with_500(self):
        """通用异常时调用 web.json_response(status=500)"""
        mock_web = MagicMock()
        with patch("promptcraft.api_routes.web", mock_web):
            @api_handler("测试")
            async def handler(request):
                raise RuntimeError("unexpected")

            request = MagicMock()
            self._run(handler(request))
            assert mock_web.json_response.call_count > 0
            last_call = mock_web.json_response.call_args
            assert last_call.kwargs.get("status") == 500 or (
                len(last_call.args) > 1 and last_call.args[1] == 500
            )
