import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Navbar from '../components/Navbar';
import OrderConfirmationModal from '../components/OrderConfirmationModal';

const CheckoutPage = () => {
    const { cart, checkout, showToast } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedItems, setSelectedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [orderData, setOrderData] = useState(null);

    const [formData, setFormData] = useState({
        deliveryAddress: '',
        contactNumber: '',
        message: '',
        paymentMethod: 'cash',
    });

    // Get selected items from navigation state
    useEffect(() => {
        if (location.state?.selectedItems) {
            setSelectedItems(location.state.selectedItems);
        } else {
            setSelectedItems(cart); // Use all cart items if none specified
        }
    }, [location.state, cart]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (selectedItems.length === 0) {
            showToast('Your cart is empty', 'error');
            return;
        }

        if (!formData.deliveryAddress || !formData.contactNumber) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const orderDetails = {
                ...formData,
                items: selectedItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: Number(item.price)
                })),
                total: selectedItems.reduce((sum, item) => 
                    sum + (Number(item.price) * item.quantity), 0)
            };

            console.log('Submitting order:', orderDetails); // Debug log

            const result = await checkout(orderDetails);
            if (result.success) {
                setOrderData(result.data);
                setShowConfirmation(true);
            } else {
                throw new Error(result.message || 'Failed to process checkout');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            const errorMessage = error.response?.data?.message 
                || error.message 
                || 'Server error occurred during checkout.';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="container py-5 text-center">
                    <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Processing your order...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container py-5">
                <button
                    onClick={() => navigate('/cart')}
                    className="btn btn-link text-success mb-4"
                >
                    <i className="bi bi-arrow-left"></i> Back to Cart
                </button>

                {error && (
                    <div className="alert alert-danger mb-4">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                    </div>
                )}

                <div className="row">
                    <div className="col-md-8">
                        <div className="card shadow-sm mb-4">
                            <div className="card-header bg-success text-white">
                                <h5 className="mb-0">Delivery Information</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleCheckout}>
                                    <div className="mb-3">
                                        <label className="form-label">Delivery Address *</label>
                                        <textarea
                                            name="deliveryAddress"
                                            className="form-control"
                                            rows="3"
                                            value={formData.deliveryAddress}
                                            onChange={handleInputChange}
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Contact Number *</label>
                                        <input
                                            type="tel"
                                            name="contactNumber"
                                            className="form-control"
                                            value={formData.contactNumber}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Message (Optional)</label>
                                        <textarea
                                            name="message"
                                            className="form-control"
                                            rows="2"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                        ></textarea>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Payment Method *</label>
                                        <select 
                                            name="paymentMethod"
                                            className="form-select"
                                            value={formData.paymentMethod}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="cash">Cash on Delivery</option>
                                            <option value="gcash">GCash</option>
                                            <option value="card">Credit/Debit Card</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={selectedItems.length === 0}
                                        className="btn btn-success btn-lg w-100"
                                    >
                                        Confirm Order
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                {selectedItems.map((item) => (
                                    <div key={item.product_id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                                        <img
                                            src={item.image || 'https://via.placeholder.com/100'}
                                            alt={item.name}
                                            className="rounded"
                                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        />
                                        <div className="ms-3 flex-grow-1">
                                            <h5 className="mb-1">{item.name}</h5>
                                            <p className="text-muted mb-1">
                                                Quantity: {item.quantity} x ₱{Number(item.price).toFixed(2)}
                                            </p>
                                            <p className="fw-bold mb-0">
                                                Subtotal: ₱{(item.quantity * Number(item.price)).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-4 pt-3 border-top">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h4 className="mb-0">Total:</h4>
                                        <h4 className="mb-0 text-success">
                                            ₱{selectedItems.reduce((sum, item) => 
                                                sum + (Number(item.price) * item.quantity), 0).toFixed(2)}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {showConfirmation && (
                    <OrderConfirmationModal
                        show={showConfirmation}
                        orderData={orderData}
                        onClose={() => {
                            setShowConfirmation(false);
                            navigate('/customer-dashboard');
                        }}
                    />
                )}
            </div>
        </>
    );
};

export default CheckoutPage;