// src/components/Footer/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../UI/Logo';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-5">
            <Link to="/" className="footer-brand">
              <Logo size={30} /> <span>TripTrack</span>
            </Link>
            <p className="footer-text">
              Plánuj, ukládej a sdílej své trasy. Objevuj místa, která doporučují ostatní cestovatelé.
            </p>
          </div>

          <div className="col-6 col-lg-3 offset-lg-1">
            <h6 className="footer-heading">Aplikace</h6>
            <ul className="footer-links">
              <li><Link to="/mapa">Mapa a plánovač</Link></li>
              <li><Link to="/trasa">Moje trasy</Link></li>
              <li><Link to="/oblibene">Oblíbené</Link></li>
            </ul>
          </div>

          <div className="col-6 col-lg-3">
            <h6 className="footer-heading">Právní informace</h6>
            <ul className="footer-links">
              <li><Link to="/podminky">Podmínky použití</Link></li>
              <li><Link to="/ochrana-soukromi">Ochrana soukromí</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} TripTrack</span>
          <span>Mapy © Google</span>
        </div>
      </div>
    </footer>
  );
}
