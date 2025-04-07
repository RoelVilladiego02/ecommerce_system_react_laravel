import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useOrders } from '../contexts/OrderContext';
import apiClient from '../services/apiClient';

const AdminPanel = () => {
    const navigate = useNavigate();
    const { 
        products, 
        loading: productsLoading, 
        createProduct, 
        updateProduct, 
        deleteProduct, 
        fetchProducts 
    } = useProducts();
    
    const { 
        orders, 
        salesTotal, 
        loading: ordersLoading, 
        fetchOrders, 
        fetchSalesTotal 
    } = useOrders();
    
    // State variables
    const [activeTab, setActiveTab] = useState('products');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductForm, setShowProductForm] = useState(false);
    
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
            await deleteProduct(productId);
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error(error.message || 'Failed to delete product');
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
    const handleViewOrderDetails = (orderId) => {
        // You would implement this function to show order details
        console.log(`View details for order ${orderId}`);
    };

    return (
        <div className="container-fluid">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="row my-4">
                <div className="col">
                    <h1 className="mb-4">Employee Dashboard</h1>
                    
                    {/* Dashboard Summary */}
                    <div className="row mb-4">
                        <div className="col-md-4">
                            <div className="card text-white bg-primary mb-3">
                                <div className="card-body">
                                    <h5 className="card-title">Products</h5>
                                    <p className="card-text display-6">
                                        {productsLoading ? 
                                            <small>Loading...</small> : 
                                            products.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card text-white bg-success mb-3">
                                <div className="card-body">
                                    <h5 className="card-title">Orders</h5>
                                    <p className="card-text display-6">
                                        {ordersLoading ? 
                                            <small>Loading...</small> : 
                                            orders.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card text-white bg-info mb-3">
                                <div className="card-body">
                                    <h5 className="card-title">Total Sales</h5>
                                    <p className="card-text display-6">
                                        {ordersLoading ? 
                                            <small>Loading...</small> : 
                                            `$${parseFloat(salesTotal).toFixed(2)}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Navigation Tabs */}
                    <ul className="nav nav-tabs mb-4">
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                                onClick={() => setActiveTab('products')}
                            >
                                Products Management
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                Order Transactions
                            </button>
                        </li>
                    </ul>
                    
                    {/* Products Management Tab */}
                    {activeTab === 'products' && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2>Products Management</h2>
                                <div>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={() => setShowProductForm(!showProductForm)}
                                    >
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
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <h3>{selectedProduct ? 'Edit Product' : 'Add New Product'}</h3>
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
                                                    className="btn btn-success"
                                                >
                                                    {selectedProduct ? 'Update Product' : 'Create Product'}
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-secondary" 
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
                            <div className="table-responsive">
                                {productsLoading ? (
                                    <div className="text-center p-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading products...</span>
                                        </div>
                                        <p className="mt-2">Loading products...</p>
                                    </div>
                                ) : (
                                    <table className="table table-striped table-hover">
                                        <thead className="table-dark">
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
                                                        No products found. Add your first product!
                                                    </td>
                                                </tr>
                                            ) : (
                                                products.map(product => (
                                                    <tr key={product.id}>
                                                        <td>{product.id}</td>
                                                        <td>{product.name}</td>
                                                        <td>
                                                            {product.description && product.description.length > 50 
                                                                ? `${product.description.substring(0, 50)}...` 
                                                                : product.description}
                                                        </td>
                                                        <td>${parseFloat(product.price).toFixed(2)}</td>
                                                        <td>{product.stock}</td>
                                                        <td>
                                                            <div className="btn-group" role="group">
                                                                <button 
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => handleEditProduct(product)}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button 
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => handleDeleteProduct(product.id)}
                                                                >
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
                    )}
                    
                    {/* Orders/Transactions Tab */}
                    {activeTab === 'orders' && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2>Order Transactions</h2>
                                
                                {/* Filters */}
                                <div className="d-flex gap-2 flex-wrap">
                                    <select 
                                        className="form-select" 
                                        value={statusFilter} 
                                        onChange={e => setStatusFilter(e.target.value)}
                                        style={{ maxWidth: '180px' }}
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    <input 
                                        type="date" 
                                        className="form-control" 
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
                            <div className="table-responsive">
                                {ordersLoading ? (
                                    <div className="text-center p-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading orders...</span>
                                        </div>
                                        <p className="mt-2">Loading orders...</p>
                                    </div>
                                ) : (
                                    <table className="table table-striped table-hover">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Customer ID</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                                <th>Payment Method</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrders.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-4">
                                                        {statusFilter !== 'all' || dateFilter 
                                                            ? 'No orders match the current filters.' 
                                                            : 'No orders found.'}
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredOrders.map(order => (
                                                    <tr key={order.id}>
                                                        <td>{order.id}</td>
                                                        <td>{order.user_id}</td>
                                                        <td>${parseFloat(order.total).toFixed(2)}</td>
                                                        <td>
                                                            <span className={`badge ${
                                                                order.status === 'delivered' ? 'bg-success' :
                                                                order.status === 'shipped' ? 'bg-info' :
                                                                order.status === 'processing' ? 'bg-primary' :
                                                                order.status === 'pending' ? 'bg-warning' :
                                                                'bg-danger'
                                                            }`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td>{order.payment_method}</td>
                                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                                        <td>
                                                            <button 
                                                                className="btn btn-sm btn-outline-info"
                                                                onClick={() => handleViewOrderDetails(order.id)}
                                                            >
                                                                View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;