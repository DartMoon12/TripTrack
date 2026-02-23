// src/components/RoutesPage/RoutesPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
// 💥 PŘIDAL JSEM "FaMap" do importů
import { FaTrash, FaClock, FaRulerHorizontal, FaStar, FaSearch, FaUserCircle, FaMapMarkerAlt, FaFilter, FaMap } from 'react-icons/fa';
import { useRoutesStorage } from '../../Hooks/RouteStorageContext';
import { useAuth } from '../Auth/AuthContext';
import './RoutesPage.css';

export default function RoutesPage() {
  const { currentUser } = useAuth();
  
  const {
      userRoutes,
      publicRoutes,
      favoritePublicRouteIds,
      loadingUserRoutes, 
      loadingPublicRoutes,
      fetchPublicRoutes,
      deleteRoute, 
      toggleFavorite, 
      addReview, 
      getReviews
  } = useRoutesStorage();

  const [activeTab, setActiveTab] = useState('myRoutes');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilterTag, setSelectedFilterTag] = useState("");

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [currentReviews, setCurrentReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (activeTab === 'communityRoutes') fetchPublicRoutes();
  }, [activeTab, fetchPublicRoutes]);

  const openReviewModal = async (route) => {
    setSelectedRoute(route);
    setShowReviewModal(true);
    setLoadingReviews(true);
    
    try {
        const reviews = await getReviews(route.id);
        setCurrentReviews(reviews || []);
    } catch (e) { 
        setCurrentReviews([]); 
    } finally { 
        setLoadingReviews(false);
    }
  };

  const filteredRoutes = useMemo(() => {
    const current = activeTab === 'myRoutes' ? userRoutes : publicRoutes;
    return current.filter(r => {
      const mSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
      const mTag = selectedFilterTag === "" || r.tags?.includes(selectedFilterTag);
      return mSearch && mTag;
    });
  }, [activeTab, userRoutes, publicRoutes, searchTerm, selectedFilterTag]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const newRev = await addReview(selectedRoute.id, rating, comment);
    
    if (newRev) {
        setCurrentReviews(prev => [newRev, ...prev]);
        setComment("");
        setRating(5);
    }
  };

  const renderRouteCard = (route, isMyRoute = true) => {
    const isFav = !isMyRoute && favoritePublicRouteIds.has(route.id);

    return (
      <div className="col-12 col-md-6 col-lg-4 d-flex align-items-stretch" key={route.id}>
        <div className="route-card-modern w-100">
          
          {/* --- HORNÍ ČÁST (Obrázek) --- */}
          <div className="card-img-wrapper">
            {route.image ? (
              <img src={route.image} className="w-100 h-100 object-fit-cover" alt={route.name} />
            ) : (
              // 💥 NOVÝ VZHLED PRO CHYBĚJÍCÍ OBRÁZEK
              <div className="placeholder-content h-100 w-100 d-flex flex-column align-items-center justify-content-center">
                 {/* Velká ikona mapy na pozadí */}
                 <FaMap className="placeholder-icon" />
                 <span className="placeholder-text">Bez náhledu</span>
              </div>
            )}
            
            {!isMyRoute && (
              <div 
                className="rating-badge" 
                onClick={(e) => { e.stopPropagation(); openReviewModal(route); }}
              >
                <FaStar /> 
                {route.avgRating ? Number(route.avgRating).toFixed(1) : '0.0'} 
                <span>({route.reviewCount || 0})</span>
              </div>
            )}

            <button 
                className="btn rounded-circle d-flex align-items-center justify-content-center top-0 end-0 m-3"
                style={{ width: '38px', height: '38px' }}
                onClick={(e) => { e.stopPropagation(); toggleFavorite(route.id, !isMyRoute); }}
            >
                <FaStar size={18} className={(isMyRoute ? route.isFavorite : isFav) ? 'text-warning' : 'text-secondary'} />
            </button>
          </div>

          <div className="card-body p-4 d-flex flex-column">
            <h5 className="fw-bold mb-2 text-truncate" style={{ color: 'var(--primary-dark)' }}>{route.name}</h5>
            
            <div className="d-flex flex-wrap gap-2 mb-3">
                {route.tags && route.tags.length > 0 ? (
                    route.tags.map(t => (
                        <span key={t} className="tag-pill">
                            {t}
                        </span>
                    ))
                ) : (
                    <span className="small opacity-50 fst-italic" style={{ color: 'var(--primary-dark)' }}>Bez štítků</span>
                )}
            </div>

            <div className="d-flex gap-4 small mb-4" style={{ color: 'var(--primary-dark)', opacity: 0.7 }}>
              <span className="d-flex align-items-center"><FaRulerHorizontal className="text-warning me-2" /> {route.distance}</span>
              <span className="d-flex align-items-center"><FaClock className="text-warning me-2" /> {route.duration}</span>
            </div>

            <div className="mt-auto d-flex gap-2 align-items-center">
              {!isMyRoute && (
                <button className="btn-action-outline flex-grow-1" onClick={() => openReviewModal(route)}>
                  recenze
                </button>
              )}
              
              <Link to={`/mapa?routeId=${route.id}`} className="btn-action-primary flex-grow-1 text-center text-decoration-none">
                Zobrazit
              </Link>

              {isMyRoute && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Opravdu chcete tuto trasu smazat?")) {
                      deleteRoute(route.id, false);
                    }
                  }} 
                  className="btn-delete" 
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
    <div className="routes-page-wrapper pt-5">
      <div className="container">
        
        <div className="row align-items-end mb-5 gy-3">
            <div className="col-lg-6">
                <h1 className="page-title display-5 mb-3">Prohlížeč tras</h1>
                <div className="nav-pills-custom">
                    <button 
                        className={`nav-link-custom ${activeTab === 'myRoutes' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('myRoutes')}
                    >
                        Moje trasy
                    </button>
                    <button 
                        className={`nav-link-custom ${activeTab === 'communityRoutes' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('communityRoutes')}
                    >
                        Trasy ostatních
                    </button>
                </div>
            </div>

            <div className="col-lg-6">
                <div className="d-flex gap-3">
                    <div className="search-container d-flex align-items-center flex-grow-1">
                        <FaSearch className="me-2" style={{ color: 'var(--primary-dark)', opacity: 0.5 }} />
                        <input 
                            type="text" 
                            className="form-control search-input shadow-none" 
                            placeholder="Hledat..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                        />
                    </div>
                    <div className="search-container d-flex align-items-center" style={{ minWidth: '180px' }}>
                        <FaFilter className="me-2" style={{ color: 'var(--primary-dark)', opacity: 0.5 }} />
                        <select 
                            className="form-select filter-select shadow-none p-0" 
                            value={selectedFilterTag} 
                            onChange={e => setSelectedFilterTag(e.target.value)}
                        >
                            <option value="">Všechny štítky</option>
                            {Array.from(new Set([...userRoutes, ...publicRoutes].flatMap(r => r.tags || []))).map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div className="row g-4">
            {(activeTab === 'myRoutes' ? loadingUserRoutes : loadingPublicRoutes) ? (
              <div className="col-12 text-center p-5"><div className="spinner-border text-warning"></div></div>
            ) : filteredRoutes.length === 0 ? (
              <div className="col-12 text-center py-5">
                  <div className="display-1 mb-3 opacity-25">🗺️</div>
                  <h4 className="fw-bold" style={{ color: 'var(--primary-dark)' }}>Zatím tu nic není</h4>
                  <p style={{ color: 'var(--primary-dark)', opacity: 0.7 }}>Zkuste změnit filtry nebo vytvořit novou trasu.</p>
              </div>
            ) : (
              filteredRoutes.map(r => renderRouteCard(r, activeTab === 'myRoutes'))
            )}
        </div>

        {showReviewModal && (
          <div className="modal d-block" style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content custom-modal-content shadow-lg">
                <div className="modal-header border-0 p-4 pb-0">
                  <h4 className="modal-title fw-bold">Recenze: {selectedRoute?.name}</h4>
                  <button type="button" className="btn-close shadow-none" onClick={() => setShowReviewModal(false)}></button>
                </div>
                
                <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="mb-5">
                    {loadingReviews ? (
                       <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-warning"></div></div>
                    ) : currentReviews.length === 0 ? (
                       <div className="p-4 bg-light rounded-4 text-center text-muted">Zatím bez recenzí. Buďte první!</div>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {currentReviews.map(rev => (
                          <div key={rev.id} className="p-3 bg-light rounded-4 border-0">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="fw-bold d-flex align-items-center gap-2 text-dark">
                                <FaUserCircle className="text-muted" size={20} /> {rev.userName}
                              </span>
                              <div className="text-warning">
                                {[...Array(5)].map((_, i) => <FaStar key={i} size={12} className={i < rev.rating ? '' : 'opacity-25'} />)}
                              </div>
                            </div>
                            <p className="mb-0 text-dark opacity-75">{rev.comment}</p>
                            <small className="text-muted d-block text-end mt-1" style={{ fontSize: '0.7rem' }}>
                                {rev.createdAt instanceof Date ? rev.createdAt.toLocaleDateString('cs-CZ') : 'Právě teď'}
                            </small>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-light p-4 rounded-4">
                    <h6 className="fw-bold mb-3 text-dark">Přidat hodnocení</h6>
                    <form onSubmit={handleReviewSubmit}>
                        <div className="mb-3 d-flex justify-content-center gap-2">
                        {[1,2,3,4,5].map(num => (
                            <FaStar 
                                key={num} size={32} 
                                className={`cursor-pointer transition-all ${num <= rating ? 'text-warning' : 'text-secondary opacity-25'}`}
                                onClick={() => setRating(num)} 
                            />
                        ))}
                        </div>
                        <textarea 
                            className="form-control border-0 shadow-sm rounded-3 mb-3 p-3" 
                            rows="3" 
                            placeholder="Jak se vám trasa líbila?"
                            value={comment} onChange={e => setComment(e.target.value)} 
                            required
                        ></textarea>
                        <button type="submit" className="btn btn-action-primary w-100 py-2 shadow-sm">Odeslat recenzi</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}