// src/components/Main/MainPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaMapMarkedAlt, FaRoute, FaStar, FaUsers, FaFileExport, FaMoon,
  FaMousePointer, FaSave, FaShareAlt, FaArrowRight,
} from 'react-icons/fa';
import { useAuth } from '../Auth/AuthContext';
import HeroIllustration from './HeroIllustration';
import './MainPage.css';

const FEATURES = [
  { icon: FaMapMarkedAlt, title: 'Plánování na mapě', text: 'Klikej body na mapě, přetahuj je a nech si spočítat trasu autem, pěšky, na kole nebo MHD.' },
  { icon: FaUsers, title: 'Trasy komunity', text: 'Procházej trasy ostatních, hodnoť je hvězdičkami a piš recenze.' },
  { icon: FaStar, title: 'Oblíbené', text: 'Ulož si nejlepší trasy na jedno místo, ať je máš vždy po ruce.' },
  { icon: FaFileExport, title: 'Export do GPX', text: 'Stáhni trasu jako GPX a otevři ji v Mapy.cz, Garminu nebo Stravě.' },
  { icon: FaShareAlt, title: 'Sdílení odkazem', text: 'Pošli kamarádům odkaz na trasu – otevře se jim rovnou na mapě.' },
  { icon: FaMoon, title: 'Tmavý režim', text: 'Příjemné na oči večer i v noci, včetně tmavé mapy.' },
];

const STEPS = [
  { icon: FaMousePointer, title: 'Naklikej body', text: 'Vyhledej místo nebo klikni do mapy. Body můžeš přetahovat a mazat.' },
  { icon: FaRoute, title: 'Spočítej trasu', text: 'Vyber způsob dopravy a hned uvidíš vzdálenost a čas.' },
  { icon: FaSave, title: 'Ulož a sdílej', text: 'Přidej název, štítky a fotku. Trasu si nech pro sebe, nebo ji zveřejni.' },
];

export default function MainPage() {
  const { currentUser } = useAuth();
  const startLink = currentUser ? '/mapa' : '/register';

  return (
    <div className="home">
      {/* HERO */}
      <section className="home-hero">
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6">
              <span className="eyebrow"><FaRoute /> Plánovač výletů</span>
              <h1 className="home-title">
                Naplánuj trasu.<br />
                <span className="home-title-accent">Vyraž na cestu.</span>
              </h1>
              <p className="home-lead">
                TripTrack je jednoduchý plánovač tras. Naklikej body na mapě, ulož si
                trasu se štítky a fotkou a sdílej ji s ostatními cestovateli.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to={startLink} className="btn btn-accent btn-lg px-4">
                  {currentUser ? 'Otevřít mapu' : 'Začít zdarma'} <FaArrowRight className="ms-2" size={14} />
                </Link>
                <Link to={currentUser ? '/trasa' : '/login'} className="btn btn-ghost btn-lg px-4">
                  {currentUser ? 'Moje trasy' : 'Mám účet'}
                </Link>
              </div>
              <ul className="home-checks">
                <li>Auto, pěšky, kolo i MHD</li>
                <li>Export do GPX</li>
                <li>Tmavý režim</li>
              </ul>
            </div>
            <div className="col-lg-6">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* JAK TO FUNGUJE */}
      <section className="home-section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Jak to funguje</span>
            <h2>Tři kroky k hotové trase</h2>
          </div>
          <div className="row g-4">
            {STEPS.map((step, i) => (
              <div className="col-md-4" key={step.title}>
                <div className="step-card">
                  <span className="step-number">{i + 1}</span>
                  <step.icon className="step-icon" />
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNKCE */}
      <section className="home-section pt-0">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Funkce</span>
            <h2>Všechno, co potřebuješ na výlet</h2>
          </div>
          <div className="row g-4">
            {FEATURES.map((f) => (
              <div className="col-sm-6 col-lg-4" key={f.title}>
                <div className="feature-card">
                  <div className="feature-icon"><f.icon /></div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VÝZVA */}
      <section className="home-section pt-0">
        <div className="container">
          <div className="cta-banner">
            <div>
              <h2>Kam vyrazíš příště?</h2>
              <p>Otevři mapu a naplánuj první trasu za pár vteřin.</p>
            </div>
            <Link to={startLink} className="btn btn-light btn-lg px-4 fw-bold">
              {currentUser ? 'Otevřít mapu' : 'Vytvořit účet'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
