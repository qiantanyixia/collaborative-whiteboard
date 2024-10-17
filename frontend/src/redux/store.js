import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import chatReducer from './chatSlice';
import roomReducer from './roomSlice';
import whiteboardReducer from './whiteboardSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        chat: chatReducer,
        room: roomReducer,
        whiteboard: whiteboardReducer,
    },
});

export default store;
