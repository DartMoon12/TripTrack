// src/components/Favorite/Favorite.jsx

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaClock, FaRulerHorizontal, FaStar, FaMapMarkerAlt, FaUserCircle } from 'react-icons/fa';
import { useRoutesStorage } from '../../Hooks/RouteStorageContext';
import './Favorite.css';

export default function Favorite() {
  // --- 1. NAČTENÍ DAT ---
  // Vytáhneme si z kontextu všechno potřebné.
  const {
      userRoutes, publicRoutes, favoritePublicRouteIds,
      loadingUserRoutes, loadingPublicRoutes, loadingFavorites,
      deleteRoute, toggleFavorite,
      // 💥 PŘIDÁNO: Musíme si vytáhnout funkci pro stažení tras
      fetchPublicRoutes 
  } = useRoutesStorage();

  // --- 1.5. OPRAVA: DOČTENÍ DAT (Lazy Loading) ---
  // Tady řešíme ten problém, že když jdeš rovnou do Oblíbených, veřejné trasy se ještě nestihly načíst.
  useEffect(() => {
    // Pokud je seznam veřejných tras prázdný, řekneme aplikaci: "Běž je stáhnout!"
    if (publicRoutes.length === 0) {
        fetchPublicRoutes();
    }
  }, [publicRoutes.length, fetchPublicRoutes]);

  // --- 2. FILTROVÁNÍ (To kouzlo stránky Oblíbené) ---
  
  // A) Moje trasy: Necháme si jen ty, kde je isFavorite === true
  const favoriteUserRoutes = (userRoutes || []).filter(route => route.isFavorite);

  // B) Veřejné trasy: Necháme si jen ty, jejichž ID máme v seznamu oblíbených
  const favoritePublicRoutesData = (publicRoutes || [])
        .filter(route => favoritePublicRouteIds.has(route.id));

  // C) Spojení: Slepíme obě pole dohromady
  const allFavoriteRoutes = [...favoriteUserRoutes, ...favoritePublicRoutesData];

  // --- 3. MAZÁNÍ ---
  const handleDelete = (routeId, isPublic = false) => {
    if (isPublic) {
        // Cizí trasa -> jen odebrat hvězdičku
        if (window.confirm('Opravdu chcete odebrat tuto veřejnou trasu z oblíbených?')) {
            toggleFavorite(routeId, true);
        }
    } else {
        // Moje trasa -> smazat úplně
        if (window.confirm('Opravdu chcete tuto vaši trasu smazat? (Tím ji smažete úplně)')) {
            deleteRoute(routeId, false);
        }
    }
  };

  // --- 4. VYKRESLENÍ JEDNÉ KARTY ---
  const renderFavoriteCard = (route) => {
    const isMyRoute = userRoutes.some(r => r.id === route.id);
    
    return (
      <div className="col-12 col-md-6 col-lg-4 d-flex align-items-stretch" key={route.id}>
        <div className="route-card-modern w-100">
          
          {/* Obrázek */}
          <div className="card-img-wrapper">
            {route.image ? (
              <img src={route.image} className="w-100 h-100 object-fit-cover" alt={route.name} />
            ) : (
              <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted bg-light">
                 <FaMapMarkerAlt size={40} className="mb-2 opacity-25" />
                 <span className="small opacity-50">Bez náhledu</span>
              </div>
            )}
            
            {/* Hodnocení */}
            {route.avgRating > 0 && (
              <div className="rating-badge position-absolute top-0 start-0 m-3">
                <FaStar className="me-1 mb-1" /> 
                {Number(route.avgRating).toFixed(1)} 
                <span className="opacity-50 ms-1 fw-normal">({route.reviewCount || 0})</span>
              </div>
            )}

            {/* Tlačítko Hvězdička */}
            <button 
                className="btn position-absolute top-0 end-0 m-3 p-2 rounded-circle bg-white shadow-sm border-0 d-flex align-items-center justify-content-center"
                style={{ width: '38px', height: '38px' }}
                onClick={(e) => { 
                    e.stopPropagation(); 
                    toggleFavorite(route.id, !isMyRoute); 
                }}
                title="Odebrat z oblíbených"
            >
                <FaStar size={18} className="text-warning" />
            </button>
          </div>

          {/* Texty a tlačítka */}
          <div className="card-body p-4 d-flex flex-column">
            <h5 className="fw-bold text-dark mb-2 text-truncate">{route.name}</h5>
            
            <div className="d-flex flex-wrap gap-2 mb-3">
                {route.tags && route.tags.length > 0 ? (
                    route.tags.map(t => <span key={t} className="tag-pill">{t}</span>)
                ) : (
                    <span className="small text-muted opacity-50 fst-italic">Bez štítků</span>
                )}
            </div>

            <div className="d-flex gap-4 text-muted small mb-4">
              <span className="d-flex align-items-center"><FaRulerHorizontal className="text-warning me-2" /> {route.distance}</span>
              <span className="d-flex align-items-center"><FaClock className="text-warning me-2" /> {route.duration}</span>
            </div>
            
            {!isMyRoute && route.userName && (
                <div className="d-flex align-items-center small text-muted mb-3 opacity-75">
                    <FaUserCircle className="me-2" /> Autor: {route.userName}
                </div>
            )}

            <div className="mt-auto d-flex gap-2 align-items-center">
              <Link to={`/mapa?routeId=${route.id}`} className="btn-action-primary flex-grow-1 text-center text-decoration-none">
                Zobrazit
              </Link>

              {isMyRoute && (
                <button onClick={() => handleDelete(route.id, false)} className="btn-delete" title="Smazat trasu">
                  <FaTrash size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- 5. HLAVNÍ VYKRESLENÍ ---
  return (
    <div className="favorites-page-wrapper pt-5">
      <div className="container">
        <div className="row mb-5">
            <div className="col-12 text-center text-md-start">
                <h1 className="page-title display-5 mb-3">Oblíbené trasy</h1>
                <p className="lead text-muted">Vaše oblíbené trasy na jednom místě.</p>
            </div>
        </div>

        {loadingUserRoutes || loadingPublicRoutes || loadingFavorites ? (
            <div className="text-center p-5">
                <div className="spinner-border text-warning" role="status"></div>
            </div>
        ) : allFavoriteRoutes.length === 0 ? (
          <div className="text-center py-5">
              <div className="display-1 mb-3 opacity-25">⭐</div>
              <h4 className="text-muted fw-bold">Zatím žádné oblíbené trasy</h4>
              <p className="text-muted">Označte trasy hvězdičkou a najdete je zde.</p>
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