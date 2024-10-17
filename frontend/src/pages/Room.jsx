// src/pages/Room.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../utils/SocketContext';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentRoom } from '../redux/roomSlice';
import { Box } from '@mui/material';
import Whiteboard from '../components/Whiteboard';
import Chat from '../components/Chat';
import OnlineUsers from '../components/OnlineUsers'; // 新增

const Room = () => {
    const { roomId } = useParams();
    const socket = useSocket();
    const dispatch = useDispatch();
    const { rooms } = useSelector((state) => state.room);
    const { user } = useSelector((state) => state.user);

    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        const room = rooms.find((r) => r.roomId === roomId);
        if (room) {
            dispatch(setCurrentRoom(room));
        }
    }, [roomId, rooms, dispatch]);

    useEffect(() => {
        if (socket && user && roomId) {
            // 加入房间
            socket.emit('joinRoom', { roomId, user });

            // 监听聊天室消息
            socket.on('chatMessage', (message) => {
                setMessages((prevMessages) => [...prevMessages, message]);
            });

            // 监听在线用户更新
            socket.on('updateUsers', (users) => {
                setOnlineUsers(users);
            });

            // 监听绘图事件
            socket.on('drawLine', (line) => {
                // 通过事件传递给Whiteboard组件
                // 这里白板组件已经订阅了'SocketContext'，所以可以在Whiteboard中处理
            });

            // 监听清空白板事件
            socket.on('clearCanvas', () => {
                // 通过事件传递给Whiteboard组件
                // Whiteboard组件会处理'clearCanvas'事件
            });

            // 加载白板内容（由服务器自动发送，无需额外emit）

            return () => {
                socket.emit('leaveRoom', { roomId, user });
                socket.off('chatMessage');
                socket.off('updateUsers');
                socket.off('drawLine');
                socket.off('clearCanvas');
            };
        }
    }, [socket, roomId, user, dispatch]);

    const sendMessage = (message) => {
        socket.emit('chatMessage', { roomId, message });
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <Box sx={{ flex: 3, borderRight: '1px solid #ccc', position: 'relative' }}>
                <Whiteboard roomId={roomId} />
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Chat messages={messages} onSend={sendMessage} />
                <OnlineUsers users={onlineUsers} />
            </Box>
        </Box>
    );
};

export default Room;
