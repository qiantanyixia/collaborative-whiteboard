import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 创建房间
export const createRoom = createAsyncThunk('room/createRoom', async ({ name }, thunkAPI) => {
    const state = thunkAPI.getState();
    try {
        const res = await axios.post(
            'http://localhost:5000/api/rooms/create',
            { name },
            { headers: { Authorization: state.user.token } }
        );
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data);
    }
});

// 获取房间列表
export const fetchRooms = createAsyncThunk('room/fetchRooms', async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    try {
        const res = await axios.get('http://localhost:5000/api/rooms/list', {
            headers: { Authorization: state.user.token },
        });
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data);
    }
});

const roomSlice = createSlice({
    name: 'room',
    initialState: {
        rooms: [],
        currentRoom: null,
        loading: false,
        error: null,
    },
    reducers: {
        setCurrentRoom: (state, action) => {
            state.currentRoom = action.payload;
        },
    },
    extraReducers: (builder) => {
        // 创建房间
        builder.addCase(createRoom.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createRoom.fulfilled, (state, action) => {
            state.loading = false;
            state.rooms.push(action.payload);
            state.currentRoom = action.payload;
        });
        builder.addCase(createRoom.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message || '创建房间失败';
        });

        // 获取房间列表
        builder.addCase(fetchRooms.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchRooms.fulfilled, (state, action) => {
            state.loading = false;
            state.rooms = action.payload;
        });
        builder.addCase(fetchRooms.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message || '获取房间列表失败';
        });
    },
});

export const { setCurrentRoom } = roomSlice.actions;
export default roomSlice.reducer;
