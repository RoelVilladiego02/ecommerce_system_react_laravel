import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CartPage = () => {
    const { 
        cart, 
        loading, 
        error,
        removeFromCart,
        cartTotal,
        showToast,
        updateCartItem
    } = useCart();
    const navigate = useNavigate();
    const [selectedItems, setSelectedItems] = useState([]);

    const handleSelectItem = (productId) => {
        setSelectedItems(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            }
            return [...prev, productId];
        });
    };

    const handleSelectAll = () => {
        if (selectedItems.length === cart.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cart.map(item => item.product_id));
        }
    };

    const selectedTotal = cart
        .filter(item => selectedItems.includes(item.product_id))
        .reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

    const calculateShipping = (items) => {
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        if (totalQuantity === 0) return 0;
        return 5 + (Math.max(0, totalQuantity - 1) * 2);
    };

    const selectedCart = cart.filter(item => selectedItems.includes(item.product_id));
    const shippingCost = calculateShipping(selectedCart);
    const finalTotal = selectedTotal + shippingCost;

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            showToast('Please select items to checkout', 'error');
            return;
        }

        const selectedCartItems = cart.filter(item => selectedItems.includes(item.product_id));
        navigate('/checkout', { 
            state: { 
                selectedItems: selectedCartItems,
                shippingCost: shippingCost,
                total: finalTotal
            }
        });
    };

    const updateQuantity = async (item, newQuantity) => {
        try {
            if (newQuantity <= 0) {
                await removeFromCart(item.product_id);
                return;
            }
    
            // Prevent going below 1
            if (newQuantity < 1) {
                return;
            }
    
            // Prevent exceeding stock
            if (newQuantity > item.stock) {
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
                            <div className="d-flex justify-content-between align-items-center">
                                <h2 className="mb-0">Your Cart</h2>
                                {cart.length > 0 && (
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={selectedItems.length === cart.length}
                                            onChange={handleSelectAll}
                                            id="selectAll"
                                        />
                                        <label className="form-check-label text-white" htmlFor="selectAll">
                                            Select All
                                        </label>
                                    </div>
                                )}
                            </div>
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
                                                    <div key={item.product_id} className="card mb-3 border-0 border-bottom rounded-0">
                                                        <div className="row g-0 p-3">
                                                            <div className="col-auto d-flex align-items-center me-3">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    checked={selectedItems.includes(item.product_id)}
                                                                    onChange={() => handleSelectItem(item.product_id)}
                                                                />
                                                            </div>
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
                                                                        <strong className="text-success">₱{(Number(item.price) * item.quantity).toFixed(2)}</strong>
                                                                    </div>
                                                                    <p className="card-text text-muted mb-2">
                                                                        ₱{Number(item.price).toFixed(2)} × {item.quantity}
                                                                    </p>
                                                                    <div className="mt-auto d-flex justify-content-between align-items-center">
                                                                        <div className="input-group" style={{width: "120px"}}>
                                                                            <button 
                                                                                type="button" 
                                                                                className="btn btn-sm btn-outline-secondary"
                                                                                onClick={() => updateQuantity(item, item.quantity - 1)}
                                                                                disabled={item.quantity <= 1} // Disable "-" button if quantity is at minimum
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
                                                                                disabled={item.quantity >= item.stock} // Disable "+" button if quantity is at max stock
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
                                                    <span>Selected Items:</span>
                                                    <span>{selectedItems.length}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span>Cart Total:</span>
                                                    <span className="text-muted">₱{cartTotal.toFixed(2)}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span>Selected Subtotal:</span>
                                                    <span>₱{selectedTotal.toFixed(2)}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span>Shipping:</span>
                                                    <span>
                                                        {selectedItems.length === 0 ? (
                                                            <span>---</span>
                                                        ) : (
                                                            <span>
                                                                ₱{shippingCost.toFixed(2)}
                                                                <small className="d-block text-muted">
                                                                    ₱5 first item + ₱2/additional item
                                                                </small>
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                                <hr />
                                                <div className="d-flex justify-content-between mb-4">
                                                    <strong>Total to Pay:</strong>
                                                    <strong className="text-success">₱{finalTotal.toFixed(2)}</strong>
                                                </div>
                                                <div className="d-grid gap-2">
                                                    <button 
                                                        className="btn btn-success py-2"
                                                        onClick={handleCheckout}
                                                        disabled={selectedItems.length === 0}
                                                    >
                                                        <i className="bi bi-credit-card me-2"></i>
                                                        Proceed to Checkout ({selectedItems.length} items)
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