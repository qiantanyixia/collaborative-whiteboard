import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createRoom } from '../redux/roomSlice';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

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
        <Container maxWidth="sm">
            <Box sx={{ mt: 8 }}>
                <Typography variant="h4" gutterBottom>
                    创建房间
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="房间名称"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />
                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                    <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                        {loading ? '创建中...' : '创建'}
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default CreateRoom;
