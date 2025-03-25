import axios from 'axios';
import Cookies from 'universal-cookie';

export const API_URL = 'http://127.0.0.1:8000/api/';
const cookies = new Cookies();


const apiClient = axios.create({
  baseURL: API_URL,
});

// Interceptor to handle token refresh on 401 errors
apiClient.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry // Avoid infinite retry loop
    ) {
      originalRequest._retry = true;

      const refresh_token = cookies.get('refresh_token'); // Get refresh token from cookies
      if (!refresh_token) {
        console.error('No refresh token available.');
        cookies.remove('access_token');
        cookies.remove('refresh_token');
        cookies.remove('isAdmin');
        cookies.remove('user_id');
        window.location.href = '/login'; 
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(API_URL + 'token/refresh/', {
          refresh_token: refresh_token,
        });

        const new_access_token = data.access_token;

        // Store the new access token in cookies
        cookies.set('access_token', new_access_token, { path: '/' });

        // Update the original request with the new token and retry it
        originalRequest.headers['Authorization'] = `Bearer ${new_access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        cookies.remove('access_token');
        cookies.remove('refresh_token');
        cookies.remove('isAdmin');
        cookies.remove('user_id');
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export const register = (username, email, password, password2) => {
  return apiClient.post('register/', { username, email, password, password2 });
};

export const login = (username, password) => {
  return apiClient.post('login/', { username, password });
};

export const getProfile = () => {
  return apiClient.get('profile/', {
    headers: {
      Authorization: `Bearer ${cookies.get('access_token')}`,   
    },
  });
};

export const fileUpload = (formData) => {
  return apiClient.post('files/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${cookies.get('access_token')}`,
    },
  });
};

export const generateShareableLink = (fileId, payload) => {
  return apiClient.post('files/' + fileId + '/share/', payload, {
    headers: {
      Authorization: `Bearer ${cookies.get('access_token')}`,
    },
  });
};
 
export const getFileUsingEmailId = (email, fileId, file_access_token) => {
  return apiClient.get(`files/${fileId}/access/`, {
    params: { 
      file_access_token: file_access_token,
      guest_email: email  
    },
    responseType: 'blob'  
  });
};

export const getFileUsingToken = (fileId, file_access_token) => {
  return apiClient.get(`files/${fileId}/access/`, {
    params: { 
      file_access_token: file_access_token  
    },
    headers: {
      Authorization: `Bearer ${cookies.get('access_token')}`,
    },
    responseType: 'blob'  // Ensure the response is handled as binary data
  });
};

export const getViewFlagUsingEmailId = (email, fileId, file_access_token) => {
  return apiClient.get(`files/${fileId}/flag/`, {
    params: { 
      file_access_token: file_access_token,
      guest_email: email  
    }
  });
};

export const getViewFlagUsingToken = (fileId, file_access_token) => {
  return apiClient.get(`files/${fileId}/flag/`, {
    params: { 
      file_access_token: file_access_token  
    },
    headers: {
      Authorization: `Bearer ${cookies.get('access_token')}`,
    },
  });
};

export const getAdminData = () => {
  return apiClient.get(`admin/data`, {
    headers: {
      Authorization: `Bearer ${cookies.get('access_token')}`,
    },
  });
};

export const deleteUser = (user_id) => {
  return apiClient.delete(`admin/delete-user/`, {
    params: { 
      user_id: user_id
    },
    headers: {
      Authorization: `Bearer ${cookies.get('access_token')}`,
    },
  });
};
export const deleteFile = (fileId) => {
  return apiClient.delete(`admin/delete-file/`, {
    params: { 
      fileId: fileId
    },
    headers: {
      Authorization: `Bearer ${cookies.get('access_token')}`,
    },
  });
};

export const verifyTwoFactorAuth = (user_id, otp) => {
  return apiClient.post('verify-two-factor-auth/', { user_id, otp });
};

export const getQRCodeLink = (user_id) => {
  return apiClient.post('set-two-factor-auth/', { user_id });
};

export default apiClient;
