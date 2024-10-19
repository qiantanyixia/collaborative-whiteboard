// src/components/Sidebar.jsx
import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, Tooltip, Box } from '@mui/material';
import SelectIcon from '@mui/icons-material/Mouse'; // 临时使用 MUI 图标
import PanToolIcon from '@mui/icons-material/PanTool';
import BrushIcon from '@mui/icons-material/Brush';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TimelineIcon from '@mui/icons-material/Timeline';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import SaveIcon from '@mui/icons-material/Save';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';

// 如果您有自定义图标，导入它们
// import SelectImg from '../assets/icons/select.png';
// import PanImg from '../assets/icons/pan.png';
// ... 其他图标

const Sidebar = ({
  currentTool,
  handleToolChange,
  handleZoomIn,
  handleZoomOut,
  handleResetZoom,
}) => {
  return (
    <Drawer variant="permanent" anchor="left">
      <Box sx={{ width: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
        <List>
          {/* 选择工具 */}
          <Tooltip title="选择" placement="right">
            <ListItem button selected={currentTool === 'select'} onClick={() => handleToolChange('select')}>
              <ListItemIcon>
                {/* 使用自定义图标 */}
                {/* <img src={SelectImg} alt="Select" width="24" height="24" /> */}
                <SelectIcon />
              </ListItemIcon>
            </ListItem>
          </Tooltip>

          {/* 拖拽工具 */}
          <Tooltip title="拖拽" placement="right">
            <ListItem button selected={currentTool === 'pan'} onClick={() => handleToolChange('pan')}>
              <ListItemIcon>
                <PanToolIcon />
              </ListItemIcon>
            </ListItem>
          </Tooltip>

          {/* 画笔工具 */}
          <Tooltip title="画笔工具" placement="right">
            <ListItem button selected={currentTool === 'brush'} onClick={() => handleToolChange('brush')}>
              <ListItemIcon>
                <BrushIcon />
              </ListItemIcon>
            </ListItem>
          </Tooltip>

          {/* 文本工具 */}
          <Tooltip title="文本工具" placement="right">
            <ListItem button selected={currentTool === 'text'} onClick={() => handleToolChange('text')}>
              <ListItemIcon>
                <TextFieldsIcon />
              </ListItemIcon>
            </ListItem>
          </Tooltip>

          {/* 线条工具 */}
          <Tooltip title="线条工具" placement="right">
            <ListItem button selected={currentTool === 'line'} onClick={() => handleToolChange('line')}>
              <ListItemIcon>
                <TimelineIcon />
              </ListItemIcon>
            </ListItem>
          </Tooltip>

          {/* 形状工具 */}
          <Tooltip title="形状工具" placement="right">
            <ListItem button selected={currentTool === 'shape'} onClick={() => handleToolChange('shape')}>
              <ListItemIcon>
                <CropSquareIcon />
              </ListItemIcon>
            </ListItem>
          </Tooltip>

          {/* 保存按钮 */}
          <Tooltip title="保存" placement="right">
            <ListItem button onClick={handleZoomIn}> {/* 示例绑定保存功能 */}
              <ListItemIcon>
                <SaveIcon />
              </ListItemIcon>
            </ListItem>
          </Tooltip>
        </List>

        {/* 缩放控制按钮 */}
        <Box sx={{ mt: 'auto', mb: 2 }}>
          <Tooltip title="放大" placement="right">
            <ListItem button onClick={handleZoomIn}>
              <ListItemIcon>
                <ZoomInIcon />
              </ListItemIcon>
            </ListItem>
          </Tooltip>
          <Tooltip title="缩小" placement="right">
            <ListItem button onClick={handleZoomOut}>
              <ListItemIcon>
                <ZoomOutIcon />
              </ListItemIcon>
            </ListItem>
          </Tooltip>
          <Tooltip title="重置缩放" placement="right">
            <ListItem button onClick={handleResetZoom}>
              <ListItemIcon>
                <FitScreenIcon />
              </ListItemIcon>
            </ListItem>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
