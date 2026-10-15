#!/usr/bin/env bash
#
# 构建 Excalidraw 插件（本地编译版）并安装到 Obsidian 插件目录。
#
# 用法:
#   ./install-to-vault.sh [插件目录]
# 不传参数时用下面的 VAULT_PLUGIN_DIR 默认值。
#
# 只覆盖 main.js / manifest.json / styles.css 三个文件，
# 不会动插件目录里的 data.json（你的设置）。
#
# 注意: 这是 master 分支的编译产物（2.29.0 + 若干未发布提交），
# 不等于插件市场发布的版本。插件市场自动更新会覆盖 main.js，
# 覆盖后重跑本脚本即可恢复。

set -euo pipefail

VAULT_PLUGIN_DIR="${1:-/Users/chou/obsidian_study_notes/.obsidian/plugins/obsidian-excalidraw-plugin}"

cd "$(dirname "$0")"

if [ ! -d "$VAULT_PLUGIN_DIR" ]; then
	echo "找不到插件目录: $VAULT_PLUGIN_DIR" >&2
	exit 1
fi

npm run build

cp -p dist/main.js dist/manifest.json dist/styles.css "$VAULT_PLUGIN_DIR/"

echo
echo "已安装到 $VAULT_PLUGIN_DIR"
echo "在 Obsidian 里重载插件后生效（Cmd+R，或 设置 → 第三方插件 里关掉 Excalidraw 再打开）"
