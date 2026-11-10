import React from 'react';
import { FaGoogle } from 'react-icons/fa';
import Logo from '../UI/Logo';
import './Auth.css';

// Společný rámeček pro přihlášení i registraci
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-4">
          <Logo size={48} className="mb-3" />
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>
        {children}
        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function GoogleButton({ onClick, disabled, children = 'Pokračovat přes Google' }) {
  return (
    <button type="button" className="btn btn-ghost w-100 py-2 google-btn" onClick={onClick} disabled={disabled}>
      <FaGoogle /> {children}
    </button>
  );
}

export function Divider() {
  return <div className="auth-divider"><span>nebo e-mailem</span></div>;
}
