import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import LoginForm from './auth/LoginForm';
import CustomerRegisterForm from './auth/CustomerRegisterForm';
import EmployeeRegisterForm from './auth/EmployeeRegisterForm';
import AdminPanel from './components/AdminPanel';
import CustomerStorefront from './components/CustomerStorefront';
import Navbar from './components/Navbar';
import CartPage from './components/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';
import { OrderProvider } from './contexts/OrderContext';
import './App.css';

const ProtectedRoute = ({ children, allowedRole }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!token || !user) {
        return <Navigate to="/login" />;
    }

    if (allowedRole && user.role !== allowedRole) {
        // Redirect employees to employee dashboard and customers to customer dashboard
        return <Navigate to={user.role === 'employee' ? '/employee-dashboard' : '/customer-dashboard'} />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <ProductProvider>
                <OrderProvider>
                    <CartProvider>
                        <Router>
                            <Routes>
                                <Route path="/login" element={<LoginForm />} />
                                <Route path="/register/customer" element={<CustomerRegisterForm />} />
                                <Route path="/register/employee" element={<EmployeeRegisterForm />} />
                                
                                {/* Protected Routes */}
                                <Route path="/employee-dashboard" element={
                                    <ProtectedRoute allowedRole="employee">
                                        <AdminPanel />
                                    </ProtectedRoute>
                                } />
                                
                                <Route path="/customer-dashboard" element={
                                    <ProtectedRoute allowedRole="customer">
                                        <Navbar />
                                        <CustomerStorefront />
                                    </ProtectedRoute>
                                } />
                                
                                <Route path="/cart" element={
                                    <ProtectedRoute allowedRole="customer">
                                        <CartPage />
                                    </ProtectedRoute>
                                } />
                                
                                <Route path="/checkout" element={
                                    <ProtectedRoute allowedRole="customer">
                                        <CheckoutPage />
                                    </ProtectedRoute>
                                } />
                                
                                <Route path="*" element={<Navigate to="/login" />} />
                            </Routes>
                        </Router>
                    </CartProvider>
                </OrderProvider>
            </ProductProvider>
        </AuthProvider>
    );
}

export default App;
