#!/bin/bash

# 中文汉字学习应用部署脚本
# 适用于 Linux 环境

set -e  # 遇到错误立即退出

echo "🚀 开始部署中文汉字学习应用..."

# 检查并加载 NVM（如果存在）
if [ -f "$HOME/.nvm/nvm.sh" ]; then
    echo "🔧 加载 NVM..."
    source "$HOME/.nvm/nvm.sh"
fi

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.17.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js 版本过低，需要 >= $REQUIRED_VERSION，当前版本: $NODE_VERSION"
    echo "建议使用: nvm install --lts && nvm use --lts"
    exit 1
fi

echo "✅ Node.js 版本检查通过: $NODE_VERSION"

# 检查 npm
echo "📋 检查 npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

echo "✅ npm 检查通过: $(npm -v)"

# 安装依赖
echo "📦 安装依赖..."
npm ci --include=dev

# 构建应用
echo "🔨 构建应用..."
npm run build

# 创建日志目录
echo "📁 创建日志目录..."
mkdir -p logs

# 设置权限
echo "🔐 设置文件权限..."
chmod +x scripts/deploy.sh
chmod -R 755 .next
chmod -R 755 logs

# 检查 PM2
echo "📋 检查 PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 未安装，正在安装..."
    npm install -g pm2
fi

echo "✅ PM2 检查通过: $(pm2 -v)"

# 停止现有进程（如果存在）
echo "🛑 停止现有进程..."
pm2 stop zh-hans-learning-app 2>/dev/null || echo "没有运行中的进程"
pm2 delete zh-hans-learning-app 2>/dev/null || echo "没有需要删除的进程"

# 启动应用
echo "🚀 启动应用..."
pm2 start ecosystem.config.js

# 保存 PM2 配置
echo "💾 保存 PM2 配置..."
pm2 save

# 设置开机自启（可选）
echo "🔄 设置开机自启..."
pm2 startup || echo "⚠️  无法设置开机自启，请手动运行: sudo pm2 startup"

# 显示状态
echo "📊 应用状态:"
pm2 status

echo ""
echo "🎉 部署完成！"
echo "📱 应用地址: http://localhost:3000"
echo "📊 查看状态: pm2 status"
echo "📝 查看日志: pm2 logs zh-hans-learning-app"
echo "🔄 重启应用: pm2 restart zh-hans-learning-app"
echo "🛑 停止应用: pm2 stop zh-hans-learning-app"
