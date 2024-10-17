import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './redux/userSlice';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import CreateRoom from './pages/CreateRoom';
import RoomList from './pages/RoomList';
import Room from './pages/Room'; 
import { SocketProvider } from './utils/SocketContext';

const App = () => {
    const dispatch = useDispatch();
    const { token, user } = useSelector((state) => state.user);

    useEffect(() => {
        if (token) {
            dispatch(fetchCurrentUser(token));
        }
    }, [token, dispatch]);

    return (
      <SocketProvider>
        <Router>
            <Header />
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/dashboard"
                    element={user ? <Dashboard /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/create-room"
                    element={user ? <CreateRoom /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/rooms"
                    element={user ? <RoomList /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/room/:roomId"
                    element={user ? <Room /> : <Navigate to="/login" replace />}
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
      </SocketProvider>
    );
};

export default App;
