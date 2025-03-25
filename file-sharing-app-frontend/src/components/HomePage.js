import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Stack } from '@mui/material';

const HomePage = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="90vh"
      textAlign="center"
      sx={{
        marginTop: '50px',
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to the File Sharing App
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Click on the buttons below to navigate:
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/register"
        >
          Register
        </Button>
        <Button
          variant="outlined"
          color="primary"
          component={Link}
          to="/login"
        >
          Login
        </Button>
      </Stack>
    </Box>
  );
};

export default HomePage;
