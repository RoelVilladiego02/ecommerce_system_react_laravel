import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = ({ cartItemCount }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('token'); // Clear the token from localStorage
            navigate('/login'); // Redirect to the login page
        }
    };

    const handleBrandClick = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.role === 'employee') {
            navigate('/employee-dashboard');
        } else {
            navigate('/customer-dashboard');
        }
    };

    useEffect(() => {
        // Close mobile menu on navigation
        setIsMobileMenuOpen(false);
    }, [location]);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
            <div className="container">
                <Link
                    className="navbar-brand fw-bold"
                    to="#"
                    onClick={handleBrandClick}
                >
                    CustomerStorefront
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={toggleMobileMenu}
                    aria-controls="navbarNav"
                    aria-expanded={isMobileMenuOpen}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`} id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${location.pathname === '/cart' ? 'active' : ''}`}
                                to="/cart"
                            >
                                <i className="bi bi-cart"></i> Cart
                                {cartItemCount > 0 && (
                                    <span className="badge bg-danger ms-1">{cartItemCount}</span>
                                )}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <button
                                className="btn btn-link nav-link text-white text-decoration-none"
                                style={{ cursor: 'pointer' }}
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
