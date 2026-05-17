import React from 'react';
import { Typography, Container, Box, Button, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);

    const actions = [
        {
            title: '创建房间',
            desc: '新建一个协作白板房间，邀请他人加入',
            icon: <AddIcon sx={{ fontSize: 32 }} />,
            color: '#2563eb',
            bg: 'rgba(37, 99, 235, 0.08)',
            onClick: () => navigate('/create-room'),
            variant: 'contained',
        },
        {
            title: '查看房间',
            desc: '浏览已创建的房间列表，快速加入',
            icon: <MeetingRoomIcon sx={{ fontSize: 32 }} />,
            color: '#10b981',
            bg: 'rgba(16, 185, 129, 0.08)',
            onClick: () => navigate('/rooms'),
            variant: 'outlined',
        },
    ];

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Box sx={{ mb: 5 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    欢迎回来，{user?.username}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    选择一个操作开始协作
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {actions.map((action) => (
                    <Grid item xs={12} sm={6} key={action.title}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                border: '1px solid #f1f5f9',
                                borderRadius: 3,
                                transition: 'all 0.25s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
                                    borderColor: '#e2e8f0',
                                },
                            }}
                            onClick={action.onClick}
                        >
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 2.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: action.bg,
                                    color: action.color,
                                    mb: 2,
                                }}
                            >
                                {action.icon}
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {action.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {action.desc}
                            </Typography>
                            <Button
                                variant={action.variant}
                                fullWidth
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                {action.title}
                            </Button>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Dashboard;
