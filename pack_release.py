#!/usr/bin/env python3
"""PromptCraft 标准打包脚本 — 生成与 GitHub Release 完全一致的纯净运行包。

产出目录结构与 .github/workflows/release.yml 保持一致：

    1. （默认）运行 pytest 门禁，与 CI 相同
    2. npm run build 编译 Vue 前端，产出 js/promptcraft-vue.js / .css
    3. git archive HEAD 导出 git 追踪的文件（自动排除 .gitignore 内容：
       缓存、本地用户配置等），等价于其他用户从 GitHub 获取的内容；
       Vue 产物已随仓库提交，会包含在导出中
    4. 删除开发文件（tests / src / design / docs / vite 配置等）
    5. 补入 Vue 构建产物并校验运行时必备文件
    6. 可选 --zip 生成 ComfyUI-PromptCraft-<版本>.zip

用法：
    python pack_release.py              # 完整流程，产出 dist/ComfyUI-PromptCraft/
    python pack_release.py --zip        # 额外生成 zip 发布包
    python pack_release.py --skip-tests # 跳过 pytest（快速迭代）
    python pack_release.py --skip-build # 跳过前端构建（复用现有产物）

产出的 dist/ComfyUI-PromptCraft/ 可直接复制（或软链接）到
ComfyUI/custom_nodes/ 下运行，与 GitHub Release zip 解压后等价。
"""

import argparse
import re
import shutil
import subprocess
import sys
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
PKG_NAME = "ComfyUI-PromptCraft"

# 构建产物（已纳入 git 追踪；此处用刚构建的版本覆盖，保证与当前 src/ 严格一致）
BUILD_ARTIFACTS = ["js/promptcraft-vue.js", "js/promptcraft-vue.css"]

# 运行时不需要的开发文件（与 release.yml 的剔除清单一致，外加本地目录兜底）
DEV_DIRS = [
    "tests", "src", "design", "docs", ".github",
    "staging", "work", ".gstack", ".claude", ".mimocode",
]
DEV_FILES = [
    "CLAUDE.md", "PLAN.md", "DEVELOPMENT.md", "MIGRATION.md",
    "package.json", "package-lock.json", "vite.config.js",
    ".pre-commit-config.yaml", "update_version.sh", "Makefile",
    "pack_release.py",
]

# 运行时必备文件（与 release.yml 校验一致）
RUNTIME_ESSENTIALS = [
    "__init__.py", "pyproject.toml",
    "js/promptcraft-vue.js", "js/promptcraft-vue.css",
    "data/sfw_prompts.json", "data/nsfw_prompts.json",
]


def fail(msg):
    print(f"[pack] 错误：{msg}", file=sys.stderr)
    sys.exit(1)


def run(cmd, **kwargs):
    print(f"[pack] $ {' '.join(str(c) for c in cmd)}")
    subprocess.run([str(c) for c in cmd], check=True, cwd=ROOT, **kwargs)


def tool(name):
    path = shutil.which(name)
    if not path:
        fail(f"找不到命令：{name}，请确认已安装并在 PATH 中")
    return path


def get_version():
    text = (ROOT / "pyproject.toml").read_text(encoding="utf-8")
    match = re.search(r'^version\s*=\s*"([^"]+)"', text, re.MULTILINE)
    if not match:
        fail("无法从 pyproject.toml 解析版本号")
    return match.group(1)


def run_tests():
    print("\n[pack] === 1/5 运行 pytest 门禁 ===")
    run([sys.executable, "-m", "pytest", "-q"])


def build_frontend(skip):
    print("\n[pack] === 2/5 构建 Vue 前端 ===")
    if skip:
        print("[pack] 跳过构建（--skip-build）")
    else:
        run([tool("npm"), "run", "build"])
    for rel in BUILD_ARTIFACTS:
        if not (ROOT / rel).is_file():
            fail(f"构建产物缺失：{rel}，请去掉 --skip-build 重新运行")


def export_tracked(pkg_dir):
    print("\n[pack] === 3/5 导出 git 追踪文件（排除 .gitignore 内容）===")
    tar_path = DIST / "pkg.tar"
    run([tool("git"), "archive", "--format=tar",
         f"--prefix={PKG_NAME}/", "HEAD", "-o", str(tar_path)])
    with tarfile.open(tar_path) as tf:
        try:
            tf.extractall(DIST, filter="tar")
        except TypeError:  # Python < 3.12 无 filter 参数
            tf.extractall(DIST)
    tar_path.unlink()
    print(f"[pack] 已导出到 {pkg_dir}")


def strip_dev_files(pkg_dir):
    print("\n[pack] === 4/5 剔除开发文件 ===")
    for d in DEV_DIRS:
        target = pkg_dir / d
        if target.exists():
            shutil.rmtree(target)
            print(f"[pack]   删除目录 {d}/")
    for f in DEV_FILES:
        target = pkg_dir / f
        if target.is_file():
            target.unlink()
            print(f"[pack]   删除文件 {f}")


def inject_artifacts_and_verify(pkg_dir):
    print("\n[pack] === 5/5 补入构建产物并校验 ===")
    for rel in BUILD_ARTIFACTS:
        shutil.copy2(ROOT / rel, pkg_dir / rel)
        print(f"[pack]   补入 {rel}")
    for rel in RUNTIME_ESSENTIALS:
        if not (pkg_dir / rel).is_file():
            fail(f"运行时必备文件缺失：{rel}")
    print("[pack] 运行时必备文件校验通过")


def warn_dirty_tree():
    result = subprocess.run(
        [tool("git"), "status", "--porcelain"],
        capture_output=True, text=True, cwd=ROOT,
    )
    dirty = [line for line in result.stdout.splitlines() if line.strip()]
    if dirty:
        print(f"\n[pack] 注意：工作区还有 {len(dirty)} 处未提交改动，"
              f"不包含在本包中（本包与 git HEAD 一致，等价于 GitHub 上的内容）")


def main():
    parser = argparse.ArgumentParser(description="生成纯净发布包")
    parser.add_argument("--zip", action="store_true", help="额外生成 zip 包")
    parser.add_argument("--skip-tests", action="store_true", help="跳过 pytest")
    parser.add_argument("--skip-build", action="store_true", help="跳过前端构建")
    args = parser.parse_args()

    version = get_version()
    pkg_dir = DIST / PKG_NAME

    if not args.skip_tests:
        run_tests()
    build_frontend(args.skip_build)

    # 每次生成全新文件夹
    if pkg_dir.exists():
        shutil.rmtree(pkg_dir)
    DIST.mkdir(parents=True, exist_ok=True)

    export_tracked(pkg_dir)
    strip_dev_files(pkg_dir)
    inject_artifacts_and_verify(pkg_dir)
    warn_dirty_tree()

    file_count = sum(1 for p in pkg_dir.rglob("*") if p.is_file())
    print(f"\n[pack] 完成：{pkg_dir}（{file_count} 个文件，版本 {version}）")
    print(f"[pack] 使用方法：将 {PKG_NAME} 文件夹复制或软链接到 ComfyUI/custom_nodes/ 后重启 ComfyUI")

    if args.zip:
        zip_base = DIST / f"{PKG_NAME}-{version}"
        shutil.make_archive(str(zip_base), "zip", root_dir=DIST, base_dir=PKG_NAME)
        print(f"[pack] zip 包：{zip_base}.zip")


if __name__ == "__main__":
    main()
