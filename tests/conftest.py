"""
PromptCraft 测试套件 — 公共 fixtures 和 mock 基础设施
"""

import os
import sys
import json
import tempfile
import shutil
import importlib.util
import pytest
from unittest.mock import MagicMock, patch

# ==================== Mock ComfyUI 依赖（在加载项目模块之前） ====================

# mock folder_paths
_mock_folder_paths = MagicMock()
_mock_folder_paths.get_user_directory.return_value = None
_mock_folder_paths.get_full_path_or_raise.side_effect = lambda cat, name: f"/mock/{cat}/{name}"
_mock_folder_paths.get_filename_list.return_value = []
sys.modules['folder_paths'] = _mock_folder_paths

# mock comfy.*
sys.modules['comfy'] = MagicMock()
sys.modules['comfy.sd'] = MagicMock()
sys.modules['comfy.utils'] = MagicMock()
sys.modules['comfy.model_management'] = MagicMock()
sys.modules['nodes'] = MagicMock()

# mock server（需要 PromptServer.instance）
_mock_server = MagicMock()
sys.modules['server'] = _mock_server

# ==================== 包加载 ====================
# 项目使用相对导入（from .config_manager import ...），
# 需要通过 importlib 加载为 Python 包。

_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def _load_project_package():
    """加载项目为 'promptcraft' 包，使相对导入正常工作

    加载顺序：
    1. 先注册空的包对象到 sys.modules（使相对导入的 parent 可被找到）
    2. 加载所有子模块（它们的 from .xxx 会引用步骤1的包对象）
    3. 最后执行 __init__.py（它也会 from .xxx 导入，此时子模块已就绪）
    """
    if 'promptcraft' in sys.modules:
        return

    # 1. 创建空的包对象（仅设置 __path__ 和 __package__）
    import types
    pkg = types.ModuleType('promptcraft')
    pkg.__path__ = [_PROJECT_ROOT]
    pkg.__package__ = 'promptcraft'
    pkg.__file__ = os.path.join(_PROJECT_ROOT, '__init__.py')
    sys.modules['promptcraft'] = pkg

    # 2. 按依赖顺序加载子模块
    SUBMODULES = [
        'cache_utils', 'thinking_control', 'agent_prompt',
        'config_manager', 'lora_scanner', 'lora_group_manager',
        'lora_prompt_manager', 'lora_utils', 'llm_client',
        'legacy_migration',  # 必须在 prompt_enhancer 之前加载
        'prompt_enhancer', 'model_lora_loader', 'lora_prompt_loader',
        'clip_text_encode_pro', 'ai_chat',
    ]
    for mod_name in SUBMODULES:
        full_name = f'promptcraft.{mod_name}'
        mod_path = os.path.join(_PROJECT_ROOT, f'{mod_name}.py')
        if not os.path.exists(mod_path):
            continue
        mod_spec = importlib.util.spec_from_file_location(full_name, mod_path)
        if mod_spec is None or mod_spec.loader is None:
            continue
        mod = importlib.util.module_from_spec(mod_spec)
        mod.__package__ = 'promptcraft'
        sys.modules[full_name] = mod
        sys.modules[mod_name] = mod  # 顶级别名
        mod_spec.loader.exec_module(mod)

    # 3. 执行 __init__.py（此时子模块已就绪，from .xxx 不会失败）
    init_spec = importlib.util.spec_from_file_location(
        'promptcraft',
        os.path.join(_PROJECT_ROOT, '__init__.py'),
        submodule_search_locations=[_PROJECT_ROOT],
    )
    init_pkg = importlib.util.module_from_spec(init_spec)
    init_pkg.__path__ = [_PROJECT_ROOT]
    init_pkg.__package__ = 'promptcraft'
    sys.modules['promptcraft'] = init_pkg
    init_spec.loader.exec_module(init_pkg)


# 延迟加载（在第一个测试收集前完成）
_load_project_package()


# ==================== Fixtures ====================

@pytest.fixture(autouse=True)
def mock_comfy_deps():
    """提供 mock 对象给需要的测试"""
    yield {
        'folder_paths': _mock_folder_paths,
        'server': _mock_server,
    }


@pytest.fixture
def tmp_dir():
    """创建临时目录，测试后自动清理"""
    path = tempfile.mkdtemp(prefix="promptcraft_test_")
    yield path
    shutil.rmtree(path, ignore_errors=True)


@pytest.fixture
def tmp_json_dir(tmp_dir):
    """创建带 data/ 子目录的临时目录（模拟插件目录结构）"""
    data_dir = os.path.join(tmp_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    return tmp_dir


@pytest.fixture
def sample_lora_groups():
    """示例 LoRA 群组数据"""
    return {
        "version": "1.0.0",
        "groups": {
            "style_cyberpunk": {
                "label": "style_cyberpunk",
                "description": "赛博朋克风格",
                "created_at": "2026-05-21T10:00:00",
                "updated_at": "2026-05-21T10:00:00",
                "loras": [
                    {"lora": "style/cyberpunk_neon.safetensors", "weight": 0.8, "clip_weight": 0.8, "enabled": True, "note": ""},
                    {"lora": "style/neon_glow.safetensors", "weight": 0.5, "clip_weight": 0.5, "enabled": True, "note": "发光效果"},
                ]
            },
            "character_arknights": {
                "label": "character_arknights",
                "description": "明日方舟角色",
                "created_at": "2026-05-21T11:00:00",
                "updated_at": "2026-05-21T11:00:00",
                "loras": [
                    {"lora": "character/amiya.safetensors", "weight": 0.7, "clip_weight": 0.7, "enabled": True, "note": ""},
                ]
            }
        }
    }


@pytest.fixture
def sample_lora_prompts():
    """示例 LoRA Prompt 数据"""
    return {
        "version": "1.0.0",
        "loras": {
            "style/cyberpunk_neon.safetensors": {
                "groups": [
                    {
                        "name": "默认",
                        "prompts": ["neon lights, cyberpunk city", "holographic display"],
                        "negative": "daylight, nature"
                    }
                ]
            },
            "character/amiya.safetensors": {
                "groups": [
                    {
                        "name": "默认",
                        "prompts": ["amiya, arknights, animal ears"],
                        "negative": ""
                    },
                    {
                        "name": "战斗",
                        "prompts": ["amiya, battle stance, energy sword"],
                        "negative": "peaceful"
                    }
                ]
            }
        }
    }


@pytest.fixture
def sample_sfw_library():
    """示例 SFW prompt 库"""
    return {
        "version": "1.0.0",
        "categories": {
            "scene": {
                "label": "场景",
                "options": [
                    {"label": "city street", "value": "city street"},
                    {"label": "forest", "value": "forest"},
                    {"label": "beach", "value": "beach"},
                ]
            },
            "style": {
                "label": "风格",
                "options": [
                    {"label": "anime", "value": "anime"},
                    {"label": "oil painting", "value": "oil painting"},
                ]
            }
        }
    }


@pytest.fixture
def sample_llm_config():
    """示例 LLM 配置"""
    return {
        "services": {
            "enhance_basic": {
                "name": "基础扩写",
                "provider": "openai",
                "base_url": "https://api.openai.com/v1",
                "api_key": "sk-test123456789",
                "model": "gpt-4",
                "temperature": 0.7,
                "max_tokens": 2000,
                "enabled": True,
            },
            "enhance_detail": {
                "name": "详细扩写",
                "provider": "zhipu",
                "base_url": "https://open.bigmodel.cn/api/paas/v4",
                "api_key": "test-key-1234",
                "model": "glm-4",
                "temperature": 0.8,
                "max_tokens": 3000,
                "enabled": True,
            }
        },
        "active_service": "enhance_basic",
    }
