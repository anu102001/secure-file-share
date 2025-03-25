import React, { useEffect } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Button, Container } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import TwoFARegister from './components/TwoFARegister';
import TwoFAVerify from './components/TwoFAVerify';
import Cookies from "universal-cookie";
import Logout from './components/Logout';
import HomePage from './components/HomePage';
import FileAccess from './components/FileAccess';
import FileUpload from './components/FileUpload';
import AdminPage from './components/AdminPage';
import Test from './components/Test'

import { setAuthData } from './reducers/authReducer'
import './assets/styles/global.css';

const App = () => {
  const dispatch = useDispatch();
  const { accessToken, isAdmin } = useSelector((state) => state.auth);

  useEffect(() => {
    const cookies = new Cookies();
    const accessToken = cookies.get('access_token');
    const refreshToken = cookies.get('refresh_token');
    const isAdmin = cookies.get('isAdmin');
    const userId = cookies.get('user_id');
    if (accessToken && refreshToken) {
      dispatch(setAuthData({ accessToken, refreshToken, isAdmin, userId }));
    }
  }, [dispatch]);

  const menuItems = accessToken
    ? [
        { key: "3", label: "Profile", to: "/profile" },
        { key: "5", label: "Upload", to: "/upload-file" },
        ...(isAdmin ? [{ key: "6", label: "Admin Dashboard", to: "/admin" }] : []),
        { key: "4", label: <Logout/> }
      ]
    : [
        { key: "1", label: "Register", to: "/register" },
        { key: "2", label: "Login", to: "/login" },
      ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            My App
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {menuItems.map((item) =>
              item.to ? (
                <Button
                  key={item.key}
                  component={Link}
                  to={item.to}
                  color="inherit"
                  sx={{ textTransform: 'none' }}
                >
                  {item.label}
                </Button>
              ) : (
                <Box key={item.key}>{item.label}</Box>
              )
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container
        component="main"
        sx={{
          flex: 1,
          backgroundColor: '#f4f4f4',
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '100% !important'
        }}
      >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/two-fa-register-page" element={<TwoFARegister />} />
            <Route path="/two-fa-verify-page" element={<TwoFAVerify />} />
            <Route path="/upload-file" element={<FileUpload />} />
            <Route path="/files/:fileId/access" element={<FileAccess />} />
            <Route path="/test" element={<Test/>}/>
          </Routes>
      </Container>
    </Box>
  );
};

export default App;
