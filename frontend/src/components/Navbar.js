import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import OrderHistoryModal from './OrderHistoryModal';

const Navbar = ({ isCartPage }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { cartCount, resetCart } = useCart();
    const [showOrderHistory, setShowOrderHistory] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('token'); // Clear the token from localStorage
            localStorage.removeItem('user'); // Clear the user from localStorage
            resetCart(); // Clear the cart state
            navigate('/login'); // Redirect to the login page
        }
    };


    useEffect(() => {
        // Close mobile menu on navigation
        setIsMobileMenuOpen(false);
    }, [location]);

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
                <div className="container">
                    <Link
                        className="navbar-brand fw-bold"
                        to="/customer-dashboard" // Redirect to customer-dashboard
                    >
                        Ecommerce System
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
                                {isCartPage ? (
                                    <Link className="nav-link" to="/customer-dashboard">
                                        <i className="bi bi-shop"></i> Product Catalog
                                    </Link>
                                ) : (
                                    <Link className="nav-link" to="/cart">
                                        <i className="bi bi-cart"></i> Cart
                                        {cartCount > 0 && (
                                            <span className="badge bg-danger ms-1">{cartCount}</span>
                                        )}
                                    </Link>
                                )}
                            </li>
                            <li className="nav-item">
                                <button
                                    className="btn btn-link nav-link text-white text-decoration-none"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setShowOrderHistory(true)}
                                >
                                    <i className="bi bi-clock-history"></i> Order History
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className="btn btn-link nav-link text-white text-decoration-none"
                                    style={{ cursor: 'pointer' }}
                                    onClick={handleLogout}
                                >
                                    <i className="bi bi-box-arrow-right me-1"></i>Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <OrderHistoryModal
                show={showOrderHistory}
                onClose={() => setShowOrderHistory(false)}
            />
        </>
    );
};

export default Navbar;