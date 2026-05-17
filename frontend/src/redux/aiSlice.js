// frontend/src/redux/aiSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

// AI 绘图生成
export const generateAIDrawing = createAsyncThunk(
  'ai/generateDrawing',
  async (prompt, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/ai/draw`,
        { prompt },
        { headers: { Authorization: token } }
      );
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'AI 绘图请求失败'
      );
    }
  }
);

// AI 聊天
export const sendAIMessage = createAsyncThunk(
  'ai/sendMessage',
  async ({ message, context, history }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/ai/chat`,
        { message, context, history },
        { headers: { Authorization: token } }
      );
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'AI 聊天请求失败'
      );
    }
  }
);

// AI 图片分析（多模态）
export const analyzeWhiteboard = createAsyncThunk(
  'ai/analyzeWhiteboard',
  async ({ image, prompt }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/ai/analyze`,
        { image, prompt },
        { headers: { Authorization: token } }
      );
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'AI 图片分析请求失败'
      );
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    messages: [],
    drawLoading: false,
    chatLoading: false,
    error: null,
    drawError: null,
  },
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({
        role: 'user',
        content: action.payload,
        timestamp: Date.now(),
      });
    },
    addAIMessage: (state, action) => {
      state.messages.push({
        role: 'assistant',
        ...action.payload,
        timestamp: Date.now(),
      });
    },
    clearAIMessages: (state) => {
      state.messages = [];
    },
    clearAIError: (state) => {
      state.error = null;
      state.drawError = null;
    },
  },
  extraReducers: (builder) => {
    // generateAIDrawing
    builder.addCase(generateAIDrawing.pending, (state) => {
      state.drawLoading = true;
      state.drawError = null;
    });
    builder.addCase(generateAIDrawing.fulfilled, (state) => {
      state.drawLoading = false;
    });
    builder.addCase(generateAIDrawing.rejected, (state, action) => {
      state.drawLoading = false;
      state.drawError = action.payload;
    });

    // sendAIMessage
    builder.addCase(sendAIMessage.pending, (state) => {
      state.chatLoading = true;
      state.error = null;
    });
    builder.addCase(sendAIMessage.fulfilled, (state, action) => {
      state.chatLoading = false;
      state.messages.push({
        role: 'assistant',
        ...action.payload,
        timestamp: Date.now(),
      });
    });
    builder.addCase(sendAIMessage.rejected, (state, action) => {
      state.chatLoading = false;
      state.error = action.payload;
    });

    // analyzeWhiteboard
    builder.addCase(analyzeWhiteboard.pending, (state) => {
      state.chatLoading = true;
      state.error = null;
    });
    builder.addCase(analyzeWhiteboard.fulfilled, (state, action) => {
      state.chatLoading = false;
      state.messages.push({
        role: 'assistant',
        type: 'text',
        content: action.payload.content,
        timestamp: Date.now(),
      });
    });
    builder.addCase(analyzeWhiteboard.rejected, (state, action) => {
      state.chatLoading = false;
      state.error = action.payload;
    });
  },
});

export const { addUserMessage, addAIMessage, clearAIMessages, clearAIError } = aiSlice.actions;
export default aiSlice.reducer;
