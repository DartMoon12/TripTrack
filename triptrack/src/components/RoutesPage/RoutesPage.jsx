// src/components/RoutesPage/RoutesPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaMapMarkedAlt, FaClock, FaRulerHorizontal, FaStar } from 'react-icons/fa';
import { useRoutesStorage } from '../../Hooks/RouteStorageContext';
import './RoutesPage.css';

export default function RoutesPage() {
  const {
      userRoutes, publicRoutes, favoritePublicRouteIds, // 💥 Načteme ID oblíbených veřejných
      loadingUserRoutes, loadingPublicRoutes, loadingFavorites, // Stavy načítání
      fetchPublicRoutes, deleteRoute, toggleFavorite
  } = useRoutesStorage();
  const [activeTab, setActiveTab] = useState('myRoutes');

  // Efekt pro načtení veřejných tras
  useEffect(() => {
    if (activeTab === 'communityRoutes') {
        // Načteme jen jednou, pokud nejsou načteny a neprobíhá načítání
        if (publicRoutes.length === 0 && !loadingPublicRoutes) {
             fetchPublicRoutes();
        }
    }
  }, [activeTab, fetchPublicRoutes, publicRoutes.length, loadingPublicRoutes]);

  const handleDelete = (routeId, isPublic = false) => {
    if (window.confirm('Opravdu chcete tuto trasu smazat? Tato akce je nevratná.')) {
        // 💥 Pozor: mazání veřejných tras by mělo být omezeno jen na autora
        // Prozatím voláme deleteRoute s příznakem
        deleteRoute(routeId, isPublic);
    }
  };

  // Helper funkce pro vykreslení karty trasy
  const renderRouteCard = (route, isMyRoute = true) => {
    // 💥 Zjistíme, zda je VEŘEJNÁ trasa oblíbená
    const isPublicFavorite = !isMyRoute && favoritePublicRouteIds.has(route.id);

    return (
      <div className="col-12 col-md-6 col-lg-4" key={route.id}>
        <div className="route-card card h-100 shadow-sm border-0">
          <div className="card-body p-4 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <h5 className="card-title fw-bold text-dark mb-0">{route.name}</h5>
              {/* Tlačítko Oblíbené */}
              <button
                className="btn btn-link p-0 text-decoration-none favorite-button" // Přidána třída pro případné stylování
                // 💥 Voláme toggleFavorite s příznakem, zda jde o veřejnou trasu
                onClick={() => toggleFavorite(route.id, !isMyRoute)}
                title={ (isMyRoute ? route.isFavorite : isPublicFavorite) ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
              >
                <FaStar
                  // 💥 Barva hvězdičky závisí na typu trasy
                  className={ (isMyRoute ? route.isFavorite : isPublicFavorite) ? 'text-warning' : 'text-secondary opacity-50'}
                  size={22}
                />
              </button>
            </div>
            {/* Detaily trasy */}
            <div className="route-details mb-3">
              <div className="d-flex align-items-center text-muted small mb-1">
                <FaRulerHorizontal className="me-2 text-accent" />
                <span>Vzdálenost: <strong>{route.distance}</strong></span>
              </div>
              <div className="d-flex align-items-center text-muted small mb-2">
                <FaClock className="me-2 text-accent" />
                <span>Čas: <strong>{route.duration}</strong></span>
              </div>
              {route.description && (
                <p className="card-text text-muted small mt-2 mb-0 route-description">
                  {route.description}
                </p>
              )}
              {/* Můžeme zobrazit autora u veřejných tras */}
              {!isMyRoute && route.userId && <p className="text-muted small mt-1 mb-0">Autor: ID {route.userId.substring(0, 6)}...</p>}
            </div>
            {/* Patička karty */}
            <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
              <span className="text-secondary small">
                Uloženo: {route.savedDate || 'N/A'}
              </span>
              <div className="d-flex gap-2">
                <Link to={`/mapa?routeId=${route.id}`} className="btn btn-sm btn-outline-dark">
                    Zobrazit
                </Link>
                {/* Mazání povolíme jen u vlastních tras (nebo pokud je uživatel autor veřejné - TODO) */}
                {isMyRoute && (
                  <button
                    onClick={() => handleDelete(route.id, false)}
                    className="btn btn-sm btn-outline-danger"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }; // Konec renderRouteCard

  return (
    <div className="routes-page-wrapper">
      <div className="container py-5">
        <h1 className="text-primary-dark fw-bold mb-4">Prohlížeč tras</h1>
        <p className="lead text-muted mb-4">
          Spravujte své uložené trasy nebo objevujte nové od ostatních cestovatelů.
        </p>

        {/* Navigace pro záložky */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'myRoutes' ? 'active' : ''}`}
              onClick={() => setActiveTab('myRoutes')}
            >
              Moje trasy
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'communityRoutes' ? 'active' : ''}`}
              onClick={() => setActiveTab('communityRoutes')}
            >
              Trasy ostatních
            </button>
          </li>
        </ul>

        {/* Obsah záložek */}
        <div className="tab-content">

          {/* Panel 1: Moje trasy */}
          <div className={`tab-pane fade ${activeTab === 'myRoutes' ? 'show active' : ''}`} id="myRoutes">
            {loadingUserRoutes || loadingFavorites ? ( // Čekáme i na načtení oblíbených
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Načítám...</span></div>
                <p className="mt-2 text-muted">Načítám vaše trasy...</p>
              </div>
            ) : userRoutes.length === 0 ? (
              <div className="alert alert-info">
                  Zatím nemáte žádné uložené trasy...
              </div>
            ) : (
              <div className="row g-4">
                {userRoutes.map((route) => renderRouteCard(route, true))}
              </div>
            )}
          </div>

          {/* Panel 2: Trasy ostatních */}
          <div className={`tab-pane fade ${activeTab === 'communityRoutes' ? 'show active' : ''}`} id="communityRoutes">
            {loadingPublicRoutes || loadingFavorites ? ( // Čekáme i na načtení oblíbených
                <div className="text-center p-5">
                  <div className="spinner-border text-secondary" role="status"><span className="visually-hidden">Načítám...</span></div>
                  <p className="mt-2 text-muted">Načítám veřejné trasy...</p>
                </div>
            ) : publicRoutes.length === 0 ? (
              <div className="alert alert-secondary">
                  Zatím nejsou k dispozici žádné veřejné trasy.
              </div>
            ) : (
              <div className="row g-4">
                {publicRoutes.map((route) => renderRouteCard(route, false))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}