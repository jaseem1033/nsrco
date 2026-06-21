import React from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  name: string;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, name, onClose }) => {
  return (
    <div className={`success-modal-overlay ${isOpen ? 'open' : ''}`} id="successModal">
      <div className="success-modal">
        <div className="success-icon" aria-hidden="true">✓</div>
        <h3>THANK YOU!</h3>
        <p>Your inquiry is being prepared. Redirecting to your mail client...</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.8rem' }}>
          Preparing mail context for: <span id="successName" style={{ color: 'var(--orange)', fontWeight: 600 }}>{name}</span>
        </p>
        
        <div className="success-loader">
          <div className="success-loader-bar"></div>
        </div>
        <button className="btn-primary" onClick={onClose} style={{ width: '100%', marginTop: '1.5rem', padding: '12px' }}>
          Close
        </button>
      </div>
    </div>
  );
};
