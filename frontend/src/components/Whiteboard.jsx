// src/components/Whiteboard.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Stage, Layer, Line, Arrow, Rect, Path, Circle, Ellipse, RegularPolygon, Star } from 'react-konva';
import {
  Box,
  Paper,
  IconButton,
  Slider,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
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
  setShapeType,
} from '../redux/whiteboardSlice';

// 工具图标
import EditIcon from '@mui/icons-material/Edit';
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import PanToolIcon from '@mui/icons-material/PanTool';
import GestureIcon from '@mui/icons-material/Gesture';
import ShapeLineIcon from '@mui/icons-material/ShapeLine';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import StraightIcon from '@mui/icons-material/LinearScale';
import DashedIcon from '@mui/icons-material/BorderStyle';
import ArrowIcon from '@mui/icons-material/CallMissed';
import BezierIcon from '@mui/icons-material/Functions';
import TimelineIcon from '@mui/icons-material/Timeline';
import GridOnIcon from '@mui/icons-material/GridOn';
import GridOffIcon from '@mui/icons-material/GridOff';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ColorLensIcon from '@mui/icons-material/ColorLens';

// 形状图标
import SquareIcon from '@mui/icons-material/CropSquare';
import RectangleIcon from '@mui/icons-material/Rectangle';
import CircleIcon from '@mui/icons-material/Circle';
import EllipseIcon from '@mui/icons-material/VignetteRounded';
import TriangleIcon from '@mui/icons-material/ChangeHistory';
import StarIcon from '@mui/icons-material/Star';
import PolygonIcon from '@mui/icons-material/Pentagon';

import jsPDF from 'jspdf';
import AIDrawInput from './AIDrawInput';
import { analyzeWhiteboard } from '../redux/aiSlice';

const TOOL_CONFIG = [
  { key: 'pencil', icon: <EditIcon />, label: '铅笔' },
  { key: 'eraser', icon: <AutoFixNormalIcon />, label: '橡皮擦' },
  { key: 'pan', icon: <PanToolIcon />, label: '拖拽画布' },
  { key: 'line', icon: <GestureIcon />, label: '线条' },
  { key: 'shape', icon: <ShapeLineIcon />, label: '形状' },
];

const LINE_TYPES = [
  { key: 'straight', icon: <StraightIcon fontSize="small" />, label: '直线' },
  { key: 'dashed', icon: <DashedIcon fontSize="small" />, label: '虚线' },
  { key: 'arrow', icon: <ArrowIcon fontSize="small" />, label: '箭头线' },
  { key: 'bezier', icon: <BezierIcon fontSize="small" />, label: '贝塞尔曲线' },
  { key: 'arc', icon: <TimelineIcon fontSize="small" />, label: '圆弧线' },
];

const SHAPES = [
  { key: 'rectangle', icon: <RectangleIcon fontSize="small" />, label: '矩形' },
  { key: 'square', icon: <SquareIcon fontSize="small" />, label: '正方形' },
  { key: 'circle', icon: <CircleIcon fontSize="small" />, label: '圆形' },
  { key: 'ellipse', icon: <EllipseIcon fontSize="small" />, label: '椭圆形' },
  { key: 'triangle', icon: <TriangleIcon fontSize="small" />, label: '三角形' },
  { key: 'star', icon: <StarIcon fontSize="small" />, label: '星形' },
  { key: 'polygon', icon: <PolygonIcon fontSize="small" />, label: '多边形' },
];

const Whiteboard = ({ roomId }) => {
  const [elements, setElements] = useState([]);
  const isDrawing = useRef(false);
  const dispatch = useDispatch();
  const tool = useSelector((state) => state.whiteboard.tool);
  const color = useSelector((state) => state.whiteboard.color);
  const toolWidth = useSelector((state) => state.whiteboard.lineWidth);
  const lineType = useSelector((state) => state.whiteboard.lineType);
  const shapeType = useSelector((state) => state.whiteboard.shapeType);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const socket = useContext(SocketContext);
  const currentUser = useSelector((state) => state.user.user);

  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth * 0.75,
    height: window.innerHeight - 150,
  });

  const [showGrid, setShowGrid] = useState(false);
  const [toolAnchorEl, setToolAnchorEl] = useState(null);
  const [shapeAnchorEl, setShapeAnchorEl] = useState(null);
  const currentElementRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit('joinRoom', { roomId, user: currentUser });
    socket.on('clearCanvas', () => setElements([]));
    socket.on('loadCanvas', (canvasData) => setElements(canvasData));
    socket.on('drawElement', (newElement) => {
      setElements((prevElements) => [...prevElements, newElement]);
    });
    return () => {
      socket.off('clearCanvas');
      socket.off('loadCanvas');
      socket.off('drawElement');
    };
  }, [socket, roomId, currentUser]);

  const handleAIGenerate = (aiElements) => {
    const enrichedElements = aiElements.map((el) => {
      const base = {
        id: uuidv4(),
        tool: el.type === 'line' ? 'line' : 'shape',
        color: el.color || '#000000',
        width: el.width || el.strokeWidth || 2,
        roomId,
        userId: currentUser?.id || 'ai',
        aiGenerated: true,
      };
      if (el.type === 'circle') {
        base.shapeType = 'circle';
        base.startPos = { x: el.x - el.radius, y: el.y - el.radius };
        base.endPos = { x: el.x + el.radius, y: el.y + el.radius };
      } else if (el.type === 'rectangle') {
        base.shapeType = 'rectangle';
        base.startPos = { x: el.x, y: el.y };
        base.endPos = { x: el.x + el.width, y: el.y + el.height };
      } else if (el.type === 'square') {
        base.shapeType = 'square';
        base.startPos = { x: el.x, y: el.y };
        base.endPos = { x: el.x + el.size, y: el.y + el.size };
      } else if (el.type === 'ellipse') {
        base.shapeType = 'ellipse';
        base.startPos = { x: el.x - el.radiusX, y: el.y - el.radiusY };
        base.endPos = { x: el.x + el.radiusX, y: el.y + el.radiusY };
      } else if (el.type === 'triangle') {
        base.shapeType = 'triangle';
        base.startPos = { x: el.x - el.radius, y: el.y - el.radius };
        base.endPos = { x: el.x + el.radius, y: el.y + el.radius };
      } else if (el.type === 'star') {
        base.shapeType = 'star';
        base.startPos = { x: el.x - el.outerRadius, y: el.y - el.outerRadius };
        base.endPos = { x: el.x + el.outerRadius, y: el.y + el.outerRadius };
      } else if (el.type === 'line') {
        base.points = el.points || [0, 0, 100, 100];
        base.lineType = el.lineType || 'straight';
      }
      return base;
    });

    setElements((prev) => [...prev, ...enrichedElements]);
    enrichedElements.forEach((el) => socket.emit('drawElement', el));
  };

  const handleMouseDown = (e) => {
    if (tool === 'pan') return;
    isDrawing.current = true;
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    const id = uuidv4();
    let newElement = {
      id,
      tool,
      color: tool === 'eraser' ? '#ffffff' : color,
      width: tool === 'eraser' ? 10 : toolWidth,
      roomId,
      userId: currentUser.id,
    };

    if (tool === 'pencil' || tool === 'eraser') {
      newElement.points = [pos.x, pos.y];
    } else if (tool === 'line') {
      newElement.points = [pos.x, pos.y, pos.x, pos.y];
      newElement.lineType = lineType;
    } else if (tool === 'shape') {
      newElement.shapeType = shapeType;
      newElement.startPos = pos;
      newElement.endPos = pos;
    }

    currentElementRef.current = newElement;
    setElements((prevElements) => [...prevElements, newElement]);
  };

  const throttledEmitDraw = useRef(
    throttle((updatedElement) => {
      socket.emit('drawElement', updatedElement);
    }, 50)
  ).current;

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);

    if (currentElementRef.current) {
      const updatedElement = { ...currentElementRef.current };
      if (tool === 'pencil' || tool === 'eraser') {
        updatedElement.points = updatedElement.points.concat([pos.x, pos.y]);
      } else if (tool === 'line') {
        updatedElement.points = [updatedElement.points[0], updatedElement.points[1], pos.x, pos.y];
      } else if (tool === 'shape') {
        updatedElement.endPos = pos;
      }
      currentElementRef.current = updatedElement;
      setElements((prevElements) =>
        prevElements.map((el) => (el.id === updatedElement.id ? updatedElement : el))
      );
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    if (currentElementRef.current) {
      socket.emit('drawElement', currentElementRef.current);
      currentElementRef.current = null;
    }
  };

  const getRelativePointerPosition = (stage) => {
    const pointer = stage.getPointerPosition();
    if (!pointer) return { x: 0, y: 0 };
    return {
      x: (pointer.x - stagePosition.x) / stageScale,
      y: (pointer.y - stagePosition.y) / stageScale,
    };
  };

  const clearCanvas = () => {
    setElements([]);
    socket.emit('clearCanvas', { roomId });
  };

  const saveCanvasAsPNG = () => {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 3 });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'whiteboard.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveCanvasAsPDF = () => {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 3 });
    const pdf = new jsPDF('landscape', 'px', [dimensions.width, dimensions.height]);
    pdf.addImage(dataURL, 'PNG', 0, 0, dimensions.width, dimensions.height);
    pdf.save('whiteboard.pdf');
  };

  const toggleGrid = () => setShowGrid((prev) => !prev);

  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const handleAIAnalyze = async () => {
    if (!stageRef.current || analyzeLoading) return;
    setAnalyzeLoading(true);
    try {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
      const base64 = dataURL.replace('data:image/png;base64,', '');
      await dispatch(
        analyzeWhiteboard({
          image: base64,
          prompt: '请详细分析这张白板图片的内容，包括：1. 有哪些图形元素；2. 它们的颜色和位置；3. 整体表达的主题或含义；4. 给出改进建议。',
        })
      );
    } catch (err) {
      console.error('AI 分析失败:', err);
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const handleColorChange = (selectedColor) => dispatch(setColor(selectedColor.hex));
  const handleToolWidthChange = (event, newValue) => dispatch(setLineWidth(newValue));

  const handleToolChange = (selectedTool) => {
    dispatch(setTool(selectedTool));
    if (selectedTool === 'shape' && !shapeType) dispatch(setShapeType('rectangle'));
    if (selectedTool === 'line' && !lineType) dispatch(setLineType('straight'));
  };

  const handleShapeToolClick = (event) => setShapeAnchorEl(event.currentTarget);
  const handleShapeToolClose = () => setShapeAnchorEl(null);
  const handleShapeSelect = (type) => {
    dispatch(setShapeType(type));
    dispatch(setTool('shape'));
    handleShapeToolClose();
  };

  const handleLineTypeClick = (event) => setToolAnchorEl(event.currentTarget);
  const handleLineTypeClose = () => setToolAnchorEl(null);
  const handleLineTypeSelect = (type) => {
    dispatch(setLineType(type));
    handleLineTypeClose();
  };

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
    const direction = e.evt.deltaY > 0 ? 1 : -1;
    let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    newScale = Math.max(0.1, Math.min(newScale, 10));
    setStageScale(newScale);
    setStagePosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleDragEnd = (e) => setStagePosition({ x: e.target.x(), y: e.target.y() });

  const zoomIn = () => setStageScale((s) => Math.min(s * 1.2, 10));
  const zoomOut = () => setStageScale((s) => Math.max(s / 1.2, 0.1));
  const resetZoom = () => {
    setStageScale(1);
    setStagePosition({ x: 0, y: 0 });
  };

  const generateBezierPath = (points) => {
    if (points.length < 4) return '';
    const [x0, y0, x1, y1] = points;
    return `M${x0},${y0} Q${(x0 + x1) / 2},${y0 - 50} ${x1},${y1}`;
  };

  const generateArcPath = (points) => {
    if (points.length < 4) return '';
    const [x0, y0, x1, y1] = points;
    return `M${x0},${y0} A50,50 0 0,1 ${x1},${y1}`;
  };

  // 当前选中的工具配置
  const activeToolConfig = TOOL_CONFIG.find((t) => t.key === tool);
  const activeLineConfig = LINE_TYPES.find((l) => l.key === lineType);
  const activeShapeConfig = SHAPES.find((s) => s.key === shapeType);

  return (
    <Box
      sx={{ width: '100%', height: 'calc(100vh - 64px)', position: 'relative', display: 'flex', flexDirection: 'column' }}
    >
      {/* 工具栏 */}
      <Paper
        elevation={0}
        sx={{
          mx: 2,
          mt: 1.5,
          mb: 1,
          px: 1.5,
          py: 1,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
          zIndex: 10,
          bgcolor: '#ffffff',
        }}
      >
        {/* 工具图标组 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {TOOL_CONFIG.map((t) => (
            <Tooltip key={t.key} title={t.label} arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  if (t.key === 'line') {
                    handleToolChange('line');
                    handleLineTypeClick(e);
                  } else if (t.key === 'shape') {
                    handleShapeToolClick(e);
                  } else {
                    handleToolChange(t.key);
                  }
                }}
                sx={{
                  bgcolor: tool === t.key ? 'primary.main' : 'transparent',
                  color: tool === t.key ? '#fff' : 'text.secondary',
                  '&:hover': {
                    bgcolor: tool === t.key ? 'primary.dark' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                {t.icon}
              </IconButton>
            </Tooltip>
          ))}

          {/* 线条类型下拉 */}
          <Menu anchorEl={toolAnchorEl} open={Boolean(toolAnchorEl)} onClose={handleLineTypeClose}>
            {LINE_TYPES.map((lt) => (
              <MenuItem key={lt.key} onClick={() => handleLineTypeSelect(lt.key)} selected={lineType === lt.key}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {lt.icon}
                  <Typography variant="body2">{lt.label}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>

          {/* 形状下拉 */}
          <Menu anchorEl={shapeAnchorEl} open={Boolean(shapeAnchorEl)} onClose={handleShapeToolClose}>
            {SHAPES.map((s) => (
              <MenuItem key={s.key} onClick={() => handleShapeSelect(s.key)} selected={shapeType === s.key}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {s.icon}
                  <Typography variant="body2">{s.label}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* 属性区：颜色 + 粗细 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* 颜色选择 */}
          <Tooltip title="选择颜色" arrow>
            <Box sx={{ position: 'relative' }}>
              <IconButton size="small" onClick={() => setShowColorPicker(!showColorPicker)}>
                <ColorLensIcon sx={{ color }} />
              </IconButton>
              {showColorPicker && (
                <>
                  <Box
                    sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
                    onClick={() => setShowColorPicker(false)}
                  />
                  <Box sx={{ position: 'absolute', top: 40, left: 0, zIndex: 2 }}>
                    <SketchPicker color={color} onChangeComplete={handleColorChange} />
                  </Box>
                </>
              )}
            </Box>
          </Tooltip>

          {/* 粗细滑块 */}
          <Box sx={{ width: 100, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: toolWidth,
                height: toolWidth,
                borderRadius: '50%',
                bgcolor: color,
                flexShrink: 0,
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            />
            <Slider
              size="small"
              value={toolWidth}
              onChange={handleToolWidthChange}
              min={1}
              max={20}
              sx={{ width: 70 }}
            />
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* AI 绘图输入 */}
        <AIDrawInput onGenerate={handleAIGenerate} />

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* 操作按钮组 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="清空白板" arrow>
            <IconButton size="small" onClick={clearCanvas} sx={{ color: '#ef4444' }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="保存 PNG" arrow>
            <IconButton size="small" onClick={saveCanvasAsPNG}>
              <SaveAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="保存 PDF" arrow>
            <IconButton size="small" onClick={saveCanvasAsPDF}>
              <PictureAsPdfIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={showGrid ? '隐藏网格' : '显示网格'} arrow>
            <IconButton size="small" onClick={toggleGrid} sx={{ color: showGrid ? 'primary.main' : 'text.secondary' }}>
              {showGrid ? <GridOnIcon fontSize="small" /> : <GridOffIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="AI 分析白板内容" arrow>
            <IconButton
              size="small"
              onClick={handleAIAnalyze}
              disabled={analyzeLoading}
              sx={{ color: 'primary.main' }}
            >
              <AnalyticsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* 缩放控制 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 45, textAlign: 'center' }}>
            {Math.round(stageScale * 100)}%
          </Typography>
          <Tooltip title="放大" arrow>
            <IconButton size="small" onClick={zoomIn}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="缩小" arrow>
            <IconButton size="small" onClick={zoomOut}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="重置视图" arrow>
            <IconButton size="small" onClick={resetZoom}>
              <FitScreenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* 当前状态提示条 */}
      <Box sx={{ px: 2, pb: 0.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          当前工具：
          <Box component="span" sx={{ fontWeight: 600, color: 'text.primary', ml: 0.5 }}>
            {activeToolConfig?.label}
          </Box>
        </Typography>
        {tool === 'line' && activeLineConfig && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            线条类型：
            <Box component="span" sx={{ fontWeight: 600, color: 'text.primary', ml: 0.5 }}>
              {activeLineConfig.label}
            </Box>
          </Typography>
        )}
        {tool === 'shape' && activeShapeConfig && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            形状：
            <Box component="span" sx={{ fontWeight: 600, color: 'text.primary', ml: 0.5 }}>
              {activeShapeConfig.label}
            </Box>
          </Typography>
        )}
      </Box>

      {/* 画布区域 */}
      <Box ref={containerRef} sx={{ flex: 1, mx: 2, mb: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ background: '#fff' }}
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
          <Layer>
            <Rect x={-10000} y={-10000} width={20000} height={20000} fill="#ffffff" />
          </Layer>
          <Layer>
            {showGrid && (
              <>
                {[...Array(401)].map((_, i) => {
                  const x = i * 50 - 10000;
                  return <Line key={`v-${i}`} points={[x, -10000, x, 10000]} stroke="#e2e8f0" strokeWidth={1} dash={[4, 4]} />;
                })}
                {[...Array(401)].map((_, i) => {
                  const y = i * 50 - 10000;
                  return <Line key={`h-${i}`} points={[-10000, y, 10000, y]} stroke="#e2e8f0" strokeWidth={1} dash={[4, 4]} />;
                })}
              </>
            )}
          </Layer>
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
                        globalCompositeOperation={el.tool === 'eraser' ? 'destination-out' : 'source-over'}
                      />
                    )
                  );
                case 'line':
                  if (!el.lineType) return null;
                  switch (el.lineType) {
                    case 'straight':
                      return <Line key={el.id} points={el.points.slice(0, 4)} stroke={el.color} strokeWidth={el.width} lineCap="round" dash={[]} globalCompositeOperation="source-over" />;
                    case 'dashed':
                      return <Line key={el.id} points={el.points} stroke={el.color} strokeWidth={el.width} lineCap="round" dash={[10, 5]} globalCompositeOperation="source-over" />;
                    case 'arrow':
                      return <Arrow key={el.id} points={el.points} stroke={el.color} strokeWidth={el.width} pointerLength={10} pointerWidth={10} fill={el.color} globalCompositeOperation="source-over" />;
                    case 'bezier':
                      return <Path key={el.id} data={generateBezierPath(el.points)} stroke={el.color} strokeWidth={el.width} lineCap="round" fill="transparent" globalCompositeOperation="source-over" />;
                    case 'arc':
                      return <Path key={el.id} data={generateArcPath(el.points)} stroke={el.color} strokeWidth={el.width} lineCap="round" fill="transparent" globalCompositeOperation="source-over" />;
                    default:
                      return null;
                  }
                case 'shape': {
                  const { startPos, endPos, shapeType: st, color: sc, width: sw } = el;
                  const wDiff = endPos.x - startPos.x;
                  const hDiff = endPos.y - startPos.y;
                  const x = Math.min(startPos.x, endPos.x);
                  const y = Math.min(startPos.y, endPos.y);
                  const wAbs = Math.abs(wDiff);
                  const hAbs = Math.abs(hDiff);
                  switch (st) {
                    case 'rectangle':
                      return <Rect key={el.id} x={x} y={y} width={wAbs} height={hAbs} stroke={sc} strokeWidth={sw} fill="transparent" />;
                    case 'square': {
                      const size = Math.min(wAbs, hAbs);
                      return <Rect key={el.id} x={x} y={y} width={size} height={size} stroke={sc} strokeWidth={sw} fill="transparent" />;
                    }
                    case 'circle': {
                      const r = Math.sqrt(wAbs ** 2 + hAbs ** 2) / 2;
                      return <Circle key={el.id} x={startPos.x + wDiff / 2} y={startPos.y + hDiff / 2} radius={r} stroke={sc} strokeWidth={sw} fill="transparent" />;
                    }
                    case 'ellipse':
                      return <Ellipse key={el.id} x={startPos.x + wDiff / 2} y={startPos.y + hDiff / 2} radiusX={wAbs / 2} radiusY={hAbs / 2} stroke={sc} strokeWidth={sw} fill="transparent" />;
                    case 'triangle':
                      return <RegularPolygon key={el.id} x={(startPos.x + endPos.x) / 2} y={endPos.y} sides={3} radius={Math.max(wAbs, hAbs)} stroke={sc} strokeWidth={sw} fill="transparent" />;
                    case 'star':
                      return <Star key={el.id} x={startPos.x + wDiff / 2} y={startPos.y + hDiff / 2} numPoints={5} innerRadius={wAbs / 4} outerRadius={wAbs / 2} fill="transparent" stroke={sc} strokeWidth={sw} />;
                    case 'polygon':
                      return <RegularPolygon key={el.id} x={(startPos.x + endPos.x) / 2} y={(startPos.y + endPos.y) / 2} sides={5} radius={Math.max(wAbs, hAbs)} stroke={sc} strokeWidth={sw} fill="transparent" />;
                    default:
                      return null;
                  }
                }
                default:
                  return null;
              }
            })}
          </Layer>
        </Stage>
      </Box>
    </Box>
  );
};

export default Whiteboard;
