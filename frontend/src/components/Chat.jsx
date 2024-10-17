import React, { useState } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import { useSelector } from 'react-redux';

const Chat = ({ messages, onSend }) => {
    const [message, setMessage] = useState('');
    const { user } = useSelector((state) => state.user);

    const handleSend = () => {
        if (message.trim()) {
            console.log('当前用户名:', user.username); // 添加此行测试
            const msg = { user: user.username, text: message };
            onSend(msg);
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #ccc' }}>
                聊天
            </Typography>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                <List>
                    {messages.map((msg, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={`${msg.user}: ${msg.text}`} />
                        </ListItem>
                    ))}
                </List>
            </Box>
            <Box sx={{ p: 2, borderTop: '1px solid #ccc', display: 'flex' }}>
                <TextField
                    variant="outlined"
                    fullWidth
                    placeholder="输入消息..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <Button variant="contained" color="primary" onClick={handleSend} sx={{ ml: 1 }}>
                    发送
                </Button>
            </Box>
        </Box>
    );
};

export default Chat;
