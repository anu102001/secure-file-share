import React, { useState, useEffect } from 'react';
import { TextField, Button, FormControlLabel, Typography, Container, Box, Modal, Radio, RadioGroup, FormControl, FormLabel, FormHelperText } from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectAuthState } from '../reducers/authReducer';
import { message } from 'antd';
import ContentCopy from '@mui/icons-material/ContentCopy';
import { fileUpload, generateShareableLink, API_URL } from '../service/apiService';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [messageText, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState('view');
  const [emailList, setEmailList] = useState([]);
  const [shareableLink, setShareableLink] = useState('');

  const { accessToken } = useSelector(selectAuthState);
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
    }
  }, [accessToken, navigate]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  function arrayToBase64(arr) {
    if (!(arr instanceof Uint8Array)) {
      arr = new Uint8Array(arr);
    }
    return btoa(String.fromCharCode(...arr));
  }

  const encryptFile = async (file) => {
    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(16));
    const fileBuffer = await file.arrayBuffer();

    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      fileBuffer
    );

    const exportedKey = await crypto.subtle.exportKey("raw", key);
    return {
      encryptedData,
      base64Iv: arrayToBase64(iv),
      base64Key: arrayToBase64(exportedKey),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    // Check for allowed file types
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setMessage('Invalid file type. Only JPEG, PNG, and PDF files are allowed.');
      return;
    }

    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { encryptedData, base64Iv, base64Key } = await encryptFile(file);

      const formData = new FormData();
      formData.append("file", new Blob([encryptedData]), `${file.name}.enc`);
      formData.append("iv", base64Iv);
      formData.append("key", base64Key);
      formData.append("content_type", file.type);

      const response = await fileUpload(formData);
      setFileId(response.data.file_id);
      setMessage('File uploaded successfully!');
      setShowModal(true);
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Error uploading file. Please try again.');
    }
  };

  const handleAddEmail = () => {
    if (!email) {
      message.error('Please provide an email address.');
      return;
    }

    setEmailList((prevList) => [
      ...prevList,
      { email, permission: permissions },
    ]);

    setEmail('');
    setPermissions('view');
  };

  const handleLinkGeneration = async () => {
    if (emailList.length === 0) {
      message.error('Please add at least one email to share the file.');
      return;
    }

    const payload = {
      guest_email_list: emailList.map((e) => e.email),
      user_email_list: emailList
        .filter((e) => e.permission === 'download')
        .map((e) => e.email),
    };

    try {
      const response = await generateShareableLink(fileId, payload);
      const updatedLink = response.data.shareable_link.replace(
        API_URL,
        `${window.location.origin}/`
      ); // replacig backend domain with frontend
      setShareableLink(updatedLink);
      setShowModal(false);

      message.success(`Shareable Link: ${updatedLink}`);
    } catch (error) {
      console.error('Error generating shareable link:', error);
      message.error('Error generating the shareable link.');
    }
  };

  const handleCopyLink = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink).then(() => {
        message.success('Link copied to clipboard!');
      });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', borderRadius: '8px', boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom>
          Upload File
        </Typography>
        {!shareableLink && (
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                fullWidth
                type="file"
                onChange={handleFileChange}
                variant="outlined"
                label="Choose File"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>

            <Button variant="contained" color="primary" type="submit" fullWidth>
              Upload
            </Button>
          </form>)}

        {messageText && (
          <Typography variant="body2" color="error" sx={{ marginTop: 2 }}>
            {messageText}
          </Typography>
        )}
        {fileId && (
          <Typography variant="body2" sx={{ marginTop: 2 }}>
            File ID: {fileId}
          </Typography>
        )}
        {shareableLink && (
          <Button
            variant="contained"
            color="success"
            endIcon={<ContentCopy />}
            onClick={handleCopyLink}
          >
            Copy Link
          </Button>
        )}
      </Box>

      {/* Show the "Copy Link" button after the shareable link is generated */}


      {/* Modal for sharing the file */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: 3,
          backgroundColor: 'white',
          width: '400px',
          margin: 'auto',
          marginTop: '10%',
        }}>
          <Typography id="modal-title" variant="h6" gutterBottom>
            Share File
          </Typography>

          <TextField
            label="Recipient's Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            sx={{ marginBottom: 2 }}
          />
          <FormControl sx={{ marginBottom: 2 }}>
            <FormLabel>Permissions</FormLabel>
            <RadioGroup
              row
              value={permissions}
              onChange={(e) => setPermissions(e.target.value)}
            >
              <FormControlLabel value="view" control={<Radio />} label="View Only" />
              <FormControlLabel
                value="download"
                control={<Radio />}
                label="View & Download"
              />
            </RadioGroup>
            <FormHelperText>Select file permissions</FormHelperText>
          </FormControl>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleAddEmail}
            sx={{ marginBottom: 2 }}
          >
            Add Email
          </Button>
          <Typography variant="body2" gutterBottom>
            Emails to share:
          </Typography>
          <ul>
            {emailList.map((entry, index) => (
              <li key={index}>
                {entry.email} - {entry.permission}
              </li>
            ))}
          </ul>
          <Button variant="contained" color="primary" onClick={handleLinkGeneration}>
            Generate Shareable Link
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default FileUpload;
