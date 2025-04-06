import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const CartPage = () => {
    const { 
        cart, 
        loading, 
        error,
        removeFromCart,
        checkout,
        cartTotal,
        showToast,
        updateCartItem
    } = useCart();
    const navigate = useNavigate();

    const handleCheckout = async () => {
        try {
            await checkout();
            showToast('Order placed successfully!');
            navigate('/orders'); // Or to a success page
        } catch (err) {
            showToast(err.message || 'Checkout failed', 'error');
        }
    };

    // Updated function to handle quantity changes
    const updateQuantity = async (item, newQuantity) => {
        try {
            if (newQuantity <= 0) {
                await removeFromCart(item.product_id);
                return;
            }
    
            if (newQuantity > item.stock) {
                showToast('Cannot exceed available stock', 'error');
                return;
            }
    
            await updateCartItem(item.product_id, newQuantity);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update quantity', 'error');
        }
    };

    if (loading) return (
        <>
            <Navbar isCartPage={true} />
            <div className="bg-light min-vh-100 py-5">
                <div className="container py-5 text-center">
                    <div className="spinner-border text-success" style={{width: '3rem', height: '3rem'}} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h4 className="mt-3 text-success">Loading Cart...</h4>
                </div>
            </div>
        </>
    );

    if (error) return (
        <>
            <Navbar isCartPage={true} />
            <div className="bg-light min-vh-100 py-5">
                <div className="container py-5">
                    <div className="row justify-content-center">
                        <div className="col-md-8 col-lg-6">
                            <div className="card shadow-sm border-0">
                                <div className="card-header bg-danger text-white">
                                    <h4 className="mb-0">Error Loading Cart</h4>
                                </div>
                                <div className="card-body text-center py-4">
                                    <i className="bi bi-exclamation-triangle-fill text-danger display-4 mb-3"></i>
                                    <p className="lead">{error}</p>
                                    <div className="d-grid gap-2">
                                        <button 
                                            className="btn btn-danger"
                                            onClick={() => window.location.reload()}
                                        >
                                            <i className="bi bi-arrow-repeat me-2"></i>Try Again
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <>
            <Navbar isCartPage={true} />
            <div className="bg-light min-vh-100 py-5">
                <div className="container">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-success text-white py-3">
                            <h2 className="text-center mb-0">Your Cart</h2>
                        </div>
                        <div className="card-body p-4">
                            {cart.length === 0 ? (
                                <div className="text-center py-5 my-4">
                                    <div className="display-2 text-muted mb-3">
                                        <i className="bi bi-cart-x"></i>
                                    </div>
                                    <h3 className="fw-light">Your cart is currently empty</h3>
                                    <p className="text-muted mb-4">Looks like you haven't added any products to your cart yet.</p>
                                    <button 
                                        className="btn btn-success btn-lg rounded-pill px-4"
                                        onClick={() => navigate('/customer-dashboard')}
                                    >
                                        <i className="bi bi-bag-plus me-2"></i>Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                <div className="row">
                                    <div className="col-lg-8 mb-4 mb-lg-0">
                                        <div className="card shadow-sm border-0 mb-4">
                                            <div className="card-header bg-light">
                                                <h5 className="mb-0">Cart Items ({cart.reduce((total, item) => total + item.quantity, 0)})</h5>
                                            </div>
                                            <div className="card-body p-0">
                                                {cart.map(item => (
                                                    <div key={item.product_id} className="card mb-0 border-0 border-bottom rounded-0">
                                                        <div className="row g-0 p-3">
                                                            <div className="col-md-3 col-lg-2">
                                                                <img 
                                                                    src={item.image || 'https://via.placeholder.com/300'}
                                                                    className="img-fluid rounded" 
                                                                    alt={item.name}
                                                                    style={{objectFit: 'cover', height: '100px', width: '100%'}}
                                                                />
                                                            </div>
                                                            <div className="col-md-9 col-lg-10">
                                                                <div className="card-body d-flex flex-column h-100">
                                                                    <div className="d-flex justify-content-between">
                                                                        <h5 className="card-title">{item.name}</h5>
                                                                        <strong className="text-success">${(Number(item.price) * item.quantity).toFixed(2)}</strong>
                                                                    </div>
                                                                    <p className="card-text text-muted mb-2">
                                                                        ${Number(item.price).toFixed(2)} × {item.quantity}
                                                                    </p>
                                                                    <div className="mt-auto d-flex justify-content-between align-items-center">
                                                                        <div className="input-group" style={{width: "120px"}}>
                                                                            <button 
                                                                                type="button" 
                                                                                className="btn btn-sm btn-outline-secondary"
                                                                                onClick={() => updateQuantity(item, item.quantity - 1)}
                                                                                disabled={item.quantity <= 1}
                                                                            >
                                                                                <i className="bi bi-dash"></i>
                                                                            </button>
                                                                            <span className="input-group-text bg-white text-center" style={{flex: "1"}}>
                                                                                {item.quantity}
                                                                            </span>
                                                                            <button 
                                                                                type="button" 
                                                                                className="btn btn-sm btn-outline-secondary"
                                                                                onClick={() => updateQuantity(item, item.quantity + 1)}
                                                                                disabled={item.quantity >= item.stock}
                                                                            >
                                                                                <i className="bi bi-plus"></i>
                                                                            </button>
                                                                        </div>
                                                                        <button 
                                                                            onClick={() => removeFromCart(item.product_id)}
                                                                            className="btn btn-sm btn-outline-danger"
                                                                        >
                                                                            <i className="bi bi-trash me-1"></i>Remove
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-4">
                                        <div className="card shadow-sm border-0">
                                            <div className="card-header bg-light">
                                                <h5 className="mb-0">Order Summary</h5>
                                            </div>
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span>Subtotal:</span>
                                                    <span>${cartTotal.toFixed(2)}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span>Shipping:</span>
                                                    <span>Free</span>
                                                </div>
                                                <hr />
                                                <div className="d-flex justify-content-between mb-4">
                                                    <strong>Total:</strong>
                                                    <strong className="text-success">${cartTotal.toFixed(2)}</strong>
                                                </div>
                                                <div className="d-grid gap-2">
                                                    <button 
                                                        className="btn btn-success py-2"
                                                        onClick={handleCheckout}
                                                    >
                                                        <i className="bi bi-credit-card me-2"></i>Proceed to Checkout
                                                    </button>
                                                    <button 
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => navigate('/customer-dashboard')}
                                                    >
                                                        <i className="bi bi-arrow-left me-2"></i>Continue Shopping
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CartPage;