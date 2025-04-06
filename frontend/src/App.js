import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginForm from './components/LoginForm';
import CustomerRegisterForm from './components/CustomerRegisterForm';
import EmployeeRegisterForm from './components/EmployeeRegisterForm';
import AdminPanel from './components/AdminPanel';
import CustomerStorefront from './components/CustomerStorefront';
import Navbar from './components/Navbar';
import CartPage from './components/CartPage';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import './App.css';
import CheckoutPage from './components/CheckoutPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route
              path="/customer-dashboard"
              element={
                <>
                  <Navbar />
                  <CustomerStorefront />
                </>
              }
            />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register/customer" element={<CustomerRegisterForm />} />
            <Route path="/register/employee" element={<EmployeeRegisterForm />} />
            <Route path="/employee-dashboard" element={<AdminPanel />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </CartProvider>
      <Router>
        <Routes>
          <Route
            path="/customer-dashboard"
            element={
              <>
                <Navbar cartItemCount={cartItemCount} />
                <CustomerStorefront />
              </>
            }
          />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register/customer" element={<CustomerRegisterForm />} />
          <Route path="/register/employee" element={<EmployeeRegisterForm />} />
          <Route path="/employee-dashboard" element={<AdminPanel />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
