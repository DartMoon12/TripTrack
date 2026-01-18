// src/components/RoutesPage/RoutesPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaClock, FaRulerHorizontal, FaStar, FaSearch, FaFilter, FaTag } from 'react-icons/fa';
import { useRoutesStorage } from '../../Hooks/RouteStorageContext';
import './RoutesPage.css';

export default function RoutesPage() {
  const {
      userRoutes, publicRoutes, favoritePublicRouteIds,
      loadingUserRoutes, loadingPublicRoutes, loadingFavorites,
      fetchPublicRoutes, deleteRoute, toggleFavorite
  } = useRoutesStorage();

  const [activeTab, setActiveTab] = useState('myRoutes');
  
  // 💥 STAVY PRO FILTROVÁNÍ (Úkol č. 3)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilterTag, setSelectedFilterTag] = useState("");

  useEffect(() => {
    if (activeTab === 'communityRoutes') {
        if (publicRoutes.length === 0 && !loadingPublicRoutes) {
             fetchPublicRoutes();
        }
    }
  }, [activeTab, fetchPublicRoutes, publicRoutes.length, loadingPublicRoutes]);

  // 💥 LOGIKA FILTROVÁNÍ (Úkol č. 3)
  const filteredRoutes = useMemo(() => {
    const currentRoutes = activeTab === 'myRoutes' ? userRoutes : publicRoutes;
    
    return currentRoutes.filter(route => {
      const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (route.description && route.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTag = selectedFilterTag === "" || (route.tags && route.tags.includes(selectedFilterTag));
      
      return matchesSearch && matchesTag;
    });
  }, [activeTab, userRoutes, publicRoutes, searchTerm, selectedFilterTag]);

  // Získání unikátních štítků pro filtrační menu
  const allAvailableTags = useMemo(() => {
    const currentRoutes = activeTab === 'myRoutes' ? userRoutes : publicRoutes;
    const tags = new Set();
    currentRoutes.forEach(r => r.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [activeTab, userRoutes, publicRoutes]);

  const handleDelete = (routeId, isPublic = false) => {
    if (window.confirm('Opravdu chcete tuto trasu smazat? Tato akce je nevratná.')) {
        deleteRoute(routeId, isPublic);
    }
  };

  const renderRouteCard = (route, isMyRoute = true) => {
    const isPublicFavorite = !isMyRoute && favoritePublicRouteIds.has(route.id);

    return (
      <div className="col-12 col-md-6 col-lg-4" key={route.id}>
        <div className="route-card card h-100 shadow-sm border-0 overflow-hidden">
          
          <div className="card-img-top-wrapper" style={{ height: '180px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
            {route.image ? (
                <img src={route.image} alt={route.name} className="w-100 h-100" style={{ objectFit: 'cover' }} />
            ) : (
                <div className="text-muted text-center p-3">
                    <span style={{ fontSize: '3rem', display: 'block' }}>🗺️</span>
                </div>
            )}
            {/* 💥 ZOBRAZENÍ ŠTÍTKŮ NA OBRÁZKU (Úkol č. 1) */}
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {route.tags?.map(tag => (
                    <span key={tag} className="badge bg-warning text-dark shadow-sm" style={{ fontSize: '0.7rem' }}>
                        {tag}
                    </span>
                ))}
            </div>
          </div>

          <div className="card-body p-4 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h5 className="card-title fw-bold text-dark mb-0">{route.name}</h5>
              <button
                className="btn btn-link p-0 text-decoration-none favorite-button"
                onClick={() => toggleFavorite(route.id, !isMyRoute)}
              >
                <FaStar className={(isMyRoute ? route.isFavorite : isPublicFavorite) ? 'text-warning' : 'text-secondary opacity-50'} size={20} />
              </button>
            </div>
            
            <div className="route-details mb-3">
              <div className="d-flex align-items-center text-muted small mb-1">
                <FaRulerHorizontal className="me-2 text-accent" />
                <span><strong>{route.distance}</strong></span>
                <FaClock className="ms-3 me-2 text-accent" />
                <span><strong>{route.duration}</strong></span>
              </div>
              {route.description && (
                <p className="card-text text-muted small mt-2 mb-0 text-truncate-2">
                  {route.description}
                </p>
              )}
            </div>

            <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                {route.savedDate || 'N/A'}
              </span>
              <div className="d-flex gap-2">
                <Link to={`/mapa?routeId=${route.id}`} className="btn btn-sm btn-outline-dark px-3">
                    Zobrazit
                </Link>
                {isMyRoute && (
                  <button onClick={() => handleDelete(route.id, false)} className="btn btn-sm btn-outline-danger">
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="routes-page-wrapper">
      <div className="container py-5">
        <h1 className="text-primary-dark fw-bold mb-4">Prohlížeč tras</h1>
        
        {/* 💥 FILTRAČNÍ PANEL (Úkol č. 3) */}
        <div className="row mb-4 g-3">
            <div className="col-md-6">
                <div className="input-group shadow-sm">
                    <span className="input-group-text bg-white border-end-0"><FaSearch className="text-muted" /></span>
                    <input 
                        type="text" 
                        className="form-control border-start-0 ps-0" 
                        placeholder="Hledat podle názvu nebo popisu..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="col-md-4">
                <div className="input-group shadow-sm">
                    <span className="input-group-text bg-white border-end-0"><FaFilter className="text-muted" /></span>
                    <select 
                        className="form-select border-start-0 ps-0"
                        value={selectedFilterTag}
                        onChange={(e) => setSelectedFilterTag(e.target.value)}
                    >
                        <option value="">Všechny štítky</option>
                        {allAvailableTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="col-md-2">
                <button 
                    className="btn btn-outline-secondary w-100 shadow-sm"
                    onClick={() => { setSearchTerm(""); setSelectedFilterTag(""); }}
                >
                    Reset
                </button>
            </div>
        </div>

        <ul className="nav nav-tabs mb-4 border-bottom-0 gap-2">
          <li className="nav-item">
            <button className={`nav-link rounded-pill px-4 ${activeTab === 'myRoutes' ? 'active bg-dark text-white' : 'text-muted'}`} onClick={() => setActiveTab('myRoutes')}>Moje trasy</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link rounded-pill px-4 ${activeTab === 'communityRoutes' ? 'active bg-dark text-white' : 'text-muted'}`} onClick={() => setActiveTab('communityRoutes')}>Trasy ostatních</button>
          </li>
        </ul>

        <div className="tab-content">
          <div className={`tab-pane fade ${activeTab === 'myRoutes' || activeTab === 'communityRoutes' ? 'show active' : ''}`}>
            {(activeTab === 'myRoutes' ? loadingUserRoutes : loadingPublicRoutes) || loadingFavorites ? (
              <div className="text-center p-5"><div className="spinner-border text-primary" role="status"></div></div>
            ) : filteredRoutes.length === 0 ? (
              <div className="alert alert-light border text-center p-5 shadow-sm">
                  <div className="fs-1 mb-3">🔍</div>
                  <p className="mb-0 text-muted">Nebyly nalezeny žádné trasy odpovídající vašim filtrům.</p>
              </div>
            ) : (
              <div className="row g-4">
                {filteredRoutes.map((route) => renderRouteCard(route, activeTab === 'myRoutes'))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}