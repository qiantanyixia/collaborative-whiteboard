import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/userSlice';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    协作白板
                </Typography>
                {user ? (
                    <>
                        <Typography variant="body1" sx={{ mr: 2 }}>
                            {user.username}
                        </Typography>
                        <Button color="inherit" onClick={handleLogout}>
                            登出
                        </Button>
                    </>
                ) : (
                    <>
                        <Button color="inherit" component={Link} to="/login">
                            登录
                        </Button>
                        <Button color="inherit" component={Link} to="/register">
                            注册
                        </Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
