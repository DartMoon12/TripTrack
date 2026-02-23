// src/components/MainPage/MainPage.jsx

import React from 'react';
// Importujeme Link pro odkazy, které neobnovují stránku
import { Link, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaRoute, FaHeart } from 'react-icons/fa';
import heroImage from '../../assets/hero.svg';
import './MainPage.css';
import { useAuth } from '../Auth/AuthContext';

export default function MainPage() {
  
  // --- 1. HOOKY (Nástroje) ---
  // Zjistíme, jestli je uživatel přihlášený (currentUser)
  const { currentUser } = useAuth();
  // Získáme funkci pro "přesměrování" (navigaci) v kódu
  const navigate = useNavigate();

  // --- 2. DATA PRO KARTY ---
  // Místo abychom psali 3x stejný HTML kód pro karty dole,
  // uděláme si pole objektů a pak ho jenom "projdedeme" (map).
  // Je to čistší a snadno se přidávají nové karty.
  const features = [
    { 
      title: 'Mapa', 
      description: 'Zobrazování trasy a bodů zájmu pro snadnou orientaci.', 
      icon: FaMapMarkerAlt,
      to: '/mapa' 
    },
    { 
      title: 'Trasa', 
      description: 'Plánování cesty, nastavení cílů a správa itineráře.', 
      icon: FaRoute,
      to: '/trasa'
    },
    { 
      title: 'Oblíbené', 
      description: 'Uložení oblíbených míst pro rychlý přístup a budoucí cesty.', 
      icon: FaHeart,
      to: '/oblibene'
    },
  ];

  // --- 3. LOGIKA TLAČÍTKA "ZAČÍT" ---
  const handleStartClick = () => {
    // Tady se rozhodujeme, kam uživatele pošleme
    if (currentUser) {
      // Když už je přihlášený, jde rovnou na mapu
      navigate('/mapa');
    } else {
      // Když není, musí se nejdřív přihlásit
      navigate('/login');
    }
  };

  // --- 4. VYKRESLENÍ (UI) ---
  return (
    <div className="main-page">
      {/* Hero sekce (ta velká horní část) */}
      <header className="hero-header container py-5 pt-lg-5">
        
        <div className="row justify-content-center align-items-center">
            
          <div className="col-12 col-lg-6 text-center text-lg-start"> 
            <h1 className="text-primary-dark mb-3 display-3 fw-bold">TripTrack</h1>
            <p className="lead text-muted mb-4 fs-5">
              Plánuj, sleduj a objevuj své cesty. Vše na jednom místě.
            </p>
            
            {/* ZMĚNA: Použil jsem <button> místo <a>.
               Protože tohle tlačítko dělá akci (kontroluje přihlášení), 
               hodí se víc button s onClickem.
            */}
            <button 
              onClick={handleStartClick} 
              className="btn btn-dark btn-lg px-5 py-3 rounded-pill fw-bold shadow-sm"
            >
              Začít
            </button>
          </div>

          <div className="col-12 col-lg-6 mt-4 mt-lg-0 ">
            <div className="hero-img-wrapper d-flex justify-content-center justify-content-lg-end"> 
              <img
                src={heroImage}
                alt="Cestovatelka s mapou a trasou"
                className="img-fluid"
                style={{ maxWidth: '600px', height: 'auto' }} 
              />
            </div>
          </div>

        </div>
        
      </header>

      {/* Sekce s kartami (Features) */}
      <section className="container py-5 mt-5">
        <div className="row g-4 justify-content-center">
          {/* Tady "mapujeme" přes naše pole features. Pro každou položku vyrobíme jeden sloupec. */}
          {features.map((feature) => (
            <div className="col-md-4" key={feature.title}>
              <Link to={feature.to} className="feature-card-link text-decoration-none h-100 d-block">
                <div className="feature-card text-center p-4 h-100 border rounded-4 shadow-sm bg-white transition-hover">
                  
                  <div className="feature-icon-wrapper mb-3 mx-auto p-3 rounded-circle bg-accent-light" style={{ width: 'fit-content' }}>
                    <feature.icon className="text-accent" size={30} /> 
                  </div>
                  
                  <h5 className="text-dark mb-2 fw-bold">{feature.title}</h5>
                  <p className="text-muted small mb-0">{feature.description}</p>
                  
                </div>
              </Link>

            </div>
          ))}
        </div>
      </section>
    </div>
  );
}