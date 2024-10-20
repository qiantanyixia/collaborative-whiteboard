// src/utils/SocketContext.jsx

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

export const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { token } = useSelector((state) => state.user);
    const [socket, setSocket] = useState(null);
    const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

    useEffect(() => {
        if (!token) {
            setSocket(null);
            return;
        }

        // 初始化 Socket 连接
        const newSocket = io(SERVER_URL, {
            auth: { token }, // 仅发送 token
            transports: ['websocket'], // 强制使用 WebSocket，避免长轮询
            reconnectionAttempts: 5, // 最大重连次数
            reconnectionDelay: 1000, // 重连延迟时间
        });

        // 监听连接成功
        newSocket.on('connect', () => {
            console.log('✅ Socket 已连接:', newSocket.id);
        });

        // 监听连接错误
        newSocket.on('connect_error', (err) => {
            console.error('❌ Socket 连接错误:', err.message);
        });

        // 监听断开连接
        newSocket.on('disconnect', (reason) => {
            console.warn('⚠️ Socket 断开连接:', reason);
        });

        setSocket(newSocket);

        // 清理连接
        return () => {
            newSocket.disconnect();
            console.log('🔌 Socket 已断开连接');
        };
    }, [token, SERVER_URL]);

    const contextValue = useMemo(() => socket, [socket]);

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
};
