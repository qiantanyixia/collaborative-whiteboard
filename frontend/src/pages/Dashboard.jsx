import React from 'react';
import { Typography, Container, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);

    const handleCreateRoom = () => {
        navigate('/create-room');
    };

    const handleViewRooms = () => {
        navigate('/rooms');
    };

    return (
        <Container>
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    欢迎，{user.username}！
                </Typography>
                <Button variant="contained" color="primary" onClick={handleCreateRoom} sx={{ mr: 2 }}>
                    创建房间
                </Button>
                <Button variant="outlined" color="primary" onClick={handleViewRooms}>
                    查看房间
                </Button>
            </Box>
        </Container>
    );
};

export default Dashboard;
