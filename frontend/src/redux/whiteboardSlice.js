// src/redux/whiteboardSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tool: 'pencil', // Other tools: 'eraser', 'pan', 'line', 'shape'
  color: '#000000',
  lineWidth: 2,
  lineType: 'straight', // Line types: 'straight', 'dashed', 'arrow', 'bezier', 'arc'
  shapeType: 'rectangle', // New: 'rectangle', 'square', 'circle', 'ellipse', 'triangle', 'star', 'polygon', etc.
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
    setShapeType(state, action) { // New reducer for shape types
      state.shapeType = action.payload;
    },
  },
});

export const { setTool, setColor, setLineWidth, setLineType, setShapeType } = whiteboardSlice.actions;
export default whiteboardSlice.reducer;
