import React from 'react';
import './../../index.css';
import heroImage from '../../assets/hero.svg';

export default function MainPage() {
  return (
    <div className="main-page hero">
      {/* Hero sekce */}
      <header className="hero-header container">
        <div className="hero-text">
          <h1 className="text-primary-dark mb-4">TripTrack</h1>
          <p className="lead text-muted mb-4">
            Plánuj, sleduj a objevuj své cesty. Vše na jednom místě.
          </p>
          <button className="btn-dark">Začít</button>
        </div>

        <div className="hero-img-wrapper">
          <img
            src={heroImage}
            alt="Cestovatelka s mapou"
            className="hero-img"
          />
        </div>
      </header>

      {/* Feature Cards */}
      <section className="container py-5">
        <div className="row g-4 justify-content-center">
          <div className="col-md-4">
            <div className="feature-card text-center p-5 h-100">
              <h5 className="text-accent mb-3">Mapa</h5>
              <p className="text-muted">
                Zobrazení trasy na mapě pro snadnou orientaci.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card text-center p-5 h-100">
              <h5 className="text-accent mb-3">Trasa</h5>
              <p className="text-muted">
                Plánování trasy podle vašich potřeb.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card text-center p-5 h-100">
              <h5 className="text-accent mb-3">Oblíbené</h5>
              <p className="text-muted">
                Uložení oblíbených míst pro rychlý přístup.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
