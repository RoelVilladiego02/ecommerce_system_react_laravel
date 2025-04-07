import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import OrderDetailsModal from './OrderDetailsModal';

const OrderHistoryModal = ({ show, onClose, specificOrderId }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (show) {
            const fetchOrders = async () => {
                try {
                    const response = await apiClient.get('/my-orders');
                    let fetchedOrders = response.data.data || [];
                    if (specificOrderId) {
                        fetchedOrders = fetchedOrders.filter(order => order.id === specificOrderId);
                    }
                    setOrders(fetchedOrders);
                    setError(null); // Clear any previous errors
                } catch (err) {
                    console.error('Error fetching order history:', err);
                    setError('Failed to load order history. Please try again.');
                } finally {
                    setLoading(false);
                }
            };

            fetchOrders();
        }
    }, [show, specificOrderId]);


    const handleCloseDetails = () => {
        setSelectedOrder(null);
    };

    if (!show) return null;

    return (
        <>
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header bg-success text-white">
                            <h5 className="modal-title">Order History</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            {loading ? (
                                <div className="text-center my-5">
                                    <div className="spinner-border text-success" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2 text-success">Loading your order history...</p>
                                </div>
                            ) : error ? (
                                <div className="alert alert-danger text-center">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    {error}
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center">
                                    <p className="text-muted">You have no orders yet.</p>
                                    <button
                                        className="btn btn-success btn-lg"
                                        onClick={onClose}
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped table-hover">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Date</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                                <th>Payment Method</th>
                                                <th>Delivery Address</th>
                                                <th>Contact Number</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order) => (
                                                <tr key={order.id}>
                                                    <td>{order.id}</td>
                                                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                                    <td>₱{Number(order.total).toFixed(2)}</td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                order.status === 'completed'
                                                                    ? 'bg-success'
                                                                    : 'bg-warning'
                                                            }`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td>{order.payment_method}</td>
                                                    <td>{order.delivery_address || 'N/A'}</td>
                                                    <td>{order.contact_number || 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary btn-lg" onClick={onClose}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {selectedOrder && (
                <OrderDetailsModal order={selectedOrder} onClose={handleCloseDetails} />
            )}
        </>
    );
};

export default OrderHistoryModal;
