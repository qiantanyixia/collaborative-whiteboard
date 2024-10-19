// src/components/Whiteboard.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { Box, Button, ButtonGroup, Slider, Typography, IconButton } from '@mui/material';
import { SketchPicker } from 'react-color';
import { SocketContext } from '../utils/SocketContext';
import { useSelector, useDispatch } from 'react-redux';
import throttle from 'lodash.throttle';
import { v4 as uuidv4 } from 'uuid';
import { setTool, setColor, setLineWidth } from '../redux/whiteboardSlice';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import MouseIcon from '@mui/icons-material/Mouse';

const Whiteboard = ({ roomId }) => {
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);
  const dispatch = useDispatch();
  const tool = useSelector((state) => state.whiteboard.tool);
  const color = useSelector((state) => state.whiteboard.color);
  const toolWidth = useSelector((state) => state.whiteboard.lineWidth);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const socket = useContext(SocketContext);

  const currentUser = useSelector((state) => state.user.user);

  // 缩放和拖拽相关状态
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

  // 父容器引用和尺寸状态
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth * 0.75, height: window.innerHeight - 150 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      } else {
        setDimensions({
          width: window.innerWidth * 0.75,
          height: window.innerHeight - 150,
        });
      }
    };

    // 初始化尺寸
    updateDimensions();

    // 监听窗口变化
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

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
      setLines(savedLines || []);
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

  // 添加日志以验证当前工具
  useEffect(() => {
    console.log('当前选择的工具:', tool);
    console.log('Stage draggable:', tool === 'pan');
  }, [tool]);

  const handleMouseDown = (e) => {
    // 如果当前工具是“拖拽”，则不进行绘图
    if (tool === 'pan') return;

    isDrawing.current = true;
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    // 创建新线条，分配唯一 ID
    const newLine = {
      id: uuidv4(),
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
    updatedLines[lines.length - 1] = lastLine;
    setLines(updatedLines);

    // 向服务器发送更新后的线条信息，使用节流
    throttledEmitDraw(lastLine);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const getRelativePointerPosition = (stage) => {
    const pointer = stage.getPointerPosition();
    if (!pointer) return { x: 0, y: 0 };

    // 计算逻辑坐标
    const relativePos = {
      x: (pointer.x - stagePosition.x) / stageScale,
      y: (pointer.y - stagePosition.y) / stageScale,
    };

    console.log('Pointer Position:', pointer);
    console.log('Relative Position:', relativePos);

    return relativePos;
  };

  const clearCanvas = () => {
    setLines([]);
    socket.emit('clearCanvas', { roomId });
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

  // 处理缩放
  const handleWheel = (e) => {
    e.evt.preventDefault();

    const scaleBy = 1.05;
    const oldScale = stageScale;

    const pointer = e.target.getStage().getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale,
    };

    // 判断滚轮方向
    const direction = e.evt.deltaY > 0 ? 1 : -1;

    let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // 设置缩放范围
    newScale = Math.max(0.1, Math.min(newScale, 10));

    setStageScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setStagePosition(newPos);
  };

  // 处理拖拽结束
  const handleDragEnd = (e) => {
    setStagePosition({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  // Zoom 控制按钮
  const zoomIn = () => {
    const scaleBy = 1.2;
    let newScale = stageScale * scaleBy;
    newScale = Math.max(0.1, Math.min(newScale, 10));
    setStageScale(newScale);
  };

  const zoomOut = () => {
    const scaleBy = 1.2;
    let newScale = stageScale / scaleBy;
    newScale = Math.max(0.1, Math.min(newScale, 10));
    setStageScale(newScale);
  };

  const resetZoom = () => {
    setStageScale(1);
    setStagePosition({ x: 0, y: 0 });
  };

  return (
    <Box mt={2} ref={containerRef} sx={{ width: '100%', height: 'calc(100vh - 150px)', position: 'relative' }}>
      <Box mb={1} display="flex" alignItems="center" flexWrap="wrap">
        {/* 绘图工具选择 */}
        <ButtonGroup variant="contained" color="primary" sx={{ mb: 1 }}>
          <Button onClick={() => handleToolChange('pencil')}>铅笔</Button>
          <Button onClick={() => handleToolChange('eraser')}>橡皮擦</Button>
          <Button onClick={() => handleToolChange('pan')} startIcon={<MouseIcon />}>
            拖拽
          </Button>
        </ButtonGroup>

        {/* 颜色选择器和线条粗细滑动条仅在绘图模式下显示 */}
        {tool !== 'pan' && (
          <>
            <Box sx={{ ml: 2, position: 'relative', mb: 1 }}>
              <Button variant="contained" color="secondary" onClick={() => setShowColorPicker(!showColorPicker)}>
                颜色选择
              </Button>
              {showColorPicker && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '40px',
                    zIndex: 2,
                  }}
                >
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

            <Box sx={{ ml: 2, width: 200, mb: 1 }}>
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
          </>
        )}

        {/* Zoom 控制按钮 */}
        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ mr: 1 }}>
            缩放:
          </Typography>
          <IconButton color="primary" onClick={zoomIn} aria-label="Zoom In">
            <ZoomInIcon />
          </IconButton>
          <IconButton color="primary" onClick={zoomOut} aria-label="Zoom Out">
            <ZoomOutIcon />
          </IconButton>
          <IconButton color="primary" onClick={resetZoom} aria-label="Reset Zoom">
            <FitScreenIcon />
          </IconButton>
        </Box>

        {/* 功能按钮 */}
        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', mb: 1 }}>
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
        width={dimensions.width}
        height={dimensions.height}
        style={{ border: '1px solid #ccc', background: '#fff', zIndex: 1 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onWheel={handleWheel} // 添加滚轮缩放事件
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        draggable={tool === 'pan'} // 仅当工具为“拖拽”时允许拖拽
        onDragEnd={handleDragEnd} // 拖拽结束事件
      >
        <Layer>
          

          {/* 绘制所有线条 */}
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
