import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../service/apiService';
import { setAuthData } from '../reducers/authReducer';
import Cookies from "universal-cookie";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cookies = new Cookies();

  const { accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    if (accessToken) {
      navigate('/profile');
    }
  }, [accessToken, navigate]);

  const handleSubmit = async (values) => {
    try {
      const response = await login(values.username, values.password);
      message.success('Login successful!');

      const { user_id } = response.data;

      dispatch(
        setAuthData({
          accessToken: null,
          refreshToken: null,
          isAdmin: false, 
          userId: user_id,
        })
      )

      cookies.set("user_id", response.data.user_id, { path: "/", maxAge: 24 * 60 * 60 });
      navigate('/two-fa-verify-page');
    } catch (error) {
      message.error('Login failed!');
      console.error(error);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Login</h2>
      <Form onFinish={handleSubmit}>
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
