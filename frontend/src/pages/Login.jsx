import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, fetchCurrentUser } from '../redux/userSlice';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token, user, loading, error } = useSelector((state) => state.user);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const { username, password } = formData;

    useEffect(() => {
        if (token && !user) {
            dispatch(fetchCurrentUser(token));
        }
        if (user) {
            navigate('/dashboard'); // 登录成功后跳转到主页面
        }
    }, [token, user, dispatch, navigate]);

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        dispatch(loginUser({ username, password }));
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8 }}>
                <Typography variant="h4" gutterBottom>
                    登录
                </Typography>
                <form onSubmit={onSubmit}>
                    <TextField
                        label="用户名"
                        name="username"
                        value={username}
                        onChange={onChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="密码"
                        name="password"
                        type="password"
                        value={password}
                        onChange={onChange}
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
                        {loading ? '登录中...' : '登录'}
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default Login;
