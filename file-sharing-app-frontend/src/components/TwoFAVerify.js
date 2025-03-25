import { React, useState, useEffect} from 'react';
import { message } from 'antd';
import LoadingScreen from "react-loading-screen";
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Cookies from "universal-cookie";
import { verifyTwoFactorAuth } from  '../service/apiService';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthData } from '../reducers/authReducer';

function TwoFAVerify() {
	const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cookies = new Cookies();

  const { accessToken, userId } = useSelector(state => state.auth);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const response = await verifyTwoFactorAuth(cookies.get('user_id'), data.get('otp'));
      console.log(response);
      const { access_token, refresh_token, isAdmin, user_id } = response.data;

      cookies.set('access_token', response.data.access_token, {path: "/", maxAge: 24*60*60});
      cookies.set('refresh_token', response.data.refresh_token, {path: "/", maxAge: 24*60*60});
      cookies.set('isAdmin', isAdmin, { path: "/", maxAge: 24 * 60 * 60 });

      dispatch(setAuthData({
        accessToken: access_token,
        refreshToken: refresh_token,
        isAdmin: isAdmin,
        userId: user_id
      }));

      setLoading(false);
      navigate('/profile');
      window.location.reload();
    } catch (error) {
      message.error('Login failed!');
      console.error(error);
    }
  };

  useEffect(() => {
    if(userId && accessToken){
      navigate('/profile');
    }else if(!userId) {
			navigate('/login');
		}
  }, [navigate, accessToken, userId]);

	return (
    <LoadingScreen
    loading={loading}
    spinnerColor="#AC3B61"
    textColor="#AC3B61"
    text="Please Wait"
    >
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Enter your OTP
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="OTP"
              name="otp"
              autoComplete="otp"
              autoFocus
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Container>
    </LoadingScreen>
  );
}

export default TwoFAVerify;




