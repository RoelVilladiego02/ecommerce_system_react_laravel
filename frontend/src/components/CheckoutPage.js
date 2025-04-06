import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleConfirmOrder = () => {
    alert('Order confirmed!');
    localStorage.removeItem('cart');
    navigate('/customer-dashboard');
  };

  return (
    <div className="container mt-5">
      <h2>Checkout</h2>
      <div className="card p-4">
        <h4>Order Summary</h4>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <ul className="list-group mb-3">
              {cartItems.map((item, index) => (
                <li className="list-group-item d-flex justify-content-between align-items-center" key={index}>
                  <div>
                    <strong>{item.name}</strong> (x{item.quantity})
                  </div>
                  <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <h5>Total: ₱{totalPrice.toFixed(2)}</h5>
            <button className="btn btn-success mt-3" onClick={handleConfirmOrder}>
              Confirm Order
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
