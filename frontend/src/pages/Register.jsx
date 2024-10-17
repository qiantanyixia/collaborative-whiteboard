import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/userSlice';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.user);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
    });

    const { username, password, confirmPassword } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('密码不匹配');
            return;
        }
        const resultAction = await dispatch(registerUser({ username, password }));
        if (registerUser.fulfilled.match(resultAction)) {
            navigate('/login');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8 }}>
                <Typography variant="h4" gutterBottom>
                    注册
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
                    <TextField
                        label="确认密码"
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
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
                        {loading ? '注册中...' : '注册'}
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default Register;
