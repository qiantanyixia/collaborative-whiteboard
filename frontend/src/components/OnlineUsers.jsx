// src/components/OnlineUsers.jsx

import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Avatar } from '@mui/material';

const OnlineUsers = ({ users }) => {
    // 使用 Map 以 userId 为键，确保唯一性
    const uniqueUsersMap = new Map();
    users.forEach(user => {
        uniqueUsersMap.set(user.userId, user);
    });
    const uniqueUsers = Array.from(uniqueUsersMap.values());

    return (
        <Box
            sx={{
                p: 2,
                borderTop: '1px solid #ccc',
                maxHeight: '200px', // 调整最大高度
                overflowY: 'auto',
                backgroundColor: '#f9f9f9',
                // 自定义滚动条样式（仅适用于 Webkit）
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    background: '#555',
                },
            }}
        >
            <Typography variant="h6" gutterBottom>
                在线用户
            </Typography>
            <List>
                {uniqueUsers.map((user) => (
                    <ListItem key={user.userId}>
                        <Avatar sx={{ mr: 2 }}>
                            {user.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <ListItemText primary={user.username} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default OnlineUsers;
