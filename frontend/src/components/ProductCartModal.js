import React, { useState, useEffect } from 'react';

const ProductCartModal = ({ show, product, onClose, onConfirm, currentCartQuantity = 0 }) => {
    const [quantity, setQuantity] = useState(1);
    const maxQuantity = product.stock - currentCartQuantity;

    // Reset quantity when modal opens with a new product
    useEffect(() => {
        if (show) {
            setQuantity(1);
        }
    }, [show, product.id]);

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        if (value >= 1 && value <= maxQuantity) {
            setQuantity(value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (quantity > 0 && quantity <= maxQuantity) {
            onConfirm(quantity);
            setQuantity(1); // Reset quantity
            onClose();
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-md">
                <div className="modal-content shadow-lg border-0">
                    <div className="modal-header bg-success text-white">
                        <h5 className="modal-title">Add to Cart</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-4">
                                <img 
                                    src={product.image || 'https://via.placeholder.com/300'} 
                                    alt={product.name}
                                    className="img-fluid rounded"
                                />
                            </div>
                            <div className="col-md-8">
                                <h5>{product.name}</h5>
                                <p className="text-muted small">{product.description}</p>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span>Price:</span>
                                    <span className="text-success fw-bold">₱{Number(product.price).toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span>Available Stock:</span>
                                    <span className="badge bg-secondary">{maxQuantity}</span>
                                </div>
                                {currentCartQuantity > 0 && (
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span>Already in Cart:</span>
                                        <span className="badge bg-primary">{currentCartQuantity}</span>
                                    </div>
                                )}
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Quantity to Add:</label>
                                        <div className="input-group">
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-secondary"
                                                onClick={() => quantity > 1 && setQuantity(q => q - 1)}
                                            >
                                                <i className="bi bi-dash"></i>
                                            </button>
                                            <input
                                                type="number"
                                                className="form-control text-center"
                                                value={quantity}
                                                onChange={handleQuantityChange}
                                                min="1"
                                                max={maxQuantity}
                                            />
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-secondary"
                                                onClick={() => quantity < maxQuantity && setQuantity(q => q + 1)}
                                            >
                                                <i className="bi bi-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="fw-bold">Total:</span>
                                        <span className="text-success fw-bold">
                                            ₱{(Number(product.price) * quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary btn-lg" onClick={onClose}>Cancel</button>
                        <button 
                            type="button" 
                            className="btn btn-success btn-lg"
                            onClick={handleSubmit}
                            disabled={quantity < 1 || quantity > maxQuantity}
                        >
                            {currentCartQuantity > 0 ? 'Update Cart' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCartModal;