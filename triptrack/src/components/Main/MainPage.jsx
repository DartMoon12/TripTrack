import React from 'react';
import { FaMapMarkerAlt, FaRoute, FaHeart } from 'react-icons/fa'; 
import heroImage from '../../assets/hero.svg'; 
import './MainPage.css'; 
// 💥 Importujeme useAuth a useNavigate pro kontrolu stavu a přesměrování
import { useAuth } from '../Auth/AuthContext'; 
import { useNavigate } from 'react-router-dom';

export default function MainPage() {
  
  // 💥 Využití hooků
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const features = [
    // ... (data o kartách zůstávají stejná)
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

  // 💥 Nová funkce pro zpracování kliknutí na tlačítko "Začít"
  const handleStartClick = (e) => {
    e.preventDefault();
    if (currentUser) {
      // Uživatel JE přihlášený: Přesměrovat na hlavní chráněnou stránku
      navigate('/mapa'); // Změňte na libovolnou chráněnou route, např. /mapa
    } else {
      // Uživatel NENÍ přihlášený: Přesměrovat na přihlášení/registraci
      navigate('/login'); // Nebo /register
    }
  };

  return (
    <div className="main-page">
      <header className="hero-header container py-5 pt-lg-5">
        
        <div className="row justify-content-center align-items-center">
            
          <div className="col-12 col-lg-6 text-center text-lg-start"> 
            <h1 className="text-primary-dark mb-3 display-3 fw-bold">TripTrack</h1>
            <p className="lead text-muted mb-4 fs-5">
              Plánuj, sleduj a objevuj své cesty. Vše na jednom místě.
            </p>
            {/* 💥 ZMĚNA: Tlačítko teď volá handleStartClick a není pevný odkaz */}
            <a 
              href={currentUser ? '/mapa' : '/login'} 
              onClick={handleStartClick} 
              className="btn btn-dark btn-lg"
            >
              Začít
            </a>
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

      <section className="container py-5 mt-5">
        <div className="row g-4 justify-content-center">
          {features.map((feature) => (
            <div className="col-md-4" key={feature.title}>
              <a href={feature.to} className="feature-card-link text-decoration-none h-100">
                <div className="feature-card text-center p-4 h-100 border rounded-3 shadow-sm bg-white">
                  
                  <div className="feature-icon-wrapper mb-3 mx-auto p-3 rounded-3 bg-accent-light">
                    <feature.icon className="text-accent" size={30} /> 
                  </div>
                  
                  <h5 className="text-dark mb-2 fw-bold">{feature.title}</h5>
                  <p className="text-muted small mb-0">{feature.description}</p>
                  
                </div>
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}