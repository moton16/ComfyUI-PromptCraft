# Model & LoRA Group Loader — 设计文档

## 1. 概述

### 1.1 目标

在 moton-promptcraft 插件中新增一个 **Model & LoRA Group Loader** 节点，实现：
- **底模切换**：通过下拉框选择 checkpoint，运行时加载
- **LoRA 群组管理**：将多个 LoRA 组织为命名群组，一键加载整个群组
- **群组管理界面**：ComfyUI 风格的弹窗面板，支持 CRUD、拖拽排序、权重调节
- **为后续 Agent 接入预留接口**：群组名支持 STRING 输入（非静态 COMBO）

### 1.2 三阶段路线

| 阶段 | 目标 | 本设计覆盖 |
|------|------|-----------|
| **Phase 1（本文档）** | 独立节点：底模 + LoRA 群组加载 + 管理界面 | ✅ |
| Phase 2 | 与现有 PromptCraft 节点交互（提示词模板联动） | 接口预留 |
| Phase 3 | Agent 模块接入（自然语言操控） | 接口预留 |

---

## 2. 新增文件清单

```
moton-promptcraft/
├── model_lora_loader.py       # 新增：节点类 ModelLoraGroupLoader
├── lora_group_manager.py      # 新增：LoRA 群组 CRUD + 加载逻辑
├── lora_scanner.py            # 新增：磁盘 LoRA 扫描 + 元数据读取
├── js/
│   ├── index.js               # 修改：注册新节点前端扩展
│   └── lora_group_panel.js    # 新增：群组管理面板 UI
├── data/
│   └── lora_groups.json       # 新增：群组配置持久化
└── api_routes.py              # 修改：新增群组管理 API
```

---

## 3. 后端节点设计

### 3.1 节点类：`ModelLoraGroupLoader`

```python
class ModelLoraGroupLoader:
    """底模 + LoRA 群组加载器"""

    @classmethod
    def INPUT_TYPES(cls):
        # 动态获取 checkpoint 列表
        checkpoint_list = ["None"] + folder_paths.get_filename_list("checkpoints")

        return {
            "required": {
                "checkpoint": (checkpoint_list, {
                    "default": "None",
                    "tooltip": "选择底模，'None' 则使用上游传入的 MODEL"
                }),
                "lora_group": ("STRING", {
                    "default": "",
                    "multiline": False,
                    "placeholder": "输入 LoRA 群组名称，留空则不加载 LoRA",
                    "tooltip": "群组名称，需与配置文件中的群组名一致"
                }),
                "strength_multiplier": ("FLOAT", {
                    "default": 1.0, "min": 0.0, "max": 2.0, "step": 0.05,
                    "tooltip": "群组内所有 LoRA 权重的统一乘数"
                }),
            },
            "optional": {
                "model": ("MODEL",),   # 上游传入的 MODEL（当 checkpoint="None" 时使用）
                "clip": ("CLIP",),     # 上游传入的 CLIP
            },
        }

    RETURN_TYPES = ("MODEL", "CLIP")
    RETURN_NAMES = ("model", "clip")
    FUNCTION = "execute"
    CATEGORY = "Moton PromptCraft"

    # 让 ComfyUI 在 checkpoint="None" 时不执行上游（懒加载）
    @classmethod
    def VALIDATE_INPUTS(cls, checkpoint, lora_group, strength_multiplier,
                        model=None, clip=None):
        if checkpoint == "None" and model is None:
            return "当 checkpoint='None' 时，必须连接上游 MODEL 输入"
        return True

    def execute(self, checkpoint, lora_group, strength_multiplier,
                model=None, clip=None):

        # 1. 加载底模
        if checkpoint != "None":
            ckpt_path = folder_paths.get_full_path_or_raise("checkpoints", checkpoint)
            out = comfy.sd.load_checkpoint_guess_config(
                ckpt_path,
                output_vae=True,
                output_clip=True,
                embedding_directory=folder_paths.get_folder_paths("embeddings")
            )
            model = out[0]
            clip = out[1]
            # out[2] 是 VAE，本节点不输出

        # 2. 加载 LoRA 群组
        if lora_group.strip():
            groups = LoraGroupManager().load_groups()
            group_data = groups.get(lora_group.strip())
            if group_data is None:
                print(f"[ModelLoraGroupLoader] 警告: 群组 '{lora_group}' 不存在")
            else:
                for item in group_data.get("loras", []):
                    if not item.get("enabled", True):
                        continue
                    lora_name = item["lora"]
                    lora_path = folder_paths.get_full_path("loras", lora_name)
                    if lora_path is None or not os.path.exists(lora_path):
                        print(f"[ModelLoraGroupLoader] 警告: LoRA 文件不存在，跳过: {lora_name}")
                        continue

                    model, clip = self._load_single_lora(
                        model, clip, lora_path,
                        item["weight"] * strength_multiplier,
                        item["clip_weight"] * strength_multiplier
                    )

        return (model, clip)

    @staticmethod
    def _load_single_lora(model, clip, lora_path, strength_model, strength_clip):
        """参考 weilin-comfyui-tools 的加载方式"""
        lora = comfy.utils.load_torch_file(lora_path, safe_load=True)

        # 构建 key 映射
        model_lora_keys = comfy.lora.model_lora_keys_unet(model.model)
        clip_lora_keys = comfy.lora.model_lora_keys_clip(clip.cond_stage_model)

        # 合并 key 映射
        all_keys = {**model_lora_keys, **clip_lora_keys}

        # 加载 LoRA patches
        loaded = comfy.lora.load_lora(all_keys, lora)

        # 应用 patches
        model_clone = model.clone()
        clip_clone = clip.clone()

        # 分离 model 和 clip 的 patches
        model_patches = {k: v for k, v in loaded.items() if k in model_lora_keys.values()}
        clip_patches = {k: v for k, v in loaded.items() if k in clip_lora_keys.values()}

        if model_patches:
            model_clone.add_patches(model_patches, strength_model)
        if clip_patches:
            clip_clone.add_patches(clip_patches, strength_clip)

        return model_clone, clip_clone
```

### 3.2 IS_CHANGED 策略

```python
@classmethod
def IS_CHANGED(cls, checkpoint, lora_group, strength_multiplier, **kwargs):
    """
    缓存控制：
    - checkpoint 变化 → 重新执行
    - lora_group 变化 → 重新执行
    - strength_multiplier 变化 → 重新执行
    - 群组配置文件修改 → 通过 mtime 检测
    """
    import hashlib
    m = hashlib.sha256()
    m.update(checkpoint.encode())
    m.update(lora_group.encode())
    m.update(str(strength_multiplier).encode())

    # 检查群组配置文件 mtime
    groups_path = LoraGroupManager().groups_path
    if os.path.exists(groups_path):
        m.update(str(os.path.getmtime(groups_path)).encode())

    return m.hexdigest()
```

---

## 4. 数据模型

### 4.1 群组配置文件 `data/lora_groups.json`

```json
{
  "version": "1.0.0",
  "groups": {
    "日系动漫风": {
      "label": "日系动漫风",
      "description": "适合二次元角色的 LoRA 组合",
      "created_at": "2026-05-21T10:00:00",
      "updated_at": "2026-05-21T10:00:00",
      "loras": [
        {
          "lora": "Character/Anime/animeStyle_v2.safetensors",
          "weight": 0.8,
          "clip_weight": 0.8,
          "enabled": true,
          "note": "主风格 LoRA"
        },
        {
          "lora": "Style/detail_tweaker_xl.safetensors",
          "weight": 0.5,
          "clip_weight": 0.5,
          "enabled": true,
          "note": "细节增强"
        },
        {
          "lora": "Style/eye_detail_slider_v4.safetensors",
          "weight": 0.6,
          "clip_weight": 0.6,
          "enabled": false,
          "note": "眼部细节（按需启用）"
        }
      ]
    },
    "写实人像增强": {
      "label": "写实人像增强",
      "description": "写实风格人像的 LoRA 组合",
      "created_at": "2026-05-21T11:00:00",
      "updated_at": "2026-05-21T11:00:00",
      "loras": [
        {
          "lora": "Realistic/realisticVision_v5.safetensors",
          "weight": 0.75,
          "clip_weight": 0.75,
          "enabled": true
        }
      ]
    }
  }
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `lora` | string | 相对于 `models/loras/` 的文件路径 |
| `weight` | float | MODEL 权重 (0~2) |
| `clip_weight` | float | CLIP 权重 (0~2) |
| `enabled` | bool | 是否启用（管理面板中可切换） |
| `note` | string | 可选备注 |

### 4.2 LoRA 元数据（只读缓存）

扫描磁盘时可选读取 `.safetensors` 头部元数据或 `.json` sidecar 文件：

```json
{
  "base_model": "SD 1.5",
  "trigger_words": ["anime, detailed face"],
  "description": "Anime style transfer LoRA",
  "preview_image": "Character/Anime/animeStyle_v2.preview.png"
}
```

这些数据**不写入群组配置**，仅用于管理面板的显示（触发词、底模类型、预览图）。

---

## 5. LoraGroupManager 类

```python
class LoraGroupManager:
    """LoRA 群组配置的 CRUD 管理器"""

    def __init__(self):
        from .config_manager import config_manager
        self.user_dir = config_manager.user_config_dir
        self.groups_path = os.path.join(self.user_dir, "lora_groups.json")
        self._cache = None
        self._cache_mtime = 0

    def load_groups(self) -> dict:
        """加载群组配置（带 mtime 缓存）"""
        if not os.path.exists(self.groups_path):
            self._create_default()
        mtime = os.path.getmtime(self.groups_path)
        if self._cache is not None and mtime == self._cache_mtime:
            return self._cache
        with open(self.groups_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        self._cache = data.get("groups", {})
        self._cache_mtime = mtime
        return self._cache

    def save_groups(self, groups: dict):
        """原子写入群组配置"""
        data = {"version": "1.0.0", "groups": groups}
        tmp = self.groups_path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        os.replace(tmp, self.groups_path)
        self._cache = groups
        self._cache_mtime = os.path.getmtime(self.groups_path)

    def get_group_names(self) -> list:
        return list(self.load_groups().keys())

    def create_group(self, name: str, description: str = ""):
        groups = self.load_groups()
        if name in groups:
            raise ValueError(f"群组 '{name}' 已存在")
        from datetime import datetime
        now = datetime.now().isoformat()
        groups[name] = {
            "label": name,
            "description": description,
            "created_at": now,
            "updated_at": now,
            "loras": []
        }
        self.save_groups(groups)

    def rename_group(self, old_name: str, new_name: str):
        groups = self.load_groups()
        if old_name not in groups:
            raise ValueError(f"群组 '{old_name}' 不存在")
        if new_name in groups:
            raise ValueError(f"群组 '{new_name}' 已存在")
        groups[new_name] = groups.pop(old_name)
        groups[new_name]["label"] = new_name
        from datetime import datetime
        groups[new_name]["updated_at"] = datetime.now().isoformat()
        self.save_groups(groups)

    def delete_group(self, name: str):
        groups = self.load_groups()
        if name not in groups:
            raise ValueError(f"群组 '{name}' 不存在")
        del groups[name]
        self.save_groups(groups)

    def add_lora_to_group(self, group_name: str, lora_name: str,
                          weight: float = 1.0, clip_weight: float = 1.0):
        groups = self.load_groups()
        if group_name not in groups:
            raise ValueError(f"群组 '{group_name}' 不存在")
        # 防重复
        for item in groups[group_name]["loras"]:
            if item["lora"] == lora_name:
                raise ValueError(f"LoRA '{lora_name}' 已在群组中")
        from datetime import datetime
        groups[group_name]["loras"].append({
            "lora": lora_name,
            "weight": weight,
            "clip_weight": clip_weight,
            "enabled": True,
            "note": ""
        })
        groups[group_name]["updated_at"] = datetime.now().isoformat()
        self.save_groups(groups)

    def remove_lora_from_group(self, group_name: str, lora_name: str):
        groups = self.load_groups()
        if group_name not in groups:
            raise ValueError(f"群组 '{group_name}' 不存在")
        groups[group_name]["loras"] = [
            item for item in groups[group_name]["loras"]
            if item["lora"] != lora_name
        ]
        from datetime import datetime
        groups[group_name]["updated_at"] = datetime.now().isoformat()
        self.save_groups(groups)

    def update_lora_in_group(self, group_name: str, lora_name: str, **kwargs):
        """更新群组中某个 LoRA 的属性（weight, clip_weight, enabled, note）"""
        groups = self.load_groups()
        if group_name not in groups:
            raise ValueError(f"群组 '{group_name}' 不存在")
        for item in groups[group_name]["loras"]:
            if item["lora"] == lora_name:
                for key, value in kwargs.items():
                    if key in ("weight", "clip_weight", "enabled", "note"):
                        item[key] = value
                from datetime import datetime
                groups[group_name]["updated_at"] = datetime.now().isoformat()
                self.save_groups(groups)
                return
        raise ValueError(f"LoRA '{lora_name}' 不在群组 '{group_name}' 中")

    def reorder_loras(self, group_name: str, ordered_names: list):
        """按指定顺序重排群组内 LoRA"""
        groups = self.load_groups()
        if group_name not in groups:
            raise ValueError(f"群组 '{group_name}' 不存在")
        lora_map = {item["lora"]: item for item in groups[group_name]["loras"]}
        new_list = []
        for name in ordered_names:
            if name in lora_map:
                new_list.append(lora_map[name])
        groups[group_name]["loras"] = new_list
        from datetime import datetime
        groups[group_name]["updated_at"] = datetime.now().isoformat()
        self.save_groups(groups)

    def _create_default(self):
        """创建空的默认配置"""
        self.save_groups({})
```

---

## 6. LoraScanner 类

```python
class LoraScanner:
    """扫描磁盘上的 LoRA 文件并读取元数据"""

    @staticmethod
    def list_all() -> list:
        """返回所有 LoRA 文件的相对路径列表"""
        return folder_paths.get_filename_list("loras")

    @staticmethod
    def list_folders() -> dict:
        """
        返回文件夹层级结构
        参考 weilin-comfyui-tools 的 lora_networks.py
        """
        all_files = folder_paths.get_filename_list("loras")
        tree = {"all": all_files, "/": {"all": []}}

        for f in all_files:
            parts = f.replace("\\", "/").split("/")
            if len(parts) == 1:
                tree["/"]["all"].append(f)
            else:
                node = tree
                for part in parts[:-1]:
                    if part not in node:
                        node[part] = {"all": []}
                    node = node[part]
                    if f not in node["all"]:
                        node["all"].append(f)

        return tree

    @staticmethod
    def get_metadata(lora_name: str) -> dict:
        """
        读取 LoRA 元数据（优先 sidecar JSON，其次 safetensors header）
        返回: {base_model, trigger_words, description, preview_image}
        """
        full_path = folder_paths.get_full_path("loras", lora_name)
        if not full_path:
            return {}

        # 尝试 sidecar 文件 (同名 .json)
        sidecar = full_path + ".json"
        if os.path.exists(sidecar):
            try:
                with open(sidecar, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass

        # 尝试 .safetensors header
        try:
            header = comfy.utils.load_torch_file(full_path, safe_load=True, return_metadata=True)
            if "__metadata__" in header:
                meta = header["__metadata__"]
                return {
                    "base_model": meta.get("ss_base_model_version", ""),
                    "trigger_words": meta.get("ss_tag_frequency", "").split(",")[:5],
                    "description": meta.get("ss_description", ""),
                }
        except Exception:
            pass

        return {}

    @staticmethod
    def search(query: str) -> list:
        """模糊搜索 LoRA 文件名"""
        all_files = folder_paths.get_filename_list("loras")
        query_lower = query.lower()
        return [f for f in all_files if query_lower in f.lower()]
```

---

## 7. API 路由

在现有 `api_routes.py` 中新增以下路由（前缀沿用 `/moton_prompt_enhancer/api`）：

### 7.1 群组 CRUD

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/lora_groups` | 获取所有群组 |
| POST | `/lora_groups/create` | 创建群组 `{name, description}` |
| POST | `/lora_groups/rename` | 重命名群组 `{old_name, new_name}` |
| POST | `/lora_groups/delete` | 删除群组 `{name}` |
| GET | `/lora_groups/{name}` | 获取单个群组详情 |

### 7.2 群组内 LoRA 操作

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | `/lora_groups/{name}/add` | 添加 LoRA `{lora, weight, clip_weight}` |
| POST | `/lora_groups/{name}/remove` | 移除 LoRA `{lora}` |
| POST | `/lora_groups/{name}/update` | 更新 LoRA 属性 `{lora, weight?, clip_weight?, enabled?, note?}` |
| POST | `/lora_groups/{name}/reorder` | 重排序 `{order: [lora_name, ...]}` |

### 7.3 LoRA 扫描

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/lora_scan/list` | 全量 LoRA 列表 |
| GET | `/lora_scan/folders` | 文件夹树 |
| GET | `/lora_scan/search?q=xxx` | 模糊搜索 |
| GET | `/lora_scan/metadata?name=xxx` | 单个 LoRA 元数据 |

### 7.4 示例路由实现

```python
from aiohttp import web
from server import PromptServer
from .lora_group_manager import LoraGroupManager
from .lora_scanner import LoraScanner

@PromptServer.instance.routes.get("/moton_prompt_enhancer/api/lora_groups")
async def api_get_lora_groups(request):
    try:
        mgr = LoraGroupManager()
        groups = mgr.load_groups()
        # 返回简要信息（不含完整 lora 列表，减少传输量）
        summary = {name: {
            "label": g.get("label", name),
            "description": g.get("description", ""),
            "count": len(g.get("loras", [])),
            "updated_at": g.get("updated_at", ""),
        } for name, g in groups.items()}
        return web.json_response({"success": True, "data": summary})
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=500)

@PromptServer.instance.routes.get("/moton_prompt_enhancer/api/lora_groups/{name}")
async def api_get_lora_group(request):
    try:
        group_name = request.match_info["name"]
        mgr = LoraGroupManager()
        groups = mgr.load_groups()
        if group_name not in groups:
            return web.json_response(
                {"success": False, "error": f"群组 '{group_name}' 不存在"}, status=404)
        return web.json_response({"success": True, "data": groups[group_name]})
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=500)

@PromptServer.instance.routes.post("/moton_prompt_enhancer/api/lora_groups/create")
async def api_create_lora_group(request):
    try:
        data = await request.json()
        name = data.get("name", "").strip()
        if not name:
            return web.json_response({"success": False, "error": "名称不能为空"}, status=400)
        mgr = LoraGroupManager()
        mgr.create_group(name, data.get("description", ""))
        return web.json_response({"success": True})
    except ValueError as e:
        return web.json_response({"success": False, "error": str(e)}, status=400)
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=500)

# ... 其余路由类似
```

---

## 8. 前端设计

### 8.1 节点画布 Widget

详见 `design/lora_node_canvas_widget.html`，包含 4 种状态的完整 HTML/CSS 原型：

**节点 body 区域布局（从上到下）：**

| 区域 | 高度 | 说明 |
|------|------|------|
| 底模下拉 | 26px | COMBO widget，显示 checkpoint 文件名 |
| 群组选择行 | 28px | 左侧状态灯(绿/红/灰) + "群组"标签 + 群组名(蓝色) + LoRA计数 + ⚙按钮 |
| 倍率滑块 | 26px | 0.00~2.00×，实时显示数值 |
| LoRA 迷你列表 | 可折叠 | 默认折叠(显示计数badge)，展开后逐行显示：状态灯 + 文件名 + 权重 |
| 操作栏 | 22px | [⚙ 管理群组] [🎲 随机填充] 两个等宽按钮 |
| 端口行 | ~28px | 左侧 MODEL(紫) CLIP(金)，右侧同 |

**4 种状态：**
- **Default**：群组有效，状态灯绿色，LoRA 列表可展开
- **Collapsed**：LoRA 列表折叠，节点更紧凑
- **Empty**：未选群组，状态灯灰色，"未选择群组"斜体占位
- **Error**：LoRA 文件缺失，状态灯红色，节点边框变红，缺失项高亮

**关键交互：**
- 点击「⚙ 管理群组」按钮 → 打开全屏管理面板（见 8.2）
- 点击 LoRA 列表头 → 展开/折叠（CSS transition 动画）
- 倍率滑块拖动 → 实时更新数值显示
- 底模下拉 → 标准 ComfyUI COMBO widget 行为
- 右键菜单 → 导出群组配置、重置节点

### 8.2 管理面板（全屏弹窗）

已在 `design/lora_group_manager_prototype.html` 中可视化设计。结构分为：

```
┌─────────────────────────────────────────────┐
│  LoRA 群组管理器          [导入][导出] [×]  │
├──────────┬──────────────────────────────────┤
│  群组列表  │  当前群组: 日系动漫风            │
│           │  ┌────────────────────────────┐  │
│  [搜索…]  │  │ ⠿ [ON] animeStyle_v2   0.80│  │
│           │  │ ⠿ [ON] detail_tweaker  0.50│  │
│  ✦ 日系动漫│  │ ⠿ [OFF] eye_detail    0.60│  │
│  ✦ 写实人像│  └────────────────────────────┘  │
│  ✦ 风景摄影│                                  │
│  ✦ 赛博朋克│  ▸ 从磁盘添加 LoRA (247个)       │
│           │  / › Character › Anime           │
│ [+ 新建]   │  [搜索…]                         │
│           │  📁Realistic 📁Style anime_face+  │
└──────────┴──────────────────────────────────┘
```

### 8.3 前端 JS 扩展注册

```javascript
// js/lora_group_panel.js
import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

app.registerExtension({
    name: "Comfy.MotonPromptCraft.LoraGroupLoader",

    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== "ModelLoraGroupLoader") return;

        // 节点创建时添加管理按钮
        const onCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            onCreated?.apply(this, arguments);

            // 添加「管理群组」按钮
            this.addWidget("button", "管理群组", "open_panel", () => {
                openLoraGroupPanel(this);
            });
        };
    },

    async nodeCreated(node) {
        if (node.comfyClass !== "ModelLoraGroupLoader") return;
        node.serialize_widgets = true;
    },
});

async function openLoraGroupPanel(node) {
    // 加载群组数据
    const resp = await api.fetchApi("/moton_prompt_enhancer/api/lora_groups");
    const { data: groups } = await resp.json();

    // 加载 LoRA 列表
    const loraResp = await api.fetchApi("/moton_prompt_enhancer/api/lora_scan/folders");
    const { data: loraTree } = await loraResp.json();

    // 创建弹窗（内容来自 lora_group_manager_prototype.html 的结构）
    const modal = createModal(groups, loraTree, node);
    document.body.appendChild(modal);
}

function createModal(groups, loraTree, node) {
    // ... 构建 DOM 结构，参考 prototype.html
    // 绑定事件：群组 CRUD、LoRA 添加/移除/排序/权重修改
    // 操作完成后更新节点 widget 值
}
```

---

## 9. 与现有架构的集成

### 9.1 `__init__.py` 修改

```python
# 在现有节点注册后添加
try:
    from .model_lora_loader import ModelLoraGroupLoader
    NODE_CLASS_MAPPINGS["ModelLoraGroupLoader"] = ModelLoraGroupLoader
    NODE_DISPLAY_NAME_MAPPINGS["ModelLoraGroupLoader"] = "Model & LoRA Group Loader"
except ImportError as e:
    print(f"[PromptCraft] Warning: Failed to import ModelLoraGroupLoader: {e}")
```

### 9.2 `api_routes.py` 修改

在文件末尾添加新的路由定义（复用已有的 `PromptServer.instance` 模式）。

### 9.3 `config_manager.py` 修改

无需修改。`LoraGroupManager` 独立管理自己的配置文件，但复用 `config_manager.user_config_dir` 路径。

### 9.4 前端 `js/index.js` 修改

在现有扩展注册之后，加载新模块：

```javascript
// 在 index.js 末尾或顶部添加
import "./lora_group_panel.js";
```

---

## 10. Phase 2/3 预留接口

### 10.1 为 PromptCraft 节点交互预留

`ModelLoraGroupLoader` 的 `lora_group` 输入是 `STRING` 类型，这意味着：
- PromptCraft 节点可以输出一个群组名作为 STRING
- 直接连线到 ModelLoraGroupLoader 的 `lora_group` 输入即可

```
[PromptCraft] --STRING(lora_group)--> [ModelLoraGroupLoader]
```

### 10.2 为 Agent 模块预留

Agent 模块可以通过以下方式操控节点：
1. **读取群组列表**：调用 `GET /lora_groups` API
2. **修改群组配置**：调用群组 CRUD API
3. **切换当前群组**：通过 ComfyUI API 修改节点 widget 值
4. **切换底模**：通过 ComfyUI API 修改节点 checkpoint widget

这些操作在 Phase 3 的 `agent_tools.py` 中实现为一组 tool function。

---

## 11. 技术风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| `load_checkpoint_guess_config` 可能失败 | 底模加载报错 | VALIDATE_INPUTS 中校验文件存在性；execute 中 try-catch |
| LoRA 文件被移动/删除 | 群组中部分 LoRA 失效 | 加载时跳过不存在的文件并 print 警告，不中断执行 |
| 大量 LoRA 扫描耗时 | 前端面板打开慢 | 参考 weilin 的分页加载 + 线程池方案 |
| 群组名与 ComfyUI 内置冲突 | 不会，因为是 STRING 输入 | N/A |
| comfy.lora API 在不同 ComfyUI 版本变化 | 兼容性问题 | 封装加载函数，集中在 `_load_single_lora` 中，便于统一修改 |
