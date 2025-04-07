import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import Toast from '../components/Toast'; // Assuming Toast component is in components folder

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const fetchCart = useCallback(async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        // Only fetch cart for customers
        if (!user || user.role !== 'customer') {
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.get('/cart');
            
            // Extract cart data, ensuring it's properly structured
            const cartData = response.data.cart || [];
            // Convert object to array if needed and ensure uniqueness by product_id
            const cartArray = Array.isArray(cartData) ? cartData : Object.values(cartData);
            
            // Ensure cart items are unique by product_id
            const uniqueCart = [];
            const seenProductIds = new Set();
            
            cartArray.forEach(item => {
                if (!seenProductIds.has(item.product_id)) {
                    seenProductIds.add(item.product_id);
                    uniqueCart.push(item);
                }
            });
            
            setCart(uniqueCart);
        } catch (err) {
            console.error('Fetch cart error:', err.response || err);
            setError(err.response?.data?.message || 'Failed to fetch cart');
            showToast('Failed to fetch cart', 'error');
        } finally {
            setLoading(false);
        }
    }, []);
    
    const addToCart = async (product, quantityChange = 1, newQuantity = null) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'customer') {
            throw new Error('Only customers can add items to cart');
        }
        setLoading(true);
        try {
            // Check if item already exists in cart
            const existingItem = cart.find(item => item.product_id === product.id);
            
            const finalQuantity = newQuantity !== null 
                ? newQuantity 
                : (existingItem ? existingItem.quantity + quantityChange : quantityChange);

            // If item exists, use updateCartItem instead of adding new
            if (existingItem) {
                await updateCartItem(product.id, finalQuantity);
            } else {
                const response = await apiClient.post('/cart', {
                    product_id: product.id,
                    quantity: finalQuantity
                });

                if (response.data.success) {
                    await fetchCart();
                    showToast('Item added to cart successfully');
                }
            }
        } catch (error) {
            console.error('Add to cart error:', error.response || error);
            showToast(error.response?.data?.message || 'Failed to add item to cart', 'error');
            throw error;
        } finally {
            setLoading(false);
        }
    };    

    const updateCartItem = async (productId, quantity) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'customer') {
            throw new Error('Only customers can update items in cart');
        }
        try {
            if (quantity <= 0) {
                // If quantity is 0 or less, remove the item
                await removeFromCart(productId);
                return;
            }

            // First remove the existing item
            await apiClient.delete(`/cart/${productId}`);
            
            // Then add it back with new quantity
            const response = await apiClient.post('/cart', {
                product_id: productId,
                quantity: quantity
            });
            
            if (response.data.success) {
                await fetchCart();
                showToast('Cart updated successfully');
            }
        } catch (err) {
            console.error('Update cart error:', err.response || err);
            showToast(err.response?.data?.message || 'Failed to update cart', 'error');
            throw err;
        }
    };

    const removeFromCart = async (productId) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'customer') {
            throw new Error('Only customers can remove items from cart');
        }
        try {
            await apiClient.delete(`/cart/${productId}`);
            
            await fetchCart(); // Refresh cart after removing item
            showToast('Item removed from cart');
        } catch (err) {
            console.error('Remove from cart error:', err.response || err);
            showToast(err.response?.data?.message || 'Failed to remove item', 'error');
            throw err;
        }
    };

    const clearCart = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'customer') {
            throw new Error('Only customers can clear the cart');
        }
        try {
            await apiClient.post('/cart/clear');
            setCart([]);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to clear cart');
        }
    };

    const checkout = async (orderDetails) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'customer') {
            throw new Error('Only customers can checkout');
        }
        try {
            setLoading(true);
            
            if (!orderDetails || !orderDetails.items || orderDetails.items.length === 0) {
                throw new Error('No items selected for checkout');
            }

            console.log('Checkout payload:', {
                user_id: JSON.parse(localStorage.getItem('user')).id,
                delivery_address: orderDetails.deliveryAddress,
                contact_number: orderDetails.contactNumber,
                message: orderDetails.message,
                payment_method: orderDetails.paymentMethod,
                items: orderDetails.items,
                total_amount: orderDetails.total
            });

            const response = await apiClient.post('/checkout', {
                user_id: JSON.parse(localStorage.getItem('user')).id,
                delivery_address: orderDetails.deliveryAddress,
                contact_number: orderDetails.contactNumber,
                message: orderDetails.message,
                payment_method: orderDetails.paymentMethod,
                items: orderDetails.items,
                total_amount: orderDetails.total
            });

            if (response.status === 201 || response.status === 200) {
                await clearCart();
                return { 
                    success: true, 
                    data: response.data,
                    orderId: response.data.order_id 
                };
            } else {
                throw new Error(response.data.error || 'Checkout failed');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error 
                || err.message 
                || 'Failed to process checkout';
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Add a method to reset cart state
    const resetCart = () => {
        setCart([]);
        setError(null);
    };

    useEffect(() => {
        const handleTokenChange = () => {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            // Only fetch cart for customers
            if (token && user && user.role === 'customer') {
                fetchCart();
            } else {
                resetCart();
            }
        };

        // Initial check
        handleTokenChange();

        // Listen for token changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'token') {
                handleTokenChange();
            }
        });

        // Listen for custom login event
        window.addEventListener('user-login', handleTokenChange);

        return () => {
            window.removeEventListener('storage', handleTokenChange);
            window.removeEventListener('user-login', handleTokenChange);
        };
    }, [fetchCart]);

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            error,
            addToCart,
            removeFromCart,
            clearCart,
            checkout,
            updateCartItem,
            cartCount: cart.length, // Changed from reduce to just length of cart array
            cartTotal: cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0),
            toast,
            setToast,
            showToast,
            resetCart
        }}>
            {children}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: 'success' })}
                />
            )}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);