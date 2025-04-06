import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const login = async (userData, authToken) => {
        try {
            console.log('Login attempt with:', { userData, authToken }); // Debug log
            
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Update state
            setUser(userData);
            setToken(authToken);
            
            // Set axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
            
            return true;
        } catch (error) {
            console.error('Login error:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
    };

    const isEmployee = user?.role === 'employee';
    const isCustomer = user?.role === 'customer';

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isEmployee, isCustomer }}>
            {children}
        </AuthContext.Provider>
    );
};
