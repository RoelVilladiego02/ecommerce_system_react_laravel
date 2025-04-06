import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// Set Axios base URL
axios.defaults.baseURL = 'http://localhost:8000/api';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

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
        
        try {
            await axios.get('/sanctum/csrf-cookie').catch((err) => {
                if (err.response?.status === 404) {
                    console.warn('CSRF cookie endpoint not found. Proceeding without CSRF setup.');
                } else {
                    throw err;
                }
            });
            
            const response = await axios.post('/login', { email, password });
            const { user, token } = response.data;
            
            // Store both token and user in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Log the saved data for debugging
            console.log('Saved to localStorage:', {
                token: token,
                user: JSON.stringify(user)
            });
            
            // Call the context login method
            await login(user, token);
            
            // Dispatch a custom event to notify other components
            window.dispatchEvent(new Event('user-login'));
            
            // Navigate based on user role
            navigate(user.role === 'employee' ? '/employee-dashboard' : '/customer-dashboard');
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
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card border-info shadow-lg">
                        <div className="card-header bg-info text-white">
                            <h2 className="text-center mb-0">Login</h2>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                {error && <div className="alert alert-danger alert-dismissible fade show">
                                    {error}
                                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                                </div>}
                                
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email Address</label>
                                    <input type="email" className="form-control" id="email" 
                                        placeholder="your@email.com" value={email} 
                                        onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                
                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input type="password" className="form-control" id="password" 
                                        placeholder="Enter your password" value={password} 
                                        onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                
                                <div className="d-grid mb-3">
                                    <button type="submit" className="btn btn-info btn-lg text-white">Login</button>
                                </div>
                                
                                <div className="text-center">
                                    <p className="mb-3">Don't have an account?</p>
                                    <div className="d-flex justify-content-center gap-3">
                                        <Link to="/register/customer" className="btn btn-outline-success">
                                            Customer Sign Up
                                        </Link>
                                        <Link to="/register/employee" className="btn btn-outline-primary">
                                            Employee Sign Up
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;