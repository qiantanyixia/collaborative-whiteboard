// src/components/OnlineUsers.jsx

import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

const OnlineUsers = ({ users }) => {
    // 使用 Map 以 userId 为键，确保唯一性
    const uniqueUsersMap = new Map();
    users.forEach(user => {
        uniqueUsersMap.set(user.userId, user);
    });
    const uniqueUsers = Array.from(uniqueUsersMap.values());

    return (
        <Box sx={{ p: 2, borderTop: '1px solid #ccc', maxHeight: '300px', overflowY: 'auto' }}>
            <Typography variant="h6">在线用户</Typography>
            <List>
                {uniqueUsers.map((user) => (
                    <ListItem key={user.userId}>
                        <ListItemText primary={user.username} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default OnlineUsers;
