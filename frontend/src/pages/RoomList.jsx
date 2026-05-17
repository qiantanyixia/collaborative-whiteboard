import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRooms } from '../redux/roomSlice';
import {
    Typography,
    Container,
    Box,
    List,
    ListItem,
    ListItemText,
    Button,
    Paper,
    Chip,
    Skeleton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import LoginIcon from '@mui/icons-material/Login';

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

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ textTransform: 'none', borderColor: '#e2e8f0' }}
                >
                    返回
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    房间列表
                </Typography>
            </Box>

            {loading && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 3 }} />
                    ))}
                </Box>
            )}

            {error && (
                <Paper sx={{ p: 3, bgcolor: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                </Paper>
            )}

            {!loading && rooms.length === 0 && (
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#fafbfc' }}>
                    <MeetingRoomIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        暂无房间
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        点击「创建房间」来开始第一个协作白板
                    </Typography>
                </Paper>
            )}

            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {rooms.map((room) => (
                    <Paper
                        component={ListItem}
                        key={room.roomId}
                        secondaryAction={
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<LoginIcon />}
                                onClick={() => handleJoin(room.roomId)}
                                sx={{ textTransform: 'none', fontWeight: 600, mr: 1 }}
                            >
                                加入
                            </Button>
                        }
                        sx={{
                            px: 3,
                            py: 2,
                            borderRadius: 3,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                borderColor: '#e2e8f0',
                            },
                        }}
                    >
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        {room.name}
                                    </Typography>
                                    <Chip
                                        label={`ID: ${room.roomId}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem', height: 22 }}
                                    />
                                </Box>
                            }
                            secondary={`创建于 ${new Date(room.createdAt).toLocaleDateString()}`}
                        />
                    </Paper>
                ))}
            </List>
        </Container>
    );
};

export default RoomList;
