## 中文汉字学习应用

一个基于 Next.js 的交互式中文汉字学习应用，支持笔画动画演示、汉字发音播放、自定义字库管理等功能。

## ✨ 功能特性

- 🖋️ **笔画动画演示** - 使用 HanziWriter 库展示汉字笔画顺序
- 🔊 **多音字语音播放** - 支持不同读音的词语朗读，智能区分多音字
- 📚 **自定义字库管理** - 导入、管理和切换不同的汉字学习集
- 💾 **数据持久化** - 使用 localStorage 本地存储学习数据
- 📱 **响应式设计** - 适配桌面和移动设备
- 🎯 **智能学习** - 随机选择汉字，提高学习效率
- 🎨 **纯净界面** - 隐藏灰色边框，只显示绿色笔画动画

## 🚀 快速部署

### 环境要求

- Node.js 18.18.0+ 或 20.0.0+
- Linux/macOS/Windows 服务器
- 512MB+ 内存（推荐 1GB+）

### 一键部署

```bash
# 克隆仓库
git clone https://github.com/zs3t/zh-hans-learning-app.git
cd zh-hans-learning-app

# 一键部署
npm run deploy
```

### 手动部署

```bash
# 克隆仓库
git clone https://github.com/zs3t/zh-hans-learning-app.git
cd zh-hans-learning-app

# 安装依赖
npm ci

# 构建并启动
npm run build
npm start
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动

## 🏗️ 技术栈

- **前端框架**: Next.js 13 (App Router)
- **开发语言**: TypeScript
- **样式方案**: Tailwind CSS + 内联样式
- **汉字渲染**: HanziWriter
- **拼音处理**: pinyin-pro
- **数据存储**: localStorage (客户端)
- **语音合成**: Web Speech API
- **部署方案**: PM2 + Node.js

## 📊 数据存储

应用使用客户端 localStorage 存储，无需服务器数据库：

- **存储位置**: 浏览器本地存储
- **数据格式**: JSON 格式存储字库数据
- **会话管理**: 客户端生成和管理会话ID
- **数据持久化**: 数据保存在用户浏览器中，清除浏览器数据会丢失

## 🔧 进程管理

### 使用 PM2（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
npm run pm2:start

# 查看状态
pm2 status

# 查看日志
npm run pm2:logs

# 重启应用
npm run pm2:restart

# 停止应用
npm run pm2:stop
```

### 使用 PM2 配置文件

```bash
# 使用配置文件启动
pm2 start ecosystem.config.js

# 保存配置
pm2 save

# 设置开机自启
pm2 startup
```

## 📁 项目结构

```
zh-hans-learning-app/
├── app/                          # Next.js App Router 目录
│   ├── api/                      # API 路由
│   │   └── character-sets/       # 字库管理 API
│   ├── learn/                    # 学习页面
│   ├── test-speech/              # 语音测试页面
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 根布局组件
│   └── page.tsx                  # 主页面
├── components/                   # React 组件
│   ├── SimpleStrokeAnimation.tsx # 笔画动画组件
│   └── ui/                       # UI 组件库
├── lib/                          # 工具库和服务
│   ├── database.ts               # SQLite 数据库 (已弃用)
│   ├── localStorageDatabase.ts   # localStorage 数据库
│   ├── pinyin.ts                 # 拼音处理工具
│   ├── speechService.ts          # 语音服务
│   ├── wordDatabase.ts           # 多音字词库
│   └── utils.ts                  # 通用工具函数
├── styles/                       # 样式文件
│   └── hanzi-writer.css          # HanziWriter 样式
├── data/                         # 数据文件 (已弃用)
├── database/                     # 数据库文件 (已弃用)
├── ecosystem.config.js           # PM2 配置文件
├── next.config.js                # Next.js 配置
├── tailwind.config.js            # Tailwind CSS 配置
└── package.json                  # 项目依赖配置
```

## 📖 使用说明

### 基本功能

1. **学习汉字**: 应用会随机显示汉字，点击"换一个字"获取新汉字
2. **查看笔画**: 点击"查看笔画"观看汉字书写动画
3. **语音播放**: 点击拼音按钮听取正确发音
4. **字库管理**: 点击字库按钮管理学习内容

### 字库管理

1. **导入字库**: 支持 JSON 格式的字库文件
2. **字库格式**:
   ```json
   {
     "id": "unique_id",
     "name": "字库名称",
     "description": "字库描述",
     "characters": [
       {
         "char": "汉",
         "pinyin": ["hàn"],
         "strokeOrder": []
       }
     ]
   }
   ```

### 多音字配置

编辑 `lib/wordDatabase.ts` 文件添加或修改多音字词库：

```typescript
"空": {
  "kōng": ["天空", "空气", "空间", "空中"],
  "kòng": ["空隙", "空闲", "空地", "空白"]
}
```

## 🔧 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行代码检查
- `npm run deploy` - 一键部署到生产环境
- `npm run pm2:start` - 使用 PM2 启动应用
- `npm run pm2:stop` - 停止 PM2 进程
- `npm run pm2:restart` - 重启 PM2 进程
- `npm run pm2:logs` - 查看 PM2 日志



## 📱 移动端支持

### iOS 语音播放
应用已针对 iOS Safari/Chrome 的语音播放限制进行了优化：

- **自动初始化**: 首次用户交互时自动激活语音合成
- **错误重试**: 自动处理 iOS 语音播放失败并重试
- **兼容性**: 支持 iPhone/iPad 的 Safari 和 Chrome 浏览器

### 使用建议
- 确保设备音量开启且未静音
- 首次使用时点击任意语音按钮激活功能
- 如遇问题可访问 `/test-speech` 页面进行测试

## 🐛 故障排除

### 常见问题

1. **笔画动画不显示**
   - 检查 HanziWriter 库是否正确加载
   - 确认网络连接正常

2. **语音播放失败**
   - 检查浏览器是否支持 Web Speech API
   - 确认浏览器权限设置

3. **字库数据丢失**
   - 检查浏览器 localStorage 是否被清理
   - 重新导入字库文件

4. **Linux 部署问题**
   - 确保 Node.js 版本 >= 18.16.0
   - 检查文件权限：`chmod +x scripts/deploy.sh`
   - 查看 PM2 日志：`pm2 logs zh-hans-learning-app`

5. **安全状态** ✅
   - 所有已知安全漏洞已修复
   - Next.js 版本：14.2.32（从 13.5.0 升级）
   - Node.js 版本：v22.16.0（从 v18.16.1 升级）
   - 详见 [SECURITY.md](SECURITY.md)

### 日志查看

```bash
# PM2 日志
npm run pm2:logs

# 开发模式日志
npm run dev
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [HanziWriter](https://hanziwriter.org/) - 汉字笔画动画库
- [pinyin-pro](https://github.com/zh-lx/pinyin-pro) - 拼音处理库
- [Next.js](https://nextjs.org/) - React 全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
