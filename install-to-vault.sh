#!/usr/bin/env bash
#
# 安装 / 更新「Oh My Excalidraw」精简版插件。
#
# 做什么：
#   1. 构建精简版插件
#   2. 把当前已安装的 oh-my-excalidraw 目录（含 data.json）整体移到
#      .obsidian/plugins-disabled/ 下作为备份
#   3. 首次使用时，把旧的 obsidian-excalidraw-plugin 目录（含它的 data.json）
#      一并移出备份
#   4. 安装精简版到 .obsidian/plugins/oh-my-excalidraw/
#   5. 延续设置：优先用当前安装留下的 data.json（更新场景），
#      否则用旧上游插件的 data.json（首次迁移场景）
#
# 运行前：请在 Obsidian 设置 → 第三方插件 里，把 Excalidraw 相关插件先关闭。
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

# 1) 备份并移出当前安装（含 data.json，稍后从这里延续设置）
if [ -d "$NEW" ]; then
	echo "==> 备份当前安装 → $DISABLED/oh-my-excalidraw-$STAMP"
	mv "$NEW" "$DISABLED/oh-my-excalidraw-$STAMP"
fi

# 2) 首次迁移：备份并移出旧的官方/裁剪版目录
if [ -d "$OLD" ]; then
	echo "==> 备份旧插件目录 → $DISABLED/obsidian-excalidraw-plugin-$STAMP"
	mv "$OLD" "$DISABLED/obsidian-excalidraw-plugin-$STAMP"
fi

# 3) 安装精简版
echo "==> 安装到 $NEW"
mkdir -p "$NEW"
cp -p dist/main.js dist/manifest.json dist/styles.css "$NEW/"

# 4) 延续设置：当前安装的 data.json 优先，其次是旧上游插件的
DATA_SRC=""
if [ -f "$DISABLED/oh-my-excalidraw-$STAMP/data.json" ]; then
	DATA_SRC="$DISABLED/oh-my-excalidraw-$STAMP/data.json"
elif [ -f "$DISABLED/obsidian-excalidraw-plugin-$STAMP/data.json" ]; then
	DATA_SRC="$DISABLED/obsidian-excalidraw-plugin-$STAMP/data.json"
fi
if [ -n "$DATA_SRC" ]; then
	cp -p "$DATA_SRC" "$NEW/data.json"
	echo "==> 已延续设置：$DATA_SRC"
else
	echo "!! 未找到可延续的 data.json，新插件将使用默认设置" >&2
fi

echo
echo "完成。接下来："
echo "  1. 重载 Obsidian（Cmd+R）"
echo "  2. 设置 → 第三方插件 → 启用 Oh My Excalidraw"
echo "  3. 打开绘图验证：工具栏只剩 hand/select/pen/eraser，⋮ 菜单已消失，"
echo "     重置画布按钮在右上角按钮组里，笔选中后再点一次会弹出粗细面板"
echo "回退方式：把 $DISABLED 里的 oh-my-excalidraw-$STAMP"
echo "目录移回 plugins/ 并改名回 oh-my-excalidraw，再启用即可。"
