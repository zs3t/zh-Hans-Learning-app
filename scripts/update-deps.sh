#!/bin/bash

# 依赖更新脚本 - 处理过时的 npm 包警告
# 谨慎使用：建议在测试环境中先验证

set -e

echo "🔄 依赖更新脚本"
echo "================"

# 创建备份
echo "💾 创建备份..."
BACKUP_DIR="backup-deps-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp package.json "$BACKUP_DIR/"
cp package-lock.json "$BACKUP_DIR/" 2>/dev/null || echo "没有 package-lock.json"

echo "✅ 备份已创建: $BACKUP_DIR"

# 检查过时的包
echo "📋 检查过时的包..."
npm outdated || echo "检查完成"

# 选择性更新策略
echo "🎯 开始选择性更新..."

# 1. 更新 ESLint 相关（相对安全）
echo "📝 更新 ESLint 相关包..."
npm install eslint@latest eslint-config-next@latest --save-dev || echo "ESLint 更新完成"

# 2. 检查是否可以安全更新其他包
echo "🔍 检查其他可更新的包..."

# 显示当前状态
echo "📊 当前依赖状态:"
npm list --depth=0 2>/dev/null | grep -E "(eslint|rimraf|glob)" || echo "相关包检查完成"

# 运行安全审计
echo "🔒 运行安全审计..."
npm audit || echo "审计完成"

# 测试构建
echo "🔨 测试构建..."
if npm run build; then
    echo "✅ 构建成功 - 更新完成"
    echo "📁 备份位置: $BACKUP_DIR"
    echo ""
    echo "🎉 依赖更新完成！"
    echo "⚠️  请测试以下功能："
    echo "   - npm run dev"
    echo "   - npm run build"
    echo "   - npm run lint"
    echo ""
    echo "如有问题，可从备份恢复:"
    echo "   cp $BACKUP_DIR/package.json ."
    echo "   cp $BACKUP_DIR/package-lock.json ."
    echo "   npm install"
else
    echo "❌ 构建失败 - 恢复备份..."
    cp "$BACKUP_DIR/package.json" .
    cp "$BACKUP_DIR/package-lock.json" . 2>/dev/null || echo "没有备份的 package-lock.json"
    npm install
    echo "🔄 已恢复到更新前状态"
    exit 1
fi
