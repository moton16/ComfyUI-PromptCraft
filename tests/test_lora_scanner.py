"""
LoraScanner 测试
覆盖: _parse_training_words, _read_safetensors_header, _compute_sha256,
      list_folders, search, get_lora_info
"""

import hashlib
import json
import os
import struct
from unittest.mock import patch

from lora_scanner import LoraScanner

# ==================== _parse_training_words ====================

class TestParseTrainingWords:

    def test_empty_input_returns_empty(self):
        assert LoraScanner._parse_training_words(None) == []
        assert LoraScanner._parse_training_words("") == []
        assert LoraScanner._parse_training_words({}) == []

    def test_string_json_input(self):
        data = json.dumps({"b0": {"custom_tag": 10, "1girl": 5}})
        result = LoraScanner._parse_training_words(data)
        words = [w["word"] for w in result]
        assert "custom_tag" in words
        assert "1girl" in words

    def test_non_common_before_common(self):
        data = {"b0": {"1girl": 100, "trigger_word_xyz": 50, "solo": 80}}
        result = LoraScanner._parse_training_words(data)
        words = [w["word"] for w in result]
        non_common_idx = words.index("trigger_word_xyz")
        common_idx = words.index("1girl")
        assert non_common_idx < common_idx

    def test_max_count(self):
        tags = {f"tag_{i}": i for i in range(50)}
        data = {"b0": tags}
        result = LoraScanner._parse_training_words(data, max_count=5)
        assert len(result) == 5

    def test_invalid_json_string_returns_empty(self):
        assert LoraScanner._parse_training_words("not valid json !!!") == []

    def test_non_dict_input_returns_empty(self):
        assert LoraScanner._parse_training_words(42) == []
        assert LoraScanner._parse_training_words([1, 2, 3]) == []

    def test_multiple_buckets_accumulate(self):
        data = {
            "b0": {"tag_a": 3, "tag_b": 1},
            "b1": {"tag_a": 2, "tag_b": 5},
        }
        result = LoraScanner._parse_training_words(data)
        counts = {w["word"]: w["count"] for w in result}
        assert counts["tag_a"] == 5
        assert counts["tag_b"] == 6

    def test_non_common_tags_sorted_by_count_desc(self):
        data = {"b0": {"alpha_tag": 1, "beta_tag": 3, "gamma_tag": 2}}
        result = LoraScanner._parse_training_words(data)
        assert result[0]["word"] == "beta_tag"
        assert result[1]["word"] == "gamma_tag"
        assert result[2]["word"] == "alpha_tag"

    def test_tags_with_non_numeric_count_ignored(self):
        data = {"b0": {"good_tag": 5, "bad_tag": "not_a_number"}}
        result = LoraScanner._parse_training_words(data)
        assert len(result) == 1
        assert result[0]["word"] == "good_tag"

    def test_empty_tag_name_skipped(self):
        data = {"b0": {"": 5, "valid_tag": 1}}
        result = LoraScanner._parse_training_words(data)
        assert len(result) == 1
        assert result[0]["word"] == "valid_tag"


# ==================== _read_safetensors_header ====================

def _write_safetensors_file(path: str, header: dict, extra_data: bytes = b"\x00" * 64):
    """写入一个最小 safetensors 文件：8字节LE header_size + JSON header + 伪数据"""
    header_bytes = json.dumps(header).encode("utf-8")
    with open(path, "wb") as f:
        f.write(struct.pack("<Q", len(header_bytes)))
        f.write(header_bytes)
        f.write(extra_data)


class TestReadSafetensorsHeader:

    def test_valid_header(self, tmp_path):
        header = {
            "__metadata__": {"ss_output_name": "my_lora", "ss_base_model_version": "SD1.5"},
            "lora_up.weight": {"dtype": "F16", "shape": [128, 64], "data_offsets": [0, 16384]},
        }
        path = str(tmp_path / "test.safetensors")
        _write_safetensors_file(path, header)
        result = LoraScanner._read_safetensors_header(path)
        assert result["__metadata__"]["ss_output_name"] == "my_lora"
        assert "lora_up.weight" in result

    def test_metadata_json_string_parsed(self, tmp_path):
        header = {
            "__metadata__": {
                "ss_tag_frequency": json.dumps({"b0": {"tag1": 10}})
            }
        }
        path = str(tmp_path / "test.safetensors")
        _write_safetensors_file(path, header)
        result = LoraScanner._read_safetensors_header(path)
        meta = result.get("__metadata__", {})
        assert isinstance(meta["ss_tag_frequency"], dict)

    def test_too_small_file_returns_empty(self, tmp_path):
        path = str(tmp_path / "tiny.bin")
        with open(path, "wb") as f:
            f.write(b"\x00" * 4)
        assert LoraScanner._read_safetensors_header(path) == {}

    def test_nonexistent_file_returns_empty(self):
        assert LoraScanner._read_safetensors_header("/nonexistent/file.safetensors") == {}

    def test_header_size_zero_returns_empty(self, tmp_path):
        path = str(tmp_path / "zero.bin")
        with open(path, "wb") as f:
            f.write(struct.pack("<Q", 0))
            f.write(b"\x00" * 64)
        assert LoraScanner._read_safetensors_header(path) == {}


# ==================== _compute_sha256 ====================

class TestComputeSha256:

    def test_known_content(self, tmp_path):
        content = b"hello promptcraft"
        path = str(tmp_path / "known.bin")
        with open(path, "wb") as f:
            f.write(content)
        expected = hashlib.sha256(content).hexdigest()
        assert LoraScanner._compute_sha256(path) == expected

    def test_empty_file(self, tmp_path):
        path = str(tmp_path / "empty.bin")
        with open(path, "wb") as f:
            f.write(b"")
        expected = hashlib.sha256(b"").hexdigest()
        assert LoraScanner._compute_sha256(path) == expected

    def test_nonexistent_file_returns_empty(self):
        assert LoraScanner._compute_sha256("/nonexistent/file.bin") == ""

    def test_large_file_chunked(self, tmp_path):
        content = os.urandom(8192 + 100)
        path = str(tmp_path / "large.bin")
        with open(path, "wb") as f:
            f.write(content)
        expected = hashlib.sha256(content).hexdigest()
        assert LoraScanner._compute_sha256(path) == expected


# ==================== list_folders ====================

class TestListFolders:

    @patch("lora_scanner.folder_paths")
    def test_flat_structure(self, mock_fp):
        mock_fp.get_filename_list.return_value = [
            "style_a.safetensors",
            "style_b.safetensors",
        ]
        tree = LoraScanner.list_folders()
        assert "/" in tree
        assert len(tree["/"]["all"]) == 2

    @patch("lora_scanner.folder_paths")
    def test_nested_structure(self, mock_fp):
        mock_fp.get_filename_list.return_value = [
            "style/cyberpunk.safetensors",
            "style/neon.safetensors",
            "character/amiya.safetensors",
        ]
        tree = LoraScanner.list_folders()
        assert "style" in tree
        assert "character" in tree
        assert len(tree["style"]["all"]) == 2
        assert len(tree["character"]["all"]) == 1


# ==================== search ====================

class TestSearch:

    @patch("lora_scanner.folder_paths")
    def test_empty_query_returns_all(self, mock_fp):
        mock_fp.get_filename_list.return_value = ["a.safetensors", "b.safetensors"]
        result = LoraScanner.search("")
        assert len(result) == 2

    @patch("lora_scanner.folder_paths")
    def test_query_filters(self, mock_fp):
        mock_fp.get_filename_list.return_value = [
            "style/cyberpunk.safetensors",
            "style/neon.safetensors",
            "character/amiya.safetensors",
        ]
        result = LoraScanner.search("cyber")
        assert len(result) == 1
        assert "cyberpunk" in result[0]

    @patch("lora_scanner.folder_paths")
    def test_case_insensitive(self, mock_fp):
        mock_fp.get_filename_list.return_value = ["MyLoRA.safetensors"]
        assert len(LoraScanner.search("mylora")) == 1
        assert len(LoraScanner.search("MYLORA")) == 1

    @patch("lora_scanner.folder_paths")
    def test_no_match_returns_empty(self, mock_fp):
        mock_fp.get_filename_list.return_value = ["style_a.safetensors"]
        assert LoraScanner.search("zzz_no_match") == []


# ==================== get_lora_info ====================

class TestGetLoraInfo:

    @patch("lora_scanner.folder_paths")
    def test_info_from_safetensors(self, mock_fp, tmp_path):
        tag_freq = {"b0": {"trigger_word": 20, "1girl": 10}}
        header = {
            "__metadata__": {
                "modelspec.title": "My Cool LoRA",
                "ss_sd_model_name": "animagine_v3",
                "ss_clip_skip": "2",
                "ss_description": "A test lora",
                "ss_tag_frequency": json.dumps(tag_freq),
            }
        }
        lora_file = tmp_path / "my_lora.safetensors"
        _write_safetensors_file(str(lora_file), header)
        pc_info = tmp_path / "my_lora.safetensors.pc-info.json"
        if pc_info.exists():
            pc_info.unlink()

        mock_fp.get_full_path.return_value = str(lora_file)
        result = LoraScanner.get_lora_info("my_lora.safetensors")
        assert result["name"] == "My Cool LoRA"
        assert result["base_model"] == "animagine_v3"
        assert result["clip_skip"] == "2"
        assert result["description"] == "A test lora"
        words = [w["word"] for w in result["training_words"]]
        assert "trigger_word" in words

    @patch("lora_scanner.folder_paths")
    def test_nonexistent_file_returns_error(self, mock_fp):
        mock_fp.get_full_path.return_value = "/nonexistent/path.safetensors"
        result = LoraScanner.get_lora_info("missing.safetensors")
        assert "error" in result

    @patch("lora_scanner.folder_paths")
    def test_cache_hit(self, mock_fp, tmp_path):
        header = {"__metadata__": {"modelspec.title": "Cached LoRA"}}
        lora_file = tmp_path / "cached.safetensors"
        _write_safetensors_file(str(lora_file), header)
        mock_fp.get_full_path.return_value = str(lora_file)

        LoraScanner.get_lora_info("cached.safetensors")
        result = LoraScanner.get_lora_info("cached.safetensors")
        assert result["name"] == "Cached LoRA"

    @patch("lora_scanner.folder_paths")
    def test_sha256_from_metadata(self, mock_fp, tmp_path):
        header = {"__metadata__": {"_sha256": "abc123def456"}}
        lora_file = tmp_path / "with_hash.safetensors"
        _write_safetensors_file(str(lora_file), header)
        mock_fp.get_full_path.return_value = str(lora_file)
        result = LoraScanner.get_lora_info("with_hash.safetensors")
        assert result["sha256"] == "abc123def456"

    @patch("lora_scanner.folder_paths")
    def test_non_safetensors_falls_back_to_compute(self, mock_fp, tmp_path):
        lora_file = tmp_path / "model.pt"
        lora_file.write_bytes(b"fake weights")
        mock_fp.get_full_path.return_value = str(lora_file)
        result = LoraScanner.get_lora_info("model.pt")
        expected_hash = hashlib.sha256(b"fake weights").hexdigest()
        assert result["sha256"] == expected_hash
        assert result["name"] == "model"
