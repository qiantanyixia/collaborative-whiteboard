// src/components/AIDrawInput.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, TextField, IconButton, CircularProgress, Tooltip } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { generateAIDrawing, clearAIError } from '../redux/aiSlice';

const AIDrawInput = ({ onGenerate }) => {
  const dispatch = useDispatch();
  const [prompt, setPrompt] = useState('');
  const { drawLoading, drawError } = useSelector((state) => state.ai);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || drawLoading) return;

    const resultAction = await dispatch(generateAIDrawing(prompt.trim()));

    if (generateAIDrawing.fulfilled.match(resultAction)) {
      const { elements } = resultAction.payload;
      if (elements && elements.length > 0) {
        onGenerate(elements);
        setPrompt('');
      }
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <Tooltip title="输入自然语言描述生成图形，例如：画一个红色五角星" arrow>
        <TextField
          size="small"
          placeholder="AI 绘图..."
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            if (drawError) dispatch(clearAIError());
          }}
          error={!!drawError}
          helperText={drawError || ''}
          sx={{
            width: 180,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(37, 99, 235, 0.04)',
              fontSize: '0.85rem',
            },
            '& .MuiFormHelperText-root': {
              position: 'absolute',
              bottom: -20,
              left: 0,
            },
          }}
        />
      </Tooltip>
      <IconButton
        type="submit"
        size="small"
        disabled={drawLoading || !prompt.trim()}
        sx={{
          bgcolor: 'primary.main',
          color: '#fff',
          '&:hover': { bgcolor: 'primary.dark' },
          '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.2)' },
        }}
      >
        {drawLoading ? <CircularProgress size={16} color="inherit" /> : <AutoFixHighIcon fontSize="small" />}
      </IconButton>
    </Box>
  );
};

export default AIDrawInput;
