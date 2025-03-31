import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginForm from './components/LoginForm';
import CustomerRegisterForm from './components/CustomerRegisterForm';
import EmployeeRegisterForm from './components/EmployeeRegisterForm';
import AdminPanel from './components/AdminPanel'; // Placeholder for Admin Panel
import CustomerStorefront from './components/CustomerStorefront'; // Placeholder for Customer Storefront
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App container py-4">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register/customer" element={<CustomerRegisterForm />} />
            <Route path="/register/employee" element={<EmployeeRegisterForm />} />
            <Route path="/employee-dashboard" element={<AdminPanel />} /> {/* Admin Panel */}
            <Route path="/customer-dashboard" element={<CustomerStorefront />} /> {/* Customer Storefront */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
