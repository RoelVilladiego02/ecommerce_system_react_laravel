import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmployeeRegisterForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [adminKey, setAdminKey] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Admin-Key being sent:', adminKey); // Debugging: Log the Admin-Key
            await axios.get('/sanctum/csrf-cookie').catch((err) => {
                if (err.response?.status === 404) {
                    console.warn('CSRF cookie endpoint not found. Proceeding without CSRF setup.');
                } else {
                    throw err;
                }
            });
            await axios.post('/register/employee', formData, {
                headers: {
                    'Admin-Key': adminKey, // Send Admin-Key securely
                },
            });
            setSuccess('Employee registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
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
                    <h2 className="text-center mb-4">Employee Registration</h2>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <div className="mb-3">
                        <input type="text" className="form-control" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <input type="email" className="form-control" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <input type="password" className="form-control" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <input type="password" className="form-control" name="password_confirmation" placeholder="Confirm Password" value={formData.password_confirmation} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <input type="text" className="form-control" placeholder="Admin Key" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Register</button>
                </form>
            </div>
        </div>
    );
};

export default EmployeeRegisterForm;
