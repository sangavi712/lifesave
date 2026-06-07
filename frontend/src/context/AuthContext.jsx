import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token') || null;
    console.log('[AuthContext] Initial token read from localStorage:', savedToken ? 'FOUND' : 'NOT FOUND');
    return savedToken;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const setUserWithOverrides = (rawUser) => {
    if (!rawUser) {
      setUser(null);
      return;
    }
    const overrides = localStorage.getItem('user_profile_overrides');
    let userOverrides = {};
    if (overrides) {
      try {
        const parsed = JSON.parse(overrides);
        userOverrides = parsed[rawUser.email] || {};
      } catch (e) {
        console.error(e);
      }
    }
    setUser({
      ...rawUser,
      name: userOverrides.name || rawUser.name,
      profilePhoto: userOverrides.profilePhoto || null,
    });
  };

  const updateProfile = (name, profilePhoto) => {
    if (!user) return;
    const emailKey = user.email;
    let overrides = {};
    const saved = localStorage.getItem('user_profile_overrides');
    if (saved) {
      try {
        overrides = JSON.parse(saved);
      } catch (e) {}
    }
    overrides[emailKey] = {
      name: name || user.name,
      profilePhoto: profilePhoto !== undefined ? profilePhoto : (overrides[emailKey]?.profilePhoto || null),
    };
    localStorage.setItem('user_profile_overrides', JSON.stringify(overrides));
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        name: name || prev.name,
        profilePhoto: profilePhoto !== undefined ? profilePhoto : prev.profilePhoto,
      };
    });
  };

  // Fetch logged-in user profile on load if token exists
  useEffect(() => {
    const loadUser = async () => {
      console.log('[AuthContext] loadUser triggered. Token status:', token ? 'PRESENT' : 'ABSENT');
      if (!token) {
        console.log('[AuthContext] loadUser: No token found, setting loading to false');
        setLoading(false);
        return;
      }
      try {
        console.log('[AuthContext] loadUser: Requesting user profile from /auth/me...');
        const res = await API.get('/auth/me');
        console.log('[AuthContext] loadUser: Profile retrieved successfully:', res.data);
        setUserWithOverrides(res.data);
      } catch (err) {
        console.error('[AuthContext] loadUser: Failed to load user profile. Error details:', err.response?.data || err.message);
        // Token might be expired or server disconnected
        const isOffline = !err.response || err.message.includes('Network Error') || err.message.includes('timeout') || err.message.includes('connect');
        if (isOffline && (token === 'mock-jwt-token-for-offline-mode' || token.startsWith('mock'))) {
          console.log('[AuthContext] Keeping mock user session alive during backend offline state.');
          setUserWithOverrides({
            id: 1,
            name: 'System Administrator',
            email: 'admin@bloodbank.com',
            role: 'admin'
          });
        } else {
          console.log('[AuthContext] Invoking logout due to error');
          logout();
        }
      } finally {
        console.log('[AuthContext] loadUser: Setting loading to false in finally block');
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    console.log('[AuthContext] login handler called for email:', email);
    setLoading(true);
    setError(null);
    try {
      console.log('[AuthContext] login: Sending POST /auth/login request...');
      const res = await API.post('/auth/login', { email, password });
      console.log('[AuthContext] login: Response received status:', res.status);
      const { token: userToken, ...userData } = res.data;
      
      console.log('[AuthContext] login: Saving token to localStorage...');
      localStorage.setItem('token', userToken);
      console.log('[AuthContext] login: Setting token in React state...');
      setToken(userToken);
      console.log('[AuthContext] login: Setting user data in React state:', userData);
      setUserWithOverrides(userData);
      return userData;
    } catch (err) {
      const isOffline = !err.response || err.message.includes('Network Error') || err.message.includes('timeout') || err.message.includes('connect');
      if (isOffline) {
        console.warn('[AuthContext] Backend offline. Attempting mock login for demo account:', email);
        if (
          (email === 'admin@bloodbank.com' && password === 'admin123') ||
          (email === 'user@bloodbank.com' && password === 'user123')
        ) {
          const userData = {
            id: email === 'admin@bloodbank.com' ? 1 : 4,
            name: email === 'admin@bloodbank.com' ? 'System Administrator' : 'Demo User',
            email,
            role: email === 'admin@bloodbank.com' ? 'admin' : 'user',
            token: 'mock-jwt-token-for-offline-mode'
          };
          localStorage.setItem('token', userData.token);
          setToken(userData.token);
          setUserWithOverrides(userData);
          return userData;
        }
      }
      const errMsg = err.response?.data?.message || 'Login failed. Please try again.';
      console.error('[AuthContext] login: Failed. Error message:', errMsg);
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      console.log('[AuthContext] login: Setting loading to false in finally block');
      setLoading(false);
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    console.log('[AuthContext] register handler called for email:', email);
    setLoading(true);
    setError(null);
    try {
      console.log('[AuthContext] register: Sending POST /auth/register request...');
      const res = await API.post('/auth/register', { name, email, password });
      console.log('[AuthContext] register: Response received status:', res.status);
      const { token: userToken, ...userData } = res.data;

      console.log('[AuthContext] register: Saving token to localStorage...');
      localStorage.setItem('token', userToken);
      console.log('[AuthContext] register: Setting token in React state...');
      setToken(userToken);
      console.log('[AuthContext] register: Setting user data in React state:', userData);
      setUserWithOverrides(userData);
      return userData;
    } catch (err) {
      const isOffline = !err.response || err.message.includes('Network Error') || err.message.includes('timeout') || err.message.includes('connect');
      if (isOffline) {
        console.warn('[AuthContext] Backend offline. Simulating mock user registration...');
        const userData = {
          id: 999,
          name,
          email,
          role: 'user',
          token: 'mock-jwt-token-for-offline-mode'
        };
        localStorage.setItem('token', userData.token);
        setToken(userData.token);
        setUserWithOverrides(userData);
        return userData;
      }
      const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      console.error('[AuthContext] register: Failed. Error message:', errMsg);
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      console.log('[AuthContext] register: Setting loading to false in finally block');
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    console.log('[AuthContext] logout invoked. Clearing tokens and state...');
    localStorage.removeItem('token');
    setToken(null);
    setUserWithOverrides(null);
    setError(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAdmin,
        login,
        register,
        logout,
        setError,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
