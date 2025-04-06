import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="text-center my-5">
            <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-success">Processing your order...</p>
        </div>
    );
};

export default LoadingSpinner;
