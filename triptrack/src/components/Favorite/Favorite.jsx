// src/components/Favorite/Favorite.jsx

import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { useRoutesStorage } from '../../Hooks/RouteStorageContext';
import { useAuth } from '../Auth/AuthContext';
import RouteCard, { RouteCardSkeleton } from '../UI/RouteCard';
import ReviewModal from '../RoutesPage/ReviewModal';
import { copyRouteLink } from '../../utils/share';
import toast from 'react-hot-toast';

export default function Favorite() {
  const { currentUser } = useAuth();
  const {
    userRoutes, publicRoutes, favoritePublicRouteIds,
    loadingUserRoutes, loadingPublicRoutes, loadingFavorites,
    toggleFavorite, fetchPublicRoutes,
  } = useRoutesStorage();
  const [reviewRoute, setReviewRoute] = React.useState(null);

  // Oblíbené veřejné trasy potřebují data z komunity
  useEffect(() => {
    if (favoritePublicRouteIds.size > 0) fetchPublicRoutes();
  }, [favoritePublicRouteIds.size, fetchPublicRoutes]);

  const favorites = useMemo(() => [
    ...userRoutes.filter((r) => r.isFavorite),
    ...publicRoutes.filter((r) => favoritePublicRouteIds.has(r.id)),
  ], [userRoutes, publicRoutes, favoritePublicRouteIds]);

  const loading = loadingUserRoutes || loadingFavorites || (favoritePublicRouteIds.size > 0 && loadingPublicRoutes);

  const share = (route) => {
    const id = route.isPublic ? route.id : route.publicId;
    if (!id) return toast('Tuto trasu vidíte jen vy.', { icon: '🔒' });
    copyRouteLink(id);
  };

  return (
    <div className="container">
      <header className="page-header">
        <span className="eyebrow"><FaStar /> Oblíbené</span>
        <h1 className="mt-2">Vaše oblíbené trasy</h1>
        <p>Trasy označené hvězdičkou – vaše i od komunity.</p>
      </header>

      {loading ? (
        <div className="row g-4">
          {[0, 1, 2].map((i) => <div className="col-12 col-md-6 col-lg-4" key={i}><RouteCardSkeleton /></div>)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><FaStar /></div>
          <h4>Zatím žádné oblíbené</h4>
          <p>Klikněte na hvězdičku u trasy a najdete ji tady.</p>
          <Link to="/trasa?tab=komunita" className="btn btn-accent">Procházet trasy komunity</Link>
        </div>
      ) : (
        <div className="row g-4">
          {favorites.map((route) => (
            <div className="col-12 col-md-6 col-lg-4" key={`${route.isPublic ? 'p' : 'u'}-${route.id}`}>
              <RouteCard
                route={route}
                isFavorite
                showAuthor={route.isPublic && route.userId !== currentUser?.uid}
                onToggleFavorite={() => toggleFavorite(route.id, !!route.isPublic)}
                onShare={() => share(route)}
                onReviews={route.isPublic ? () => setReviewRoute(route) : undefined}
              />
            </div>
          ))}
        </div>
      )}

      {reviewRoute && (
        <ReviewModal
          route={publicRoutes.find((r) => r.id === reviewRoute.id) || reviewRoute}
          onClose={() => setReviewRoute(null)}
        />
      )}
    </div>
  );
}
