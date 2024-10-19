// src/redux/whiteboardSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tool: 'pencil', // 其他工具: 'eraser', 'pan', 'line'
  color: '#000000',
  lineWidth: 2,
  lineType: 'straight', // 新增的线条类型: 'straight', 'dashed', 'wave', 'arrow', 'polyline', 'bezier', 'arc'
};

const whiteboardSlice = createSlice({
  name: 'whiteboard',
  initialState,
  reducers: {
    setTool(state, action) {
      state.tool = action.payload;
    },
    setColor(state, action) {
      state.color = action.payload;
    },
    setLineWidth(state, action) {
      state.lineWidth = action.payload;
    },
    setLineType(state, action) {
      state.lineType = action.payload;
    },
  },
});

export const { setTool, setColor, setLineWidth, setLineType } = whiteboardSlice.actions;
export default whiteboardSlice.reducer;
