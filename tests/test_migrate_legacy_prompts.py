"""
migrate_legacy_prompts 单元测试
覆盖旧版权重语法 → 新版冒号语法的迁移规则
"""

import json
import os
import tempfile

from migrate_legacy_prompts import _migrate_json_file, _migrate_text


class TestMigrateParenSyntax:
    """多层括号语法迁移"""

    def test_double_paren_becomes_weight_1_0(self):
        # ((tag)) → (tag:1.0)
        result, count = _migrate_text("((tag))")
        assert result == "(tag:1.0)"
        assert count > 0

    def test_triple_paren_becomes_weight_1_5(self):
        # (((tag))) → (tag:1.5)
        result, count = _migrate_text("(((tag)))")
        assert result == "(tag:1.5)"
        assert count > 0

    def test_triple_paren_with_colon_preserved(self):
        # (((tag:1.5))) → (tag:1.5)（已有冒号权重时保留原值）
        result, count = _migrate_text("(((tag:1.5)))")
        assert result == "(tag:1.5)"
        assert count > 0


class TestMigrateBracketSyntax:
    """中括号语法迁移"""

    def test_double_bracket_becomes_weight_0_5(self):
        # [[tag]] → (tag:0.5)
        result, count = _migrate_text("[[tag]]")
        assert result == "(tag:0.5)"
        assert count > 0

    def test_single_bracket_becomes_weight_0_9(self):
        # [tag] → (tag:0.9)
        result, count = _migrate_text("[tag]")
        assert result == "(tag:0.9)"
        assert count > 0

    def test_single_bracket_with_colon_preserved(self):
        # [tag:0.5] → (tag:0.5)
        result, count = _migrate_text("[tag:0.5]")
        assert result == "(tag:0.5)"
        assert count > 0


class TestMigrateNoChange:

    def test_new_syntax_unchanged(self):
        # (already:new) 不变（新语法）
        result, count = _migrate_text("(already:new)")
        assert result == "(already:new)"
        assert count == 0

    def test_plain_text_unchanged(self):
        # 纯文本不变
        result, count = _migrate_text("plain text")
        assert result == "plain text"
        assert count == 0


class TestMigrateMixed:

    def test_mixed_text_migrates_all(self):
        # normal, ((enhanced)), [reduced] → normal, (enhanced:1.0), (reduced:0.9)
        result, count = _migrate_text("normal, ((enhanced)), [reduced]")
        assert result == "normal, (enhanced:1.0), (reduced:0.9)"
        assert count > 0


class TestMigrateCount:

    def test_count_zero_when_no_change(self):
        # 无变化时 count = 0
        _, count = _migrate_text("plain text without syntax")
        assert count == 0

    def test_count_positive_when_changed(self):
        # 有变化时 count > 0
        _, count = _migrate_text("((tag))")
        assert count > 0


class TestMigrateEdgeCases:

    def test_empty_string(self):
        result, count = _migrate_text("")
        assert result == ""
        assert count == 0

    def test_none_input(self):
        # _migrate_text 对 None 的处理：if not text 直接返回
        result, count = _migrate_text(None)
        assert result is None
        assert count == 0


class TestMigrateJsonFile:
    """_migrate_json_file 测试 — 覆盖 Bug 1: prompts 列表字段迁移"""

    def test_prompts_list_field_migrated(self):
        """Bug 1 回归测试: lora_prompts.json 中 prompts 是字符串列表，必须逐项迁移"""
        # 模拟 lora_prompts.json 结构
        data = {
            "version": "1.0.0",
            "loras": {
                "models/test.safetensors": {
                    "groups": [
                        {
                            "name": "group1",
                            "prompts": ["((tag1))", "[tag2]", "normal tag"],
                            "negative": "((bad_tag))"
                        }
                    ]
                }
            }
        }
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", delete=False, encoding="utf-8"
        ) as f:
            json.dump(data, f, ensure_ascii=False)
            tmp_path = f.name

        try:
            # 迁移 prompts 和 negative 字段
            changed = _migrate_json_file(tmp_path, ["prompts", "negative"])
            assert changed, "应当检测到需要迁移的旧语法"

            with open(tmp_path, "r", encoding="utf-8") as f:
                migrated = json.load(f)

            group = migrated["loras"]["models/test.safetensors"]["groups"][0]
            # prompts 列表中的每项应被迁移
            assert group["prompts"][0] == "(tag1:1.0)", f"Expected '(tag1:1.0)', got '{group['prompts'][0]}'"
            assert group["prompts"][1] == "(tag2:0.9)", f"Expected '(tag2:0.9)', got '{group['prompts'][1]}'"
            assert group["prompts"][2] == "normal tag"  # 无旧语法的项不变
            # negative 字符串字段也应被迁移
            assert group["negative"] == "(bad_tag:1.0)"
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
            bak = tmp_path + ".prompt.bak"
            if os.path.exists(bak):
                os.unlink(bak)

    def test_idempotent(self):
        """迁移幂等性：已是新语法的文件不会被修改"""
        data = {
            "version": "1.0.0",
            "loras": {
                "models/test.safetensors": {
                    "groups": [
                        {
                            "name": "group1",
                            "prompts": ["(tag1:1.0)", "(tag2:0.9)"],
                            "negative": "(bad:1.0)"
                        }
                    ]
                }
            }
        }
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", delete=False, encoding="utf-8"
        ) as f:
            json.dump(data, f, ensure_ascii=False)
            tmp_path = f.name

        try:
            changed = _migrate_json_file(tmp_path, ["prompts", "negative"])
            assert not changed, "已是新语法的文件不应被修改"
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    def test_backup_failure_aborts_migration(self, monkeypatch):
        """V1-DATA-01: 备份失败时应中止迁移，避免原文件无备份被覆盖"""
        data = {
            "version": "1.0.0",
            "loras": {
                "models/test.safetensors": {
                    "groups": [
                        {
                            "name": "group1",
                            "prompts": ["((tag1))"],
                            "negative": ""
                        }
                    ]
                }
            }
        }
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", delete=False, encoding="utf-8"
        ) as f:
            json.dump(data, f, ensure_ascii=False)
            tmp_path = f.name

        def _failing_copy(*args, **kwargs):
            raise OSError("模拟备份失败")

        monkeypatch.setattr("shutil.copy2", _failing_copy)

        try:
            changed = _migrate_json_file(tmp_path, ["prompts", "negative"])
            assert changed is False, "备份失败时应当中止迁移并返回 False"

            # 原文件应保持旧语法不变
            with open(tmp_path, "r", encoding="utf-8") as f:
                original = json.load(f)
            assert original["loras"]["models/test.safetensors"]["groups"][0]["prompts"] == ["((tag1))"]
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
            bak = tmp_path + ".prompt.bak"
            if os.path.exists(bak):
                os.unlink(bak)
