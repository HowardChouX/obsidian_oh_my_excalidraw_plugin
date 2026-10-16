#!/usr/bin/env bash
#
# 一次性迁移：以「Oh My Excalidraw」的独立身份安装精简版插件。
#
# 做什么：
#   1. 构建精简版插件
#   2. 把旧的 obsidian-excalidraw-plugin 目录（连同你的 data.json 设置）整体移出
#      插件目录，作为备份保存在 .obsidian/plugins-disabled/ 下
#   3. 把昨天误装的重写版 oh-my-excalidraw 目录也移出备份
#   4. 安装精简版到 .obsidian/plugins/oh-my-excalidraw/
#   5. 把你原来的 data.json 设置复制进新插件目录（设置无缝延续）
#
# 运行前：请在 Obsidian 设置 → 第三方插件 里，把两个 Excalidraw 插件都先关闭。
# 运行后：重载 Obsidian（Cmd+R），在第三方插件里启用 Oh My Excalidraw。
# 回退：plugins-disabled 目录整体移回 plugins/ 即可恢复原状。

set -euo pipefail

VAULT="${VAULT:-/Users/chou/obsidian_study_notes}"
PLUGINS="$VAULT/.obsidian/plugins"
DISABLED="$VAULT/.obsidian/plugins-disabled"
OLD="$PLUGINS/obsidian-excalidraw-plugin"
NEW="$PLUGINS/oh-my-excalidraw"
STAMP="$(date +%Y%m%d-%H%M%S)"

cd "$(dirname "$0")"

echo "==> 构建精简版插件"
npm run build

mkdir -p "$DISABLED"

# 1) 备份并移出旧的官方/裁剪版目录（含它的 data.json，一并留在备份里）
if [ -d "$OLD" ]; then
	echo "==> 备份旧插件目录 → $DISABLED/obsidian-excalidraw-plugin-$STAMP"
	mv "$OLD" "$DISABLED/obsidian-excalidraw-plugin-$STAMP"
fi

# 2) 备份并移出昨天的重写版
if [ -d "$NEW" ]; then
	echo "==> 备份重写版目录 → $DISABLED/oh-my-excalidraw-rewrite-$STAMP"
	mv "$NEW" "$DISABLED/oh-my-excalidraw-rewrite-$STAMP"
fi

# 3) 安装精简版
echo "==> 安装到 $NEW"
mkdir -p "$NEW"
cp -p dist/main.js dist/manifest.json dist/styles.css "$NEW/"

# 4) 迁移你原来的设置
if [ -f "$DISABLED/obsidian-excalidraw-plugin-$STAMP/data.json" ]; then
	cp -p "$DISABLED/obsidian-excalidraw-plugin-$STAMP/data.json" "$NEW/data.json"
	echo "==> 已迁移原设置 data.json"
else
	echo "!! 未找到旧 data.json，新插件将使用默认设置" >&2
fi

echo
echo "完成。接下来："
echo "  1. 重载 Obsidian（Cmd+R）"
echo "  2. 设置 → 第三方插件 → 启用 Oh My Excalidraw"
echo "  3. 侧边栏点击新建绘图按钮；再点开几个旧绘图验证自动打开"
echo "回退方式：把 $DISABLED 里的 obsidian-excalidraw-plugin-$STAMP"
echo "目录移回 plugins/ 并改名回 obsidian-excalidraw-plugin，再启用即可。"
