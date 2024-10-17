const express = require('express');
const router = express.Router();
const passport = require('passport');
const Room = require('../models/Room');
const { v4: uuidv4 } = require('uuid');

// 创建房间
router.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        const { name } = req.body;
        try {
            const roomId = uuidv4(); // 生成唯一房间ID
            const newRoom = new Room({
                name,
                roomId,
                createdBy: req.user.id,
            });
            await newRoom.save();
            res.status(201).json(newRoom);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: '服务器错误' });
        }
    }
);

// 获取所有房间
router.get(
    '/list',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const rooms = await Room.find();
            res.json(rooms);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: '服务器错误' });
        }
    }
);

module.exports = router;
