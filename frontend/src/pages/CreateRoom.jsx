import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createRoom } from '../redux/roomSlice';
import { TextField, Button, Typography, Container, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';

const CreateRoom = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.room);

    const [roomName, setRoomName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!roomName.trim()) {
            alert('房间名称不能为空');
            return;
        }
        const resultAction = await dispatch(createRoom({ name: roomName }));
        if (createRoom.fulfilled.match(resultAction)) {
            navigate(`/room/${resultAction.payload.roomId}`);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 6 }}>
            <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3, textTransform: 'none', borderColor: '#e2e8f0' }}
            >
                返回
            </Button>

            <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, border: '1px solid #f1f5f9' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    创建房间
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    输入房间名称，即可创建一个全新的协作白板空间
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        label="房间名称"
                        placeholder="例如：产品设计讨论"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                        autoFocus
                        sx={{ mb: 2 }}
                    />

                    {error && (
                        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={loading || !roomName.trim()}
                        startIcon={<AddIcon />}
                        sx={{ mt: 2, textTransform: 'none', fontWeight: 600, py: 1.2 }}
                    >
                        {loading ? '创建中...' : '创建房间'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default CreateRoom;
