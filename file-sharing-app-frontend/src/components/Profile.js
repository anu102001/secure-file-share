import React, { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../service/apiService';
import { Descriptions, Spin, Alert } from 'antd';
import { useSelector } from 'react-redux';
import { selectAuthState } from '../reducers/authReducer';

const Profile = () => {
  const navigate = useNavigate();

  const { accessToken, userId } = useSelector(selectAuthState);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !accessToken) {
      if (!userId && !accessToken) {
        navigate('/login');
      } else if (userId && !accessToken) {
        navigate('/two-fa-verify-page');
      }
      return;
    } 
    
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getProfile();
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, accessToken, navigate]);
  

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <Alert message="Error loading profile" type="error" description={error} />;
  }

  if (!user) {
    return <Alert message="Error loading profile" type="error" />;
  }

  return (
    <div style={{ padding: '20px' , width: '100%'}}>
      <h2>User Profile</h2>
      <Descriptions bordered>
        <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default Profile;
