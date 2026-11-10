import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaRoute, FaStar } from 'react-icons/fa';
import { useAuth } from '../Auth/AuthContext';
import ThemeToggle from '../Theme/ThemeToggle';
import Logo from '../UI/Logo';
import './navbar.css';

const LINKS = [
  { name: 'Domů', to: '/', end: true },
  { name: 'Mapa', to: '/mapa' },
  { name: 'Moje trasy', to: '/trasa' },
  { name: 'Oblíbené', to: '/oblibene' },
];

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Po přechodu na jinou stránku zavřít obě menu
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Kliknutí mimo uživatelské menu ho zavře
  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setUserMenuOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [userMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const userName = currentUser?.displayName || currentUser?.email || '';
  const initial = userName.charAt(0).toUpperCase() || '?';

  return (
    <header className="site-nav">
      <nav className="container site-nav-inner" aria-label="Hlavní navigace">
        <Link to="/" className="site-brand" aria-label="TripTrack – domů">
          <Logo size={34} />
          <span>TripTrack</span>
        </Link>

        <ul className={`site-links ${menuOpen ? 'is-open' : ''}`}>
          {LINKS.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.end} className={({ isActive }) => `site-link ${isActive ? 'active' : ''}`}>
                {link.name}
              </NavLink>
            </li>
          ))}
          {!currentUser && (
            <li className="site-links-auth">
              <Link className="btn btn-ghost w-100" to="/login">Přihlásit se</Link>
              <Link className="btn btn-accent w-100" to="/register">Registrace</Link>
            </li>
          )}
        </ul>

        <div className="site-actions">
          <ThemeToggle />

          {!currentUser ? (
            <div className="d-none d-md-flex gap-2">
              <Link className="btn btn-ghost" to="/login">Přihlásit se</Link>
              <Link className="btn btn-accent" to="/register">Registrace</Link>
            </div>
          ) : (
            <div className="user-menu" ref={userMenuRef}>
              <button
                type="button"
                className="avatar-btn"
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                aria-label="Uživatelské menu"
              >
                {currentUser.photoURL ? <img src={currentUser.photoURL} alt="" referrerPolicy="no-referrer" /> : initial}
              </button>

              {userMenuOpen && (
                <div className="user-dropdown" role="menu">
                  <div className="user-dropdown-head">
                    <span className="small text-muted">Přihlášen jako</span>
                    <strong className="text-truncate d-block">{userName}</strong>
                  </div>
                  <Link role="menuitem" className="user-dropdown-item" to="/trasa"><FaRoute /> Moje trasy</Link>
                  <Link role="menuitem" className="user-dropdown-item" to="/oblibene"><FaStar /> Oblíbené</Link>
                  <button role="menuitem" type="button" className="user-dropdown-item danger" onClick={handleLogout}>
                    <FaSignOutAlt /> Odhlásit se
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="icon-btn d-lg-none"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Zavřít menu' : 'Otevřít menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>
    </header>
  );
}
