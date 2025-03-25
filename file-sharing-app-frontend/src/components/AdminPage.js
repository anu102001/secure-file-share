import React, { useEffect, useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthState } from '../reducers/authReducer';
import { getAdminData, deleteUser, deleteFile } from '../service/apiService';

const AdminPage = () => {
  const [usersData, setUsersData] = useState([]);
  const [filesData, setFilesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteType, setDeleteType] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const navigate = useNavigate();
  const { isAdmin, accessToken } = useSelector(selectAuthState);

  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
    } else if (!isAdmin) {
      navigate('/profile');
    } else {
      const fetchAdminData = async () => {
        try {
          const response = await getAdminData();
          setUsersData(response.data.users);
          setFilesData(response.data.files);
        } catch (error) {
          setError('Error fetching admin data');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchAdminData();
    }
  }, [accessToken, isAdmin, navigate]);

  const handleDeleteClick = (id, type) => {
    setDeleteId(id);
    setDeleteType(type);
    setOpenDialog(true); 
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteType === 'user') {
        await deleteUser(deleteId); 
        setUsersData((prevData) => prevData.filter((user) => user.id !== deleteId));
      } else if (deleteType === 'file') {
        await deleteFile(deleteId);  
        setFilesData((prevData) => prevData.filter((file) => file.id !== deleteId));
      }
      setOpenDialog(false); 
    } catch (error) {
      setError('Error deleting item');
      console.error(error);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container component="main" style={{height:'75vh'}}>
      <Typography variant="h4">Admin Dashboard</Typography>

      <Typography variant="h6">Users</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Date Joined</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersData.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.is_active ? 'Yes' : 'No'}</TableCell>
                <TableCell>{new Date(user.date_joined).toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    color="error"
                    variant="contained"
                    onClick={() => handleDeleteClick(user.id, 'user')}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" style={{ marginTop: '20px' }}>Files</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File Name</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Uploaded At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filesData.map((file) => (
              <TableRow key={file.id}>
                <TableCell>{file.name}</TableCell>
                <TableCell>{file.owner__username}</TableCell>
                <TableCell>{new Date(file.uploaded_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    color="error"
                    variant="contained"
                    onClick={() => handleDeleteClick(file.id, 'file')}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography color="error">{error}</Typography>
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {deleteType === 'user' ? 'user' : 'file'}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Confirm
          </Button>
        </DialogActions>
      </Dialog> 
    </Container>
  );
};

export default AdminPage;
