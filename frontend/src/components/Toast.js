import React from 'react';

const Toast = ({ message, type, onClose }) => {
    return (
        <div className={`toast show position-fixed top-0 end-0 m-3 bg-${type === 'error' ? 'danger' : 'success'}`}
             role="alert"
             style={{ zIndex: 1051 }}>
            <div className="toast-header">
                <strong className="me-auto">{type === 'error' ? 'Error' : 'Success'}</strong>
                <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="toast-body text-white">
                {message}
            </div>
        </div>
    );
};

export default Toast;
