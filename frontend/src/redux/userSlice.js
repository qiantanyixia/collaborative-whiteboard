import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 获取当前用户
export const fetchCurrentUser = createAsyncThunk('user/fetchCurrentUser', async (token, thunkAPI) => {
    try {
        const res = await axios.get('http://localhost:5000/api/auth/current', {
            headers: { Authorization: token },
        });
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data);
    }
});

// 用户登录
export const loginUser = createAsyncThunk('user/loginUser', async ({ username, password }, thunkAPI) => {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data);
    }
});

// 用户注册
export const registerUser = createAsyncThunk('user/registerUser', async ({ username, password }, thunkAPI) => {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', { username, password });
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data);
    }
});

const userSlice = createSlice({
    name: 'user',
    initialState: {
        token: localStorage.getItem('token') || '',
        user: null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.token = '';
            state.user = null;
            localStorage.removeItem('token');
        },
    },
    extraReducers: (builder) => {
        // 登录
        builder.addCase(loginUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.loading = false;
            state.token = action.payload.token;
            localStorage.setItem('token', action.payload.token);
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message || '登录失败';
        });

        // 注册
        builder.addCase(registerUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(registerUser.fulfilled, (state, action) => {
            state.loading = false;
            // 注册后可以选择自动登录或提示用户登录
        });
        builder.addCase(registerUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message || '注册失败';
        });

        // 获取当前用户
        builder.addCase(fetchCurrentUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
        });
        builder.addCase(fetchCurrentUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message || '获取用户失败';
            state.token = '';
            localStorage.removeItem('token');
        });
    },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
