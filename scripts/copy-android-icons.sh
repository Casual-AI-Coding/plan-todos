#!/bin/bash

# Android 图标复制脚本
# 在运行 `pnpm tauri android init` 后执行此脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ICONS_SRC="$PROJECT_ROOT/src-tauri/icons/android"
GEN_RES="$PROJECT_ROOT/src-tauri/gen/android/app/src/main/res"

echo "📱 Android 图标复制脚本"
echo "========================"

# 检查 gen 目录是否存在
if [ ! -d "$PROJECT_ROOT/src-tauri/gen/android" ]; then
  echo "❌ 错误: gen/android 目录不存在"
  echo "请先运行: pnpm tauri android init"
  exit 1
fi

# 检查源图标目录
if [ ! -d "$ICONS_SRC" ]; then
  echo "❌ 错误: 图标源目录不存在: $ICONS_SRC"
  exit 1
fi

# 复制 mipmap 目录
for dir in mipmap-mdpi mipmap-hdpi mipmap-xhdpi mipmap-xxhdpi mipmap-xxxhdpi; do
  if [ -d "$ICONS_SRC/$dir" ]; then
    echo "📁 复制 $dir..."
    mkdir -p "$GEN_RES/$dir"
    cp -f "$ICONS_SRC/$dir/"* "$GEN_RES/$dir/" 2>/dev/null || true
  fi
done

# 复制 mipmap-anydpi-v26 (自适应图标)
if [ -d "$ICONS_SRC/mipmap-anydpi-v26" ]; then
  echo "📁 复制 mipmap-anydpi-v26 (自适应图标)..."
  mkdir -p "$GEN_RES/mipmap-anydpi-v26"
  cp -f "$ICONS_SRC/mipmap-anydpi-v26/"* "$GEN_RES/mipmap-anydpi-v26/" 2>/dev/null || true
fi

# 复制 values (颜色配置)
if [ -d "$ICONS_SRC/values" ]; then
  echo "📁 复制 values (颜色配置)..."
  mkdir -p "$GEN_RES/values"
  cp -f "$ICONS_SRC/values/"* "$GEN_RES/values/" 2>/dev/null || true
fi

echo ""
echo "✅ Android 图标复制完成！"
echo "已复制到: $GEN_RES"