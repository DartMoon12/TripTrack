// src/components/Favorite/Favorite.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaMapMarkedAlt, FaClock, FaRulerHorizontal, FaStar } from 'react-icons/fa';
import { useRoutesStorage } from '../../Hooks/RouteStorageContext';
import './Favorite.css'; // Ujisti se, že cesta a název jsou správné

export default function Favorite() { // Přejmenoval jsem komponentu na Favorite
  const {
      userRoutes, publicRoutes, favoritePublicRouteIds, // Načteme všechna data
      loadingUserRoutes, loadingPublicRoutes, loadingFavorites, // Stavy načítání
      deleteRoute, toggleFavorite
  } = useRoutesStorage();

  // 1. Získáme oblíbené SOUKROMÉ trasy
  const favoriteUserRoutes = (userRoutes || []).filter(route => route.isFavorite);

  // 2. Získáme oblíbené VEŘEJNÉ trasy
  const favoritePublicRoutesData = (publicRoutes || [])
        .filter(route => favoritePublicRouteIds.has(route.id));

  // 3. Spojíme obě pole pro zobrazení
  const allFavoriteRoutes = [...favoriteUserRoutes, ...favoritePublicRoutesData];

  const handleDelete = (routeId, isPublic = false) => {
    // Rozhodnutí, zda mazat jen z oblíbených (veřejná) nebo úplně (soukromá)
    if (isPublic) {
        // Pokud je veřejná, chceme ji jen odebrat z oblíbených
        if (window.confirm('Opravdu chcete odebrat tuto veřejnou trasu z oblíbených?')) {
            toggleFavorite(routeId, true); // Voláme toggle s příznakem isPublic
        }
    } else {
        // Pokud je soukromá, ptáme se na smazání
        if (window.confirm('Opravdu chcete tuto vaši trasu smazat? (Tím ji smažete úplně)')) {
            deleteRoute(routeId, false);
        }
    }
  };

  // Helper pro vykreslení karty (podobný jako v RoutesPage)
  const renderFavoriteCard = (route) => {
    const isMyRoute = userRoutes.some(r => r.id === route.id); // Zjistíme, zda je to moje trasa
    return (
      <div className="col-12 col-md-6 col-lg-4" key={route.id}>
        <div className="route-card card h-100 shadow-sm border-0">
          <div className="card-body p-4 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <h5 className="card-title fw-bold text-dark mb-0">{route.name}</h5>
              {/* Vždy žlutá hvězdička, kliknutím se odebere */}
              <button
                className="btn btn-link p-0 text-decoration-none"
                onClick={() => toggleFavorite(route.id, !isMyRoute)} // Správně předáme příznak
                title="Odebrat z oblíbených"
              >
                <FaStar className="text-warning" size={22} />
              </button>
            </div>
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
               {!isMyRoute && route.userId && <p className="text-muted small mt-1 mb-0">Autor: ID {route.userId.substring(0, 6)}...</p>}
            </div>
            <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
              <span className="text-secondary small">
                Uloženo: {route.savedDate || 'N/A'}
              </span>
              <div className="d-flex gap-2">
                <Link to={`/mapa?routeId=${route.id}`} className="btn btn-sm btn-outline-dark">
                    Zobrazit
                </Link>
                {/* Tlačítko Smazat je zde jen pro vlastní trasy */}
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
  }; // Konec renderFavoriteCard

  return (
    <div className="favorites-page-wrapper">
      <div className="container py-5">
        <h1 className="text-primary-dark fw-bold mb-4">Oblíbené trasy</h1>
        <p className="lead text-muted mb-5">
          Vaše oblíbené trasy na jednom místě.
        </p>

        {/* Zobrazení během načítání */}
        {loadingUserRoutes || loadingPublicRoutes || loadingFavorites ? (
            <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Načítám...</span>
                </div>
                <p className="mt-2 text-muted">Načítám vaše oblíbené trasy...</p>
            </div>
        ) : allFavoriteRoutes.length === 0 ? (
          <div className="alert alert-info">
              Zatím nemáte žádné oblíbené trasy. Označte nějakou trasu hvězdičkou!
          </div>
        ) : (
          <div className="row g-4">
            {allFavoriteRoutes.map((route) => renderFavoriteCard(route))}
          </div>
        )}
      </div>
    </div>
  );
}