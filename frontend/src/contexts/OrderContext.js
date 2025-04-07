import React, { createContext, useContext, useState, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const [salesTotal, setSalesTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/orders');
            setOrders(response.data?.data || response.data || []);
            setError(null);
        } catch (error) {
            console.error('Error fetching orders:', error.response || error);
            setError(error.response?.data?.message || 'Failed to fetch orders');
            toast.error('Failed to load orders. Please check your permissions or try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSalesTotal = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/orders/sales/total');
            setSalesTotal(response.data.total_sales || 0);
            setError(null);
        } catch (error) {
            console.error('Error fetching sales total:', error);
            setError(error.response?.data?.message || 'Failed to fetch sales total');
            toast.error('Failed to load sales total');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateOrderStatus = async (orderId, status) => {
        setLoading(true);
        try {
            const response = await apiClient.put(`/orders/${orderId}/status`, { status });
            toast.success(response.data.message || `Order status updated to ${status}`);
            await fetchOrders(); // Refresh the orders list
        } catch (error) {
            console.error('Failed to update order status:', error);
            const errorMessage = error.response?.data?.error || 'Failed to update order status. Please try again.';
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <OrderContext.Provider value={{
            orders,
            salesTotal,
            loading,
            error,
            fetchOrders,
            fetchSalesTotal,
            updateOrderStatus
        }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};
