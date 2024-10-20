// backend/server.js

require('dotenv').config(); // 加载环境变量

const express = require('express');
const http = require('http');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken'); // 添加 JWT 解析
const { v4: uuidv4 } = require('uuid'); // 引入 uuid

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173', // 从环境变量读取前端地址
        methods: ['GET', 'POST'],
    },
});

// 中间件
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

console.log('✅ 中间件已加载');

// 连接数据库
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true, // 如果使用的是 Mongoose v6，请移除此选项
})
.then(() => console.log('✅ MongoDB 连接成功'))
.catch(err => console.error('❌ MongoDB 连接失败:', err));

// 加载模型
const User = require('./models/User'); // 先加载用户模型
const Room = require('./models/Room'); // 再加载房间模型（如果有）
console.log('🔗 模型已加载');

// Passport 中间件
app.use(passport.initialize());
require('./config/passport')(passport); // 初始化 Passport
console.log('🔗 Passport 已初始化并配置');

// 路由
const authRoutes = require('./routes/auth');
const roomsRoutes = require('./routes/rooms');
const onlineUsers = {}; // 房间ID -> 用户列表
const savedCanvases = {}; // 房间ID -> 线条数据

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
console.log('🔗 路由已加载');

// 辅助函数：解析 JWT Token
const getUserFromToken = (token) => {
    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'your_jwt_secret'); // 使用环境变量中的 secret
        return { id: decoded.id, username: decoded.username };
    } catch (err) {
        return null;
    }
};

// Socket.io 连接认证
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
        const user = getUserFromToken(token);
        if (user) {
            socket.user = user;
            next();
        } else {
            next(new Error('身份验证失败'));
        }
    } else {
        next(new Error('没有提供 token'));
    }
});

// Socket.io 事件处理
io.on('connection', (socket) => {
    console.log('新用户连接:', socket.id, '用户:', socket.user.username);

    // 加入房间
    socket.on('joinRoom', ({ roomId }) => { // 修改为仅传递 roomId
        const { id: userId, username } = socket.user;
        socket.join(roomId);

        if (!onlineUsers[roomId]) {
            onlineUsers[roomId] = [];
        }

        // 检查用户是否已在房间中
        const existingUserIndex = onlineUsers[roomId].findIndex(user => user.userId === userId);
        if (existingUserIndex === -1) {
            onlineUsers[roomId].push({ userId, username, socketId: socket.id });
            console.log(`${username} 加入房间 ${roomId}`);
        } else {
            // 如果用户已在房间中，更新 socketId
            onlineUsers[roomId][existingUserIndex].socketId = socket.id;
            console.log(`${username} 重连并加入房间 ${roomId}`);
        }

        // 发送当前在线用户列表
        io.to(roomId).emit('updateUsers', onlineUsers[roomId]);
        console.log(`房间 ${roomId} 在线用户列表已更新:`, onlineUsers[roomId]);

        // 发送当前白板内容给新加入的用户
        if (savedCanvases[roomId]) {
            socket.emit('loadCanvas', savedCanvases[roomId]);
            console.log(`发送房间 ${roomId} 的白板内容给用户 ${socket.id}`);
        }
    });

    // 绘图事件
    socket.on('drawElement', (data) => { // 确保 data 包含唯一的 id
        const { roomId, id, ...lineData } = data;
        if (!roomId) {
            console.error('drawElement 事件缺少 roomId');
            return;
        }
        if (!savedCanvases[roomId]) {
            savedCanvases[roomId] = [];
        }
        savedCanvases[roomId].push({ id, ...lineData });
        socket.to(roomId).emit('drawElement', { id, ...lineData });
    });

    // 聊天消息
    socket.on('chatMessage', ({ roomId, message }) => {
        io.to(roomId).emit('chatMessage', message);
    });

    // 清空白板
    socket.on('clearCanvas', (data) => {
        const { roomId } = data;
        if (roomId && savedCanvases[roomId]) {
            savedCanvases[roomId] = [];
            io.to(roomId).emit('clearCanvas');
            console.log(`房间 ${roomId} 的白板已清空`);
        }
    });

    // 加载白板
    socket.on('loadCanvas', (data) => {
        const { roomId } = data;
        if (roomId) {
            const canvasData = savedCanvases[roomId] || [];
            socket.emit('loadCanvas', canvasData);
            console.log(`发送房间 ${roomId} 的白板内容给用户 ${socket.id}`);
        }
    });

    // 离开房间
    socket.on('leaveRoom', ({ roomId }) => { // 修改为仅传递 roomId
        const { id: userId, username } = socket.user;
        socket.leave(roomId);
        if (onlineUsers[roomId]) {
            onlineUsers[roomId] = onlineUsers[roomId].filter(user => user.userId !== userId);
            io.to(roomId).emit('updateUsers', onlineUsers[roomId]);
            console.log(`${username} 离开房间 ${roomId}`);

            // 如果房间内没有用户，删除保存的白板数据
            if (onlineUsers[roomId].length === 0) {
                delete savedCanvases[roomId];
                console.log(`房间 ${roomId} 的白板数据已删除，因为没有用户在线`);
            }
        }
    });

    // 断开连接
    socket.on('disconnect', () => {
        console.log('用户断开连接:', socket.id, '用户:', socket.user.username);
        // 移除用户在所有房间中的条目
        for (const [roomId, users] of Object.entries(onlineUsers)) {
            const userIndex = users.findIndex(user => user.userId === socket.user.id);
            if (userIndex !== -1) {
                const [removedUser] = users.splice(userIndex, 1);
                io.to(roomId).emit('updateUsers', onlineUsers[roomId]);
                console.log(`用户 ${removedUser.username} 从房间 ${roomId} 中移除`);

                // 如果房间内没有用户，删除保存的白板数据
                if (onlineUsers[roomId].length === 0) {
                    delete savedCanvases[roomId];
                    console.log(`房间 ${roomId} 的白板数据已删除，因为没有用户在线`);
                }
            }
        }
    });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 服务器运行在端口 ${PORT}`));
