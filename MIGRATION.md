# PromptCraft V1.4.0 迁移指南

本文档说明从 V1.3.x 升级到 V1.4.0 的破坏性变更与迁移路径。请在升级前完整阅读本文档，并按章节顺序执行迁移步骤。

> **升级前请务必备份整个 ComfyUI/custom_nodes/PromptCraft 目录与用户配置目录**，以防回滚需要。

---

## 1. 概览

V1.4.0 是一次包含破坏性变更的版本，主要目标包括：

- 统一 prompt 权重语法为 `(tag:weight)` 形式
- API 路由命名规范化
- LLMClient 全异步化以提升并发能力
- 模板与配置文件版本化，支持安全升级
- 单例模式重构，避免多线程下的竞态问题

下表为受影响范围速览：

| 变更项 | 影响范围 | 是否自动迁移 | 备注 |
|--------|----------|--------------|------|
| Prompt 权重语法 | 用户保存的模板、历史记录 | 启动时自动迁移并备份 | 备份为 `*.prompt.bak` |
| API 路由重命名 | 前端、第三方调用方 | 前端已同步，外部需更新 | 见第 3 节 |
| LLMClient 异步化 | 派生类、直接调用方 | 否，需手动改造 | 见第 4 节 |
| 模板版本化 | 模板文件 | 启动时自动覆盖并备份 | 备份为 `*.bak` |
| 单例模式重构 | 派生子类 | 否，需手动改造 | 见第 6 节 |
| pyproject.toml 依赖 | 运行环境 | 安装时自动 | 新增 aiohttp>=3.8.0 |

---

## 2. Prompt 权重语法迁移

### 2.1 旧语法（V1.3.x）

V1.3.x 支持两种风格的权重语法：

```
((tag))              # 加权，权重约 1.1
(((tag:1.5)))        # 强加权，显式权重
[[tag]]              # 减权，权重约 0.9
[[tag:0.5]]          # 强减权，显式权重
```

这种嵌套括号语法与 ComfyUI 原生 prompt 解析存在歧义，且无法稳定表达任意权重值。

### 2.2 新语法（V1.4.0）

V1.4.0 统一为单一形式：

```
(tag:1.5)            # 加权
(tag:0.5)            # 减权
(tag:1.0)            # 等价于无权重，但显式标注
```

权重范围推荐 `[0.1, 1.9]`，超出范围会被解析器截断到该区间。

### 2.3 自动迁移机制

启动时（ComfyUI 加载本插件阶段），`migrate_legacy_prompts.py` 会被调用，扫描以下位置：

- 用户配置目录 `ComfyUI/user/promptcraft/` 下所有 JSON 文件
- 插件 `data/` 目录下的内置模板（仅在首次升级时）

迁移规则：

1. 解析旧语法中的 `((...))` / `[[...]]` 与显式权重
2. 转换为新 `(tag:weight)` 形式
3. **原文件备份为 `*.prompt.bak`**（若已存在同名 `.bak` 则追加数字后缀）
4. 写入新内容

迁移日志会输出到 ComfyUI 主日志，关键字为 `[PromptCraft Migration]`。

### 2.4 手动回滚

若迁移结果不符合预期，可执行回滚：

1. 停止 ComfyUI
2. 删除迁移后的新文件
3. 将 `*.prompt.bak` 重命名回原文件名
4. 回滚插件代码到 V1.3.x

---

## 3. API 路由重命名

V1.4.0 规范化了所有后端 API 路由名称，去除 `_endpoint` 后缀，并按资源分组。

| 旧路由 | 新路由 | 说明 |
|--------|--------|------|
| `/agent_endpoint` | `/agent` | Agent 执行入口 |
| `/chat_endpoint` | `/chat` | LLM 聊天接口 |
| `/test_llm` | `/llm/test` | LLM 连通性测试 |

### 3.1 前端同步

前端代码（`js/` 目录）已同步更新至新路由，**普通用户无需任何操作**。

### 3.2 第三方调用方

若你有自定义脚本或外部集成直接调用本插件 API，需更新请求路径：

```python
# 旧
import requests
requests.post("http://localhost:8188/agent_endpoint", json={...})

# 新
import aiohttp
async with aiohttp.ClientSession() as session:
    await session.post("http://localhost:8188/agent", json={...})
```

> **兼容期**：V1.4.0 不再保留旧路由的别名，请务必在升级前更新所有外部调用。

---

## 4. LLMClient 全异步化

### 4.1 变更说明

V1.4.0 将 `LLMClient` 所有公开方法改为 `async def`，底层 HTTP 客户端从同步 `requests` 切换到 `aiohttp`，以支持高并发场景下的真正异步 I/O。

### 4.2 对 `api_routes.py` 的影响

`api_routes.py` 中的路由处理函数原本通过 `asyncio.run()` 或线程池包装同步调用，现在可以直接 `await`：

```python
# V1.3.x
@routes.post("/chat_endpoint")
async def chat_endpoint(request):
    result = await asyncio.to_thread(llm_client.chat, payload)
    return web.json_response(result)

# V1.4.0
@routes.post("/chat")
async def chat(request):
    result = await llm_client.chat(payload)
    return web.json_response(result)
```

### 4.3 派生类与直接调用方

若你派生了 `LLMClient` 子类或在其他模块直接调用其方法，必须：

1. 将调用处改为 `await client.method(...)`
2. 确保调用栈上游也是 `async def`
3. 不要在同步上下文中直接调用异步方法，必要时使用 `asyncio.run()` 包裹

### 4.4 测试

测试代码（`tests/test_llm_client*.py`）已全部改造为 `pytest-asyncio` 风格，使用 `@pytest.mark.asyncio` 装饰。运行 `pytest tests/ -v` 即可。

---

## 5. 模板同步机制

### 5.1 `_template_version` 字段

V1.4.0 在所有模板 JSON 文件顶层引入 `_template_version` 字段，例如：

```json
{
  "_template_version": "1.4.0",
  "prompts": [...]
}
```

### 5.2 同步流程

插件启动时会比较用户配置目录中的模板文件与插件 `data/` 目录下的内置模板的 `_template_version`：

1. 若用户文件版本 **低于** 内置版本：自动覆盖（内置 → 用户），覆盖前将用户文件备份为 `*.bak`
2. 若用户文件版本 **等于或高于** 内置版本：跳过，保留用户文件
3. 若用户文件不存在：直接拷贝内置版本

### 5.3 手动编辑保护

如果你手动编辑过用户模板并希望保留，请在升级前将 `_template_version` 提升到目标版本号（例如 `"1.4.0"`），同步逻辑将不再覆盖。

---

## 6. 单例模式重构

### 6.1 旧实现（V1.3.x）

V1.3.x 通过 `__new__` 实现单例：

```python
class LLMClient:
    _instance = None
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```

该实现在多线程下存在竞态条件，且 `__init__` 会被重复调用导致配置被重置。

### 6.2 新实现（V1.4.0）

V1.4.0 改用模块级实例 + `threading.Lock`：

```python
import threading

_client_lock = threading.Lock()
_client_instance: "LLMClient | None" = None

def get_llm_client() -> "LLMClient":
    global _client_instance
    if _client_instance is None:
        with _client_lock:
            if _client_instance is None:
                _client_instance = LLMClient()
    return _client_instance
```

### 6.3 迁移建议

- 不要再依赖 `LLMClient()` 直接返回单例的行为
- 统一使用 `get_llm_client()` 获取实例
- 派生类不要重写 `__new__`

---

## 7. pyproject.toml 依赖变更

V1.4.0 在 `pyproject.toml` 的 `[project]` 段新增运行时依赖：

```toml
dependencies = [
    "aiohttp>=3.8.0",
]
```

升级方式：

```bash
cd ComfyUI/custom_nodes/PromptCraft
python -m pip install -e .
```

如果你使用 ComfyUI 的内置 Python 环境，请确保使用对应解释器执行上述命令。

---

## 8. 用户配置目录

V1.4.0 明确了用户配置目录的位置：

```
ComfyUI/user/promptcraft/
├── llm_config.json        # 用户 LLM 配置
├── lora_groups.json       # LoRA 分组
├── lora_prompts.json      # LoRA prompt 模板
├── sfw_library.json       # SFW 词库
├── nsfw_library.json      # NSFW 词库
└── ...                    # 其他用户数据
```

- 该目录在首次启动时自动创建
- 所有用户编辑过的内容都保存在此目录，**不会**被插件升级覆盖（除第 5 节描述的模板同步场景）
- 卸载插件不会删除该目录，需要手动清理

---

## 9. 升级检查清单

升级前请确认：

- [ ] 已备份 `ComfyUI/custom_nodes/PromptCraft` 目录
- [ ] 已备份 `ComfyUI/user/promptcraft/` 目录
- [ ] 已更新所有外部 API 调用至新路由（第 3 节）
- [ ] 已更新 `LLMClient` 的派生类与直接调用方（第 4 节）
- [ ] 已更新 `LLMClient` 单例的获取方式（第 6 节）
- [ ] 已执行 `python -m pip install -e .` 安装新依赖（第 7 节）

升级后请验证：

- [ ] ComfyUI 启动日志中出现 `[PromptCraft Migration]` 迁移完成信息
- [ ] `*.prompt.bak` 备份文件已生成
- [ ] 前端 UI 可正常加载，所有面板可打开
- [ ] Agent / Chat / LLM 测试三个功能可正常调用
- [ ] 运行 `pytest tests/ -v` 全部通过

---

## 10. 回滚方案

若 V1.4.0 无法正常工作，可回滚至 V1.3.x：

1. 停止 ComfyUI
2. 将插件代码回滚到 V1.3.x（`git checkout <v1.3.x-tag>` 或恢复备份）
3. 将用户配置目录中的 `*.prompt.bak` 重命名回原文件名
4. 将 `*.bak`（模板备份）重命名回原文件名
5. 重启 ComfyUI

回滚后请勿再次执行 V1.4.0 的迁移脚本，以免重复处理已恢复的旧格式文件。
