import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

const OnlineUsers = ({ users }) => {
    return (
        <Box sx={{ p: 2, borderTop: '1px solid #ccc' }}>
            <Typography variant="h6">在线用户</Typography>
            <List>
                {users.map((user) => (
                    <ListItem key={user.id}>
                        <ListItemText primary={user.username} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default OnlineUsers;
