// src/components/Whiteboard.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { Box, Button, ButtonGroup, Slider, Typography } from '@mui/material';
import { SketchPicker } from 'react-color'; // 引入颜色选择器
import { SocketContext } from '../utils/SocketContext';
import { useSelector, useDispatch } from 'react-redux';
import throttle from 'lodash.throttle';
import { v4 as uuidv4 } from 'uuid';
import { setTool, setColor, setLineWidth } from '../redux/whiteboardSlice'; // 引入 Redux action

const Whiteboard = ({ roomId }) => {
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);
  const dispatch = useDispatch();
  const tool = useSelector((state) => state.whiteboard.tool);
  const color = useSelector((state) => state.whiteboard.color);
  const toolWidth = useSelector((state) => state.whiteboard.lineWidth);
  const [showColorPicker, setShowColorPicker] = useState(false); // 控制颜色选择器显示
  const socket = useContext(SocketContext); // 获取 Socket 实例

  const currentUser = useSelector((state) => state.user.user); // 获取当前用户

  useEffect(() => {
    if (!socket || !roomId) return;

    // 请求加载白板
    socket.emit('loadCanvas', { roomId });

    // 监听清空白板事件
    socket.on('clearCanvas', () => {
      setLines([]);
    });

    // 监听加载白板事件
    socket.on('loadCanvas', (savedLines) => {
      setLines(savedLines || []); // 确保 savedLines 为数组
    });

    // 监听绘图事件
    socket.on('drawLine', (newLine) => {
      setLines((prevLines) => [...prevLines, newLine]);
    });

    // 清理事件监听器
    return () => {
      socket.off('clearCanvas');
      socket.off('loadCanvas');
      socket.off('drawLine');
    };
  }, [socket, roomId]);

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    // 创建新线条，分配唯一 ID
    const newLine = {
      id: uuidv4(), // 生成唯一 ID
      tool,
      color: tool === 'eraser' ? '#ffffff' : color,
      width: tool === 'eraser' ? 10 : toolWidth,
      points: [pos.x, pos.y],
      roomId,
      userId: currentUser.id,
    };
    setLines([...lines, newLine]);
    // 向服务器发送新线条
    socket.emit('drawLine', newLine);
  };

  // 使用节流函数控制发送频率
  const throttledEmitDraw = throttle((lastLine) => {
    socket.emit('drawLine', lastLine);
  }, 50); // 50ms 节流间隔，根据需要调整

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    let lastLine = lines[lines.length - 1];
    if (!lastLine) return;

    // 添加新的点
    lastLine.points = lastLine.points.concat([pos.x, pos.y]);
    const updatedLines = lines.slice();
    updatedLines[updatedLines.length - 1] = lastLine;
    setLines(updatedLines);

    // 向服务器发送更新后的线条信息，使用节流
    throttledEmitDraw(lastLine);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const getRelativePointerPosition = (stage) => {
    const pointer = stage.getPointerPosition();
    return { x: pointer.x, y: pointer.y };
  };

  const clearCanvas = () => {
    setLines([]);
    socket.emit('clearCanvas', { roomId }); // 向服务器发送清空白板事件
  };

  const saveCanvas = () => {
    // 向服务器发送保存白板请求，包含当前线条数据
    socket.emit('saveCanvas', { roomId, lines });
    // 可选：显示保存成功的提示
    alert('白板内容已保存');
  };

  const loadCanvas = () => {
    // 向服务器请求加载白板
    socket.emit('loadCanvas', { roomId });
    // 服务器会发送 'loadCanvas' 事件，包含保存的线条数据
  };

  const handleColorChange = (selectedColor) => {
    dispatch(setColor(selectedColor.hex));
  };

  const handleToolWidthChange = (event, newValue) => {
    dispatch(setLineWidth(newValue));
  };

  const handleToolChange = (selectedTool) => {
    dispatch(setTool(selectedTool));
  };

  return (
    <Box mt={2}>
      <Box mb={1} display="flex" alignItems="center">
        {/* 绘图工具选择 */}
        <ButtonGroup variant="contained" color="primary">
          <Button onClick={() => handleToolChange('pencil')}>铅笔</Button>
          <Button onClick={() => handleToolChange('eraser')}>橡皮擦</Button>
        </ButtonGroup>

        {/* 颜色选择器 */}
        <Box sx={{ ml: 2 }}>
          <Button variant="contained" color="secondary" onClick={() => setShowColorPicker(!showColorPicker)}>
            颜色选择
          </Button>
          {showColorPicker && (
            <Box position="absolute" zIndex={2}>
              <Box
                sx={{
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                }}
                onClick={() => setShowColorPicker(false)}
              />
              <SketchPicker color={color} onChangeComplete={handleColorChange} />
            </Box>
          )}
        </Box>

        {/* 线条粗细滑动条 */}
        <Box sx={{ ml: 4, width: 200 }}>
          <Typography gutterBottom>线条粗细</Typography>
          <Slider
            value={toolWidth}
            onChange={handleToolWidthChange}
            aria-labelledby="line-width-slider"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={20}
          />
        </Box>

        {/* 功能按钮 */}
        <Box sx={{ ml: 4 }}>
          <Button
            variant="outlined"
            color="error"
            sx={{ mr: 2 }}
            onClick={clearCanvas}
          >
            清空白板
          </Button>
          <Button
            variant="outlined"
            color="info"
            sx={{ mr: 2 }}
            onClick={saveCanvas}
          >
            保存白板
          </Button>
          <Button
            variant="outlined"
            color="warning"
            onClick={loadCanvas}
          >
            加载白板
          </Button>
        </Box>
      </Box>
      <Stage
        width={800}
        height={600}
        style={{ border: '1px solid #ccc' }}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onMouseLeave={handleMouseUp}
        // 支持触摸设备
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          {(lines || []).map((line) => (
            line.points.length >= 2 && (
              <Line
                key={line.id} // 使用唯一 ID 作为键
                points={line.points}
                stroke={line.color}
                strokeWidth={line.width}
                tension={0.5}
                lineCap="round"
                globalCompositeOperation={
                  line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            )
          ))}
        </Layer>
      </Stage>
    </Box>
  );
};

export default Whiteboard;
