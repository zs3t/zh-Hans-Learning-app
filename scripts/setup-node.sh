#!/bin/bash

# 打印Node.js 版本

echo "当前 Node.js 版本: $(node --version)"
echo "当前 npm 版本: $(npm --version)"

# 检查版本是否符合要求
NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="18.17.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
    echo "✅ Node.js 版本符合要求 (>= $REQUIRED_VERSION)"
else
    echo "❌ Node.js 版本不符合要求 (需要 >= $REQUIRED_VERSION，当前 $NODE_VERSION)"
    exit 1
fi

echo "🚀 环境配置完成！"


