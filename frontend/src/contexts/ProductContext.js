import React, { createContext, useContext, useState, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0,
    });

    const fetchProducts = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found. Please log in.');
            }

            const response = await apiClient.get(`/products?page=${page}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include token in headers
                },
            });
            console.log('Products API response:', response.data); // Debug log

            // Handle both paginated and non-paginated responses
            const productsData = response.data.data || response.data;
            setProducts(Array.isArray(productsData) ? productsData : []);

            // Update pagination state if meta is available
            if (response.data.meta) {
                setPagination({
                    currentPage: response.data.meta.current_page,
                    lastPage: response.data.meta.last_page,
                    perPage: response.data.meta.per_page,
                    total: response.data.meta.total,
                });
            }

            setError(null);
        } catch (error) {
            console.error('Error fetching products:', error.response || error);
            const errorMessage = error.response?.data?.message || 'Failed to fetch products';
            setError(errorMessage);
            toast.error('Failed to load products. Please check your permissions or try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    const createProduct = async (productData) => {
        setLoading(true);
        try {
            const response = await apiClient.post('/products', productData);
            await fetchProducts();
            toast.success('Product created successfully');
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create product';
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateProduct = async (id, productData) => {
        setLoading(true);
        try {
            const response = await apiClient.put(`/products/${id}`, productData);
            await fetchProducts();
            toast.success('Product updated successfully');
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update product';
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id) => {
        setLoading(true);
        try {
            await apiClient.delete(`/products/${id}`);
            await fetchProducts();
            return null; // Return null to indicate success
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete product';
            console.error('Delete product error:', error); // Log the error for debugging
            return errorMessage; // Return the error message instead of throwing
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProductContext.Provider value={{
            products,
            setProducts, // Expose setProducts
            loading,
            error,
            pagination, // Expose pagination state
            fetchProducts,
            createProduct,
            updateProduct,
            deleteProduct
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};