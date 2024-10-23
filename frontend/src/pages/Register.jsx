import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/userSlice';
import { Typography, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // 使用相同的CSS文件
import logoURL from './图片/logo1.png';

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

    useEffect(() => {
        document.body.classList.add('login-page');
        return () => {
            document.body.classList.remove('login-page');
        };
    }, []);

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
        <div className="page">
            <div className="logo-container">
                <img src={logoURL} alt="logo" className="logo-image" />
            </div>
            <Container maxWidth="xs" className="login-container">
                <h1 className="login-title">注册</h1>
                <Box sx={{ mt: 8 }}>
                    <form onSubmit={onSubmit}>
                        <input
                            type="text"
                            name="username"
                            placeholder="用户名"
                            value={username}
                            onChange={onChange}
                            className="login-input"
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="密码"
                            value={password}
                            onChange={onChange}
                            className="login-input"
                            required
                        />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="确认密码"
                            value={confirmPassword}
                            onChange={onChange}
                            className="login-input"
                            required
                        />
                        {error && (
                            <Typography color="error" variant="body2">
                                {error}
                            </Typography>
                        )}
                        <div className="button-container">
                            <div className="social-login"><a href="/login">已有账号</a></div>
                            <input
                                type="submit"
                                className="login-button"
                                disabled={loading}
                                value={loading ? '注册中...' : '注册'}
                            />
                        </div>
                    </form>
                </Box>
            </Container>
        </div>
    );
};

export default Register;