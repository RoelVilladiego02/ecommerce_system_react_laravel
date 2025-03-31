import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Clear the token from localStorage
        localStorage.removeItem('token');
        // Redirect to the login page
        navigate('/login');
    }, [navigate]);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Logging out...</span>
                </div>
                <h4 className="mt-3 text-primary">Logging out...</h4>
            </div>
        </div>
    );
};

export default Logout;
