// src/components/Footer/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkedAlt, FaHeart } from 'react-icons/fa';
// Ujisti se, že máš správně importy ikon, v původním kódu jich bylo víc, 
// ale používaly se jen tyhle dvě, tak jsem to pročistil, aby to nehlásilo varování.
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section">
      <div className="container">
        {/* ZMĚNA: Přidal jsem 'justify-content-center', aby se sloupce posunuly na střed stránky.
            Taky jsem přidal 'text-center', aby se text uvnitř zarovnal na střed.
        */}
        <div className="row g-4 justify-content-center text-center">
          
          {/* 1. Sloupec: O aplikaci */}
          {/* 💥 ZMĚNA: col-md-4 místo col-md-6, aby se tam vešly 3 sloupce vedle sebe */}
          <div className="col-lg-4 col-md-4">
            <div className="footer-brand mb-3 d-flex justify-content-center align-items-center">
              <FaMapMarkedAlt className="me-2 text-accent" size={24} />
              <span className="fw-bold fs-4">TripTrack</span>
            </div>
            
            <p className="small">
              TripTrack je váš osobní průvodce světem. Plánujte, ukládejte a sdílejte své cesty s ostatními.
              Objevujte nová místa a mějte své zážitky vždy po ruce.
            </p>
          </div>

          {/* 2. Sloupec: Rychlé odkazy */}
          <div className="col-lg-4 col-md-4">
            <h5 className="fw-bold mb-3">Rychlé odkazy</h5>
            <ul className="list-unstyled footer-links">
              <li><Link to="/">Domů</Link></li>
              <li><Link to="/mapa">Mapa a plánovač</Link></li>
              <li><Link to="/trasa">Prohlížeč tras</Link></li>
              <li><Link to="/oblibene">Oblíbené</Link></li>
            </ul>
          </div>

          {/* 💥 PŘIDÁNO - 3. Sloupec: Právní informace */}
          <div className="col-lg-4 col-md-4">
            <h5 className="fw-bold mb-3">Právní informace</h5>
            <ul className="list-unstyled footer-links">
              <li><Link to="/podminky">Podmínky použití</Link></li>
              <li><Link to="/ochrana-soukromi">Ochrana soukromí (GDPR)</Link></li>
            </ul>
          </div>

        </div>

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