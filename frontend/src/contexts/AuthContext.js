import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true; // Include credentials with requests
axios.defaults.baseURL = 'http://localhost:8000/api'; // Ensure the base URL matches the backend

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

    const fetchCsrfToken = async () => {
        try {
            await axios.get('/sanctum/csrf-cookie');
        } catch (err) {
            if (err.response?.status === 404) {
                console.warn('CSRF cookie endpoint not found. Proceeding without CSRF setup.');
            } else {
                throw err;
            }
        }
    };

    const login = async (userData, authToken) => {
        await fetchCsrfToken(); // Ensure CSRF token is set
        setUser(userData);
        setToken(authToken);
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
