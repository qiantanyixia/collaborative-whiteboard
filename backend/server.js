// backend/server.js

require('dotenv').config(); // 加载环境变量

const express = require('express');
const http = require('http');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: 'http://localhost:5173', // 前端地址
        methods: ['GET', 'POST'],
    },
});

// 中间件
app.use(cors({
    origin: 'http://localhost:5173',
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
require('./models/User'); // 先加载用户模型
require('./models/Room'); // 再加载其他模型（如果有）
console.log('🔗 模型已加载');

// Passport 中间件
app.use(passport.initialize());
require('./config/passport')(passport); // 初始化 Passport
console.log('🔗 Passport 已初始化并配置');

// 路由
const authRoutes = require('./routes/auth');
const roomsRoutes = require('./routes/rooms');
const onlineUsers = {}; // 房间ID -> 用户列表

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
console.log('🔗 路由已加载');

// Socket.io 连接
io.on('connection', (socket) => {
    console.log('新用户连接:', socket.id);

    // 加入房间
    socket.on('joinRoom', ({ roomId, user }) => {
        socket.join(roomId);
        if (!onlineUsers[roomId]) {
            onlineUsers[roomId] = [];
        }
        onlineUsers[roomId].push(user);
        io.to(roomId).emit('updateUsers', onlineUsers[roomId]);
        console.log(`${user.username} 加入房间 ${roomId}`);

        // if (savedCanvases[roomId]) {
        //     socket.emit('loadCanvas', { roomId, savedLines: savedCanvases[roomId] });
        //     console.log(`发送房间 ${roomId} 的白板内容给用户 ${socket.id}`);
        // }
    });

    // 绘图事件
    socket.on('drawing', ({ roomId, data }) => {
        socket.to(roomId).emit('drawing', data);
    });

    // 聊天消息
    socket.on('chatMessage', ({ roomId, message }) => {
        io.to(roomId).emit('chatMessage', message);
    });

    // 清空白板
    socket.on('clearCanvas', ({ roomId }) => {
        io.to(roomId).emit('clearCanvas');
    });

    // 加载白板
    socket.on('loadCanvas', ({ roomId, data }) => {
        socket.to(roomId).emit('loadCanvas', data);
    });

    // 离开房间
    socket.on('leaveRoom', ({ roomId, user }) => {
        socket.leave(roomId);
        if (onlineUsers[roomId]) {
            onlineUsers[roomId] = onlineUsers[roomId].filter((u) => u.id !== user.id);
            io.to(roomId).emit('updateUsers', onlineUsers[roomId]);
        }
        console.log(`${user.username} 离开房间 ${roomId}`);
    });

    // 断开连接
    socket.on('disconnect', () => {
        console.log('用户断开连接:', socket.id);
        // 需要找到该用户所在的房间并移除
        for (const [roomId, users] of Object.entries(onlineUsers)) {
            const index = users.findIndex((u) => u.id === socket.id);
            if (index !== -1) {
                users.splice(index, 1);
                io.to(roomId).emit('updateUsers', users);
                break;
            }
        }
    });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 服务器运行在端口 ${PORT}`));
