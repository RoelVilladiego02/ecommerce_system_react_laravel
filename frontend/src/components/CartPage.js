import React from 'react';

const CartPage = () => {
    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-success text-white">
                            <h2 className="text-center mb-0">Your Cart</h2>
                        </div>
                        <div className="card-body text-center">
                            <p className="text-muted">Your cart is currently empty.</p>
                            <button className="btn btn-success" onClick={() => window.history.back()}>
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
