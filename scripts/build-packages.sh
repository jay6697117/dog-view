#!/bin/bash

# Dog View 本地打包脚本
# 用法: ./scripts/build-packages.sh

set -e

APP_NAME="dog-view"
VERSION="${1:-1.0.0}"
BUILD_DIR="build/bin"
DIST_DIR="dist"

echo "🚀 开始构建 ${APP_NAME} v${VERSION}"

# 创建 dist 目录
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# 1. 构建 macOS 应用
echo "📦 构建 macOS 应用..."
wails build -clean

# 2. 创建 ZIP
echo "📦 创建 ZIP 包..."
cd "$BUILD_DIR"
zip -r "../../${DIST_DIR}/${APP_NAME}-${VERSION}-macOS.zip" "${APP_NAME}.app"
cd ../..

# 3. 创建 DMG (需要 create-dmg)
if command -v create-dmg &> /dev/null; then
    echo "📦 创建 DMG 安装包..."
    create-dmg \
        --volname "${APP_NAME}" \
        --window-pos 200 120 \
        --window-size 600 400 \
        --icon-size 100 \
        --icon "${APP_NAME}.app" 175 190 \
        --hide-extension "${APP_NAME}.app" \
        --app-drop-link 425 190 \
        "${DIST_DIR}/${APP_NAME}-${VERSION}-macOS.dmg" \
        "${BUILD_DIR}/${APP_NAME}.app" || echo "⚠️  DMG 创建失败，但 ZIP 包已生成"
else
    echo "⚠️  未安装 create-dmg，跳过 DMG 创建"
    echo "   安装命令: brew install create-dmg"
fi

# 4. (可选) 交叉编译 Windows
read -p "是否编译 Windows 版本? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v x86_64-w64-mingw32-gcc &> /dev/null; then
        echo "📦 编译 Windows 版本..."
        wails build -platform windows/amd64 -clean
        cd "$BUILD_DIR"
        zip -r "../../${DIST_DIR}/${APP_NAME}-${VERSION}-Windows-x64.zip" "${APP_NAME}.exe"
        cd ../..
    else
        echo "⚠️  未安装 mingw-w64，无法编译 Windows 版本"
        echo "   安装命令: brew install mingw-w64"
    fi
fi

echo ""
echo "✅ 打包完成！输出目录: ${DIST_DIR}/"
ls -la "${DIST_DIR}/"
