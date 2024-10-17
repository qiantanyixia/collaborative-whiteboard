const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    roomId: {
        type: String,
        required: true,
        unique: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Room', RoomSchema);
