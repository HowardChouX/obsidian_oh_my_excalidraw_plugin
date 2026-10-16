#!/usr/bin/env bash
#
# 构建「精简版 Excalidraw」并安装到 Obsidian 插件目录。
#
# 用法:
#   bash install-to-vault.sh [插件目录]
# 不传参数时用下面的 VAULT_PLUGIN_DIR 默认值。
#
# 与上游 install-to-vault.sh 的差异：
# 1) 安装前会把现有 main.js / styles.css / manifest.json 备份为 *.pre-trim.bak
#    （data.json 设置文件从不动，插件 id 未变，设置与绘图完全延续）。
# 2) 覆盖的就是原插件目录本身——本版本是同一个插件的精简版。

set -euo pipefail

VAULT_PLUGIN_DIR="${1:-/Users/chou/obsidian_study_notes/.obsidian/plugins/obsidian-excalidraw-plugin}"

cd "$(dirname "$0")"

if [ ! -d "$VAULT_PLUGIN_DIR" ]; then
	echo "找不到插件目录: $VAULT_PLUGIN_DIR" >&2
	exit 1
fi

npm run build

STAMP="$(date +%Y%m%d-%H%M%S)"
for f in main.js styles.css manifest.json; do
	if [ -f "$VAULT_PLUGIN_DIR/$f" ]; then
		cp -p "$VAULT_PLUGIN_DIR/$f" "$VAULT_PLUGIN_DIR/$f.$STAMP.pretrim.bak"
	fi
done

cp -p dist/main.js dist/manifest.json dist/styles.css "$VAULT_PLUGIN_DIR/"

echo
echo "已安装到 $VAULT_PLUGIN_DIR"
echo "另有备份：$VAULT_PLUGIN_DIR/*.$STAMP.pretrim.bak（回退时改名覆盖即可）"
echo "在 Obsidian 里重载插件后生效（Cmd+R，或 设置 → 第三方插件 里关掉 Excalidraw 再打开）"
echo
echo "建议先在测试绘图上验证：打开、编辑、保存、markdown 嵌入预览、导出 PNG。"
