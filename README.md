# 📖 中文汉字学习应用

[![Next.js](https://img.shields.io/badge/Next.js-15.x-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-latest--%28v5%2B%29-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v22.16.0-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/index.html)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

一个基于现代化 **Next.js** 框架构建的交互式中文汉字学习应用。本项目通过集成 **Prisma ORM** 进行数据持久化，存储汉字的自定义字库。语音功能通过 **本地服务器** 动态提供 `.m4a` 音频文件，确保稳定、快速的汉字发音。应用集成了笔画动画演示、多音字语音播放、灵活的字库管理等核心功能，并通过响应式设计确保在不同设备上都能流畅使用。

## ✨ 功能特性

-   🖋️ **沉浸式笔画动画** - 集成 HanziWriter 库，动态展示汉字的规范笔画顺序，辅助用户直观学习和记忆。
-   🔊 **本地音源语音播放** - 通过 Next.js API 路由从服务器 `public/audio` 目录获取 `.m4a` 文件，提供高质量的汉字发音和多音字朗读。
-   📚 **数据库驱动字库管理** - 利用 Prisma ORM，将自定义字库持久化存储于 SQLite 数据库，实现可靠的数据管理。
-   ✅ **已学会字跟踪** - 主界面提供“我学会了 / 我还不会”按钮，跨字库同步记录学习进度，可一键导出 TXT 文件备份。
-   🎯 **高效智能学习模式** - 随机选取汉字进行学习，打破固定顺序，全面提升学习效率和记忆巩固。
-   🚀 **极简纯净界面** - 专注于学习核心，隐藏冗余视觉元素，突出绿色笔画动画，营造专注的学习氛围。

## 🚀 快速部署

### 一键部署 (推荐)

此脚本将自动化完成项目克隆/更新、依赖安装、PM2 安装 (如果未安装)、创建 `.env.production` 文件、Prisma 数据库迁移、Next.js 应用构建，并使用 PM2 启动或重启应用。

```bash
# 在服务器上执行，例如在你的用户主目录
# 首次部署:
git clone https://github.com/zs3t/zh-Hans-Learning-app.git
cd zh-Hans-Learning-app
bash scripts/deploy.sh

# 后续更新:
cd zh-Hans-Learning-app # 进入项目路径
bash scripts/deploy.sh
```

部署成功后，应用通常会在 `http://localhost:3000` 上运行，具体取决于您的服务器配置和 PM2 默认行为。

### 手动部署

```bash
# 克隆仓库
git clone https://github.com/zs3t/zh-Hans-Learning-app.git
cd zh-Hans-Learning-app

# 创建 .env 文件 (示例，可复制 .env.example)
cp .env.example .env.production

# 安装依赖 (推荐使用 npm ci，确保精确版本和一致性)
npm ci

# 加载 .env.production 文件
set -a
source .env.production
set +a

# 应用 Prisma 数据库迁移
npx prisma migrate deploy

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

应用将在 `http://localhost:3000` 启动。

## 🏗️ 技术栈

-   **前端框架**: Next.js (App Router, v15.x)
-   **开发语言**: TypeScript
-   **样式方案**: Tailwind CSS v4
-   **汉字渲染**: HanziWriter
-   **拼音处理**: pinyin-pro
-   **数据存储**: Prisma ORM (基于 SQLite)
-   **语音资源**: 本地 `.m4a` 音频文件 
-   **部署方案**: PM2 + Node.js

## 📊 数据存储

本项目利用 **Prisma ORM** 进行数据管理，支持多种关系型数据库。默认配置为轻量级的 SQLite 数据库文件（`prisma/dev.db` 或生产环境的 `prod.db`）。

-   **ORM**: Prisma ORM，提供类型安全的数据库访问。
-   **数据库**: 默认使用 SQLite，通过文件存储。可配置为 PostgreSQL, MySQL 等。
-   **模式定义**: `prisma/schema.prisma` 定义了数据模型（如 Character, CharacterSet）。
-   **数据迁移**: 通过 Prisma Migrate 管理数据库模式变更 (`npx prisma migrate deploy`)。

## 🔧 进程管理 (使用 PM2)

本项目推荐使用 PM2 工具进行 Node.js 应用的进程管理，以实现应用的稳定运行、自动重启和日志管理。

### 基本命令

```bash
# 全局安装 PM2 (如果尚未安装)
npm install -g pm2

# 使用预设脚本启动应用 (名称为 zh-Hans-Learning-app)
pm2 start npm --name "zh-Hans-Learning-app" -- start

# 查看所有 PM2 管理的进程状态
pm2 status

# 查看应用的实时日志
pm2 logs zh-Hans-Learning-app

# 重启应用
pm2 restart zh-Hans-Learning-app

# 停止应用
pm2 stop zh-Hans-Learning-app
```

### PM2 配置与自启动

虽然 `scripts/deploy.sh` 脚本会处理 PM2 的启动和保存，您也可以手动操作。

```bash
# 保存当前 PM2 进程列表，以便服务器重启后自动恢复
pm2 save

# 配置 PM2 为系统服务，实现服务器启动时应用自动启动
pm2 startup
```

## 📖 使用说明

### 基本功能操作

1.  **开始学习**: 应用启动后会自动随机展示一个汉字。点击页面中的“换一个字”按钮即可获取新的学习汉字。
2.  **查看笔画演示**: 点击汉字下方的“查看笔画”按钮，即可观看当前汉字的书写笔画动画，学习正确的书写顺序。
3.  **聆听语音**: 点击汉字旁的拼音按钮，应用将通过 Next.js API 路由从服务器获取对应的 `.m4a` 音频文件，并播放该汉字的正确发音。对于多音字也可展示并播放对应的发音，多音字库支持自定义配置。
4.  **字库管理**: 通过应用界面中的字库管理功能，您可以导入、切换和管理您的汉字学习集。这些数据将持久化存储到数据库中。

### 多音字配置

多音字及其对应的词语配置存储在 `lib/data/polyphonic.json` 文件中。如果您需要添加新的多音字或修改现有词库，可以直接编辑此 JSON 文件。

示例文件结构 (`lib/data/polyphonic.json`):

```json
{
  "行": ["háng", "xíng"],
  "长": ["cháng", "zhǎng"],
  "好": ["hǎo", "hào"],
  "少": ["shǎo", "shào"],
  "中": ["zhōng", "zhòng"],
  "为": ["wéi", "wèi"],
  "乐": ["lè", "yuè"],
  "卡": ["kǎ", "qiǎ"],
  "着": ["zháo", "zhuó"],
  "的": ["de", "dí", "dì"],
  "和": ["hé","hú"],
  "们": ["mén"]
}
```

**⚠️ 注意:** 修改此文件后，需要重新构建并部署应用以使更改生效。

### 已学会字管理

-   **标记/取消**：在主学习界面中，当前汉字右侧的按钮可在“我学会了”与“我还不会”之间切换，状态会实时写入数据库的专属表中，与字库无关。
-   **导出备份**：在“字库管理”面板顶部，导入按钮旁新增“导出已学会字库”按钮，点击即可生成每行一个汉字的 `learned-characters.txt` 文件，方便备份或分享。

## 🔧 可用脚本
-   `npm run dev` - 启动开发服务器 (具备热重载功能，默认运行在 `http://localhost:3000`)
-   `npm run build` - 构建生产优化版本的应用 (生成 `.next` 目录)
-   `npm run start` - 启动生产环境服务器 (此命令需在 `npm run build` 之后执行)


## 🤝 贡献指南

我们非常欢迎社区的贡献！如果您有改进建议、发现了 Bug 或想添加新功能，请遵循以下步骤：

1.  Fork 本仓库到您的 GitHub 账户。
2.  创建一个新的特性分支 (`git checkout -b feature/your-awesome-feature`)。
3.  在您的分支上进行更改并提交 (`git commit -m 'feat: Add some amazing feature'`)。
4.  将您的更改推送到您的 Fork 仓库 (`git push origin feature/your-awesome-feature`)。
5.  向本项目提交一个 Pull Request，详细描述您的更改内容、目的和实现方式。

## 📄 许可证

本项目采用 MIT 许可证。有关更多详情，请查阅 [LICENSE](LICENSE) 文件。

## 🙏 致谢

-   [HanziWriter](https://hanziwriter.org/) - 优秀而强大的汉字笔画动画库
-   [pinyin-pro](https://github.com/zh-lx/pinyin-pro) - 高效且功能丰富的拼音处理库
-   [Next.js](https://nextjs.org/) - 领先的 React 全栈框架
-   [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
-   [Prisma](https://www.prisma.io/) - 现代化的数据库 ORM
```
