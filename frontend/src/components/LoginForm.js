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

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            login(user, token);
            navigate(user.role === 'employee' ? '/employee-dashboard' : '/customer-dashboard'); // Redirect based on role
        } catch (err) {
            if (err.response?.data?.errors) {
                const errors = Object.values(err.response.data.errors).flat();
                setError(errors.join(' '));
            } else {
                setError(err.response?.data?.message || 'An error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="card shadow-sm mx-auto" style={{ maxWidth: '400px' }}>
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-center mb-4">Login</h2>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3">
                        <input 
                            type="email" 
                            className="form-control" 
                            placeholder="Email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <input 
                            type="password" 
                            className="form-control" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mb-3">Login</button>
                    <p className="text-center">
                        Don't have an account? <br />
                        <Link to="/register/customer" className="btn btn-link">Register as a Customer</Link>
                        <span className="mx-2">or</span>
                        <Link to="/register/employee" className="btn btn-link">Register as an Employee</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
