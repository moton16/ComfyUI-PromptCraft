"""
旧版 prompt 权重语法迁移工具

V1-BE-04: 将多层括号/中括号旧语法统一迁移为 SD 标准冒号语法 (tag:weight)。

迁移规则：
  (((tag:1.5)))  → (tag:1.5)    多层括号+冒号 → 单层括号+冒号
  ((tag:1.5))    → (tag:1.5)
  (((tag)))      → (tag:1.5)    多层括号无冒号 → 默认 1.5（每层 +0.5）
  ((tag))        → (tag:1.0)    两层=1.0, 三层=1.5, 四层=2.0 ...
  [[tag]]        → (tag:0.5)    多层中括号 → 0.5
  [tag]          → (tag:0.9)    单层中括号 → 0.9
  [tag:0.5]      → (tag:0.5)    中括号+冒号 → 括号+冒号

迁移目标：
  - prompt_history.json（用户配置目录）
  - lora_prompts.json（LoRA prompt 管理）

备份：迁移前自动备份为 *.prompt.bak（已存在则不覆盖）。
幂等：重复运行不会重复迁移（已是新语法的文本不会被修改）。
"""

import json
import os
import re
from typing import Tuple

# 旧语法正则（从内到外匹配，避免贪婪问题）
# 匹配多层括号包裹的纯 tag（无冒号）：((tag)), (((tag)))
_RE_MULTI_PAREN = re.compile(r'\({2,}([^()]+)\){2,}')
# 匹配多层中括号：[[tag]], [[[tag]]]
_RE_MULTI_BRACKET = re.compile(r'\[{2,}([^\[\]]+)\]{2,}')
# 匹配单层中括号带冒号：[tag:0.5]
_RE_SINGLE_BRACKET_COLON = re.compile(r'\[([^\[\]:]+):(\d+\.?\d*)\]')
# 匹配单层中括号：[tag]
_RE_SINGLE_BRACKET = re.compile(r'\[([^\[\]]+)\]')


def _migrate_text(text: str) -> Tuple[str, int]:
    """迁移单条文本，返回 (新文本, 替换次数)"""
    if not text:
        return text, 0
    count = 0
    original = text

    # 1. 多层中括号 [[tag]] → (tag:0.5)（先处理多层，避免被单层规则误匹配）
    def _repl_multi_bracket(m):
        nonlocal count
        count += 1
        return f"({m.group(1)}:0.5)"
    text = _RE_MULTI_BRACKET.sub(_repl_multi_bracket, text)

    # 2. 单层中括号带冒号 [tag:0.5] → (tag:0.5)
    def _repl_single_bracket_colon(m):
        nonlocal count
        count += 1
        return f"({m.group(1)}:{m.group(2)})"
    text = _RE_SINGLE_BRACKET_COLON.sub(_repl_single_bracket_colon, text)

    # 3. 单层中括号 [tag] → (tag:0.9)
    def _repl_single_bracket(m):
        nonlocal count
        count += 1
        return f"({m.group(1)}:0.9)"
    text = _RE_SINGLE_BRACKET.sub(_repl_single_bracket, text)

    # 4. 多层括号带冒号 (((tag:1.5))) → (tag:1.5)
    # 必须先于无冒号多层括号处理，否则 [^()]+ 会吞掉 "tag:1.5"
    _re_multi_paren_colon = re.compile(r'\({2,}([^()]+:\d+\.?\d*)\){2,}')
    def _repl_multi_paren_colon(m):
        nonlocal count
        count += 1
        return f"({m.group(1)})"
    prev = None
    while prev != text:
        prev = text
        text = _re_multi_paren_colon.sub(_repl_multi_paren_colon, text)

    # 5. 多层括号无冒号 (((tag))) → (tag:weight)
    # 每层括号 +0.5 权重：2层=1.0, 3层=1.5, 4层=2.0
    # 正则排除含冒号的内容，避免误匹配已处理的 (tag:w)
    _re_multi_paren_no_colon = re.compile(r'\({2,}([^():]+)\){2,}')
    def _repl_multi_paren(m):
        nonlocal count
        full = m.group(0)
        left_count = full.count('(')
        weight = 0.5 + (left_count - 1) * 0.5  # 2层=1.0, 3层=1.5
        count += 1
        return f"({m.group(1)}:{weight:.1f})"
    prev = None
    while prev != text:
        prev = text
        text = _re_multi_paren_no_colon.sub(_repl_multi_paren, text)

    if text != original:
        return text, count
    return text, 0


def _migrate_json_file(file_path: str, fields_to_check: list) -> bool:
    """迁移 JSON 文件中的 prompt 字段

    Args:
        file_path: JSON 文件路径
        fields_to_check: 需要检查迁移的字段名列表（如 ["positive_prompt", "negative_prompt"]）

    Returns:
        True 如果文件被修改并写入
    """
    if not os.path.exists(file_path):
        return False
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"[Migrate] 读取失败 {os.path.basename(file_path)}: {e}")
        return False

    total_changes = 0

    # 处理 prompt_history.json 结构：{"entries": [{"positive_prompt": ...}, ...]}
    entries = None
    if isinstance(data, dict) and "entries" in data:
        entries = data["entries"]
    elif isinstance(data, list):
        entries = data

    if entries and isinstance(entries, list):
        for entry in entries:
            if not isinstance(entry, dict):
                continue
            for field in fields_to_check:
                if field in entry and isinstance(entry[field], str):
                    new_text, n = _migrate_text(entry[field])
                    if n > 0:
                        entry[field] = new_text
                        total_changes += n
    else:
        # 处理其他结构（如 lora_prompts.json）
        def _walk(obj):
            nonlocal total_changes
            if isinstance(obj, dict):
                for k, v in obj.items():
                    if k in fields_to_check:
                        # Bug fix: prompts 字段可能是字符串列表，需逐项迁移
                        if isinstance(v, str):
                            new_text, n = _migrate_text(v)
                            if n > 0:
                                obj[k] = new_text
                                total_changes += n
                        elif isinstance(v, list):
                            for i, item in enumerate(v):
                                if isinstance(item, str):
                                    new_text, n = _migrate_text(item)
                                    if n > 0:
                                        v[i] = new_text
                                        total_changes += n
                    else:
                        _walk(v)
            elif isinstance(obj, list):
                for item in obj:
                    _walk(item)
        _walk(data)

    if total_changes == 0:
        return False

    # 备份原文件（不覆盖已存在的 .bak）
    bak_path = file_path + ".prompt.bak"
    if not os.path.exists(bak_path):
        try:
            import shutil
            shutil.copy2(file_path, bak_path)
        except Exception as e:
            # V1-DATA-01: 备份失败时中止迁移，避免无备份覆盖导致数据丢失
            print(f"[Migrate] 备份失败 {os.path.basename(file_path)}，中止迁移以防数据丢失: {e}")
            return False

    # 写入迁移后的数据
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"[Migrate] 已迁移 {os.path.basename(file_path)}: {total_changes} 处旧语法")
        return True
    except Exception as e:
        print(f"[Migrate] 写入失败 {os.path.basename(file_path)}: {e}")
        return False


def run_migration(user_config_dir: str) -> int:
    """运行一次性迁移（幂等，可在启动时调用）

    Args:
        user_config_dir: 用户配置目录路径

    Returns:
        迁移的文件数
    """
    migrated = 0

    # 1. prompt_history.json
    history_path = os.path.join(user_config_dir, "prompt_history.json")
    if _migrate_json_file(history_path, ["positive_prompt", "negative_prompt"]):
        migrated += 1

    # 2. lora_prompts.json（LoRA prompt 管理）
    lora_prompts_path = os.path.join(user_config_dir, "lora_prompts.json")
    if _migrate_json_file(lora_prompts_path, ["prompts", "negative"]):
        migrated += 1

    if migrated > 0:
        print(f"[Migrate] 权重语法迁移完成：{migrated} 个文件已更新为冒号语法")
    return migrated


# ==================== 自检 ====================

def _self_test():
    """自测迁移逻辑"""
    cases = [
        ("((tag))", "(tag:1.0)"),
        ("(((tag)))", "(tag:1.5)"),
        ("(((tag:1.5)))", "(tag:1.5)"),
        ("((tag:1.5))", "(tag:1.5)"),
        ("[[tag]]", "(tag:0.5)"),
        ("[tag]", "(tag:0.9)"),
        ("[tag:0.5]", "(tag:0.5)"),
        ("normal tag, ((enhanced)), [reduced]", "normal tag, (enhanced:1.0), (reduced:0.9)"),
        ("(already:new)", "(already:new)"),  # 新语法保持不变
        ("plain text", "plain text"),  # 无权重语法不变
    ]
    failures = 0
    for old, expected in cases:
        result, n = _migrate_text(old)
        # 新语法不变的情况 n=0，有变化 n>0
        if result != expected:
            print(f"  FAIL: {old!r} → {result!r} (期望 {expected!r})")
            failures += 1
    if failures == 0:
        print("[Migrate] 自测全部通过")
    else:
        print(f"[Migrate] 自测失败 {failures} 项")
    return failures == 0


if __name__ == "__main__":
    _self_test()
