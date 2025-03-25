import { React, useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import {Avatar, Button, CssBaseline, Box, Typography, Container} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useSelector } from 'react-redux';
import { selectAuthState } from '../reducers/authReducer';
import { getQRCodeLink } from  '../service/apiService';

function TwoFARegister() {
	const [qrCodeLink, setQrCodeLink] = useState("");
  const navigate = useNavigate();
  const { userId, accessToken } = useSelector(selectAuthState);

  useEffect(() => {
    if (accessToken) {
      navigate('/profile');
    } else if (userId) {
      const fetchQRCode = async () => {
        try {
          const response = await getQRCodeLink(userId);
          setQrCodeLink(response.data.qr_code);
        } catch (error) {
          message.error('Failed to fetch QR code. Please try again.');
          console.error(error);
        }
      };
      fetchQRCode();
    } else {
      navigate('/login');
    }
  }, [accessToken, userId, navigate]);

  const handleSubmit = async() => {
    navigate('/login');
  }

  return (
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
          Scan
        </Typography>
        {qrCodeLink ? (
          <img src={qrCodeLink} alt="QR Code" />
        ) : (
          <Typography variant="body1" color="textSecondary">
            Loading QR Code...
          </Typography>
        )}
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          noValidate
          sx={{ mt: 1 }}
        >
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Done
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default TwoFARegister;



