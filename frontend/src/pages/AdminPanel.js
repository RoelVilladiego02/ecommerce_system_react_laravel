import React, { useState, useEffect, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useOrders } from '../contexts/OrderContext';
import apiClient from '../services/apiClient';
import OrderDetailsModal from '../components/OrderDetailsModal';

const AdminPanel = () => {
    const navigate = useNavigate();
    const { 
        products, 
        loading: productsLoading, 
        createProduct, 
        updateProduct, 
        deleteProduct, 
        fetchProducts,
        pagination
    } = useProducts();
    
    const { 
        orders, 
        salesTotal, 
        loading: ordersLoading, 
        fetchOrders, 
        fetchSalesTotal, 
        fetchAllowedTransitions
    } = useOrders();
    
    // State variables
    const [activeTab, setActiveTab] = useState('products');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductForm, setShowProductForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [allowedTransitions, setAllowedTransitions] = useState({});

    // Get employee name from localStorage
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const employeeName = currentUser?.name || 'Employee';
    
    // Product form state
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        image: ''
    });

    // Filter states for orders
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    // Authentication check
    useEffect(() => {
        const checkAuth = async () => {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');

            if (!token || !currentUser) {
                toast.error('Please login first');
                navigate('/login');
                return;
            }

            if (currentUser.role !== 'employee') {
                toast.error('Unauthorized. Employee access only.');
                navigate('/login');
                return;
            }

            try {
                // Verify token and role with backend
                const response = await apiClient.get('/user');
                if (response.data.role !== 'employee') {
                    throw new Error('Unauthorized role');
                }

                // If verification successful, fetch data
                fetchProducts();
                fetchOrders();
                fetchSalesTotal();
            } catch (error) {
                console.error('Auth check error:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                toast.error('Authentication failed. Please login again.');
                navigate('/login');
            }
        };

        checkAuth();
    }, [navigate, fetchProducts, fetchOrders, fetchSalesTotal]);

    // Handle product fetch errors
    useEffect(() => {
        if (productsLoading === false && products.length === 0) {
            setError('No products found or failed to load products.');
        } else {
            setError(null);
        }
    }, [productsLoading, products]);

    // Fetch allowed status transitions for each order
    const handleFetchAllowedTransitions = useCallback(async (orderId) => {
        try {
            const transitions = await fetchAllowedTransitions(orderId);
            setAllowedTransitions((prev) => ({
                ...prev,
                [orderId]: transitions.allowedTransitions || [],
            }));
        } catch (error) {
            console.error(`Failed to fetch transitions for order ${orderId}:`, error);
        }
    }, [fetchAllowedTransitions]);

    // Fetch transitions for all orders when orders change
    useEffect(() => {
        orders.forEach((order) => {
            if (!allowedTransitions[order.id]) {
                handleFetchAllowedTransitions(order.id);
            }
        });
    }, [orders, allowedTransitions, handleFetchAllowedTransitions]);

    // Filter orders by status and date
    const filteredOrders = orders.filter(order => {
        const statusMatch = statusFilter === 'all' || order.status === statusFilter;
        
        if (!dateFilter) return statusMatch;
        
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        return statusMatch && orderDate === dateFilter;
    });

    // Handle product form input changes
    const handleProductChange = (e) => {
        const { name, value } = e.target;
        setProductForm(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Handle product form submission (create or update)
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const formData = {
                ...productForm,
                price: parseFloat(productForm.price),
                stock: parseInt(productForm.stock)
            };

            if (selectedProduct) {
                await updateProduct(selectedProduct.id, formData);
            } else {
                await createProduct(formData);
            }
            
            handleCancelEdit();
        } catch (error) {
            console.error('Product operation failed:', error);
            toast.error(error.message || 'Operation failed');
        }
    };

    // Edit product - populate form with selected product
    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setProductForm({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            image: product.image || ''
        });
        setShowProductForm(true);
    };

    // Delete product
    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const errorMessage = await deleteProduct(productId);
            if (errorMessage) {
                toast.error('Cannot delete product. It is associated with a user\'s cart.');
            } else {
                toast.success('Product deleted successfully');
            }
        } catch (error) {
            console.error('Delete product error:', error);
            toast.error('Failed to delete product. Please try again.');
        }
    };

    // Cancel form editing
    const handleCancelEdit = () => {
        setSelectedProduct(null);
        setProductForm({
            name: '',
            description: '',
            price: '',
            stock: '',
            image: ''
        });
        setShowProductForm(false);
    };

    // View order details
    const handleViewOrderDetails = async (orderId) => {
        try {
            const response = await apiClient.get(`/orders/${orderId}/items`);
            setSelectedOrder({
                id: orderId,
                items: response.data.data || [],
                total: response.data.total || 0,
            });
            setShowOrderDetails(true);
        } catch (error) {
            console.error('Failed to fetch order details:', error);
            const errorMessage = error.response?.data?.message || 'Failed to load order details. Please try again.';
            toast.error(errorMessage);
        }
    };

    const handleCloseOrderDetails = () => {
        setSelectedOrder(null);
        setShowOrderDetails(false);
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.success('Logged out successfully');
            navigate('/login');
        }
    };

    // Handle pagination
    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchProducts(page);
    };

    // Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
            toast.success(response.data.message || `Order status updated to ${newStatus}`);
            fetchOrders();
            handleFetchAllowedTransitions(orderId);
        } catch (error) {
            console.error('Failed to update order status:', error);
            const errorMessage = error.response?.data?.error || 'Failed to update order status. Please try again.';
            toast.error(errorMessage);
        }
    };

    return (
        <div className="container-fluid py-4 bg-light">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-lg rounded-3 mb-4">
                        <div className="card-header bg-primary text-white py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h1 className="h3 mb-0">Welcome, {employeeName}</h1>
                                <button 
                                    className="btn btn-outline-light"
                                    onClick={handleLogout}
                                >
                                    <i className="bi bi-box-arrow-right me-2"></i>
                                    Logout
                                </button>
                            </div>
                        </div>
                        
                        <div className="card-body">
                            {/* Dashboard Summary */}
                            <div className="row mb-4">
                                <div className="col-md-4">
                                    <div className="card border-primary h-100 shadow-sm">
                                        <div className="card-body bg-primary bg-opacity-10">
                                            <h5 className="card-title text-primary">Products</h5>
                                            <p className="card-text display-6 fw-bold">
                                                {productsLoading ? 
                                                    <small>Loading...</small> : 
                                                    `${products.length} out of ${pagination.total || products.length}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card border-success h-100 shadow-sm">
                                        <div className="card-body bg-success bg-opacity-10">
                                            <h5 className="card-title text-success">Orders</h5>
                                            <p className="card-text display-6 fw-bold">
                                                {ordersLoading ? 
                                                    <small>Loading...</small> : 
                                                    orders.length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card border-info h-100 shadow-sm">
                                        <div className="card-body bg-info bg-opacity-10">
                                            <h5 className="card-title text-info">Total Sales</h5>
                                            <p className="card-text display-6 fw-bold">
                                                {ordersLoading ? 
                                                    <small>Loading...</small> : 
                                                    `₱${parseFloat(salesTotal).toFixed(2)}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Navigation Tabs */}
                            <ul className="nav nav-pills nav-fill mb-4">
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'products' ? 'active bg-primary' : ''}`}
                                        onClick={() => setActiveTab('products')}
                                    >
                                        <i className="bi bi-box-seam me-2"></i>
                                        Products Management
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'orders' ? 'active bg-primary' : ''}`}
                                        onClick={() => setActiveTab('orders')}
                                    >
                                        <i className="bi bi-cart-check me-2"></i>
                                        Order Transactions
                                    </button>
                                </li>
                            </ul>
                            
                            {/* Products Management Tab */}
                            {activeTab === 'products' && (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h2 className="h4 mb-0">Products Management</h2>
                                        <div>
                                            <button 
                                                className="btn btn-primary shadow-sm" 
                                                onClick={() => setShowProductForm(!showProductForm)}
                                            >
                                                <i className={`bi ${showProductForm ? 'bi-dash-circle' : 'bi-plus-circle'} me-2`}></i>
                                                {showProductForm ? 'Hide Form' : 'Add New Product'}
                                            </button>
                                            <button 
                                                className="btn btn-outline-secondary ms-2" 
                                                onClick={fetchProducts}
                                                disabled={productsLoading}
                                            >
                                                <i className="bi bi-arrow-clockwise me-1"></i>
                                                Refresh
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Product Form */}
                                    {showProductForm && (
                                        <div className="card mb-4 border-primary shadow-sm">
                                            <div className="card-header bg-primary bg-opacity-10 text-primary">
                                                <h3 className="h5 mb-0">{selectedProduct ? 'Edit Product' : 'Add New Product'}</h3>
                                            </div>
                                            <div className="card-body">
                                                <form onSubmit={handleProductSubmit}>
                                                    <div className="mb-3">
                                                        <label htmlFor="name" className="form-label">Product Name</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="name"
                                                            name="name"
                                                            value={productForm.name}
                                                            onChange={handleProductChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="description" className="form-label">Description</label>
                                                        <textarea
                                                            className="form-control"
                                                            id="description"
                                                            name="description"
                                                            value={productForm.description}
                                                            onChange={handleProductChange}
                                                            rows="3"
                                                            required
                                                        ></textarea>
                                                    </div>
                                                    <div className="row mb-3">
                                                        <div className="col">
                                                            <label htmlFor="price" className="form-label">Price</label>
                                                            <div className="input-group">
                                                                <span className="input-group-text">₱</span>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    id="price"
                                                                    name="price"
                                                                    value={productForm.price}
                                                                    onChange={handleProductChange}
                                                                    step="0.01"
                                                                    min="0"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col">
                                                            <label htmlFor="stock" className="form-label">Stock</label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                id="stock"
                                                                name="stock"
                                                                value={productForm.stock}
                                                                onChange={handleProductChange}
                                                                min="0"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="image" className="form-label">Image URL</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="image"
                                                            name="image"
                                                            value={productForm.image}
                                                            onChange={handleProductChange}
                                                        />
                                                    </div>
                                                    <div className="d-flex gap-2">
                                                        <button 
                                                            type="submit" 
                                                            className="btn btn-primary"
                                                        >
                                                            {selectedProduct ? 'Update Product' : 'Create Product'}
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            className="btn btn-outline-secondary" 
                                                            onClick={handleCancelEdit}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Products Table */}
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                {productsLoading ? (
                                                    <div className="text-center p-5">
                                                        <div className="spinner-border text-primary" role="status">
                                                            <span className="visually-hidden">Loading products...</span>
                                                        </div>
                                                        <p className="mt-2">Loading products...</p>
                                                    </div>
                                                ) : error ? (
                                                    <div className="alert alert-danger">
                                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                                        {error}
                                                    </div>
                                                ) : (
                                                    <table className="table table-hover align-middle">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>ID</th>
                                                                <th>Name</th>
                                                                <th>Description</th>
                                                                <th>Price</th>
                                                                <th>Stock</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {products.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan="6" className="text-center py-4">
                                                                        <div className="text-muted">
                                                                            <i className="bi bi-inbox-fill fs-3 d-block mb-2"></i>
                                                                            No products found. Add your first product!
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                products.map(product => (
                                                                    <tr key={product.id}>
                                                                        <td>{product.id}</td>
                                                                        <td className="fw-medium">{product.name}</td>
                                                                        <td>
                                                                            {product.description && product.description.length > 50 
                                                                                ? `${product.description.substring(0, 50)}...` 
                                                                                : product.description}
                                                                        </td>
                                                                        <td className="text-nowrap">₱{parseFloat(product.price).toFixed(2)}</td>
                                                                        <td>
                                                                            <span className={`badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}`}>
                                                                                {product.stock}
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <div className="btn-group" role="group">
                                                                                <button 
                                                                                    className="btn btn-sm btn-outline-primary"
                                                                                    onClick={() => handleEditProduct(product)}
                                                                                >
                                                                                    <i className="bi bi-pencil me-1"></i>
                                                                                    Edit
                                                                                </button>
                                                                                <button 
                                                                                    className="btn btn-sm btn-outline-danger"
                                                                                    onClick={() => handleDeleteProduct(product.id)}
                                                                                >
                                                                                    <i className="bi bi-trash me-1"></i>
                                                                                    Delete
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pagination Controls */}
                                    {pagination.total > pagination.perPage && (
                                        <nav className="mt-4">
                                            <ul className="pagination justify-content-center">
                                                {Array.from({ length: pagination.lastPage }, (_, index) => (
                                                    <li
                                                        key={index + 1}
                                                        className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                                    >
                                                        <button
                                                            className="page-link"
                                                            onClick={() => handlePageChange(index + 1)}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </nav>
                                    )}
                                </div>
                            )}
                            
                            {/* Orders/Transactions Tab */}
                            {activeTab === 'orders' && (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h2 className="h4 mb-0">Order Transactions</h2>
                                        
                                        {/* Filters */}
                                        <div className="d-flex gap-2 flex-wrap">
                                            <select 
                                                className="form-select shadow-sm" 
                                                value={statusFilter} 
                                                onChange={e => setStatusFilter(e.target.value)}
                                                style={{ maxWidth: '180px' }}
                                            >
                                                <option value="all">All Statuses</option>
                                                <option value="pending">Pending</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                            <input 
                                                type="date" 
                                                className="form-control shadow-sm" 
                                                value={dateFilter} 
                                                onChange={e => setDateFilter(e.target.value)}
                                                style={{ maxWidth: '180px' }}
                                            />
                                            <button 
                                                className="btn btn-outline-secondary"
                                                onClick={() => setDateFilter('')}
                                                disabled={!dateFilter}
                                            >
                                                Clear Date
                                            </button>
                                            <button 
                                                className="btn btn-outline-primary" 
                                                onClick={fetchOrders}
                                                disabled={ordersLoading}
                                            >
                                                <i className="bi bi-arrow-clockwise me-1"></i>
                                                Refresh
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Orders Table */}
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                {ordersLoading ? (
                                                    <div className="text-center p-5">
                                                        <div className="spinner-border text-primary" role="status">
                                                            <span className="visually-hidden">Loading orders...</span>
                                                        </div>
                                                        <p className="mt-2">Loading orders...</p>
                                                    </div>
                                                ) : (
                                                    <table className="table table-hover align-middle">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>Order ID</th>
                                                                <th>Customer</th>
                                                                <th>Total</th>
                                                                <th>Status</th>
                                                                <th>Payment</th>
                                                                <th>Address</th>
                                                                <th>Contact</th>
                                                                <th>Date</th>
                                                                <th>Items</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {filteredOrders.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan="10" className="text-center py-4">
                                                                        <div className="text-muted">
                                                                            <i className="bi bi-inbox-fill fs-3 d-block mb-2"></i>
                                                                            {statusFilter !== 'all' || dateFilter 
                                                                                ? 'No orders match the current filters.' 
                                                                                : 'No orders found.'}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                filteredOrders.map(order => (
                                                                    <tr key={order.id}>
                                                                        <td>#{order.id}</td>
                                                                        <td>{order.user_id}</td>
                                                                        <td className="text-nowrap fw-medium">₱{parseFloat(order.total).toFixed(2)}</td>
                                                                        <td>
                                                                            <span className={`badge ${
                                                                                order.status === 'completed' ? 'bg-success' :
                                                                                'bg-warning'
                                                                            }`}>
                                                                                {order.status}
                                                                            </span>
                                                                        </td>
                                                                        <td>{order.payment_method}</td>
                                                                        <td className="text-truncate" style={{maxWidth: "150px"}}>{order.delivery_address || 'N/A'}</td>
                                                                        <td>{order.contact_number || 'N/A'}</td>
                                                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                                                        <td>
                                                                            <button 
                                                                                className="btn btn-sm btn-outline-info"
                                                                                onClick={() => handleViewOrderDetails(order.id)}
                                                                            >
                                                                                <i className="bi bi-eye me-1"></i>
                                                                                Details
                                                                            </button>
                                                                        </td>
                                                                        <td>
                                                                            {order.status !== 'completed' && (
                                                                                <div className="dropdown">
                                                                                    <button 
                                                                                        className="btn btn-sm btn-outline-primary dropdown-toggle"
                                                                                        type="button"
                                                                                        id={`dropdownMenuButton-${order.id}`}
                                                                                        data-bs-toggle="dropdown"
                                                                                        aria-expanded="false"
                                                                                    >
                                                                                        <i className="bi bi-gear-fill me-1"></i>
                                                                                        Update
                                                                                    </button>
                                                                                    <ul 
                                                                                        className="dropdown-menu shadow" 
                                                                                        aria-labelledby={`dropdownMenuButton-${order.id}`}
                                                                                    >
                                                                                        <li>
                                                                                            <button 
                                                                                                className="dropdown-item" 
                                                                                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                                                                            >
                                                                                                Mark as completed
                                                                                            </button>
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && (
                <OrderDetailsModal 
                    order={selectedOrder} 
                    onClose={handleCloseOrderDetails} 
                />
            )}
        </div>
    );
};

export default AdminPanel;