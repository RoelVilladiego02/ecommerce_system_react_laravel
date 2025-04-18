import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient'; // Use the centralized API client

const LoginForm = () => {
    document.title = "Ecommerce System"; // Set the page title
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);

    // Format error message from response data
    const formatErrorMessage = (responseData) => {
        // If it's a string, return it directly
        if (typeof responseData === 'string') {
            return responseData;
        }
        
        // If we have errors object with potential arrays
        if (responseData.errors) {
            const errorMessages = [];
            
            // Loop through each error field
            Object.entries(responseData.errors).forEach(([field, messages]) => {
                if (Array.isArray(messages)) { 
                    // Just add each message without the field name
                    messages.forEach(msg => errorMessages.push(msg));
                } else if (typeof messages === 'string') {
                    errorMessages.push(messages);
                }
            });
            
            // Join all messages with periods or spaces
            if (errorMessages.length > 0) {
                return errorMessages.join('. ').replace(/\.\./g, '.');
            }
        }
        
        // If we have a message field
        if (responseData.message && typeof responseData.message === 'string') {
            return responseData.message;
        }
        
        // If we have an error field
        if (responseData.error && typeof responseData.error === 'string') {
            return responseData.error;
        }
        
        // Last resort: try to JSON.stringify but with a message
        try {
            return "Error: " + JSON.stringify(responseData)
                .replace(/[{}"]/g, '') // Remove brackets and quotes
                .replace(/,/g, '. ')    // Replace commas with periods
                .replace(/:/g, ' ')     // Replace colons with spaces
                .replace(/\[\]/g, '')   // Remove array brackets
                .replace(/\.\./g, '.')  // Fix any double periods
                .trim();
        } catch (e) {
            return 'An unexpected error occurred.';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const response = await apiClient.post('/login', { email, password });
            const { user, token } = response.data;
            
            // Store auth data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Call the context login method
            await login(user, token);
            
            // Set the Authorization header immediately
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Hard redirect for role-based navigation
            if (user.role === 'employee') {
                window.location.href = '/employee-dashboard';
            } else {
                window.location.href = '/customer-dashboard';
            }
        } catch (err) {
            console.error('Login error:', err);
            
            // Display the actual error message from API
            if (err.response?.data) {
                setError(formatErrorMessage(err.response.data));
            } else if (err.message) {
                setError(`Error: ${err.message}`);
            } else if (err.response?.statusText) {
                setError(`${err.response.status}: ${err.response.statusText}`);
            } else {
                setError('An unexpected error occurred. Please check the console for details.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card border-0 shadow-lg">
                        <div className="card-header bg-gradient bg-info text-white text-center py-4">
                            <h2 className="mb-0">Welcome to Ecommerce System</h2>
                            <p className="mb-0">Please log in to continue</p>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                {error && (
                                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                        <i className="bi bi-exclamation-circle me-2"></i>{error}
                                        <button type="button" className="btn-close" onClick={() => setError('')}></button>
                                    </div>
                                )}
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label fw-bold">Email Address</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light">
                                            <i className="bi bi-envelope"></i>
                                        </span>
                                        <input 
                                            type="email" 
                                            className="form-control" 
                                            id="email" 
                                            placeholder="your@email.com" 
                                            value={email} 
                                            onChange={(e) => setEmail(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label fw-bold">Password</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light">
                                            <i className="bi bi-lock"></i>
                                        </span>
                                        <input 
                                            type="password" 
                                            className="form-control" 
                                            id="password" 
                                            placeholder="Enter your password" 
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="d-grid mb-3">
                                    <button 
                                        type="submit" 
                                        className="btn btn-info btn-lg text-white shadow-sm" 
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <span>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Logging in...
                                            </span>
                                        ) : (
                                            'Login'
                                        )}
                                    </button>
                                </div>
                                <div className="text-center">
                                    <p className="mb-3">Don't have an account?</p>
                                    <Link to="/register/customer" className="btn btn-outline-success btn-sm">
                                        <i className="bi bi-person-plus me-1"></i> Sign Up
                                    </Link>
                                </div>
                            </form>
                        </div>
                        <div className="card-footer text-center bg-light py-3">
                            <small className="text-muted">© 2023 Ecommerce System. All rights reserved.</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;