// src/redux/store.js

import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';
import roomReducer from './roomSlice';
import userReducer from './userSlice';
import whiteboardReducer from './whiteboardSlice';
import onlineUsersReducer from './onlineUsersSlice'; // 导入 onlineUsersReducer

const store = configureStore({
    reducer: {
        chat: chatReducer,
        room: roomReducer,
        user: userReducer,
        whiteboard: whiteboardReducer,
        onlineUsers: onlineUsersReducer, // 添加 onlineUsers 到 root reducer
    },
});

export default store;
