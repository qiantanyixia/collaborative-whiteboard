import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, fetchCurrentUser } from '../redux/userSlice';
import { Button, Typography, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // 引入CSS文件
import logoURL from './图片/logo1.png';

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
        document.body.classList.add('login-page');
        return () => {
            document.body.classList.remove('login-page');
        };
    }, []);

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
        <div className="login-page">
            <div className="logo-container">
                <img src={logoURL} alt="公司logo" className="logo-image" />
            </div>
            <Container maxWidth="xs" className="login-container">
                <h1 className="login-title">登录</h1>
                <Box sx={{ mt: 8 }}>
                    <form onSubmit={onSubmit}>
                        <input
                            type="text"
                            name="username"
                            placeholder="用户名/邮箱"
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
                        {error && (
                            <Typography color="error" variant="body2">
                                {error}
                            </Typography>
                        )}
                        <div className="button-container">
                            <div className="forgot-password">忘记密码?</div>
                            <input
                                type="submit"
                                className="login-button"
                                disabled={loading}
                                value={loading ? '登录中...' : '登录'}
                            />
                        </div>
                    </form>
                    <div className="social-login">
                        还没有账号？ <a href="/register">创建一个</a>
                    </div>
                </Box>
            </Container>
        </div>
    );
};

export default Login;