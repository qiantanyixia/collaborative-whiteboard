# 协作白板 / Collaborative Whiteboard

一个支持实时多人协作、AI 智能辅助的在线白板应用。

---

## 功能特性

- **实时协作** — 基于 WebSocket 的多人同步绘画，支持笔迹、形状、线条实时广播
- **丰富绘图工具** — 铅笔、橡皮擦、拖拽画布、多种线条类型（直线/虚线/箭头/贝塞尔/圆弧）、七种形状
- **AI 绘图** — 输入自然语言描述，AI 自动生成图形到画布
- **AI 聊天助手** — 支持上下文对话，可执行清空白板等操作
- **AI 白板分析** — 一键截图，多模态视觉模型自动分析白板内容
- **画布导出** — 支持导出 PNG、PDF
- **缩放与拖拽** — 滚轮缩放、拖拽平移，支持重置视图
- **用户认证** — JWT + Passport 注册登录系统
- **房间管理** — 创建房间、房间列表、在线用户实时显示

---

## 技术栈

**前端**
- React 18 + Vite
- Material-UI (MUI) v6
- Redux Toolkit + React-Redux
- react-konva (Canvas 绘图引擎)
- Socket.io-client

**后端**
- Node.js + Express
- Socket.io (WebSocket 实时通信)
- MongoDB + Mongoose
- Passport.js + JWT 认证
- OpenAI 兼容 API (Silicon Flow) — AI 功能

---

## 快速开始

### 前置要求
- Node.js >= 18
- MongoDB (本地或 MongoDB Atlas)

### 1. 克隆项目

```bash
git clone https://github.com/qiantanyixia/collaborative-whiteboard.git
cd collaborative-whiteboard
```

### 2. 配置环境变量

**后端** (`backend/.env`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/collaborative-whiteboard
# 或 MongoDB Atlas 连接串
JWT_SECRET=your_jwt_secret_key

# AI 配置 (Silicon Flow)
SILICONFLOW_API_KEY=your_api_key
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
AI_MODEL=Qwen/Qwen2.5-VL-72B-Instruct
```

### 3. 启动后端

```bash
cd backend
npm install
npm start
# 服务运行在 http://localhost:5000
```

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
# 服务运行在 http://localhost:5173
```

---

## 项目结构

```
collaborative-whiteboard/
├── backend/                 # Node.js 后端
│   ├── server.js           # Express + Socket.io 入口
│   ├── routes/             # API 路由
│   ├── models/             # Mongoose 数据模型
│   ├── services/           # 业务逻辑 (AI Service 等)
│   ├── middleware/         # 认证中间件
│   └── .env                # 环境变量 (不上传 Git)
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # UI 组件 (Whiteboard, Chat, Header...)
│   │   ├── pages/          # 页面 (Login, Dashboard, Room...)
│   │   ├── redux/          # Redux Toolkit Slices
│   │   ├── theme.js        # MUI 自定义主题
│   │   └── main.jsx        # 应用入口
│   └── .env                # 环境变量 (不上传 Git)
└── .gitignore              # Git 忽略规则
```

---

## 注意事项

- `backend/.env` 和 `frontend/.env` 包含 API Key 等敏感信息，**请勿上传到 Git**
- AI 功能需要有效的 Silicon Flow API Key
- 生产环境部署时，请使用 HTTPS 和安全的 JWT Secret

---

## License

MIT
