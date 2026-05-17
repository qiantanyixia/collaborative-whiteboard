// src/components/OnlineUsers.jsx
import React from 'react';
import { Box, Typography, List, ListItem, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const OnlineUsers = ({ users }) => {
    const uniqueUsersMap = new Map();
    users.forEach(user => {
        uniqueUsersMap.set(user.userId, user);
    });
    const uniqueUsers = Array.from(uniqueUsersMap.values());

    return (
        <Box
            sx={{
                p: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                maxHeight: '180px',
                overflowY: 'auto',
                bgcolor: '#fafbfc',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Box
                    sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#10b981',
                    }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    在线用户 · {uniqueUsers.length}
                </Typography>
            </Box>

            <List dense sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {uniqueUsers.map((user) => (
                    <ListItem
                        key={user.userId}
                        sx={{
                            py: 0.5,
                            px: 1,
                            borderRadius: 2,
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.02)',
                            },
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 28,
                                height: 28,
                                mr: 1.5,
                                fontSize: '0.85rem',
                                bgcolor: 'primary.light',
                            }}
                        >
                            {user.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                            {user.username}
                        </Typography>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default OnlineUsers;
