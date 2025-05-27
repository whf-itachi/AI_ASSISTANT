# AI 助手

一个基于 Vue 3 + Element Plus + Vite 构建的 AI 助手项目。

## 功能特点

- 响应式设计，支持移动端和桌面端
- 实时聊天界面
- 消息历史记录
- 错误处理和加载状态
- 支持快捷键操作

## 技术栈

- Vue 3
- Element Plus
- Vite
- Axios

## 开发环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

## 安装和运行

1. 克隆项目
```bash
git clone [项目地址]
cd ai-assistant
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 项目结构

```
ai-assistant/
├── src/
│   ├── api/          # API 接口
│   ├── utils/        # 工具函数
│   ├── App.vue       # 主组件
│   ├── main.js       # 入口文件
│   └── style.css     # 全局样式
├── public/           # 静态资源
├── index.html        # HTML 模板
├── vite.config.js    # Vite 配置
└── package.json      # 项目配置
```

## 环境变量

在项目根目录创建 `.env` 文件：

```
VITE_APP_TITLE=AI助手
VITE_APP_API_BASE_URL=http://localhost:3000
VITE_APP_VERSION=0.0.1
```

## 使用说明

1. 在输入框中输入问题
2. 点击发送按钮或使用 Ctrl + Enter 发送消息
3. 等待 AI 助手响应
4. 可以切换移动端/桌面端视图

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT 