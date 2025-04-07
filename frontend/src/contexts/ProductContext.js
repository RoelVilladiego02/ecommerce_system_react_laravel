import React, { createContext, useContext, useState, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/products');
            setProducts(Array.isArray(response.data) ? response.data : []);
            setError(null);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError(error.response?.data?.message || 'Failed to fetch products');
            toast.error('Failed to load products');
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
            toast.success('Product deleted successfully');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete product';
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProductContext.Provider value={{
            products,
            loading,
            error,
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
