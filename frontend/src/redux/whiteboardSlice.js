// src/redux/whiteboardSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tool: 'pencil',
  color: '#000000',
  lineWidth: 2,
  // Add more settings as needed
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
    // Add more reducers as needed
  },
});

export const { setTool, setColor, setLineWidth } = whiteboardSlice.actions;
export default whiteboardSlice.reducer;
