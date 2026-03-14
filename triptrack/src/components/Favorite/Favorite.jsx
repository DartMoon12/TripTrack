// src/components/Favorite/Favorite.jsx

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaClock, FaRulerHorizontal, FaStar, FaMapMarkerAlt, FaUserCircle } from 'react-icons/fa';
import { useRoutesStorage } from '../../Hooks/RouteStorageContext';
import './Favorite.css';

export default function Favorite() {
  const {
      userRoutes, publicRoutes, favoritePublicRouteIds,
      loadingUserRoutes, loadingPublicRoutes, loadingFavorites,
      deleteRoute, toggleFavorite,
      fetchPublicRoutes 
  } = useRoutesStorage();

  useEffect(() => {
    if (publicRoutes.length === 0) {
        fetchPublicRoutes();
    }
  }, [publicRoutes.length, fetchPublicRoutes]);
  
  const favoriteUserRoutes = (userRoutes || []).filter(route => route.isFavorite);
  const favoritePublicRoutesData = (publicRoutes || [])
        .filter(route => favoritePublicRouteIds.has(route.id));
  const allFavoriteRoutes = [...favoriteUserRoutes, ...favoritePublicRoutesData];

  const handleDelete = (routeId, isPublic = false) => {
    if (isPublic) {
        if (window.confirm('Opravdu chcete odebrat tuto veřejnou trasu z oblíbených?')) {
            toggleFavorite(routeId, true);
        }
    } else {
        if (window.confirm('Opravdu chcete tuto vaši trasu smazat? (Tím ji smažete úplně)')) {
            deleteRoute(routeId, false);
        }
    }
  };

  const renderFavoriteCard = (route) => {
    const isMyRoute = userRoutes.some(r => r.id === route.id);
    
    // 💥 OPRAVA 1: Zde je obal kartičky (col-...) upravený tak, aby se obsah uvnitř natahoval (h-100)
    return (
      <div className="col-12 col-md-6 col-lg-4 d-flex align-items-stretch" key={route.id}>
        <div className="route-card-modern w-100 h-100 d-flex flex-column">
          
          <div className="card-img-wrapper" style={{ height: '200px', flexShrink: 0 }}>
            {route.image ? (
              <img src={route.image} className="w-100 h-100 object-fit-cover" alt={route.name} />
            ) : (
              <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted bg-light">
                 <FaMapMarkerAlt size={40} className="mb-2 opacity-25" />
                 <span className="small opacity-50">Bez náhledu</span>
              </div>
            )}
            
            {route.avgRating > 0 && (
              <div className="rating-badge position-absolute top-0 start-0 m-3 bg-white px-2 py-1 rounded-pill shadow-sm">
                <FaStar className="me-1 mb-1 text-warning" /> 
                <span className="fw-bold text-dark">{Number(route.avgRating).toFixed(1)}</span>
                <span className="text-muted ms-1 fw-normal" style={{ fontSize: '0.8rem' }}>({route.reviewCount || 0})</span>
              </div>
            )}

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

          {/* 💥 OPRAVA 2: Flex-grow-1 zajistí, že toto tělo vyplní všechen volný prostor */}
          <div className="card-body p-4 d-flex flex-column flex-grow-1">
            <h5 className="fw-bold text-dark mb-2 text-truncate">{route.name}</h5>
            
            <div className="d-flex flex-wrap gap-2 mb-3">
                {route.tags && route.tags.length > 0 ? (
                    route.tags.map(t => <span key={t} className="tag-pill badge bg-light text-dark border">{t}</span>)
                ) : (
                    <span className="small text-muted opacity-50 fst-italic">Bez štítků</span>
                )}
            </div>

            <div className="d-flex gap-4 text-muted small mb-4">
              <span className="d-flex align-items-center"><FaRulerHorizontal className="text-warning me-2" /> {route.distance}</span>
              <span className="d-flex align-items-center"><FaClock className="text-warning me-2" /> {route.duration}</span>
            </div>
            
            {/* 💥 OPRAVA 3: Aby autor nezabíral místo těsně před tlačítkem, dáme mu margin */}
            {!isMyRoute && route.userName && (
                <div className="d-flex align-items-center small text-muted mb-4 opacity-75">
                    <FaUserCircle className="me-2" /> Autor: {route.userName}
                </div>
            )}

            {/* 💥 OPRAVA 4: mt-auto odtlačí tento div s tlačítky úplně dolů */}
            <div className="mt-auto d-flex gap-2 align-items-center w-100">
              <Link to={`/mapa?routeId=${route.id}`} className="btn btn-dark flex-grow-1 text-center text-decoration-none rounded-pill fw-bold">
                Zobrazit
              </Link>

              {isMyRoute && (
                <button 
                  onClick={() => handleDelete(route.id, false)} 
                  className="btn btn-outline-danger rounded-circle d-flex align-items-center justify-content-center" 
                  style={{ width: '40px', height: '40px' }}
                  title="Smazat trasu"
                >
                  <FaTrash size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="favorites-page-wrapper pt-5" style={{ minHeight: '80vh' }}>
      <div className="container">
        <div className="row mb-5">
            <div className="col-12 text-center text-md-start">
                <h1 className="page-title display-5 mb-3 fw-bold text-dark">Oblíbené trasy</h1>
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
              <h4 className="text-dark fw-bold">Zatím žádné oblíbené trasy</h4>
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