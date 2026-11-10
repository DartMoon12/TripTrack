import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// Pole pro heslo s tlačítkem "zobrazit / skrýt"
export default function PasswordInput({ id, value, onChange, autoComplete, minLength, required = true }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-field">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className="form-control"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Skrýt heslo' : 'Zobrazit heslo'}
      >
        {visible ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
}
