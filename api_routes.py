"""
Moton's Prompt Enhancer 设置面板 API 路由
注册 ComfyUI 路由，提供配置读写接口
注意：文件名改为 api_routes.py 避免与 ComfyUI 内置 server 模块冲突
"""

import json
import asyncio
import threading
from aiohttp import web
from server import PromptServer
from .config_manager import config_manager
from .llm_client import LLMClient
import os
import traceback

# API 前缀
API_PREFIX = "/moton_prompt_enhancer/api"

PREFIX = "[PromptCraft]"


def get_result_json(success: bool, data=None, error: str = None) -> dict:
    """构建标准响应"""
    result = {"success": success}
    if data is not None:
        result["data"] = data
    if error:
        result["error"] = error
    return result


# ==================== 设置摘要 API ====================

@PromptServer.instance.routes.get(f"{API_PREFIX}/settings")
async def get_all_settings(request):
    """获取全部配置（API Key 掩码）"""
    try:
        settings = config_manager.get_all_settings()
        return web.json_response(get_result_json(True, settings))
    except Exception as e:
        print(f"{PREFIX} 获取设置失败: {e}")
        return web.json_response(get_result_json(False, error=str(e)), status=500)


# ==================== LLM 配置 API ====================

@PromptServer.instance.routes.get(f"{API_PREFIX}/llm")
async def get_llm_config(request):
    """获取 LLM 配置（API Key 掩码）"""
    try:
        settings = config_manager.get_all_settings()
        return web.json_response(get_result_json(True, settings["llm"]))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/llm")
async def update_llm_config(request):
    """更新 LLM 配置"""
    try:
        data = await request.json()
        llm = config_manager.load_llm_config()

        for key in ["enabled", "api_url", "model",
                     "temperature", "max_tokens", "alternative_models"]:
            if key in data:
                llm[key] = data[key]

        # api_key 仅在提供非空值时更新（允许部分更新）
        if "api_key" in data and data["api_key"]:
            llm["api_key"] = data["api_key"]

        success = config_manager.save_llm_config(llm)
        if success:
            print(f"{PREFIX} LLM 配置已更新")
            return web.json_response(get_result_json(True))
        return web.json_response(get_result_json(False, error="保存失败"), status=500)
    except Exception as e:
        print(f"{PREFIX} 更新 LLM 配置失败: {e}")
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/llm/test")
async def test_llm_connection(request):
    """测试 LLM 连接"""
    try:
        client = LLMClient(config_manager)
        success, msg = client.test_connection()
        return web.json_response(get_result_json(success, {"message": msg}))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)))


# ==================== System Prompt API ====================

@PromptServer.instance.routes.get(f"{API_PREFIX}/system_prompt")
async def get_system_prompt(request):
    """获取 System Prompt 配置"""
    try:
        sp = config_manager.load_llm_system_prompt()
        return web.json_response(get_result_json(True, sp))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/system_prompt")
async def update_system_prompt(request):
    """更新 System Prompt 配置"""
    try:
        data = await request.json()
        sp = config_manager.load_llm_system_prompt()
        for key in ["sfw_rules", "nsfw_rules", "sfw_enabled", "nsfw_enabled"]:
            if key in data:
                sp[key] = data[key]
        success = config_manager.save_llm_system_prompt(sp)
        if success:
            return web.json_response(get_result_json(True))
        return web.json_response(get_result_json(False, error="保存失败"), status=500)
    except Exception as e:
        print(f"{PREFIX} 更新 System Prompt 失败: {e}")
        return web.json_response(get_result_json(False, error=str(e)), status=500)


# ==================== Prompt 库 API ====================

@PromptServer.instance.routes.get(f"{API_PREFIX}/library/sfw")
async def get_sfw_library(request):
    """获取 SFW Prompt 库"""
    try:
        sfw = config_manager.load_sfw_library()
        return web.json_response(get_result_json(True, sfw))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/library/sfw")
async def update_sfw_library(request):
    """更新 SFW Prompt 库"""
    try:
        data = await request.json()
        success = config_manager.save_sfw_library(data)
        if success:
            print(f"{PREFIX} SFW Prompt 库已更新")
            return web.json_response(get_result_json(True))
        return web.json_response(get_result_json(False, error="保存失败"), status=500)
    except Exception as e:
        print(f"{PREFIX} 更新 SFW 库失败: {e}")
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.get(f"{API_PREFIX}/library/nsfw")
async def get_nsfw_library(request):
    """获取 NSFW Prompt 库"""
    try:
        nsfw = config_manager.load_nsfw_library()
        return web.json_response(get_result_json(True, nsfw))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/library/nsfw")
async def update_nsfw_library(request):
    """更新 NSFW Prompt 库"""
    try:
        data = await request.json()
        success = config_manager.save_nsfw_library(data)
        if success:
            print(f"{PREFIX} NSFW Prompt 库已更新")
            return web.json_response(get_result_json(True))
        return web.json_response(get_result_json(False, error="保存失败"), status=500)
    except Exception as e:
        print(f"{PREFIX} 更新 NSFW 库失败: {e}")
        return web.json_response(get_result_json(False, error=str(e)), status=500)


# ==================== 库缓存重载 API ====================

@PromptServer.instance.routes.post(f"{API_PREFIX}/library/sfw_reload")
async def reload_sfw_library(request):
    """强制重载 SFW Prompt 库缓存"""
    try:
        config_manager.load_sfw_library(force_reload=True)
        print(f"{PREFIX} SFW Prompt 库缓存已重载")
        return web.json_response(get_result_json(True, {"message": "SFW 库缓存已重载"}))
    except Exception as e:
        print(f"{PREFIX} 重载 SFW 库失败: {e}")
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/library/nsfw_reload")
async def reload_nsfw_library(request):
    """强制重载 NSFW Prompt 库缓存"""
    try:
        config_manager.load_nsfw_library(force_reload=True)
        print(f"{PREFIX} NSFW Prompt 库缓存已重载")
        return web.json_response(get_result_json(True, {"message": "NSFW 库缓存已重载"}))
    except Exception as e:
        print(f"{PREFIX} 重载 NSFW 库失败: {e}")
        return web.json_response(get_result_json(False, error=str(e)), status=500)


# ==================== 负面 Prompt 编辑器 API ====================

@PromptServer.instance.routes.get(f"{API_PREFIX}/negative_prompt")
async def get_negative_prompt(request):
    """获取用户自定义负面提示词"""
    try:
        content = config_manager.load_negative_prompt()
        return web.json_response(get_result_json(True, {"content": content}))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/negative_prompt")
async def update_negative_prompt(request):
    """更新用户自定义负面提示词"""
    try:
        data = await request.json()
        content = data.get("content", "")
        success = config_manager.save_negative_prompt(content)
        if success:
            print(f"{PREFIX} 负面提示词已更新")
            return web.json_response(get_result_json(True))
        return web.json_response(get_result_json(False, error="保存失败"), status=500)
    except Exception as e:
        print(f"{PREFIX} 更新负面提示词失败: {e}")
        return web.json_response(get_result_json(False, error=str(e)), status=500)


# ==================== AI 聊天 API ====================

@PromptServer.instance.routes.post(f"{API_PREFIX}/chat")
async def chat_endpoint(request):
    """
    流式聊天端点
    接收: {"messages": [...], "temperature": 0.7, "max_tokens": 1000}
    返回: SSE text/event-stream 流式响应
    """
    try:
        body = await request.json()
        messages = body.get("messages", [])
        temperature = body.get("temperature")
        max_tokens = body.get("max_tokens", 1000)

        if not messages:
            return web.json_response(
                get_result_json(False, error="未提供消息"), status=400
            )

        client = LLMClient(config_manager)
        client._load_config()

        if not client.is_enabled():
            return web.json_response(
                get_result_json(False, error="LLM 未启用或配置不完整"), status=400
            )

        # SSE 流式响应
        resp = web.StreamResponse(status=200, headers={
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        })
        await resp.prepare(request)

        # 在后台线程中运行阻塞的 LLM 调用，通过 Queue 传递 chunk
        loop = asyncio.get_event_loop()
        queue = asyncio.Queue()

        def _call_llm():
            try:
                for chunk in client.chat_stream(messages, temperature, max_tokens):
                    loop.call_soon_threadsafe(queue.put_nowait, chunk)
            finally:
                loop.call_soon_threadsafe(queue.put_nowait, None)  # 结束标记

        t = threading.Thread(target=_call_llm, daemon=True)
        t.start()

        while True:
            chunk = await queue.get()
            if chunk is None:
                break
            payload = json.dumps({"content": chunk}, ensure_ascii=False)
            await resp.write(f"data: {payload}\n\n".encode("utf-8"))

        await resp.write(b"data: [DONE]\n\n")
        await resp.write_eof()
        return resp

    except Exception as e:
        print(f"{PREFIX} 聊天错误: {e}")
        traceback.print_exc()
        return web.json_response(get_result_json(False, error=str(e)), status=500)


# ==================== AI Agent API ====================

@PromptServer.instance.routes.post(f"{API_PREFIX}/agent")
async def agent_endpoint(request):
    """
    Agent 模式端点 — 使用 agent 类别的服务配置
    """
    try:
        body = await request.json()
        instruction = body.get("instruction", "").strip()
        current_state = body.get("current_state", {})

        if not instruction:
            return web.json_response(
                get_result_json(False, error="未提供指令"), status=400
            )

        client = LLMClient.for_category(config_manager, "agent")

        if not client.is_enabled():
            return web.json_response(
                get_result_json(False, error="Agent LLM 未启用或配置不完整"), status=400
            )

        result = client.agent_call(current_state, instruction)

        if result is None:
            return web.json_response(
                get_result_json(False, error="Agent 调用失败，请检查配置"), status=500
            )

        return web.json_response(get_result_json(True, {"response": result}))

    except Exception as e:
        print(f"{PREFIX} Agent 错误: {e}")
        traceback.print_exc()
        return web.json_response(get_result_json(False, error=str(e)), status=500)


# ==================== 多服务管理 API ====================

@PromptServer.instance.routes.get(f"{API_PREFIX}/services")
async def api_get_services(request):
    """获取所有服务（key 脱敏）"""
    try:
        cfg = config_manager.load_services_config()
        return web.json_response(get_result_json(True, {
            "services": config_manager.get_all_services(),
            "current": cfg.get("current", {}),
        }))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/services")
async def api_create_service(request):
    """创建新服务"""
    try:
        data = await request.json()
        svc_id = config_manager.create_service(
            data.get("name", "新服务"),
            data.get("api_url", ""),
            data.get("api_key", ""),
        )
        return web.json_response(get_result_json(True, {"id": svc_id}))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.put(f"{API_PREFIX}/services/{{service_id}}")
async def api_update_service(request):
    """更新服务"""
    try:
        svc_id = request.match_info["service_id"]
        data = await request.json()
        ok = config_manager.update_service(svc_id, data)
        if ok:
            return web.json_response(get_result_json(True))
        return web.json_response(get_result_json(False, error="服务不存在"), status=404)
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.delete(f"{API_PREFIX}/services/{{service_id}}")
async def api_delete_service(request):
    """删除服务"""
    try:
        svc_id = request.match_info["service_id"]
        ok = config_manager.delete_service(svc_id)
        if ok:
            return web.json_response(get_result_json(True))
        return web.json_response(get_result_json(False, error="无法删除（至少保留一个服务）"), status=400)
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.put(f"{API_PREFIX}/services/current")
async def api_set_current_service(request):
    """设置类别对应服务"""
    try:
        data = await request.json()
        category = data.get("category", "")
        service_id = data.get("service_id", "")
        model = data.get("model", "")
        ok = config_manager.set_current_service(category, service_id, model)
        if ok:
            return web.json_response(get_result_json(True))
        return web.json_response(get_result_json(False, error="无效类别"), status=400)
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/services/{{service_id}}/test")
async def api_test_service(request):
    """测试指定服务连接（支持内联配置覆盖）"""
    try:
        svc_id = request.match_info["service_id"]
        body = await request.json() if request.content_type == 'application/json' else {}
        inline_config = body.get("config")
        if inline_config:
            # Test with provided config (for when user modified API key before saving)
            from .llm_client import LLMClient
            inline_config["enabled"] = True
            client = LLMClient(service_config=inline_config)
            success, msg = client.test_connection()
        else:
            success, msg = config_manager.test_service_connection(svc_id)
        return web.json_response(get_result_json(success, {"message": msg}))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


# ==================== Prompt 历史 API ====================

@PromptServer.instance.routes.get(f"{API_PREFIX}/prompt_history")
async def api_get_prompt_history(request):
    """获取 prompt 历史记录"""
    try:
        data = config_manager.load_prompt_history()
        return web.json_response(get_result_json(True, data))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/prompt_history")
async def api_add_prompt_history(request):
    """添加 prompt 历史记录"""
    try:
        body = await request.json()
        positive = body.get("positive_prompt", "")
        negative = body.get("negative_prompt", "")
        extra = body.get("extra")
        ok = config_manager.add_prompt_history(positive, negative, extra)
        return web.json_response(get_result_json(ok))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.delete(f"{API_PREFIX}/prompt_history/{{entry_id}}")
async def api_delete_prompt_history(request):
    """删除单条 prompt 历史"""
    try:
        entry_id = request.match_info["entry_id"]
        ok = config_manager.delete_prompt_history(entry_id)
        return web.json_response(get_result_json(ok))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.delete(f"{API_PREFIX}/prompt_history")
async def api_clear_prompt_history(request):
    """清空 prompt 历史"""
    try:
        ok = config_manager.clear_prompt_history()
        return web.json_response(get_result_json(ok))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.put(f"{API_PREFIX}/prompt_history/limit")
async def api_set_history_limit(request):
    """设置 prompt 历史上限"""
    try:
        body = await request.json()
        limit = body.get("limit", 50)
        ok = config_manager.set_history_limit(limit)
        return web.json_response(get_result_json(ok))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


# ==================== LoRA 收藏 API ====================

@PromptServer.instance.routes.get(f"{API_PREFIX}/lora_favorites")
async def api_get_lora_favorites(request):
    """获取 LoRA 收藏列表"""
    try:
        favorites = config_manager.load_lora_favorites()
        return web.json_response(get_result_json(True, favorites))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/lora_favorites/toggle")
async def api_toggle_lora_favorite(request):
    """切换 LoRA 收藏状态"""
    try:
        body = await request.json()
        lora_path = body.get("lora", "").strip()
        if not lora_path:
            return web.json_response(get_result_json(False, error="缺少 lora 参数"), status=400)
        is_fav = config_manager.toggle_lora_favorite(lora_path)
        return web.json_response(get_result_json(True, {"favorited": is_fav}))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


print(f"{PREFIX} LoRA 群组管理 API 路由已注册")
print(f"{PREFIX} LoRA Prompt 管理 API 路由已注册")
print(f"{PREFIX} 设置面板 API 路由已注册: {API_PREFIX}")

from .lora_group_manager import lora_group_manager
from .lora_scanner import LoraScanner


@PromptServer.instance.routes.get(f"{API_PREFIX}/lora_groups")
async def api_get_lora_groups(request):
    """获取所有群组摘要"""
    try:
        summary = lora_group_manager.get_group_summary()
        return web.json_response(get_result_json(True, summary))
    except Exception as e:
        print(f"{PREFIX} 获取群组列表失败: {e}")
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.get(f"{API_PREFIX}/lora_groups/{{name}}")
async def api_get_lora_group(request):
    """获取单个群组详情"""
    try:
        group_name = request.match_info["name"]
        from urllib.parse import unquote
        group_name = unquote(group_name)
        group = lora_group_manager.get_group(group_name)
        if group is None:
            return web.json_response(
                get_result_json(False, error=f"群组 '{group_name}' 不存在"), status=404)
        return web.json_response(get_result_json(True, group))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/lora_groups/create")
async def api_create_lora_group(request):
    """创建群组"""
    try:
        data = await request.json()
        name = data.get("name", "").strip()
        if not name:
            return web.json_response(get_result_json(False, error="名称不能为空"), status=400)
        lora_group_manager.create_group(name, data.get("description", ""))
        print(f"{PREFIX} 创建群组: {name}")
        return web.json_response(get_result_json(True))
    except ValueError as e:
        return web.json_response(get_result_json(False, error=str(e)), status=400)
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/lora_groups/rename")
async def api_rename_lora_group(request):
    """重命名群组"""
    try:
        data = await request.json()
        old_name = data.get("old_name", "").strip()
        new_name = data.get("new_name", "").strip()
        if not old_name or not new_name:
            return web.json_response(get_result_json(False, error="名称不能为空"), status=400)
        lora_group_manager.rename_group(old_name, new_name)
        print(f"{PREFIX} 重命名群组: {old_name} → {new_name}")
        return web.json_response(get_result_json(True))
    except ValueError as e:
        return web.json_response(get_result_json(False, error=str(e)), status=400)
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/lora_groups/delete")
async def api_delete_lora_group(request):
    """删除群组"""
    try:
        data = await request.json()
        name = data.get("name", "").strip()
        if not name:
            return web.json_response(get_result_json(False, error="名称不能为空"), status=400)
        lora_group_manager.delete_group(name)
        print(f"{PREFIX} 删除群组: {name}")
        return web.json_response(get_result_json(True))
    except ValueError as e:
        return web.json_response(get_result_json(False, error=str(e)), status=400)
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/lora_groups/add_lora")
async def api_add_lora_to_group(request):
    """向群组添加 LoRA"""
    try:
        data = await request.json()
        group = data.get("group", "").strip()
        lora = data.get("lora", "").strip()
        if not group or not lora:
            return web.json_response(get_result_json(False, error="参数不完整"), status=400)
        lora_group_manager.add_lora(
            group, lora,
            weight=data.get("weight", 1.0),
            clip_weight=data.get("clip_weight", 1.0)
        )
        return web.json_response(get_result_json(True))
    except ValueError as e:
        return web.json_response(get_result_json(False, error=str(e)), status=400)
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/lora_groups/remove_lora")
async def api_remove_lora_from_group(request):
    """从群组移除 LoRA"""
    try:
        data = await request.json()
        group = data.get("group", "").strip()
        lora = data.get("lora", "").strip()
        if not group or not lora:
            return web.json_response(get_result_json(False, error="参数不完整"), status=400)
        lora_group_manager.remove_lora(group, lora)
        return web.json_response(get_result_json(True))
    except ValueError as e:
        return web.json_response(get_result_json(False, error=str(e)), status=400)
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/lora_groups/update_lora")
async def api_update_lora_in_group(request):
    """更新群组中 LoRA 的属性"""
    try:
        data = await request.json()
        group = data.get("group", "").strip()
        lora = data.get("lora", "").strip()
        if not group or not lora:
            return web.json_response(get_result_json(False, error="参数不完整"), status=400)
        updates = {}
        for key in ("weight", "clip_weight", "enabled", "note"):
            if key in data:
                updates[key] = data[key]
        lora_group_manager.update_lora(group, lora, **updates)
        return web.json_response(get_result_json(True))
    except ValueError as e:
        return web.json_response(get_result_json(False, error=str(e)), status=400)
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/lora_groups/reorder")
async def api_reorder_loras(request):
    """重排群组内 LoRA 顺序"""
    try:
        data = await request.json()
        group = data.get("group", "").strip()
        order = data.get("order", [])
        if not group:
            return web.json_response(get_result_json(False, error="群组名不能为空"), status=400)
        lora_group_manager.reorder_loras(group, order)
        return web.json_response(get_result_json(True))
    except ValueError as e:
        return web.json_response(get_result_json(False, error=str(e)), status=400)
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


# ==================== LoRA 扫描 API ====================

@PromptServer.instance.routes.get(f"{API_PREFIX}/lora_scan/list")
async def api_lora_list(request):
    """全量 LoRA 列表"""
    try:
        return web.json_response(get_result_json(True, LoraScanner.list_all()))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.get(f"{API_PREFIX}/lora_scan/folders")
async def api_lora_folders(request):
    """文件夹树"""
    try:
        return web.json_response(get_result_json(True, LoraScanner.list_folders()))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.get(f"{API_PREFIX}/lora_scan/search")
async def api_lora_search(request):
    """模糊搜索"""
    try:
        q = request.query.get("q", "")
        return web.json_response(get_result_json(True, LoraScanner.search(q)))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.get(f"{API_PREFIX}/lora_scan/metadata")
async def api_lora_metadata(request):
    """单个 LoRA 元数据"""
    try:
        name = request.query.get("name", "")
        if not name:
            return web.json_response(get_result_json(False, error="缺少 name 参数"), status=400)
        return web.json_response(get_result_json(True, LoraScanner.get_metadata(name)))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.get(f"{API_PREFIX}/lora_scan/info")
async def api_lora_info(request):
    """获取 LoRA 完整信息（hash、训练词等），带 sidecar 缓存"""
    try:
        name = request.query.get("name", "")
        if not name:
            return web.json_response(get_result_json(False, error="缺少 name 参数"), status=400)
        return web.json_response(get_result_json(True, LoraScanner.get_lora_info(name)))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


# ==================== LoRA Prompt 管理 API ====================

from .lora_prompt_manager import lora_prompt_manager


@PromptServer.instance.routes.get(f"{API_PREFIX}/lora_prompts")
async def api_get_all_lora_prompts(request):
    """获取全部 LoRA prompt 配置"""
    try:
        data = lora_prompt_manager.load_all()
        return web.json_response(get_result_json(True, data))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.get(f"{API_PREFIX}/lora_prompts/{{lora_path}}")
async def api_get_lora_prompts(request):
    """获取单个 LoRA 的 prompt 组"""
    try:
        from urllib.parse import unquote
        lora_path = unquote(request.match_info["lora_path"])
        data = lora_prompt_manager.get_lora_prompts(lora_path)
        return web.json_response(get_result_json(True, data))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/lora_prompts/{{lora_path}}")
async def api_set_lora_prompts(request):
    """设置某个 LoRA 的全部 prompt 组"""
    try:
        from urllib.parse import unquote
        lora_path = unquote(request.match_info["lora_path"])
        data = await request.json()
        groups = data.get("groups", [])
        lora_prompt_manager.set_lora_prompts(lora_path, groups)
        return web.json_response(get_result_json(True))
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/lora_prompts/{{lora_path}}/add_group")
async def api_add_lora_prompt_group(request):
    """为 LoRA 添加 prompt 组"""
    try:
        from urllib.parse import unquote
        lora_path = unquote(request.match_info["lora_path"])
        data = await request.json()
        name = data.get("name", "").strip()
        if not name:
            return web.json_response(get_result_json(False, error="组名不能为空"), status=400)
        lora_prompt_manager.add_group(
            lora_path, name,
            prompts=data.get("prompts", []),
            negative=data.get("negative", ""),
        )
        return web.json_response(get_result_json(True))
    except ValueError as e:
        return web.json_response(get_result_json(False, error=str(e)), status=400)
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.post(f"{API_PREFIX}/lora_prompts/{{lora_path}}/update_group")
async def api_update_lora_prompt_group(request):
    """更新 LoRA 的 prompt 组"""
    try:
        from urllib.parse import unquote
        lora_path = unquote(request.match_info["lora_path"])
        data = await request.json()
        group_name = data.get("group_name", "").strip()
        if not group_name:
            return web.json_response(get_result_json(False, error="组名不能为空"), status=400)
        updates = {}
        for key in ("name", "prompts", "negative"):
            if key in data:
                updates[key] = data[key]
        lora_prompt_manager.update_group(lora_path, group_name, **updates)
        return web.json_response(get_result_json(True))
    except ValueError as e:
        return web.json_response(get_result_json(False, error=str(e)), status=400)
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


@PromptServer.instance.routes.delete(f"{API_PREFIX}/lora_prompts/{{lora_path}}/group/{{group_name}}")
async def api_delete_lora_prompt_group(request):
    """删除 LoRA 的 prompt 组"""
    try:
        from urllib.parse import unquote
        lora_path = unquote(request.match_info["lora_path"])
        group_name = unquote(request.match_info["group_name"])
        lora_prompt_manager.delete_group(lora_path, group_name)
        return web.json_response(get_result_json(True))
    except ValueError as e:
        return web.json_response(get_result_json(False, error=str(e)), status=400)
    except Exception as e:
        return web.json_response(get_result_json(False, error=str(e)), status=500)


print(f"{PREFIX} LoRA 群组管理 API 路由已注册")
print(f"{PREFIX} LoRA Prompt 管理 API 路由已注册")
print(f"{PREFIX} 设置面板 API 路由已注册: {API_PREFIX}")
