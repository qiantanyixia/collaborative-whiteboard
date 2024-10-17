const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');

const secretOrKey = 'your_jwt_secret'; // 存储在环境变量中

// 注册
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: '用户名已存在' });
        }
        user = new User({ username, password });
        await user.save();
        res.status(201).json({ message: '用户注册成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 登录
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: '用户不存在' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: '密码错误' });
        }
        const payload = { id: user.id, username: user.username };
        const token = jwt.sign(payload, secretOrKey, { expiresIn: '1h' });
        res.json({ token: 'Bearer ' + token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 获取当前用户
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ id: req.user.id, username: req.user.username });
});

module.exports = router;
