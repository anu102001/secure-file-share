import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from 'antd';
import { logout } from '../reducers/authReducer';
import Cookies from "universal-cookie";

const Logout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cookies = new Cookies();

  const handleLogout = () => {
    cookies.remove('user_id', { path: '/' });
    cookies.remove('refresh_token', { path: '/' });
    cookies.remove('access_token', { path: '/' });
    cookies.remove('isAdmin', { path: '/' });

    // Dispatch Redux logout action to reset auth state
    dispatch(logout());

    navigate('/login');
    window.location.reload(); // Optional if full page reload is necessary
  };

  return (
    <Button type="default" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default Logout;
