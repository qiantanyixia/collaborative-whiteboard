import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRooms } from '../redux/roomSlice';
import { Typography, Container, Box, List, ListItem, ListItemText, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const RoomList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { rooms, loading, error } = useSelector((state) => state.room);

    useEffect(() => {
        dispatch(fetchRooms());
    }, [dispatch]);

    const handleJoin = (roomId) => {
        navigate(`/room/${roomId}`);
    };

    // 返回上一页的处理函数
    const handleGoBack = () => {
        navigate(-1); // 返回上一页
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    房间列表
                </Typography>
                <Button variant="outlined" onClick={handleGoBack}>
                    返回
                </Button>
            </Box>
            {loading && <Typography>加载中...</Typography>}
            {error && (
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            )}
            <List>
                {rooms.map((room) => (
                    <ListItem key={room.roomId} secondaryAction={
                        <Button variant="contained" color="primary" onClick={() => handleJoin(room.roomId)}>
                            加入
                        </Button>
                    }>
                        <ListItemText primary={room.name} secondary={`房间ID: ${room.roomId}`} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default RoomList;
