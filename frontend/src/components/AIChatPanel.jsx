// src/components/AIChatPanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Paper,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { sendAIMessage, addUserMessage, clearAIError } from '../redux/aiSlice';

const AIChatPanel = ({ onAction }) => {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { messages, chatLoading, error } = useSelector((state) => state.ai);
  const { user } = useSelector((state) => state.user);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || chatLoading) return;
    const userMessage = input.trim();
    dispatch(addUserMessage(userMessage));
    setInput('');

    const context = { roomId: 'current-room' };
    const history = messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content || m.message || '',
    }));

    const resultAction = await dispatch(
      sendAIMessage({ message: userMessage, context, history })
    );

    if (sendAIMessage.fulfilled.match(resultAction)) {
      const { type, action: actionName } = resultAction.payload;
      if (type === 'action' && actionName) {
        onAction?.(actionName);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = ['画一个红色五角星', '清空白板', '导出PNG'];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* 消息区域 */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, minHeight: 0 }}>
        {messages.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(37, 99, 235, 0.08)',
                color: 'primary.main',
                mb: 2,
              }}
            >
              <SmartToyIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              你好，我是你的白板助手
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 3, textAlign: 'center', px: 2 }}>
              可以帮你绘图、清空白板、总结内容...
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', px: 1 }}>
              {suggestions.map((text) => (
                <Paper
                  key={text}
                  elevation={0}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'rgba(37, 99, 235, 0.02)',
                    },
                  }}
                  onClick={() => {
                    dispatch(addUserMessage(text));
                    const history = messages.slice(-10).map((m) => ({
                      role: m.role,
                      content: m.content || m.message || '',
                    }));
                    dispatch(sendAIMessage({ message: text, context: { roomId: 'current-room' }, history }));
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    <AutoFixHighIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                    {text}
                  </Typography>
                </Paper>
              ))}
            </Box>

            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ImageSearchIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                点击工具栏「AI 分析」按钮，自动截图分析白板
              </Typography>
            </Box>
          </Box>
        )}

        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              mb: 2,
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {msg.role === 'assistant' && (
              <Avatar sx={{ mr: 1, width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                <SmartToyIcon sx={{ fontSize: 16 }} />
              </Avatar>
            )}

            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                maxWidth: '78%',
                bgcolor: msg.role === 'user' ? 'primary.main' : '#f1f5f9',
                color: msg.role === 'user' ? '#fff' : 'text.primary',
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              }}
            >
              <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {msg.content || msg.message}
              </Typography>
            </Paper>

            {msg.role === 'user' && (
              <Avatar sx={{ ml: 1, width: 28, height: 28, bgcolor: 'secondary.main', fontSize: '0.75rem' }}>
                <PersonIcon sx={{ fontSize: 16 }} />
              </Avatar>
            )}
          </Box>
        ))}

        {chatLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
              <SmartToyIcon sx={{ fontSize: 16 }} />
            </Avatar>
            <Paper elevation={0} sx={{ px: 2, py: 1, bgcolor: '#f1f5f9', borderRadius: '14px 14px 14px 4px' }}>
              <CircularProgress size={14} sx={{ mr: 1 }} />
              <Typography variant="caption" color="text.secondary">
                AI 思考中...
              </Typography>
            </Paper>
          </Box>
        )}

        {error && (
          <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* 输入区域 */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, bgcolor: '#fafbfc' }}>
        <TextField
          size="small"
          fullWidth
          placeholder="向 AI 助手提问..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) dispatch(clearAIError());
          }}
          onKeyDown={handleKeyPress}
          error={!!error}
          multiline
          maxRows={3}
          sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={chatLoading || !input.trim()}
          sx={{ minWidth: 44, px: 0 }}
        >
          {chatLoading ? <CircularProgress size={18} color="inherit" /> : <SendIcon fontSize="small" />}
        </Button>
      </Box>
    </Box>
  );
};

export default AIChatPanel;
