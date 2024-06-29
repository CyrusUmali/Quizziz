import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Ensure the correct import
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3001/auth/login', { email, password });
      if (response.data.success) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        setUser(decoded);
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Error logging in:", error);
      return { success: false, message: "An error occurred during login. Please try again later." };
    }
  };

  const loginWithGoogle = async (googleIdToken) => {
    try {
      const response = await axios.post('http://localhost:3001/auth/google/login', { idToken: googleIdToken });
      if (response.data.success) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        setUser(decoded);
        return { success: true };
      } else {
        return { success: false, message: response.data.error };
      }
    } catch (error) {
      console.error("Error logging in with Google:", error);
      return { success: false, message: "An error occurred during Google login. Please try again later." };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a proper loading spinner if desired
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
