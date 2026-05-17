// src/redux/store.js

import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';
import roomReducer from './roomSlice';
import userReducer from './userSlice';
import whiteboardReducer from './whiteboardSlice';
import onlineUsersReducer from './onlineUsersSlice';
import aiReducer from './aiSlice';

const store = configureStore({
    reducer: {
        chat: chatReducer,
        room: roomReducer,
        user: userReducer,
        whiteboard: whiteboardReducer,
        onlineUsers: onlineUsersReducer,
        ai: aiReducer,
    },
});

export default store;
