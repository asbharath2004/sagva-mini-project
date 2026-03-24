import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    // Ensure all necessary fields are stored
    const userToStore = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role || 'student',
      department: userData.department || '',
      year: userData.year || '',
      token: userData.token,
      authMethod: userData.authMethod || 'manual',
      profileCompleted: userData.profileCompleted !== undefined ? userData.profileCompleted : true,
      ...userData, // Include any additional fields
    };

    setUser(userToStore);
    localStorage.setItem('user', JSON.stringify(userToStore));
    localStorage.setItem('token', userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const register = (userData) => {
    const userToStore = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role || 'student',
      department: userData.department || '',
      year: userData.year || '',
      token: userData.token,
      authMethod: userData.authMethod || 'manual',
      profileCompleted: userData.profileCompleted !== undefined ? userData.profileCompleted : true,
      ...userData,
    };

    setUser(userToStore);
    localStorage.setItem('user', JSON.stringify(userToStore));
    localStorage.setItem('token', userData.token);
  };

  const updateUserProfile = (profileData) => {
    const updatedUser = {
      ...user,
      ...profileData,
      profileCompleted: true,
    };

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    register,
    updateUserProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
