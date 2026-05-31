"""
LLM客户端 - 支持OpenAI兼容API
支持：OpenAI兼容端口自行加载api等
使用 config_manager 统一管理配置
V1.2.1 — 使用 httpx 实现可中断的 API 调用
V1.3.0_Beta1 — 增强思维链控制逻辑，添加详细日志
"""

import json
import re
import httpx
import traceback
from pathlib import Path


class LLMClient:
    """OpenAI兼容的LLM客户端"""

    def __init__(self, config_manager=None, service_config=None):
        """
        初始化LLM客户端

        Args:
            config_manager: ConfigManager 实例，用于持久化配置管理
            service_config: 直接传入的服务配置（多服务模式）
        """
        self._config_manager = config_manager
        if service_config:
            self.config = service_config
        else:
            self.config = self._load_config()

    @classmethod
    def for_category(cls, config_manager, category: str):
        """工厂：为指定类别（enhance/agent）创建 LLMClient"""
        svc_config = config_manager.get_current_service_config(category)
        return cls(config_manager, service_config=svc_config)

    def _load_config(self):
        """加载LLM配置（优先从 config_manager，回退到直接读文件）并更新 self.config"""
        if self._config_manager:
            self.config = self._config_manager.load_llm_config()
        else:
            # 回退逻辑（兼容旧用法）
            try:
                config_path = Path(__file__).parent / "data" / "llm_config.json"
                with open(config_path, "r", encoding="utf-8") as f:
                    self.config = json.load(f)
            except Exception as e:
                print(f"[LLMClient] 加载配置失败: {e}")
                self.config = {
                    "enabled": False,
                    "api_url": "",
                    "api_key": "",
                    "model": "",
                    "temperature": 0.7,
                    "max_tokens": 300,
                    "system_prompt": ""
                }
        return self.config

    def save_config(self, config_dict):
        """保存LLM配置（通过 config_manager 或直接写文件）"""
        try:
            if self._config_manager:
                success = self._config_manager.save_llm_config(config_dict)
                if success:
                    self.config = config_dict
                    return True, "配置已保存"
                return False, "写入失败"
            # 回退逻辑
            config_path = Path(__file__).parent / "data" / "llm_config.json"
            config_path.parent.mkdir(parents=True, exist_ok=True)
            with open(config_path, "w", encoding="utf-8") as f:
                json.dump(config_dict, f, ensure_ascii=False, indent=2)
            self.config = config_dict
            return True, "配置已保存"
        except Exception as e:
            return False, str(e)

    def is_enabled(self):
        """检查LLM是否已启用且配置完整"""
        if not self.config.get("enabled", False):
            return False
        if not self.config.get("api_url", "").strip():
            return False
        if not self.config.get("api_key", "").strip():
            return False
        return True

    def get_config_value(self, key, default=None):
        """获取配置项"""
        return self.config.get(key, default)

    def set_config_value(self, key, value):
        """设置配置项"""
        self.config[key] = value

    def _prepare_thinking_params(self, model: str) -> dict:
        """
        准备思维链控制参数

        Args:
            model: 模型名称

        Returns:
            思维链控制参数字典
        """
        from .thinking_control import build_thinking_suppression

        disable_thinking = self.config.get("disable_thinking", True)
        if not disable_thinking:
            return {}

        # 获取激进模式设置
        aggressive = self.config.get("aggressive_thinking_control", False)

        # 获取思维链控制参数
        thinking_params = build_thinking_suppression(model, disable_thinking=True, aggressive=aggressive)

        # 检查用户自定义参数（服务级别）
        custom_params = self.config.get("custom_thinking_params")
        if custom_params and isinstance(custom_params, dict):
            thinking_params.update(custom_params)
            print(f"[LLMClient] 应用用户自定义参数: {custom_params}")

        return thinking_params

    def _filter_content(self, content: str) -> str:
        """
        过滤思维链内容

        Args:
            content: 原始内容

        Returns:
            过滤后的内容
        """
        from .thinking_control import filter_thinking_content

        filter_output = self.config.get("filter_thinking_output", True)
        if not filter_output:
            return content

        original_content = content
        content = filter_thinking_content(content)

        # 记录过滤效果
        if content != original_content:
            print(f"[LLMClient] 思维链过滤: {len(original_content)} -> {len(content)} 字符")

        return content

    def enhance_prompt(self, base_prompt, is_detailed=False, llm_hint="", lora_tags=""):
        """
        使用LLM增强prompt

        Args:
            base_prompt: 基础prompt（已包含库中随机选取的标签）
            is_detailed: 是否使用详细扩写规则（对应NSFW system prompt）
            llm_hint: 用户对LLM的特殊要求提示词
            lora_tags: LoRA 标签字符串（已用 /// 包裹），需原样保留在输出中

        Returns:
            enhanced_prompt: 增强后的prompt（纯英文标签）
            None: 调用失败时返回None
        """
        if not self.is_enabled():
            print("[LLMClient] LLM未启用或配置不完整")
            return None

        api_url = self.config["api_url"].strip()
        api_key = self.config["api_key"].strip()
        model = self.config.get("model", "").strip()
        temperature = self.config.get("temperature", 0.7)
        max_tokens = self.config.get("max_tokens", 300)
        # 优先从 config_manager 获取有效的 system_prompt（基础扩写=SFW / 详细扩写=NSFW）
        if self._config_manager:
            system_prompt = self._config_manager.get_effective_system_prompt(is_nsfw=is_detailed)
            if not system_prompt:
                system_prompt = self.config.get("system_prompt", "")
        else:
            system_prompt = self.config.get("system_prompt", "")

        # 动态注入 LoRA 标记保护指令（兼容用户自定义 system prompt）
        if lora_tags:
            system_prompt += " Content wrapped in triple-slash markers (///...///) are immutable LoRA trigger words — you MUST copy them verbatim into your output in their original position without any modification, reordering, or omission."

        if not api_url or not api_key:
            print("[LLMClient] API URL或API Key为空")
            return None

        # 自动补全 /chat/completions 路径（兼容只填 base URL 的用户）
        if not api_url.endswith("/chat/completions"):
            api_url = api_url.rstrip("/") + "/chat/completions"

        user_message = f"Enhance this image generation prompt with richer details:\n\n{base_prompt}"
        if lora_tags:
            user_message += f"\n\nThe following LoRA trigger words are marked with /// and MUST be preserved exactly as-is in your output:\n{lora_tags}"
        if llm_hint and llm_hint.strip():
            user_message += f"\n\nAdditional requirements from the user:\n{llm_hint.strip()}"

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        # 思维链关闭参数
        thinking_params = self._prepare_thinking_params(model)
        if thinking_params:
            payload.update(thinking_params)
            print(f"[LLMClient] 已应用思维链控制参数: {thinking_params}")

        try:

            # 使用 httpx 发送请求，支持中断检测
            with httpx.Client(timeout=httpx.Timeout(30.0, connect=10.0)) as client:
                resp = client.post(
                    api_url,
                    json=payload,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {api_key}"
                    }
                )
                resp.raise_for_status()
                result = resp.json()

            if "choices" in result and len(result["choices"]) > 0:
                msg = result["choices"][0].get("message", {})
                content = msg.get("content", "") or ""
                # DeepSeek reasoning models fallback
                if not content.strip():
                    content = msg.get("reasoning_content", "") or ""
                    if content.strip():
                        print("[LLMClient] 使用 reasoning_content 字段")
                if content.strip():
                    # 过滤思维链输出
                    content = self._filter_content(content)
                    return content.strip()

            print(f"[LLMClient] API响应格式异常: {json.dumps(result, ensure_ascii=False)[:300]}")
            return None

        except httpx.TimeoutException as e:
            print(f"[LLMClient] 请求超时: {e}")
            return None
        except httpx.HTTPStatusError as e:
            print(f"[LLMClient] HTTP错误 {e.response.status_code}: {e.response.text[:500]}")
            return None
        except httpx.RequestError as e:
            print(f"[LLMClient] 网络错误: {e}")
            return None
        except Exception as e:
            print(f"[LLMClient] 未知错误: {e}")
            traceback.print_exc()
            return None

    def test_connection(self):
        """
        测试LLM连接是否正常

        Returns:
            (success, message): 是否成功和消息
        """
        if not self.is_enabled():
            return False, "LLM未启用或配置不完整"

        api_url = self.config["api_url"].strip()
        api_key = self.config["api_key"].strip()
        model = self.config.get("model", "").strip()

        # 自动补全 /chat/completions 路径（兼容只填 base URL 的用户）
        if not api_url.endswith("/chat/completions"):
            api_url = api_url.rstrip("/") + "/chat/completions"

        payload = {
            "model": model,
            "messages": [
                {"role": "user", "content": "Hello, respond with just 'OK'."}
            ],
            "max_tokens": 10
        }

        # 测试时也应用思维链控制
        thinking_params = self._prepare_thinking_params(model)
        if thinking_params:
            payload.update(thinking_params)

        try:
            with httpx.Client(timeout=httpx.Timeout(15.0, connect=10.0)) as client:
                resp = client.post(
                    api_url,
                    json=payload,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {api_key}"
                    }
                )
                resp.raise_for_status()

            return True, f"连接成功! 模型: {model}"

        except httpx.TimeoutException as e:
            return False, f"请求超时: {e}"
        except httpx.HTTPStatusError as e:
            return False, f"HTTP {e.response.status_code}: {e.response.text[:300]}"
        except httpx.RequestError as e:
            return False, f"网络错误: {e}"
        except Exception as e:
            return False, str(e)

    def chat_stream(self, messages, temperature=None, max_tokens=None):
        """
        流式聊天，逐块 yield 内容

        Args:
            messages: [{"role": "user"/"assistant"/"system", "content": "..."}]
            temperature: 覆盖配置中的 temperature（可选）
            max_tokens: 覆盖配置中的 max_tokens（可选）

        Yields:
            str: LLM 响应的内容块
        """
        if not self.is_enabled():
            yield "[Error: LLM 未启用或配置不完整]"
            return

        api_url = self.config["api_url"].strip()
        api_key = self.config["api_key"].strip()
        model = self.config.get("model", "").strip()

        if not api_url.endswith("/chat/completions"):
            api_url = api_url.rstrip("/") + "/chat/completions"

        payload = {
            "model": model,
            "messages": messages,
            "stream": True,
            "temperature": temperature if temperature is not None else self.config.get("temperature", 0.7),
            "max_tokens": max_tokens if max_tokens is not None else self.config.get("max_tokens", 1000),
        }

        # 思维链关闭参数
        thinking_params = self._prepare_thinking_params(model)
        if thinking_params:
            payload.update(thinking_params)
            print(f"[LLMClient] 流式请求已应用思维链控制参数: {thinking_params}")

        filter_output = self.config.get("filter_thinking_output", True)

        try:
            with httpx.Client(timeout=httpx.Timeout(120.0, connect=10.0)) as client:
                with client.stream(
                    "POST", api_url, json=payload,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {api_key}"
                    }
                ) as response:
                    response.raise_for_status()
                    has_content = False
                    thinking_buffer = ""  # 用于缓存可能的思维链内容
                    in_thinking = False  # 是否在思维链标签内

                    for line in response.iter_lines():
                        line = line.strip()
                        if not line.startswith("data: "):
                            continue
                        data_str = line[6:]
                        if data_str == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data_str)
                            delta = chunk["choices"][0].get("delta", {})
                            content = delta.get("content", "")

                            if content:
                                has_content = True

                                # 思维链标签检测和过滤
                                if filter_output:
                                    # 检测思维链开始标签
                                    if re.search(r'<(think|thinking|reasoning|thoughts?)>', content, re.IGNORECASE):
                                        in_thinking = True
                                        thinking_buffer += content
                                        continue

                                    # 检测思维链结束标签
                                    if in_thinking:
                                        thinking_buffer += content
                                        if re.search(r'</(think|thinking|reasoning|thoughts?)>', content, re.IGNORECASE):
                                            in_thinking = False
                                            thinking_buffer = ""
                                        continue

                                    # 正常内容，直接输出
                                    yield content
                                else:
                                    yield content
                            elif not has_content:
                                # Fallback: capture reasoning_content if content is empty
                                reasoning = delta.get("reasoning_content", "") or delta.get("reasoning", "")
                                if reasoning and not filter_output:
                                    yield reasoning
                        except (json.JSONDecodeError, KeyError, IndexError):
                            continue

                    # 如果结束时仍在思维链中，说明标签未闭合，丢弃
                    if in_thinking and thinking_buffer:
                        print(f"[LLMClient] 检测到未闭合的思维链标签，已丢弃 {len(thinking_buffer)} 字符")

        except httpx.TimeoutException as e:
            yield f"\n[Error: 请求超时 {e}]"
        except httpx.HTTPStatusError as e:
            yield f"\n[Error: HTTP {e.response.status_code}]"
        except httpx.RequestError as e:
            yield f"\n[Error: 网络错误 {e}]"
        except Exception as e:
            yield f"\n[Error: {e}]"

    def chat(self, messages, temperature=None, max_tokens=None):
        """
        非流式聊天，返回完整响应字符串

        Args:
            messages: [{"role": "user"/"assistant"/"system", "content": "..."}]
            temperature: 覆盖配置中的 temperature（可选）
            max_tokens: 覆盖配置中的 max_tokens（可选）

        Returns:
            str: 完整的 LLM 响应文本
        """
        return "".join(self.chat_stream(messages, temperature, max_tokens))

    def agent_call(self, current_state: dict, instruction: str) -> str:
        """
        Agent 模式调用 — 使用内置 system prompt（前端不可编辑）
        解析自然语言指令，返回结构化操作 JSON

        Args:
            current_state: 当前节点状态（LoRA 栈、checkpoint、类别选择等）
            instruction: 用户自然语言指令

        Returns:
            str: LLM 返回的 JSON 操作指令，失败返回 None
        """
        if not self.is_enabled():
            print("[LLMClient] Agent 调用失败: LLM 未启用")
            return None

        from .agent_prompt import get_agent_system_prompt, build_agent_context

        system_prompt = get_agent_system_prompt()
        user_message = build_agent_context(current_state, instruction)

        api_url = self.config["api_url"].strip()
        api_key = self.config["api_key"].strip()
        model = self.config.get("model", "").strip()
        temperature = self.config.get("temperature", 0.3)
        max_tokens = self.config.get("max_tokens", 500)

        if not api_url.endswith("/chat/completions"):
            api_url = api_url.rstrip("/") + "/chat/completions"

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        # 思维链关闭参数
        thinking_params = self._prepare_thinking_params(model)
        if thinking_params:
            payload.update(thinking_params)
            print(f"[LLMClient] Agent 请求已应用思维链控制参数: {thinking_params}")

        try:
            with httpx.Client(timeout=httpx.Timeout(30.0, connect=10.0)) as client:
                resp = client.post(
                    api_url, json=payload,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {api_key}",
                    }
                )
                resp.raise_for_status()
                result = resp.json()

            if "choices" in result and len(result["choices"]) > 0:
                msg = result["choices"][0].get("message", {})
                content = msg.get("content", "") or ""
                if not content.strip():
                    content = msg.get("reasoning_content", "") or ""
                    if content.strip():
                        print("[LLMClient] Agent 使用 reasoning_content 字段")
                if content.strip():
                    # 过滤思维链输出
                    content = self._filter_content(content)
                    return content.strip()

            print("[LLMClient] Agent 响应格式异常")
            return None

        except httpx.TimeoutException as e:
            print(f"[LLMClient] Agent 调用超时: {e}")
            return None
        except httpx.HTTPStatusError as e:
            print(f"[LLMClient] Agent HTTP错误: {e.response.status_code}")
            return None
        except Exception as e:
            print(f"[LLMClient] Agent 调用错误: {e}")
            return None
