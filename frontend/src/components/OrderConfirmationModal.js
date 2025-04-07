import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderHistoryModal from './OrderHistoryModal';

const OrderConfirmationModal = ({ show, orderData, onClose }) => {
    const [showOrderHistory, setShowOrderHistory] = useState(false);
    const navigate = useNavigate();

    if (!show) return null;

    return (
        <>
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header bg-success text-white">
                            <h5 className="modal-title">Order Confirmed!</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                        <div className="modal-body text-center py-4">
                            <i className="bi bi-check-circle text-success display-1 mb-3"></i>
                            <h4 className="mb-3">Thank you for your purchase!</h4>
                            <p className="mb-1">Order ID: #{orderData.order_id}</p>
                            <p className="text-muted mb-4">
                                We'll send you an email confirmation with order details shortly.
                            </p>
                            <div className="d-grid gap-2">
                                <button 
                                    className="btn btn-success btn-lg"
                                    onClick={() => setShowOrderHistory(true)}
                                >
                                    View Order Status
                                </button>
                                <button 
                                    className="btn btn-outline-secondary btn-lg"
                                    onClick={() => navigate('/customer-dashboard')}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showOrderHistory && (
                <OrderHistoryModal 
                    show={showOrderHistory} 
                    onClose={() => setShowOrderHistory(false)} 
                    specificOrderId={orderData.order_id} 
                />
            )}
        </>
    );
};

export default OrderConfirmationModal;
