# PromptCraft 开发指南

本文档面向 PromptCraft 插件的开发者，介绍环境搭建、项目结构、常用命令、代码规范与开发约定。请在新功能开发前完整阅读本文档。

---

## 1. 环境搭建

### 1.1 系统要求

- Python 3.11+（与 ComfyUI 主分支一致）
- Node.js 18+（前端构建用，运行时不需要）
- Git
- make（Windows 推荐使用 Git Bash 或 WSL）

### 1.2 安装开发依赖

克隆仓库后，在项目根目录执行：

```bash
python -m pip install -e ".[dev]"
```

`pyproject.toml` 中 `[project.optional-dependencies].dev` 包含：

- `pytest`、`pytest-asyncio`：测试框架
- `ruff`：lint + format
- `mypy`：类型检查
- `vulture`：死代码扫描

### 1.3 前端构建（可选）

如果你需要修改前端代码：

```bash
npm install
npm run build      # 生产构建
npm run dev        # 开发模式，热更新
```

构建产物会输出到 `js/` 目录，由 ComfyUI 直接加载。

---

## 2. 项目结构

```
PromptCraft/
├── __init__.py                 # 插件入口，注册节点与路由
├── server.py                   # ComfyUI server 路由注册
├── api_routes.py               # 后端 API 路由定义（全异步）
├── llm_client.py               # LLM 客户端（全异步）
├── agent_prompt.py             # Agent prompt 生成
├── ai_chat.py                  # AI 聊天逻辑
├── prompt_enhancer.py          # Prompt 增强
├── thinking_control.py         # Thinking 控制器
├── cache_utils.py              # 缓存工具
├── config_manager.py           # 配置管理
├── clip_text_encode_pro.py     # CLIP Text Encode Pro 节点
├── model_lora_loader.py        # Model/LoRA Loader 节点
├── lora_group_manager.py       # LoRA 分组管理
├── lora_prompt_loader.py       # LoRA prompt loader 节点
├── lora_prompt_manager.py      # LoRA prompt 管理
├── lora_scanner.py             # LoRA 扫描器
├── lora_utils.py               # LoRA 工具函数
├── migrate_legacy_prompts.py   # 旧 prompt 迁移脚本
├── legacy_migration.py         # 旧版迁移辅助
├── pyproject.toml              # Python 包元数据与依赖
├── update_version.sh           # 版本号同步脚本
│
├── js/                         # 前端 JS（由 ComfyUI 直接加载）
│   ├── index.js                # 前端入口
│   ├── control_panel.js        # 控制面板
│   ├── chat_panel.js           # 聊天面板
│   ├── i18n.js                 # 前端 i18n
│   ├── vue_bridge.js           # Vue 桥接
│   ├── i18n/                   # 前端 i18n 资源
│   │   ├── en.json
│   │   └── zh.json
│   ├── lora_group/             # LoRA 分组相关前端
│   └── lora_prompt_loader/     # LoRA prompt loader 前端
│
├── src/                        # Vue 源码（构建后输出到 js/）
│   ├── components/
│   │   ├── common/             # 通用组件
│   │   └── dialogs/            # 对话框组件
│   ├── composables/            # Vue composables
│   ├── styles/                 # 样式
│   └── main.js
│
├── data/                       # 内置模板与配置（只读）
│   ├── llm_config.json
│   ├── llm_services.json
│   ├── llm_system_prompt.json
│   ├── sfw_prompts.json
│   ├── nsfw_prompts.json
│   ├── usage_help_zh.md
│   └── usage_help_en.md
│
├── locales/                    # ComfyUI 节点定义 i18n
│   ├── zh/nodeDefs.json
│   └── en/nodeDefs.json
│
├── tests/                      # 测试
│   ├── conftest.py             # pytest 配置，自动 mock ComfyUI
│   ├── fixtures/               # 测试 fixtures
│   └── test_*.py
│
├── Makefile                    # 开发命令入口
├── .pre-commit-config.yaml     # pre-commit 钩子
└── .github/workflows/          # CI
```

### 2.1 模块职责约定

- 根目录 `.py` 文件为后端节点或服务模块
- `js/` 为前端构建产物与 ComfyUI 直接加载的脚本
- `src/` 为 Vue 源码，构建后输出到 `js/`
- `data/` 为插件内置的只读模板，用户数据保存在 `ComfyUI/user/promptcraft/`
- `locales/` 为 ComfyUI 节点定义的 i18n，与 `js/i18n/` 区分

---

## 3. 常用命令

所有开发命令通过 `Makefile` 暴露：

```bash
make lint        # ruff check .
make typecheck   # mypy --ignore-missing-imports .
make test        # pytest tests/ -v
make format      # ruff format . && ruff check --fix .
make deadcode    # vulture . --min-confidence 80
make check       # lint + typecheck + test
make migrate-test  # 运行 migrate_legacy_prompts.py 自测
make clean       # 清理缓存目录
```

### 3.1 单独运行

也可以直接调用底层工具：

```bash
ruff check .
ruff format .
mypy --ignore-missing-imports .
pytest tests/ -v
vulture . --min-confidence 80
```

---

## 4. 代码规范

### 4.1 Lint 与 Format

使用 `ruff` 同时承担 lint 与 format 职责。`pyproject.toml` 中配置行宽为 120：

```toml
[tool.ruff]
line-length = 120
```

提交前请执行 `make format` 自动修复可修复的问题。

### 4.2 类型检查

使用 `mypy --ignore-missing-imports .` 进行类型检查。新增代码应尽量添加类型注解，特别是公开 API。

```python
# 推荐
async def chat(self, prompt: str, *, temperature: float = 0.7) -> dict[str, Any]:
    ...

# 不推荐
async def chat(self, prompt, temperature=0.7):
    ...
```

### 4.3 测试

测试位于 `tests/` 目录，使用 `pytest`。`conftest.py` 会自动 mock ComfyUI 的依赖（`server.PromptServer`、节点注册等），因此测试可以在没有 ComfyUI 运行环境的情况下执行。

```bash
make test                            # 运行全部测试
pytest tests/test_llm_client.py -v   # 运行单个文件
pytest tests/ -k "asyncio" -v        # 按关键字过滤
```

异步测试使用 `pytest-asyncio`，示例：

```python
import pytest

@pytest.mark.asyncio
async def test_chat(mock_llm_client):
    result = await mock_llm_client.chat("hello")
    assert "response" in result
```

---

## 5. 提交前检查

### 5.1 安装 pre-commit

```bash
pre-commit install
```

此后每次 `git commit` 会自动运行：

- `ruff`（带 `--fix`）
- `ruff-format`
- `trailing-whitespace`
- `end-of-file-fixer`
- `check-yaml`
- `check-added-large-files`（>500KB 拦截）
- `check-merge-conflict`

### 5.2 手动触发

```bash
pre-commit run --all-files
```

### 5.3 提交流程

建议提交流程：

1. `make format` 格式化
2. `make check` 运行完整检查
3. `git add <files>`（明确添加，不要 `git add .`）
4. `git commit`（pre-commit 自动运行）
5. 推送前再次确认 `make check` 通过

---

## 6. 版本号更新

PromptCraft 的版本号硬编码在多个文件中，**不要手动逐个修改**。使用项目提供的脚本：

```bash
./update_version.sh 1.4.0
```

该脚本会自动同步以下位置：

- `js/index.js` 前端版本常量
- `js/control_panel.js` 设置面板显示版本
- `pyproject.toml` Python 包版本
- `__init__.py` 启动日志
- `model_lora_loader.py` 节点版本注释
- `llm_client.py` 模块版本注释
- `thinking_control.py` 模块版本注释
- `README_zh.md` / `README_en.md` badge
- `CHANGELOG.md` 顶部条目

> **注意**：`pyproject.toml` 的 version 字段只支持纯语义化版本号（如 `1.4.0`），不能带 `beta`/`rc`/`mod` 等后缀，否则 `pip install -e .` 会失败。

---

## 7. 异步开发注意事项

V1.4.0 起，`LLMClient` 全异步化。新增方法或修改现有方法时务必遵守：

### 7.1 必须 `async def`

```python
# 正确
async def generate(self, prompt: str) -> str:
    async with aiohttp.ClientSession() as session:
        ...
    return result

# 错误
def generate(self, prompt: str) -> str:
    return requests.post(...)
```

### 7.2 使用 `aiohttp` 而非 `httpx` / `requests`

项目运行时依赖为 `aiohttp>=3.8.0`，不要引入新的 HTTP 客户端依赖。

```python
import aiohttp

async def fetch(self, url: str) -> dict:
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as resp:
            resp.raise_for_status()
            return await resp.json()
```

### 7.3 路由层直接 await

`api_routes.py` 中的处理函数已经是 `async def`，直接 `await` 客户端方法即可，**不要**再用 `asyncio.to_thread` 或线程池包装：

```python
# 正确
@routes.post("/chat")
async def chat(request):
    result = await get_llm_client().chat(payload)
    return web.json_response(result)

# 错误
@routes.post("/chat")
async def chat(request):
    result = await asyncio.to_thread(get_llm_client().chat, payload)
    return web.json_response(result)
```

### 7.4 同步上下文调用

如果必须在同步上下文调用异步方法，使用 `asyncio.run()` 包裹，但**优先考虑将调用栈改为异步**：

```python
# 临时方案
def sync_wrapper():
    return asyncio.run(get_llm_client().chat(payload))
```

---

## 8. 单例模式约定

V1.4.0 重构了单例模式，统一使用 **模块级实例 + `threading.Lock`**，禁止使用 `__new__`。

### 8.1 推荐写法

```python
import threading
from typing import Optional

_client_lock = threading.Lock()
_client_instance: Optional["LLMClient"] = None

def get_llm_client() -> "LLMClient":
    global _client_instance
    if _client_instance is None:
        with _client_lock:
            if _client_instance is None:
                _client_instance = LLMClient()
    return _client_instance
```

### 8.2 禁止写法

```python
# 禁止：__new__ 实现单例
class LLMClient:
    _instance = None
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```

原因：

- `__new__` 在多线程下存在竞态条件
- `__init__` 会被重复调用，导致配置被重置
- 不利于显式控制初始化时机

### 8.3 获取实例

所有调用方统一通过 `get_llm_client()` 获取实例，**不要**直接 `LLMClient()`。

---

## 9. 模板与配置文件

### 9.1 内置模板

`data/` 目录下的 JSON 文件为内置只读模板，所有文件顶层必须有 `_template_version` 字段：

```json
{
  "_template_version": "1.4.0",
  ...
}
```

### 9.2 用户配置目录

用户编辑过的内容保存在 `ComfyUI/user/promptcraft/`，与插件代码分离。升级插件不会覆盖该目录（除非用户的模板版本低于内置版本，此时会备份为 `*.bak` 后覆盖）。

### 9.3 同步逻辑

启动时比较用户文件与内置文件的 `_template_version`：

- 用户版本 < 内置版本：覆盖并备份用户文件为 `*.bak`
- 用户版本 >= 内置版本：跳过

详见 `MIGRATION.md` 第 5 节。

---

## 10. CI

GitHub Actions 配置位于 `.github/workflows/ci.yml`，在 `push` 到 `main`/`master` 与 `pull_request` 时触发，包含以下 job：

- `lint`：ruff check
- `typecheck`：mypy
- `test`：pytest
- `i18n-check`：检查 `locales/zh` 与 `locales/en` 的 JSON key 对齐

本地推送前请确认 `make check` 通过。

---

## 11. 常见问题

### Q1：测试报错 `ModuleNotFoundError: No module named 'server'`

`server` 模块由 ComfyUI 提供，`tests/conftest.py` 会自动 mock。请确认测试是从项目根目录运行，且已执行 `pip install -e ".[dev]"`。

### Q2：mypy 报大量 `missing-imports` 错误

使用 `--ignore-missing-imports` 参数，或直接 `make typecheck`。

### Q3：pre-commit 钩子不生效

执行 `pre-commit install` 重新安装。若仍不生效，检查 `.git/hooks/pre-commit` 是否存在。

### Q4：ruff format 与 ruff check 冲突

先 `ruff format .` 再 `ruff check --fix .`，即 `make format` 的内部顺序。

### Q5：异步测试不执行

确认测试函数有 `@pytest.mark.asyncio` 装饰器，且 `pyproject.toml` 中已配置 `asyncio_mode`。
