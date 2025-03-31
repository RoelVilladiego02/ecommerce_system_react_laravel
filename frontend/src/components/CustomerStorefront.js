import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CustomerStorefront = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('name');
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token'); // Ensure token is read from localStorage
            if (!token) {
                throw new Error('No authentication token found. Please log in.');
            }

            const response = await axios.get('http://localhost:8000/api/products', {
                headers: {
                    Authorization: `Bearer ${token}`, // Include token in header
                },
            });

            setProducts(response.data);
            setFilteredProducts(response.data);
        } catch (err) {
            console.error('API Error:', {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data
            });

            let errorMessage = 'Failed to fetch products. Please try again.';
            
            if (err.response) {
                if (err.response.status === 401) {
                    errorMessage = 'Session expired. Redirecting to login...';
                    localStorage.removeItem('token');
                    setTimeout(() => navigate('/login'), 2000);
                } else if (err.response.data?.message) {
                    errorMessage = err.response.data.message;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        const sortedProducts = [...products].sort((a, b) => {
            if (sortOption === 'name') return a.name.localeCompare(b.name);
            if (sortOption === 'price-low') return a.price - b.price;
            if (sortOption === 'price-high') return b.price - a.price;
            return 0;
        });
        setFilteredProducts(sortedProducts);
    }, [sortOption, products]);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setFilteredProducts(
            products.filter((product) =>
                product.name.toLowerCase().includes(term) ||
                (product.description && product.description.toLowerCase().includes(term))
            )
        );
    };

    const handleRetry = async () => {
        setError(null);
        await fetchProducts(); // Properly scoped fetchProducts
    };

    if (loading) return (
        <div className="bg-light min-vh-100 py-5">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6 text-center">
                        <div className="spinner-border text-success" style={{width: '3rem', height: '3rem'}} role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <h4 className="mt-3 text-success">Loading Products...</h4>
                    </div>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="bg-light min-vh-100 py-5">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-danger text-white">
                                <h4 className="mb-0">Error Loading Products</h4>
                            </div>
                            <div className="card-body text-center py-4">
                                <i className="bi bi-exclamation-triangle-fill text-danger display-4 mb-3"></i>
                                <p className="lead">{error}</p>
                                <div className="d-grid gap-2">
                                    <button 
                                        className="btn btn-danger"
                                        onClick={handleRetry}
                                    >
                                        <i className="bi bi-arrow-repeat me-2"></i>Try Again
                                    </button>
                                    <button 
                                        className="btn btn-outline-secondary"
                                        onClick={handleLogout}
                                    >
                                        <i className="bi bi-box-arrow-right me-2"></i>Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-light min-vh-100 py-5">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="text-success">Customer Storefront</h1>
                    <button className="btn btn-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                </div>
                
                <div className="row justify-content-center mb-4">
                    <div className="col-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-success text-white py-3">
                                <h2 className="text-center mb-0">Product Catalog</h2>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-3 mb-4">
                                    <div className="col-md-8">
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0">
                                                <i className="bi bi-search text-secondary"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                placeholder="Search products by name or description..."
                                                value={searchTerm}
                                                onChange={handleSearch}
                                            />
                                            {searchTerm && (
                                                <button 
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => {
                                                        setSearchTerm('');
                                                        setFilteredProducts(products);
                                                    }}
                                                >
                                                    <i className="bi bi-x-lg"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <select 
                                            className="form-select form-select-lg"
                                            value={sortOption}
                                            onChange={(e) => setSortOption(e.target.value)}
                                        >
                                            <option value="name">Sort by Name (A-Z)</option>
                                            <option value="price-low">Sort by Price (Low to High)</option>
                                            <option value="price-high">Sort by Price (High to Low)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
                                    {filteredProducts.map((product) => (
                                        <div key={product.id} className="col">
                                            <div className="card h-100 shadow-sm border-0 hover-shadow transition-all">
                                                <div className="position-relative overflow-hidden" style={{height: '200px'}}>
                                                    <img
                                                        src={product.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                                                        alt={product.name}
                                                        className="img-fluid w-100 h-100 object-fit-cover"
                                                    />
                                                    <div className="position-absolute top-0 end-0 bg-success text-white px-3 py-1 rounded-bl">
                                                        ${Number(product.price || 0).toFixed(2)}
                                                    </div>
                                                </div>
                                                <div className="card-body d-flex flex-column">
                                                    <h5 className="card-title text-truncate">{product.name}</h5>
                                                    <p className="card-text text-muted flex-grow-1 small">
                                                        {product.description || 'No description available'}
                                                    </p>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <button className="btn btn-sm btn-outline-success">
                                                            <i className="bi bi-eye me-1"></i> Details
                                                        </button>
                                                        <button className="btn btn-sm btn-success">
                                                            <i className="bi bi-cart-plus me-1"></i> Add
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {filteredProducts.length === 0 && (
                                    <div className="text-center py-5 my-5">
                                        <div className="display-2 text-muted mb-3">
                                            <i className="bi bi-search-heart"></i>
                                        </div>
                                        <h3 className="fw-light">No products found</h3>
                                        <p className="text-muted mb-4">Try adjusting your search or filter criteria</p>
                                        <button 
                                            className="btn btn-outline-success rounded-pill px-4"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setFilteredProducts(products);
                                            }}
                                        >
                                            <i className="bi bi-arrow-counterclockwise me-2"></i>Reset Search
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerStorefront;