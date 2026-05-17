import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/userSlice';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <AppBar position="static" elevation={0}>
            <Toolbar sx={{ px: { xs: 2, sm: 4 } }}>
                <Typography
                    variant="h6"
                    sx={{
                        flexGrow: 1,
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        cursor: 'pointer',
                    }}
                    onClick={() => navigate('/dashboard')}
                >
                    协作白板
                </Typography>

                {user ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            component={Link}
                            to="/dashboard"
                            startIcon={<DashboardIcon />}
                            sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 500 }}
                        >
                            控制台
                        </Button>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mx: 1 }}>
                            {user.username}
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{ borderColor: '#e2e8f0', textTransform: 'none' }}
                        >
                            登出
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            component={Link}
                            to="/login"
                            startIcon={<LoginIcon />}
                            sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 500 }}
                        >
                            登录
                        </Button>
                        <Button
                            component={Link}
                            to="/register"
                            variant="contained"
                            size="small"
                            startIcon={<PersonAddIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            注册
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
