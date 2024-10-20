// src/pages/Room.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../utils/SocketContext';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentRoom } from '../redux/roomSlice';
import { setOnlineUsers } from '../redux/onlineUsersSlice';
import { Box } from '@mui/material';
import Whiteboard from '../components/Whiteboard';
import Chat from '../components/Chat';
import OnlineUsers from '../components/OnlineUsers';

const Room = () => {
    const { roomId } = useParams();
    const socket = useSocket();
    const dispatch = useDispatch();
    const { rooms } = useSelector((state) => state.room);
    const { user } = useSelector((state) => state.user);

    const [messages, setMessages] = useState([]);

    const onlineUsers = useSelector((state) => state.onlineUsers.users);

    const hasJoined = useRef(false); // 防止多次加入

    useEffect(() => {
        const room = rooms.find((r) => r.roomId === roomId);
        if (room) {
            dispatch(setCurrentRoom(room));
        }
    }, [roomId, rooms, dispatch]);

    useEffect(() => {
        if (socket && roomId && !hasJoined.current) {
            // 加入房间，仅传递 roomId
            socket.emit('joinRoom', { roomId });
            hasJoined.current = true;

            // 监听聊天室消息
            const handleChatMessage = (message) => {
                setMessages((prevMessages) => [...prevMessages, message]);
            };
            socket.on('chatMessage', handleChatMessage);

            // 监听在线用户更新
            const handleUpdateUsers = (users) => {
                console.log('接收到在线用户列表:', users);
                dispatch(setOnlineUsers(users)); // 更新 Redux Store 中的在线用户
            };
            socket.on('updateUsers', handleUpdateUsers);

            // 监听绘图事件
            socket.on('drawElement', (element) => {
                // Whiteboard 组件已经订阅 'drawElement' 事件，可以在 Whiteboard 中处理
            });

            // 监听清空白板事件
            socket.on('clearCanvas', () => {
                // Whiteboard 组件已经订阅 'clearCanvas' 事件，可以在 Whiteboard 中处理
            });

            // 清理事件监听器
            return () => {
                socket.emit('leaveRoom', { roomId });
                socket.off('chatMessage', handleChatMessage);
                socket.off('updateUsers', handleUpdateUsers);
                socket.off('drawElement');
                socket.off('clearCanvas');
                hasJoined.current = false;
            };
        }
    }, [socket, roomId, dispatch]);

    const sendMessage = (message) => {
        socket.emit('chatMessage', { roomId, message });
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* 白板部分 */}
            <Box sx={{ flex: 3, borderRight: '1px solid #ccc', position: 'relative' }}>
                <Whiteboard roomId={roomId} />
            </Box>

            {/* 右侧区域：聊天和在线用户 */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                }}
            >
                {/* 聊天部分 */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Chat messages={messages} onSend={sendMessage} />
                </Box>

                {/* 在线用户部分 */}
                <OnlineUsers users={onlineUsers} />
            </Box>
        </Box>
    );
};

export default Room;
