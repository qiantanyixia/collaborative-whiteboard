# Collaborative Whiteboard / 实时协作白板 🎨

[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://collaborative-whiteboard-pi.vercel.app)
[![JavaScript](https://img.shields.io/badge/JavaScript-90.7%25-yellow?logo=javascript)](https://github.com/qiantanyixia/collaborative-whiteboard/search?l=javascript)
[![HTML](https://img.shields.io/badge/HTML-5.1%25-orange?logo=html5)](https://github.com/qiantanyixia/collaborative-whiteboard/search?l=html)
[![CSS](https://img.shields.io/badge/CSS-4.2%25-blue?logo=css3)](https://github.com/qiantanyixia/collaborative-whiteboard/search?l=css)

A lightweight, real-time collaborative whiteboard application allowing multiple users to draw and interact simultaneously. Built with a pure JavaScript/HTML5 Canvas frontend and a Node.js backend.

一个轻量级的实时协作白板应用，允许多个用户同时进行绘画和交互。前端基于原生 JavaScript 和 HTML5 Canvas 构建，后端基于 Node.js 驱动。

---

## ✨ Features / 核心功能

- **Real-time Synchronization / 实时同步**: All drawing actions are broadcasted to connected clients instantly via WebSockets. (所有的绘画操作通过 WebSocket 实时广播给所有在线用户)
- **HTML5 Canvas / 原生画布**: Smooth and high-performance drawing experience using pure Canvas API. (使用原生 Canvas API，提供流畅、高性能的绘画体验)
- **Zero-Dependency Frontend / 零依赖前端**: The frontend is built entirely with Vanilla JavaScript, HTML, and CSS. (前端完全基于原生 JS/HTML/CSS 开发，轻量无冗余)
- **Responsive Design / 响应式布局**: Adaptive layout that works seamlessly across various screen sizes. (自适应界面设计，完美适配不同尺寸的设备屏幕)

---

## 📁 Project Structure / 项目结构

This repository adopts a strict frontend-backend separation architecture:
本项目采用明确的前后端分离架构：

```text
collaborative-whiteboard/
├── backend/          # Node.js WebSocket Server (后端 WebSocket 服务)
│   ├── package.json
│   └── ... 
└── frontend/         # Vanilla JS Client (原生 JS 前端应用)
    ├── index.html
    └── ...
```
## 🛠️ Tech Stack / 技术栈

**Frontend (前端):**
- HTML5 Canvas
- CSS3
- Vanilla JavaScript (纯原生 JS)

**Backend (后端):**
- Node.js
- WebSockets (Socket.io / ws)

**Deployment (部署):**
- **Vercel** (Frontend hosting / 前端在线托管)

---

## 🚀 Getting Started / 本地运行指南

Follow these steps to run the project locally.
请按照以下步骤在本地启动项目：

### Prerequisites / 前置要求

- Node.js installed on your machine.
- Git installed.

### 1. Clone the repository / 克隆仓库

```bash
git clone https://github.com/qiantanyixia/collaborative-whiteboard.git
cd collaborative-whiteboard
```

### 2. Run the Backend / 启动后端
Navigate to the backend directory, install dependencies, and start the server:
进入 backend 目录，安装依赖并启动服务：

```bash
cd backend
npm install
npm start
```
(The backend server will typically run on http://localhost:3000 or another port specified in your entry file. / 后端服务默认会运行在本地的指定端口，如 3000)

### 3. Run the Frontend / 启动前端
Open a new terminal window and navigate to the frontend directory:
打开一个新的终端窗口，进入 frontend 目录：

```bash
cd frontend
```
Since the frontend is built with pure JS/HTML/CSS, you can start it using any simple static file server. If you have npx installed, you can use serve:
因为前端是纯静态文件，你可以使用任何静态服务器来运行它。推荐使用 serve：
```bash
npx serve .
```
Alternatively, you can open index.html directly in your browser or use the Live Server extension in VS Code.
(或者直接在浏览器中双击打开 index.html，也可以使用 VS Code 的 Live Server 插件启动)。

**Note (注意):** : Ensure that the WebSocket connection URL in your frontend JavaScript code points to your local backend server address (e.g., ws://localhost:3000 or http://localhost:3000) during local development.
在本地调试开发时，请务必确保前端 JS 代码中的 WebSocket 连接地址指向你的本地后端服务地址。

## 🤝Contributing / 参与贡献
Contributions, issues, and feature requests are welcome!
欢迎提交 Issue 和 Pull Request 来共同完善这个项目！

Fork the project (复刻项目)

Create your feature branch (git checkout -b feature/AmazingFeature) (创建特性分支)

Commit your changes (git commit -m 'Add some AmazingFeature') (提交更改)

Push to the branch (git push origin feature/AmazingFeature) (推送到分支)

Open a Pull Request (发起 Pull Request)

## 📄 License / 开源协议
This project is licensed under the MIT License.
本项目基于 MIT 协议开源。
