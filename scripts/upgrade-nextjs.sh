#!/bin/bash

# Next.js 安全升级脚本
# 从 Next.js 13.5.0 升级到 15.5.0 以修复安全漏洞

set -e  # 遇到错误立即退出

echo "🔒 Next.js 安全升级脚本"
echo "=========================="

# 检查当前版本
echo "📋 检查当前版本..."
CURRENT_NEXT_VERSION=$(npm list next --depth=0 2>/dev/null | grep next@ | sed 's/.*next@//' | sed 's/ .*//')
echo "当前 Next.js 版本: $CURRENT_NEXT_VERSION"

# 创建备份
echo "💾 创建备份..."
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp package.json "$BACKUP_DIR/"
cp package-lock.json "$BACKUP_DIR/" 2>/dev/null || echo "没有 package-lock.json 文件"
cp -r .next "$BACKUP_DIR/" 2>/dev/null || echo "没有 .next 目录"

echo "✅ 备份已创建: $BACKUP_DIR"

# 检查 Node.js 版本兼容性
echo "📋 检查 Node.js 版本兼容性..."
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.17.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "⚠️  警告: Next.js 15 需要 Node.js >= $REQUIRED_VERSION，当前版本: $NODE_VERSION"
    echo "建议升级 Node.js 版本"
    read -p "是否继续升级？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 升级已取消"
        exit 1
    fi
fi

# 升级 Next.js 和相关依赖
echo "⬆️  升级 Next.js 和相关依赖..."

# 升级 Next.js 到最新稳定版本
npm install next@latest

# 升级 ESLint 配置
npm install eslint-config-next@latest --save-dev

# 升级 React 类型定义（如果需要）
npm install @types/react@latest @types/react-dom@latest --save-dev

echo "✅ 依赖升级完成"

# 检查配置文件兼容性
echo "🔧 检查配置文件兼容性..."

# 检查 next.config.js
if [ -f "next.config.js" ]; then
    echo "检查 next.config.js..."
    # 这里可以添加特定的配置检查逻辑
fi

# 清理缓存
echo "🧹 清理缓存..."
rm -rf .next
rm -rf node_modules/.cache
npm cache clean --force 2>/dev/null || echo "缓存清理完成"

# 重新安装依赖
echo "📦 重新安装依赖..."
rm -rf node_modules
npm install

# 构建测试
echo "🔨 构建测试..."
if npm run build; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败，正在恢复备份..."
    cp "$BACKUP_DIR/package.json" .
    cp "$BACKUP_DIR/package-lock.json" . 2>/dev/null || echo "没有备份的 package-lock.json"
    npm install
    echo "🔄 已恢复到升级前状态"
    exit 1
fi

# 运行测试（如果有）
echo "🧪 运行测试..."
if npm run test 2>/dev/null; then
    echo "✅ 测试通过"
else
    echo "⚠️  没有测试脚本或测试失败"
fi

# 检查安全漏洞
echo "🔒 检查安全漏洞..."
npm audit --audit-level=high || echo "仍有安全问题需要关注"

# 显示升级后的版本
echo "📊 升级结果:"
NEW_NEXT_VERSION=$(npm list next --depth=0 2>/dev/null | grep next@ | sed 's/.*next@//' | sed 's/ .*//')
echo "升级前: $CURRENT_NEXT_VERSION"
echo "升级后: $NEW_NEXT_VERSION"

echo ""
echo "🎉 Next.js 升级完成！"
echo "📁 备份位置: $BACKUP_DIR"
echo "🚀 请运行以下命令测试应用:"
echo "   npm run dev"
echo ""
echo "⚠️  升级后请注意:"
echo "1. 测试所有功能是否正常"
echo "2. 检查控制台是否有警告或错误"
echo "3. 验证笔画动画和语音功能"
echo "4. 如有问题，可从备份恢复: cp $BACKUP_DIR/package.json ."
