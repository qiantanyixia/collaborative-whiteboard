// src/redux/onlineUsersSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    users: [],
};

const onlineUsersSlice = createSlice({
    name: 'onlineUsers',
    initialState,
    reducers: {
        setOnlineUsers(state, action) {
            state.users = action.payload;
        },
        clearOnlineUsers(state) {
            state.users = [];
        },
    },
});

export const { setOnlineUsers, clearOnlineUsers } = onlineUsersSlice.actions;
export default onlineUsersSlice.reducer;
