import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getFileUsingEmailId, getFileUsingToken, getViewFlagUsingEmailId, getViewFlagUsingToken } from '../service/apiService';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import { Box, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { selectAuthState } from '../reducers/authReducer';

GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';

const FileAccess = () => {
  const { fileId } = useParams();
  const location = useLocation();
  const { accessToken } = useSelector(selectAuthState);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileType, setFileType] = useState('');
  const [email, setEmail] = useState('');
  const [isGuest, setIsGuest] = useState(true);
  const [emailSubmitted, setIsEmailSubmitted] = useState(false);
  const [fileAccessToken, setFileAccessToken] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(true);

  const pdfContainerRef = useRef(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('file_access_token');

    if (token) setFileAccessToken(token);
    if (accessToken) {
      setIsGuest(false);
      fetchFileDataWithToken(fileId, token);
    } else {
      setIsGuest(true);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, fileId, accessToken]);


  const fetchFileDataWithToken = async (fileId, token) => {
    setLoading(true);
    try {
      const [fileResponse, viewFlagResponse] = await Promise.all([
        getFileUsingToken(fileId, token),
        getViewFlagUsingToken(fileId, token),
      ]);
      setIsViewOnly(viewFlagResponse.data.is_view_only);
      processFile(fileResponse, viewFlagResponse.data.key, viewFlagResponse.data.iv);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFileDataWithEmail = async () => {
    setLoading(true);
    try {
      const [fileResponse, viewFlagResponse] = await Promise.all([
        getFileUsingEmailId(email, fileId, fileAccessToken),
        getViewFlagUsingEmailId(email, fileId, fileAccessToken),
      ]);
      setIsViewOnly(viewFlagResponse.data.is_view_only);
      processFile(fileResponse, viewFlagResponse.data.key, viewFlagResponse.data.iv);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const processFile = async (response, key, iv) => {
    try {
      const contentType = response.headers['content-type'];
      const encryptedData = await response.data.arrayBuffer();

      const decryptedFileData = await decryptFile(encryptedData, key, iv);
      const decryptedBlob = new Blob([decryptedFileData], { type: contentType });

      const url = URL.createObjectURL(decryptedBlob);
      setFileUrl(url);
      setFileType(contentType);
      setIsEmailSubmitted(true);

      if (contentType.includes('pdf')) {
        renderPDF(url);
      }
    } catch (err) {
      setError('Failed to process the file.');
      console.error('Error processing file:', err);
    }
  };

  const renderPDF = (pdfData) => {
    if (!pdfData) {
      console.error('Invalid PDF data.');
      return;
    }

    const loadingTask = getDocument(pdfData);
    loadingTask.promise
      .then((pdf) => {
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          pdf.getPage(pageNumber).then((page) => {
            const canvas = document.createElement('canvas');
            canvas.style.marginBottom = '10px';
            pdfContainerRef.current.appendChild(canvas);

            const context = canvas.getContext('2d');
            const viewport = page.getViewport({ scale: 1.5 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            page.render({ canvasContext: context, viewport });
          });
        }
      })
      .catch((err) => console.error('Error loading PDF:', err));
  };

  // Base64 Decode function
  const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const decryptFile = async (encryptedData, keyBase64, ivBase64) => {
    try {
      const keyBuffer = base64ToArrayBuffer(keyBase64); // Decode key from base64
      const ivBuffer = base64ToArrayBuffer(ivBase64); 

      // Import the key for AES-GCM
      const key = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      // Decrypt the file data
      return await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuffer, tagLength: 128 },
        key,
        encryptedData
      );
    } catch (error) {
      console.error('Decryption failed', error);
      setError('Failed to decrypt the file.');
    }
  };


  const handleError = (err) => {
    const status = err?.response?.status;
    if (status === 403) {
      setError('Invalid email or no access to the file.');
    } else {
      setError('Error accessing the file.');
    }
  };

  const handleDownload = async () => {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = `downloaded-file.${fileType.includes('pdf') ? 'pdf' : 'png'}`;
    a.click();
  };


  const disableRightClick = (e) => {
    if (isViewOnly) {
      e.preventDefault();
      alert('This document is view-only. Download and Print are disabled.');
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {isGuest && !emailSubmitted ? (
        <Box sx={{ textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          <Typography variant="h5">Access File as Guest</Typography>
          <TextField
            fullWidth
            label="Enter your email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={fetchFileDataWithEmail}
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', maxWidth: '800px', width: '100%', height: '75vh' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            File Viewer
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : fileUrl ? (
            <>
              {fileType.endsWith('pdf') ? (
                <Box
                  ref={pdfContainerRef}
                  sx={{ paddingTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  onContextMenu={disableRightClick}
                />
              ) : (
                <img
                  src={fileUrl}
                  alt="File Preview"
                  style={{ maxWidth: '100%', height: 'auto' }}
                  onContextMenu={disableRightClick}
                />
              )}
              {!isViewOnly && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDownload}
                  sx={{ marginTop: '10px' }}
                >
                  Download
                </Button>
              )}
            </>
          ) : (
            <Typography>No file available</Typography>
          )}
        </Box>
      )}

      {error && <Alert severity="error" sx={{ marginTop: '20px' }}>{error}</Alert>}
    </Box>
  );
};

export default FileAccess;
