import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import ProductCartModal from '../components/ProductCartModal';

const CustomerStorefront = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('name');
    const [username, setUsername] = useState('Customer');
    const [modalProduct, setModalProduct] = useState(null);
    const [detailsModalProduct, setDetailsModalProduct] = useState(null); // State for product details modal
    const navigate = useNavigate();
    const { addToCart, cart } = useCart();

    // Function to get user data from localStorage or fallback to default
    const getUserFromStorage = useCallback(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userData = JSON.parse(userStr);
                console.log('Retrieved user data from localStorage:', userData);
                if (userData && userData.name) {
                    setUsername(userData.name);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
            return false;
        }
    }, []);

    // Fetch user info from API if not available in localStorage
    const fetchUserInfo = useCallback(async () => {
        // First try to get from localStorage
        if (getUserFromStorage()) {
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found. Please log in.');
            }

            // Try to get user info from the API
            const response = await axios.get('http://localhost:8000/api/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('User API response:', response.data);
            
            if (response.data && response.data.name) {
                setUsername(response.data.name);
                // Store in localStorage for future use
                localStorage.setItem('user', JSON.stringify(response.data));
            }
        } catch (err) {
            console.error('Failed to fetch user info:', err);
            // If API call fails, try localStorage as fallback
            getUserFromStorage();
        }
    }, [getUserFromStorage]);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found. Please log in.');
            }

            let allProducts = [];
            let currentPage = 1;
            let lastPage = 1;

            do {
                const response = await axios.get(`http://localhost:8000/api/products?page=${currentPage}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const productsData = response.data.data || [];
                allProducts = [...allProducts, ...productsData];
                currentPage = response.data.meta?.current_page || currentPage;
                lastPage = response.data.meta?.last_page || lastPage;

                currentPage++;
            } while (currentPage <= lastPage);

            setProducts(allProducts);
            setFilteredProducts(allProducts);
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
                    localStorage.removeItem('user');
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
        // On component mount, check if we have user data and fetch products
        fetchUserInfo();
        fetchProducts();
    }, [fetchUserInfo, fetchProducts]);

    // This setup ensures we capture the login response in your login component
    useEffect(() => {
        // Define event listener for login
        const handleStorageChange = (e) => {
            if (e.key === 'user' || e.key === 'token') {
                getUserFromStorage();
            }
        };

        // Listen for storage events from other tabs/windows
        window.addEventListener('storage', handleStorageChange);
        
        // Listen for custom login event from same window
        window.addEventListener('user-login', getUserFromStorage);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('user-login', getUserFromStorage);
        };
    }, [getUserFromStorage]);

    useEffect(() => {
        const sortedProducts = [...products].sort((a, b) => {
            if (sortOption === 'name') return a.name.localeCompare(b.name);
            if (sortOption === 'price-low') return a.price - b.price;
            if (sortOption === 'price-high') return b.price - a.price;
            return 0;
        });
        setFilteredProducts(sortedProducts);
    }, [sortOption, products]);

    useEffect(() => {
        // Ensure filteredProducts is always an array
        if (!Array.isArray(filteredProducts)) {
            setFilteredProducts([]);
        }
    }, [filteredProducts]);

    useEffect(() => {
        console.log('Products state:', products); // Debug log
        console.log('Filtered products state:', filteredProducts); // Debug log
    }, [products, filteredProducts]);

    useEffect(() => {
        console.log('Current products state:', {
            rawProducts: products,
            filteredProducts: filteredProducts,
            count: products.length
        });
    }, [products, filteredProducts]);

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
        await fetchUserInfo();
        await fetchProducts();
    };

    const handleShowModal = (product) => {
        setModalProduct(product);
    };

    const handleCloseModal = () => {
        setModalProduct(null);
    };

    const handleConfirmAdd = async (quantity) => {
        try {
            await addToCart(modalProduct, quantity);
        } catch (err) {
            // Error handling is already in addToCart
        }
    };

    const handleViewDetails = (product) => {
        setDetailsModalProduct(product); // Set the product to display in the modal
    };

    const handleCloseDetailsModal = () => {
        setDetailsModalProduct(null); // Close the modal
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
                    <h1 className="text-success">Welcome, {username}!</h1>
                </div>
                
                {/* Rest of the component remains the same */}
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
                                                        src={product.image || 'https://via.placeholder.com/300x200'}
                                                        alt={product.name}
                                                        className="img-fluid w-100 h-100 object-fit-cover"
                                                    />
                                                    <div className="position-absolute top-0 end-0 bg-success text-white px-3 py-1 rounded-bl">
                                                        ₱{Number(product.price || 0).toFixed(2)}
                                                    </div>
                                                </div>
                                                <div className="card-body d-flex flex-column">
                                                    <h5 className="card-title text-truncate">{product.name}</h5>
                                                    <p className="card-text text-muted flex-grow-1 small">
                                                        {product.description || 'No description available'}
                                                    </p>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <button 
                                                            className="btn btn-sm btn-outline-success"
                                                            onClick={() => handleViewDetails(product)}
                                                        >
                                                            <i className="bi bi-eye me-1"></i> Details
                                                        </button>
                                                        <button 
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => handleShowModal(product)}
                                                        disabled={product.stock <= 0}
                                                    >
                                                        <i className="bi bi-cart-plus me-1"></i> 
                                                        {product.stock > 0 ? 'Add' : 'Out of Stock'}
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
            {modalProduct && (
                <ProductCartModal
                    show={true}
                    product={modalProduct}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmAdd}
                    currentCartQuantity={cart.find(item => item.product_id === modalProduct.id)?.quantity || 0}
                />
            )}
            {detailsModalProduct && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{detailsModalProduct.name}</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={handleCloseDetailsModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <img 
                                    src={detailsModalProduct.image || 'https://via.placeholder.com/300x200'} 
                                    alt={detailsModalProduct.name} 
                                    className="img-fluid mb-3"
                                />
                                <p><strong>Price:</strong> ₱{Number(detailsModalProduct.price || 0).toFixed(2)}</p>
                                <p><strong>Description:</strong> {detailsModalProduct.description || 'No description available'}</p>
                                <p><strong>Stock:</strong> {detailsModalProduct.stock}</p>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={handleCloseDetailsModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerStorefront;