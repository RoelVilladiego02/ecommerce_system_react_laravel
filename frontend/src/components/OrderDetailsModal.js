import React from 'react';

const OrderDetailsModal = ({ order, onClose }) => {
    const { items = [], total = 0 } = order; // Ensure items and total are properly destructured

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content shadow-lg border-0">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">Order Items</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <h5>Items:</h5>
                        <ul className="list-group">
                            {Array.isArray(items) && items.length > 0 ? (
                                items.map(item => (
                                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{item.product?.name || 'Unknown Product'}</strong>
                                            <p className="mb-0 text-muted">
                                                Product ID: {item.product?.id || 'N/A'}<br />
                                                ₱{Number(item.product?.price || 0).toFixed(2)} × {item.quantity}
                                            </p>
                                        </div>
                                        <span className="badge bg-secondary">₱{(item.product?.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="list-group-item text-center text-muted">
                                    No items found for this order.
                                </li>
                            )}
                        </ul>
                        {Array.isArray(items) && items.length > 0 && (
                            <>
                                <hr />
                                <div className="d-flex justify-content-between">
                                    <strong>Total:</strong>
                                    <strong className="text-success">₱{Number(total).toFixed(2)}</strong>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary btn-lg" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
