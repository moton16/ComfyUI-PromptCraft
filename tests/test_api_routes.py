"""
API 路由模块测试
覆盖: get_result_json / api_handler 装饰器 / 路由集成
"""

from unittest.mock import MagicMock, patch

import pytest
from promptcraft.api_routes import api_handler, get_result_json


class TestGetResultJson:
    """get_result_json 标准响应构建测试"""

    def test_success_with_data(self):
        result = get_result_json(True, data={"key": "value"})
        assert result == {"success": True, "data": {"key": "value"}}

    def test_error(self):
        result = get_result_json(False, error="something broke")
        assert result == {"success": False, "error": "something broke"}

    def test_no_data(self):
        result = get_result_json(True)
        assert result == {"success": True}
        assert "data" not in result

    def test_no_error(self):
        result = get_result_json(True, data="ok", error=None)
        assert "error" not in result


class TestApiHandler:
    """api_handler 装饰器行为测试"""

    @patch("promptcraft.api_routes.web")
    @pytest.mark.asyncio
    async def test_success_response(self, mock_web):
        """成功时返回 200 且包含 get_result_json(True, data)"""
        @api_handler("test")
        async def handler(request):
            return {"name": "test"}

        request = MagicMock()
        await handler(request)
        mock_web.json_response.assert_called_once()
        args, kwargs = mock_web.json_response.call_args
        assert args[0] == {"success": True, "data": {"name": "test"}}

    @patch("promptcraft.api_routes.web")
    @pytest.mark.asyncio
    async def test_value_error_returns_400(self, mock_web):
        """ValueError 返回 status=400"""
        @api_handler("test")
        async def handler(request):
            raise ValueError("bad input")

        request = MagicMock()
        await handler(request)
        _, kwargs = mock_web.json_response.call_args
        assert kwargs["status"] == 400

    @patch("promptcraft.api_routes.web")
    @pytest.mark.asyncio
    async def test_runtime_error_returns_500(self, mock_web):
        """RuntimeError 返回 status=500"""
        @api_handler("test")
        async def handler(request):
            raise RuntimeError("unexpected")

        request = MagicMock()
        await handler(request)
        _, kwargs = mock_web.json_response.call_args
        assert kwargs["status"] == 500

    @pytest.mark.asyncio
    async def test_preserves_function_name(self):
        """装饰器保留原函数名"""
        @api_handler("test")
        async def my_handler(request):
            return None

        assert my_handler.__name__ == "my_handler"


class TestRouteIntegration:
    """路由函数可调用性集成测试"""

    @patch("promptcraft.api_routes.config_manager")
    def test_get_settings_callable(self, mock_cm):
        from promptcraft.api_routes import get_all_settings
        assert callable(get_all_settings)

    @patch("promptcraft.api_routes.config_manager")
    def test_get_sfw_library_callable(self, mock_cm):
        from promptcraft.api_routes import get_sfw_library
        assert callable(get_sfw_library)

    @patch("promptcraft.api_routes.config_manager")
    def test_get_nsfw_library_callable(self, mock_cm):
        from promptcraft.api_routes import get_nsfw_library
        assert callable(get_nsfw_library)
