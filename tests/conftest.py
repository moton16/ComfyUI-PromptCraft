"""
PromptCraft 测试套件 — 公共 fixtures 和 mock 基础设施
"""

import importlib.util
import json
import os
import shutil
import sys
import tempfile
from unittest.mock import MagicMock, patch

import pytest

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
    4. 将所有子模块作为属性挂载到包对象（使 @patch("promptcraft.xxx.yyy") 可用）
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
        'clip_text_encode_pro', 'ai_chat', 'api_routes',
        'migrate_legacy_prompts', 'lora_prompt_loader',
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
        # V1-TEST-01: 将子模块作为属性挂载到包对象，使 @patch("promptcraft.xxx.yyy") 可用
        setattr(pkg, mod_name, mod)

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

    # 4. V1-TEST-01: 将所有子模块属性从旧 pkg 迁移到 init_pkg
    #    （init_pkg 是新对象，不继承 pkg 的属性，需手动复制）
    for mod_name in SUBMODULES:
        full_name = f'promptcraft.{mod_name}'
        if full_name in sys.modules:
            setattr(init_pkg, mod_name, sys.modules[full_name])


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


# ==================== 新增集成测试 fixtures ====================

@pytest.fixture
def tmp_data_dir(tmp_dir):
    """创建带 data/ 子目录 + 模板文件的临时目录（模拟插件目录结构）"""
    data_dir = os.path.join(tmp_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    # 创建最小 SFW 模板
    sfw_path = os.path.join(data_dir, "sfw_prompt_library.json")
    with open(sfw_path, "w", encoding="utf-8") as f:
        json.dump({
            "version": "1.0.0",
            "categories": {
                "scene_type": {
                    "label": "场景类型",
                    "options": [
                        {"label": "city street", "en": "city street"},
                        {"label": "forest", "en": "forest"},
                        {"label": "beach", "en": "beach"},
                    ]
                },
                "quality_level": {
                    "label": "质量等级",
                    "options": [
                        {"label": "标准", "en": "detailed, high quality"},
                    ]
                },
                "negative_prompt": {
                    "label": "负面提示词",
                    "options": [
                        {"label": "标准", "en": "low quality, worst quality"},
                    ]
                }
            },
            "presets": {},
            "trigger_words": {}
        }, f, ensure_ascii=False, indent=2)
    # 创建最小 NSFW 模板
    nsfw_path = os.path.join(data_dir, "nsfw_prompt_library.json")
    with open(nsfw_path, "w", encoding="utf-8") as f:
        json.dump({"version": "1.0.0", "categories": {}}, f, ensure_ascii=False, indent=2)
    # 创建 LLM 配置
    llm_path = os.path.join(data_dir, "llm_config.json")
    with open(llm_path, "w", encoding="utf-8") as f:
        json.dump({
            "enabled": True,
            "api_url": "https://api.openai.com/v1",
            "api_key": "sk-test123456789",
            "model": "gpt-4",
            "temperature": 0.7,
            "max_tokens": 2000,
        }, f, ensure_ascii=False, indent=2)
    return tmp_dir


@pytest.fixture
def mock_comfy_runtime():
    """模拟 ComfyUI 运行时依赖（folder_paths, comfy.sd, comfy.utils）"""
    mock_model = MagicMock(name="MODEL")
    mock_clip = MagicMock(name="CLIP")
    mock_vae = MagicMock(name="VAE")
    mock_clip.tokenize.return_value = {"input_ids": MagicMock()}
    mock_clip.encode_from_tokens_scheduled.return_value = [[mock_model]]

    with patch.dict('sys.modules', {
        'folder_paths': MagicMock(
            get_filename_list=MagicMock(return_value=["model_v1.safetensors", "model_v2.safetensors"]),
            get_full_path_or_raise=MagicMock(side_effect=lambda cat, name: f"/mock/{cat}/{name}"),
            get_folder_paths=MagicMock(return_value="/mock/embeddings"),
            get_full_path=MagicMock(side_effect=lambda cat, name: f"/mock/{cat}/{name}"),
        ),
        'comfy': MagicMock(),
        'comfy.sd': MagicMock(
            load_checkpoint_guess_config=MagicMock(return_value=(mock_model, mock_clip, mock_vae)),
            load_lora_for_models=MagicMock(return_value=(mock_model, mock_clip)),
        ),
        'comfy.utils': MagicMock(),
    }):
        yield {
            "model": mock_model,
            "clip": mock_clip,
            "vae": mock_vae,
        }


@pytest.fixture
def mock_prompt_server():
    """模拟 PromptServer.instance"""
    server = MagicMock()
    server.send_sync = MagicMock()
    server.routes = MagicMock()
    return server


@pytest.fixture
def sample_lora_stack_data():
    """示例 LoRA 栈 JSON（前端隐藏 widget 格式）"""
    return json.dumps({
        "items": [
            {
                "type": "individual",
                "lora": "style/cyberpunk.safetensors",
                "weight": 0.8,
                "clip_weight": 0.8,
                "enabled": True,
                "selected_group": None,
            },
            {
                "type": "individual",
                "lora": "character/amiya.safetensors",
                "weight": 0.6,
                "clip_weight": 0.6,
                "enabled": True,
                "selected_group": "战斗",
            },
        ]
    }, ensure_ascii=False)
