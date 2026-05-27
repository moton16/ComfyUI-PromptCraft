#!/bin/bash
# PromptCraft 版本号一键更新脚本
# 用法:
#   ./update_version.sh 1.3.0              # 更新版本号，清除 Mod
#   ./update_version.sh 1.3.0 Mod1         # 更新版本号 + Mod 后缀
#   ./update_version.sh 1.3.0 Mod1 "新功能描述"  # 同时在 README 版本历史中插入新条目

set -e

if [ -z "$1" ]; then
    echo "用法: ./update_version.sh <版本号> [Mod后缀] [版本描述]"
    echo "示例: ./update_version.sh 1.3.0 Mod1 \"新增AI Agent模块\""
    exit 1
fi

NEW_VER="$1"
MOD_SUFFIX="${2:-}"
DATE=$(date +%Y-%m-%d)

# 构建各格式的版本字符串
VER_V="v${NEW_VER}"          # v1.3.0
VER_UPPER="V${NEW_VER}"      # V1.3.0

if [ -n "$MOD_SUFFIX" ]; then
    FULL_UPPER="${VER_UPPER} ${MOD_SUFFIX}"   # V1.3.0 Mod1
    VER_DISPLAY="${VER_V} ${MOD_SUFFIX}"      # v1.3.0 Mod1
    VER_BADGE="${VER_V}%20${MOD_SUFFIX}"      # v1.3.0%20Mod1 (shields.io)
else
    FULL_UPPER="${VER_UPPER}"                  # V1.3.0
    VER_DISPLAY="${VER_V}"                     # v1.3.0
    VER_BADGE="${VER_V}"                       # v1.3.0
fi

echo "========================================="
echo " PromptCraft 版本更新"
echo " 新版本: ${FULL_UPPER}"
echo " 日期:   ${DATE}"
echo "========================================="
echo ""

# --- 1. __init__.py ---
INIT_FILE="__init__.py"
if [ -f "$INIT_FILE" ]; then
    # 匹配 V1.x.x 或 V1.x.x ModN
    sed -i -E "s/V[0-9]+\.[0-9]+\.[0-9]+( Mod[0-9]+)?/$(echo "${FULL_UPPER}" | sed 's/[&/\]/\\&/g')/g" "$INIT_FILE"
    echo "[OK] ${INIT_FILE}"
else
    echo "[SKIP] ${INIT_FILE} 不存在"
fi

# --- 2. pyproject.toml ---
PYPROJECT_FILE="pyproject.toml"
if [ -f "$PYPROJECT_FILE" ]; then
    sed -i -E "s/version = \"[0-9]+\.[0-9]+\.[0-9]+\"/version = \"${NEW_VER}\"/" "$PYPROJECT_FILE"
    echo "[OK] ${PYPROJECT_FILE}"
else
    echo "[SKIP] ${PYPROJECT_FILE} 不存在"
fi

# --- 3. js/index.js ---
JS_INDEX_FILE="js/index.js"
if [ -f "$JS_INDEX_FILE" ]; then
    sed -i -E "s/const VERSION = '[0-9]+\.[0-9]+\.[0-9]+';/const VERSION = '${NEW_VER}';/" "$JS_INDEX_FILE"
    echo "[OK] ${JS_INDEX_FILE}"
else
    echo "[SKIP] ${JS_INDEX_FILE} 不存在"
fi

# --- 4. js/control_panel.js ---
JS_FILE="js/control_panel.js"
if [ -f "$JS_FILE" ]; then
    sed -i -E "s/v[0-9]+\.[0-9]+\.[0-9]+( Mod[0-9]+)?/${VER_DISPLAY}/g" "$JS_FILE"
    echo "[OK] ${JS_FILE}"
else
    echo "[SKIP] ${JS_FILE} 不存在"
fi

# --- 5a. README_zh.md ---
README_ZH="README_zh.md"
if [ -f "$README_ZH" ]; then
    sed -i -E "s/版本-v[0-9]+\.[0-9]+\.[0-9]+(%20Mod[0-9]+)?/版本-${VER_BADGE}/g" "$README_ZH"
    sed -i -E "s/### v[0-9]+\.[0-9]+\.[0-9]+( Mod[0-9]+)? \([0-9-]+\) — 当前版本/### ${VER_DISPLAY} (${DATE}) — 当前版本/" "$README_ZH"
    echo "[OK] ${README_ZH}"
else
    echo "[SKIP] ${README_ZH} 不存在"
fi

# --- 5b. README_en.md ---
README_EN="README_en.md"
if [ -f "$README_EN" ]; then
    sed -i -E "s/Version-v[0-9]+\.[0-9]+\.[0-9]+(%20Mod[0-9]+)?/Version-${VER_BADGE}/g" "$README_EN"
    sed -i -E "s/### v[0-9]+\.[0-9]+\.[0-9]+( Mod[0-9]+)? \([0-9-]+\) — Current Version/### ${VER_DISPLAY} (${DATE}) — Current Version/" "$README_EN"
    echo "[OK] ${README_EN}"
else
    echo "[SKIP] ${README_EN} 不存在"
fi

# --- 6. CHANGELOG.md (根目录) ---
ROOT_CHANGELOG="CHANGELOG.md"
if [ -f "$ROOT_CHANGELOG" ]; then
    # 更新第一个版本标题行
    sed -i -E "1,10s/## \*\*v[0-9]+\.[0-9]+\.[0-9]+( Mod[0-9]+)?[[:space:]]*\([0-9-]+\)\*\*/## **${VER_DISPLAY}  (${DATE})**/" "$ROOT_CHANGELOG"
    echo "[OK] ${ROOT_CHANGELOG}"
else
    echo "[SKIP] ${ROOT_CHANGELOG} 不存在"
fi

# --- 7. docs/CHANGELOG.md ---
DOCS_CHANGELOG="docs/CHANGELOG.md"
if [ -f "$DOCS_CHANGELOG" ]; then
    # 更新第一个版本标题行
    sed -i -E "1,10s/## V[0-9]+\.[0-9]+\.[0-9]+( Mod[0-9]+)? \([0-9-]+\)/## ${FULL_UPPER} (${DATE})/" "$DOCS_CHANGELOG"
    echo "[OK] ${DOCS_CHANGELOG}"
else
    echo "[SKIP] ${DOCS_CHANGELOG} 不存在"
fi

echo ""
echo "========================================="
echo " 更新完成! 当前版本: ${FULL_UPPER}"
echo "========================================="
