// src/components/Whiteboard.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Stage, Layer, Line, Arrow, Rect, Path } from 'react-konva';
import {
  Box,
  Button,
  ButtonGroup,
  Slider,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { SketchPicker } from 'react-color';
import { SocketContext } from '../utils/SocketContext';
import { useSelector, useDispatch } from 'react-redux';
import throttle from 'lodash.throttle';
import { v4 as uuidv4 } from 'uuid';
import {
  setTool,
  setColor,
  setLineWidth,
  setLineType,
} from '../redux/whiteboardSlice';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import MouseIcon from '@mui/icons-material/Mouse';
import StraightIcon from '@mui/icons-material/LinearScale';
import DashedIcon from '@mui/icons-material/BorderStyle';
import ArrowIcon from '@mui/icons-material/CallMissed';
import BezierIcon from '@mui/icons-material/Functions'; // 替代 Curve
import TimelineIcon from '@mui/icons-material/Timeline'; // 替代 ArcIcon
import jsPDF from 'jspdf';

const Whiteboard = ({ roomId }) => {
  const [elements, setElements] = useState([]); // 支持不同类型的绘制元素
  const isDrawing = useRef(false);
  const dispatch = useDispatch();
  const tool = useSelector((state) => state.whiteboard.tool);
  const color = useSelector((state) => state.whiteboard.color);
  const toolWidth = useSelector((state) => state.whiteboard.lineWidth);
  const lineType = useSelector((state) => state.whiteboard.lineType);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const socket = useContext(SocketContext);

  const currentUser = useSelector((state) => state.user.user);

  // 缩放和拖拽相关状态
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

  // 父容器引用和尺寸状态
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth * 0.75,
    height: window.innerHeight - 150,
  });

  // 控制网格显示的状态
  const [showGrid, setShowGrid] = useState(false);

  // 菜单状态
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // 优化绘图性能：使用 useRef 记录当前绘制元素，避免频繁更新 state
  const currentElementRef = useRef(null);

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

  // 处理Socket.io事件
  useEffect(() => {
    if (!socket || !roomId) return;

    // 加入房间
    socket.emit('joinRoom', { roomId, user: currentUser });

    // 监听清空白板事件
    socket.on('clearCanvas', () => {
      setElements([]);
    });

    // 监听加载白板事件
    socket.on('loadCanvas', (canvasData) => {
      setElements(canvasData);
    });

    // 监听绘图事件
    socket.on('drawLine', (newElement) => {
      setElements((prevElements) => [...prevElements, newElement]);
    });

    // 清理事件监听器
    return () => {
      socket.off('clearCanvas');
      socket.off('loadCanvas');
      socket.off('drawLine');
    };
  }, [socket, roomId, currentUser]);

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

    // 创建新绘制元素
    const id = uuidv4();
    const newElement = {
      id,
      tool,
      lineType: tool === 'line' ? lineType : null, // 如果是选择线条工具，记录线条类型
      color: tool === 'eraser' ? '#ffffff' : color,
      width: tool === 'eraser' ? 10 : toolWidth,
      points: [pos.x, pos.y],
      roomId,
      userId: currentUser.id,
    };

    if (tool === 'line' || tool === 'arrow' || tool === 'bezier' || tool === 'arc') {
      currentElementRef.current = newElement; // 使用 ref 记录当前绘制元素
      setElements((prevElements) => [...prevElements, newElement]);
      // **不在这里发送drawLine事件**
    } else {
      setElements((prevElements) => [...prevElements, newElement]);
      // **不在这里发送drawLine事件**
    }
  };

  // 使用节流函数控制发送频率
  const throttledEmitDraw = useRef(
    throttle((updatedElement) => {
      socket.emit('drawLine', updatedElement);
    }, 50)
  ).current;

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);

    if (currentElementRef.current) {
      // 更新当前绘制元素
      const updatedElement = { ...currentElementRef.current };

      switch (updatedElement.tool) {
        case 'line':
        case 'arrow':
          updatedElement.points = [
            updatedElement.points[0],
            updatedElement.points[1],
            pos.x,
            pos.y,
          ];
          break;
        case 'bezier':
          // 贝塞尔曲线需要控制点，这里简化为使用当前点
          updatedElement.points = [
            updatedElement.points[0],
            updatedElement.points[1],
            pos.x,
            pos.y,
          ];
          break;
        case 'arc':
          updatedElement.points = [
            updatedElement.points[0],
            updatedElement.points[1],
            pos.x,
            pos.y,
          ];
          break;
        default:
          updatedElement.points = [...updatedElement.points, pos.x, pos.y];
      }

      currentElementRef.current = updatedElement;
      setElements((prevElements) =>
        prevElements.map((el) => (el.id === updatedElement.id ? updatedElement : el))
      );

      // **不在这里发送drawLine事件**
    } else {
      // 其他工具如铅笔、橡皮擦的绘制
      const lastElement = elements[elements.length - 1];
      if (!lastElement) return;

      // 添加新的点
      lastElement.points = lastElement.points.concat([pos.x, pos.y]);
      setElements((prevElements) => {
        const updatedElements = [...prevElements];
        updatedElements[updatedElements.length - 1] = lastElement;
        return updatedElements;
      });

      // 使用节流发送
      throttledEmitDraw(lastElement);
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    if (currentElementRef.current) {
      // 绘制完成后发送drawLine事件
      socket.emit('drawLine', currentElementRef.current);
      currentElementRef.current = null;
    }
  };

  const getRelativePointerPosition = (stage) => {
    const pointer = stage.getPointerPosition();
    if (!pointer) return { x: 0, y: 0 };

    // 计算逻辑坐标
    const relativePos = {
      x: (pointer.x - stagePosition.x) / stageScale,
      y: (pointer.y - stagePosition.y) / stageScale,
    };

    return relativePos;
  };

  const clearCanvas = () => {
    setElements([]);
    socket.emit('clearCanvas', { roomId });
  };

  // 保存为 PNG 文件
  const saveCanvasAsPNG = () => {
    if (!stageRef.current) {
      console.error('Stage 未正确引用');
      alert('导出失败，Stage 引用不存在。');
      return;
    }

    const dataURL = stageRef.current.toDataURL({ pixelRatio: 3 });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'whiteboard.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 保存为 PDF 文件
  const saveCanvasAsPDF = () => {
    if (!stageRef.current) {
      console.error('Stage 未正确引用');
      alert('导出失败，Stage 引用不存在。');
      return;
    }

    const dataURL = stageRef.current.toDataURL({ pixelRatio: 3 });
    const pdf = new jsPDF('landscape', 'px', [
      dimensions.width,
      dimensions.height,
    ]);

    // 添加 PNG 图片到 PDF
    pdf.addImage(dataURL, 'PNG', 0, 0, dimensions.width, dimensions.height);
    pdf.save('whiteboard.pdf');
  };

  // 切换网格显示
  const toggleGrid = () => {
    setShowGrid((prev) => !prev);
  };

  const handleColorChange = (selectedColor) => {
    dispatch(setColor(selectedColor.hex));
  };

  const handleToolWidthChange = (event, newValue) => {
    dispatch(setLineWidth(newValue));
  };

  const handleToolChange = (selectedTool) => {
    dispatch(setTool(selectedTool));
    // 如果切换到线条工具，保留当前绘制元素
    if (selectedTool !== 'line') {
      currentElementRef.current = null;
    }
  };

  // 处理缩放
  const handleWheel = (e) => {
    e.evt.preventDefault();

    const scaleBy = 1.05;
    const oldScale = stageScale;

    const pointer = e.target.getStage().getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale,
    };

    // 判断滚轮方向
    const direction = e.evt.deltaY > 0 ? 1 : -1;

    let newScale =
      direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

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

  // 线条类型菜单的处理函数
  const handleLineTypeClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLineTypeClose = () => {
    setAnchorEl(null);
  };

  const handleLineTypeSelect = (type) => {
    dispatch(setLineType(type));
    handleLineTypeClose();
  };

  // 生成贝塞尔曲线路径
  const generateBezierPath = (points) => {
    if (points.length < 4) return '';

    const [x0, y0, x1, y1] = points;
    return `M${x0},${y0} Q${(x0 + x1) / 2},${y0 - 50} ${x1},${y1}`;
  };

  // 生成圆弧线路径
  const generateArcPath = (points) => {
    if (points.length < 4) return '';

    const [x0, y0, x1, y1] = points;
    // 简单的圆弧，半径为50
    return `M${x0},${y0} A50,50 0 0,1 ${x1},${y1}`;
  };

  return (
    <Box
      mt={2}
      ref={containerRef}
      sx={{ width: '100%', height: 'calc(100vh - 150px)', position: 'relative' }}
    >
      <Box mb={1} display="flex" alignItems="center" flexWrap="wrap">
        {/* 绘图工具选择 */}
        <ButtonGroup variant="contained" color="primary" sx={{ mb: 1 }}>
          <Button onClick={() => handleToolChange('pencil')}>铅笔</Button>
          <Button onClick={() => handleToolChange('eraser')}>橡皮擦</Button>
          <Button onClick={() => handleToolChange('pan')} startIcon={<MouseIcon />}>
            拖拽
          </Button>
          <Button onClick={() => handleToolChange('line')}>选择线条</Button>
        </ButtonGroup>

        {/* 线条类型选择按钮，仅在选择线条工具时显示 */}
        {tool === 'line' && (
          <>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLineTypeClick}
              sx={{ ml: 2, mb: 1 }}
              startIcon={
                lineType === 'straight' ? <StraightIcon /> :
                lineType === 'dashed' ? <DashedIcon /> :
                lineType === 'arrow' ? <ArrowIcon /> :
                lineType === 'bezier' ? <BezierIcon /> :
                lineType === 'arc' ? <TimelineIcon /> : // 使用 TimelineIcon 代替 ArcIcon
                null
              }
            >
              {`线条: ${
                lineType === 'straight'
                  ? '直线'
                  : lineType === 'dashed'
                  ? '虚线'
                  : lineType === 'arrow'
                  ? '箭头线'
                  : lineType === 'bezier'
                  ? '贝塞尔曲线'
                  : lineType === 'arc'
                  ? '圆弧线'
                  : ''
              }`}
            </Button>
            <Menu anchorEl={anchorEl} open={openMenu} onClose={handleLineTypeClose}>
              <MenuItem onClick={() => handleLineTypeSelect('straight')}>
                <StraightIcon sx={{ mr: 1 }} /> 直线
              </MenuItem>
              <MenuItem onClick={() => handleLineTypeSelect('dashed')}>
                <DashedIcon sx={{ mr: 1 }} /> 虚线
              </MenuItem>
              <MenuItem onClick={() => handleLineTypeSelect('arrow')}>
                <ArrowIcon sx={{ mr: 1 }} /> 箭头线
              </MenuItem>
              <MenuItem onClick={() => handleLineTypeSelect('bezier')}>
                <BezierIcon sx={{ mr: 1 }} /> 贝塞尔曲线
              </MenuItem>
              <MenuItem onClick={() => handleLineTypeSelect('arc')}>
                <TimelineIcon sx={{ mr: 1 }} /> 圆弧线 {/* 使用 TimelineIcon 代替 ArcIcon */}
              </MenuItem>
            </Menu>
          </>
        )}

        {/* 颜色选择器和线条粗细滑动条仅在绘图模式下显示 */}
        {(tool !== 'pan' && tool !== 'line') && (
          <>
            <Box sx={{ ml: 2, position: 'relative', mb: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setShowColorPicker(!showColorPicker)}
              >
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
          <Button variant="outlined" color="error" sx={{ mr: 2 }} onClick={clearCanvas}>
            清空白板
          </Button>
          <Button variant="outlined" color="info" sx={{ mr: 2 }} onClick={saveCanvasAsPNG}>
            保存为 PNG
          </Button>
          <Button variant="outlined" color="info" onClick={saveCanvasAsPDF}>
            保存为 PDF
          </Button>
          <Button variant="outlined" color="success" onClick={toggleGrid}>
            {showGrid ? '隐藏网格' : '显示网格'}
          </Button>
        </Box>
      </Box>
      <Stage
        ref={stageRef}
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
        onWheel={handleWheel}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        draggable={tool === 'pan'}
        onDragEnd={handleDragEnd}
      >
        {/* 第一层：背景 */}
        <Layer>
          <Rect
            x={-10000}
            y={-10000}
            width={20000}
            height={20000}
            fill="#ffffff"
          />
        </Layer>

        {/* 第二层：网格 */}
        <Layer>
          {showGrid && (
            <>
              {/* 纵向网格线 */}
              {[...Array(401)].map((_, i) => {
                const x = i * 50 - 10000;
                return (
                  <Line
                    key={`v-${i}`}
                    points={[x, -10000, x, 10000]}
                    stroke="#ddd"
                    strokeWidth={1}
                    dash={[4, 4]}
                  />
                );
              })}
              {/* 横向网格线 */}
              {[...Array(401)].map((_, i) => {
                const y = i * 50 - 10000;
                return (
                  <Line
                    key={`h-${i}`}
                    points={[-10000, y, 10000, y]}
                    stroke="#ddd"
                    strokeWidth={1}
                    dash={[4, 4]}
                  />
                );
              })}
            </>
          )}
        </Layer>

        {/* 第三层：用户绘制的元素 */}
        <Layer>
          {elements.map((el) => {
            switch (el.tool) {
              case 'pencil':
              case 'eraser':
                return (
                  el.points.length >= 2 && (
                    <Line
                      key={el.id}
                      points={el.points}
                      stroke={el.color}
                      strokeWidth={el.width}
                      tension={0.5}
                      lineCap="round"
                      globalCompositeOperation={
                        el.tool === 'eraser' ? 'destination-out' : 'source-over'
                      }
                    />
                  )
                );
              case 'line':
                if (!el.lineType) return null;
                switch (el.lineType) {
                  case 'straight':
                    // 使用单一的起点和终点绘制直线
                    return (
                      <Line
                        key={el.id}
                        points={el.points.slice(0, 4)}
                        stroke={el.color}
                        strokeWidth={el.width}
                        lineCap="round"
                        dash={[]}
                        globalCompositeOperation={
                          el.tool === 'eraser' ? 'destination-out' : 'source-over'
                        }
                      />
                    );
                  case 'dashed':
                    return (
                      <Line
                        key={el.id}
                        points={el.points}
                        stroke={el.color}
                        strokeWidth={el.width}
                        lineCap="round"
                        dash={[10, 5]}
                        globalCompositeOperation={
                          el.tool === 'eraser' ? 'destination-out' : 'source-over'
                        }
                      />
                    );
                  case 'arrow':
                    return (
                      <Arrow
                        key={el.id}
                        points={el.points}
                        stroke={el.color}
                        strokeWidth={el.width}
                        pointerLength={10}
                        pointerWidth={10}
                        fill={el.color}
                        globalCompositeOperation={
                          el.tool === 'eraser' ? 'destination-out' : 'source-over'
                        }
                      />
                    );
                  case 'bezier':
                    return (
                      <Path
                        key={el.id}
                        data={generateBezierPath(el.points)}
                        stroke={el.color}
                        strokeWidth={el.width}
                        lineCap="round"
                        fill="transparent" // 设置内部为透明
                        globalCompositeOperation={
                          el.tool === 'eraser' ? 'destination-out' : 'source-over'
                        }
                      />
                    );
                  case 'arc':
                    return (
                      <Path
                        key={el.id}
                        data={generateArcPath(el.points)}
                        stroke={el.color}
                        strokeWidth={el.width}
                        lineCap="round"
                        fill="transparent" // 设置内部为透明
                        globalCompositeOperation={
                          el.tool === 'eraser' ? 'destination-out' : 'source-over'
                        }
                      />
                    );
                  default:
                    return null;
                }
              default:
                return null;
            }
          })}
        </Layer>
      </Stage>
    </Box>
  );
};

export default Whiteboard;
