import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Verify token is still valid
      api.get('/auth/me')
        .then(res => {
          setUser(res.data.data);
          localStorage.setItem('user', JSON.stringify(res.data.data));
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user: userData } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    return response.data;
  };

  const register = async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  };

  const sendOTP = async (email, purpose = 'registration') => {
    const response = await api.post('/auth/send-otp', { email, purpose });
    return response.data;
  };

  const verifyOTP = async (email, otp, purpose) => {
    const response = await api.post('/auth/verify-otp', { email, otp, purpose });
    return response.data;
  };

  const linkUniversityEmail = async (universityEmail, universityPassword) => {
    const response = await api.post('/auth/link-university-email', {
      universityEmail,
      universityPassword,
    });
    return response.data;
  };

  const verifyUniversityEmail = async (otp) => {
    const response = await api.post('/auth/verify-university-email', { otp });
    // Update user data
    const updatedUser = await api.get('/auth/me');
    setUser(updatedUser.data.data);
    localStorage.setItem('user', JSON.stringify(updatedUser.data.data));
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    sendOTP,
    verifyOTP,
    linkUniversityEmail,
    verifyUniversityEmail,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
