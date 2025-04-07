import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Set Axios base URL
axios.defaults.baseURL = 'http://localhost:8000/api';

const CustomerRegisterForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
        setSuccess('');
        
        try {
            await axios.get('/sanctum/csrf-cookie').catch((err) => {
                if (err.response?.status === 404) {
                    console.warn('CSRF cookie endpoint not found. Proceeding without CSRF setup.');
                } else {
                    throw err;
                }
            });
            
            await axios.post('/register', formData);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            console.error('Registration Error:', err);
            
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
                    <div className="card border-success shadow-lg">
                        <div className="card-header bg-success text-white">
                            <h2 className="text-center mb-0">Customer Registration</h2>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                {error && <div className="alert alert-danger alert-dismissible fade show">
                                    {error}
                                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                                </div>}
                                {success && <div className="alert alert-success alert-dismissible fade show">
                                    {success}
                                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                                </div>}
                                
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Full Name</label>
                                    <input type="text" className="form-control" id="name" name="name" 
                                        placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                                </div>
                                
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email Address</label>
                                    <input type="email" className="form-control" id="email" name="email" 
                                        placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
                                </div>
                                
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input type="password" className="form-control" id="password" name="password" 
                                        placeholder="At least 8 characters" value={formData.password} onChange={handleChange} required />
                                </div>
                                
                                <div className="mb-4">
                                    <label htmlFor="password_confirmation" className="form-label">Confirm Password</label>
                                    <input type="password" className="form-control" id="password_confirmation" name="password_confirmation" 
                                        placeholder="Re-enter your password" value={formData.password_confirmation} onChange={handleChange} required />
                                </div>
                                
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-success btn-lg">Register</button>
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/login')}>
                                        Back to Login
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerRegisterForm;