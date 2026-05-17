import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import { useSelector } from 'react-redux';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AIChatPanel from './AIChatPanel';

const Chat = ({ messages, onSend, onAIAction }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [message, setMessage] = useState('');
    const { user } = useSelector((state) => state.user);

    const handleSend = () => {
        if (message.trim()) {
            onSend({ user: user.username, text: message });
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
            <Tabs
                value={activeTab}
                onChange={(e, v) => setActiveTab(v)}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}
            >
                <Tab label="聊天" sx={{ textTransform: 'none', fontWeight: 600 }} />
                <Tab label="AI 助手" sx={{ textTransform: 'none', fontWeight: 600 }} />
            </Tabs>

            {activeTab === 0 && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                    {/* 消息列表 */}
                    <Box sx={{ flex: 1, overflowY: 'auto', p: 2, minHeight: 0 }}>
                        {messages.length === 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                                <ChatBubbleOutlineIcon sx={{ fontSize: 40, mb: 1, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    暂无消息，开始聊天吧
                                </Typography>
                            </Box>
                        )}
                        {messages.map((msg, index) => {
                            const isMe = msg.user === user?.username;
                            return (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        mb: 1.5,
                                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                                    }}
                                >
                                    {!isMe && (
                                        <Avatar sx={{ width: 28, height: 28, mr: 1, fontSize: '0.8rem', bgcolor: 'secondary.light' }}>
                                            {msg.user?.charAt(0)?.toUpperCase()}
                                        </Avatar>
                                    )}
                                    <Box sx={{ maxWidth: '78%' }}>
                                        {!isMe && (
                                            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5, mb: 0.3, display: 'block' }}>
                                                {msg.user}
                                            </Typography>
                                        )}
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                px: 1.5,
                                                py: 1,
                                                bgcolor: isMe ? 'primary.main' : '#f1f5f9',
                                                color: isMe ? '#fff' : 'text.primary',
                                                borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ lineHeight: 1.5, wordBreak: 'break-word' }}>
                                                {msg.text}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>

                    {/* 输入区 */}
                    <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, bgcolor: '#fafbfc' }}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="输入消息..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleSend}
                            disabled={!message.trim()}
                            sx={{ minWidth: 44, px: 0 }}
                        >
                            <SendIcon fontSize="small" />
                        </Button>
                    </Box>
                </Box>
            )}

            {activeTab === 1 && <AIChatPanel onAction={onAIAction} />}
        </Box>
    );
};

export default Chat;
