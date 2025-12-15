// src/components/Footer/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkedAlt, FaGithub, FaTwitter, FaInstagram, FaHeart } from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section">
      <div className="container">
        <div className="row g-4">
          
          {/* 1. Sloupec: O aplikaci */}
          <div className="col-lg-4 col-md-6">
            <div className="footer-brand mb-3">
              <FaMapMarkedAlt className="me-2 text-accent" size={24} />
              <span className="fw-bold fs-4">TripTrack</span>
            </div>
            {/* Odstraněno 'text-muted', barvu řeší CSS */}
            <p className="small">
              TripTrack je váš osobní průvodce světem. Plánujte, ukládejte a sdílejte své cesty s ostatními.
              Objevujte nová místa a mějte své zážitky vždy po ruce.
            </p>
          </div>

          {/* 2. Sloupec: Rychlé odkazy */}
          <div className="col-lg-4 col-md-6">
            <h5 className="fw-bold mb-3">Rychlé odkazy</h5>
            <ul className="list-unstyled footer-links">
              <li><Link to="/">Domů</Link></li>
              <li><Link to="/mapa">Mapa a plánovač</Link></li>
              <li><Link to="/trasa">Prohlížeč tras</Link></li>
              <li><Link to="/oblibene">Oblíbené</Link></li>
            </ul>
          </div>

          {/* 3. Sloupec: Kontakt a Sociální sítě */}
          <div className="col-lg-4 col-md-12">
            <h5 className="fw-bold mb-3">Sledujte nás</h5>
            <p className="small">
              Máte nápad na vylepšení? Napište nám nebo nás sledujte na sociálních sítích.
            </p>
            <div className="d-flex gap-3 mt-3 social-icons">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="social-link"><FaGithub /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-link"><FaTwitter /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-link"><FaInstagram /></a>
            </div>
          </div>
        </div>

        {/* Spodní lišta */}
        <div className="footer-bottom mt-5 pt-3 border-top">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <p className="small mb-0">
                &copy; {currentYear} TripTrack. Všechna práva vyhrazena.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <p className="small mb-0">
                Vytvořeno s <FaHeart className="text-danger mx-1" /> pro cestovatele.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}