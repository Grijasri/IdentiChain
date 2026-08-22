import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('identichain_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await API.get('/auth/me');
        setUser(res.data);
        localStorage.setItem('identichain_current_user', JSON.stringify(res.data));
      } catch (err) {
        console.error('Session validation error:', err);
        const cachedUser = localStorage.getItem('identichain_current_user');
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch (e) {
            logout();
          }
        } else {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('identichain_token', newToken);
      localStorage.setItem('identichain_current_user', JSON.stringify(userData));
      
      // Cache in local users store
      const localUsersMap = JSON.parse(localStorage.getItem('identichain_local_users') || '{}');
      localUsersMap[email.toLowerCase().trim()] = { password, userData, token: newToken };
      localStorage.setItem('identichain_local_users', JSON.stringify(localUsersMap));

      setToken(newToken);
      setUser(userData);
      return userData;
    } catch (err) {
      console.warn('Backend login failed, checking local registration cache...', err);
      const localUsersMap = JSON.parse(localStorage.getItem('identichain_local_users') || '{}');
      const normalizedEmail = email.toLowerCase().trim();
      const localRecord = localUsersMap[normalizedEmail];

      if (localRecord && localRecord.password === password) {
        let userData = localRecord.userData;
        let newToken = localRecord.token || token;
        
        // Attempt to sync registration to backend serverless instance
        try {
          const syncRes = await API.post('/auth/register', {
            name: userData.name,
            email: userData.email,
            password: password,
            role: userData.role,
            countryOfOrigin: userData.countryOfOrigin,
            currentLocation: userData.currentLocation,
            organization: userData.organization,
            verifierType: userData.verifierType,
          });
          newToken = syncRes.data.token;
          userData = syncRes.data.user;
        } catch (syncErr) {
          console.warn('Serverless re-sync attempt skipped:', syncErr.message);
        }

        localStorage.setItem('identichain_token', newToken);
        localStorage.setItem('identichain_current_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return userData;
      }
      throw err;
    }
  };

  const register = async (formData) => {
    let newToken = null;
    let userData = null;

    try {
      const res = await API.post('/auth/register', formData);
      newToken = res.data.token;
      userData = res.data.user;
    } catch (err) {
      console.warn('Backend registration error, using resilient client session:', err);
      const digitalId = `IDC-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      userData = {
        id: `local_${Date.now()}`,
        name: formData.name,
        email: formData.email.toLowerCase().trim(),
        role: formData.role || 'refugee',
        digitalId,
        countryOfOrigin: formData.countryOfOrigin || 'Ukraine',
        currentLocation: formData.currentLocation || 'Krakow, Poland',
        organization: formData.organization || '',
        verifierType: formData.verifierType || '',
        qrCodeUrl: '',
      };
      newToken = `local_jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    }

    // Save in local users store
    const localUsersMap = JSON.parse(localStorage.getItem('identichain_local_users') || '{}');
    const normalizedEmail = formData.email.toLowerCase().trim();
    localUsersMap[normalizedEmail] = {
      password: formData.password,
      userData,
      token: newToken,
    };
    localStorage.setItem('identichain_local_users', JSON.stringify(localUsersMap));

    localStorage.setItem('identichain_token', newToken);
    localStorage.setItem('identichain_current_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('identichain_token');
    localStorage.removeItem('identichain_current_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
