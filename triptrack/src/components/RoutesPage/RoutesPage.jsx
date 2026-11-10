// src/components/RoutesPage/RoutesPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaPlus, FaRoute, FaUsers, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useRoutesStorage } from '../../Hooks/RouteStorageContext';
import { useAuth } from '../Auth/AuthContext';
import RouteCard, { RouteCardSkeleton } from '../UI/RouteCard';
import ReviewModal from './ReviewModal';
import { distanceToMeters, formatDistance } from '../../utils/routeUtils';
import { copyRouteLink } from '../../utils/share';
import './RoutesPage.css';

const SORTS = {
  newest: { label: 'Nejnovější', fn: (a, b) => (b.savedAt?.getTime() || 0) - (a.savedAt?.getTime() || 0) },
  oldest: { label: 'Nejstarší', fn: (a, b) => (a.savedAt?.getTime() || 0) - (b.savedAt?.getTime() || 0) },
  longest: { label: 'Nejdelší', fn: (a, b) => distanceToMeters(b) - distanceToMeters(a) },
  shortest: { label: 'Nejkratší', fn: (a, b) => distanceToMeters(a) - distanceToMeters(b) },
  rating: { label: 'Nejlépe hodnocené', fn: (a, b) => (b.avgRating || 0) - (a.avgRating || 0) || (b.reviewCount || 0) - (a.reviewCount || 0), publicOnly: true },
  name: { label: 'Název A–Z', fn: (a, b) => a.name.localeCompare(b.name, 'cs') },
};

export default function RoutesPage() {
  const { currentUser } = useAuth();
  const {
    userRoutes, publicRoutes, favoritePublicRouteIds,
    loadingUserRoutes, loadingPublicRoutes,
    fetchPublicRoutes, deleteRoute, toggleFavorite,
  } = useRoutesStorage();

  // Záložka je v URL (?tab=komunita), takže jde sdílet i přežije obnovení stránky
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'komunita' ? 'community' : 'mine';
  const setTab = (t) => setSearchParams(t === 'community' ? { tab: 'komunita' } : {}, { replace: true });

  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [sortKey, setSortKey] = useState('newest');
  const [reviewRoute, setReviewRoute] = useState(null);

  useEffect(() => {
    if (tab === 'community') fetchPublicRoutes();
  }, [tab, fetchPublicRoutes]);

  // "Nejlépe hodnocené" dává smysl jen u komunity
  useEffect(() => {
    if (tab === 'mine' && SORTS[sortKey].publicOnly) setSortKey('newest');
  }, [tab, sortKey]);

  const source = tab === 'mine' ? userRoutes : publicRoutes;
  const loading = tab === 'mine' ? loadingUserRoutes : loadingPublicRoutes;

  const allTags = useMemo(
    () => Array.from(new Set(source.flatMap((r) => r.tags || []))).sort((a, b) => a.localeCompare(b, 'cs')),
    [source],
  );

  const visibleRoutes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return source
      .filter((r) => {
        const matchesText = !term
          || r.name.toLowerCase().includes(term)
          || (r.description || '').toLowerCase().includes(term)
          || (r.userName || '').toLowerCase().includes(term);
        const matchesTag = !tagFilter || r.tags?.includes(tagFilter);
        return matchesText && matchesTag;
      })
      .sort(SORTS[sortKey].fn);
  }, [source, searchTerm, tagFilter, sortKey]);

  const stats = useMemo(() => ({
    count: userRoutes.length,
    totalKm: formatDistance(userRoutes.reduce((sum, r) => sum + distanceToMeters(r), 0)),
    published: userRoutes.filter((r) => r.publicId).length,
    favorites: userRoutes.filter((r) => r.isFavorite).length + favoritePublicRouteIds.size,
  }), [userRoutes, favoritePublicRouteIds]);

  const handleDelete = (route, isPublic) => {
    const msg = isPublic
      ? `Opravdu chcete stáhnout trasu „${route.name}“ z komunity? Ve vašich trasách zůstane.`
      : `Opravdu chcete smazat trasu „${route.name}“?${route.publicId ? ' Veřejná kopie v komunitě zůstane – smažete ji v záložce Komunita.' : ''}`;
    if (window.confirm(msg)) deleteRoute(route.id, isPublic);
  };

  const handleShare = async (route) => {
    // Soukromou trasu ostatní neuvidí – sdílíme její veřejnou kopii
    const id = route.isPublic ? route.id : route.publicId;
    if (!id) {
      toast('Tuto trasu vidíte jen vy. Pro sdílení ji při uložení zveřejněte.', { icon: '🔒' });
      return;
    }
    await copyRouteLink(id);
  };

  const filtersActive = searchTerm || tagFilter;

  return (
    <div className="container routes-page">
      <header className="page-header d-flex flex-wrap justify-content-between align-items-end gap-3">
        <div>
          <h1>Trasy</h1>
          <p>Vaše uložené trasy a inspirace od ostatních cestovatelů.</p>
        </div>
        <Link to="/mapa" className="btn btn-accent"><FaPlus className="me-2" size={12} /> Nová trasa</Link>
      </header>

      {tab === 'mine' && !loadingUserRoutes && userRoutes.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3"><div className="stat-card"><div className="stat-value">{stats.count}</div><div className="stat-label">Uložených tras</div></div></div>
          <div className="col-6 col-md-3"><div className="stat-card"><div className="stat-value">{stats.totalKm}</div><div className="stat-label">Celkem naplánováno</div></div></div>
          <div className="col-6 col-md-3"><div className="stat-card"><div className="stat-value">{stats.published}</div><div className="stat-label">Zveřejněných</div></div></div>
          <div className="col-6 col-md-3"><div className="stat-card"><div className="stat-value">{stats.favorites}</div><div className="stat-label">V oblíbených</div></div></div>
        </div>
      )}

      <div className="routes-toolbar">
        <div className="segmented" role="tablist" aria-label="Zobrazit trasy">
          <button type="button" role="tab" aria-selected={tab === 'mine'} className={tab === 'mine' ? 'active' : ''} onClick={() => setTab('mine')}>
            <FaRoute className="me-2" size={13} />Moje trasy
          </button>
          <button type="button" role="tab" aria-selected={tab === 'community'} className={tab === 'community' ? 'active' : ''} onClick={() => setTab('community')}>
            <FaUsers className="me-2" size={14} />Komunita
          </button>
        </div>

        <div className="routes-filters">
          <label className="input-with-icon flex-grow-1">
            <FaSearch />
            <input
              type="search"
              className="form-control"
              placeholder={tab === 'community' ? 'Hledat název, popis, autora…' : 'Hledat název nebo popis…'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Hledat trasy"
            />
          </label>
          <label className="input-with-icon">
            <FaFilter />
            <select className="form-select" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} aria-label="Filtrovat podle štítku">
              <option value="">Všechny štítky</option>
              {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="input-with-icon">
            <FaSortAmountDown />
            <select className="form-select" value={sortKey} onChange={(e) => setSortKey(e.target.value)} aria-label="Řadit">
              {Object.entries(SORTS)
                .filter(([, s]) => tab === 'community' || !s.publicOnly)
                .map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="row g-4">
          {[0, 1, 2].map((i) => <div className="col-12 col-md-6 col-lg-4" key={i}><RouteCardSkeleton /></div>)}
        </div>
      ) : visibleRoutes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{tab === 'mine' ? <FaRoute /> : <FaUsers />}</div>
          {filtersActive ? (
            <>
              <h4>Nic jsme nenašli</h4>
              <p>Zkuste upravit hledání nebo zrušit filtr štítků.</p>
              <button type="button" className="btn btn-ghost" onClick={() => { setSearchTerm(''); setTagFilter(''); }}>Zrušit filtry</button>
            </>
          ) : tab === 'mine' ? (
            <>
              <h4>Zatím nemáte žádnou trasu</h4>
              <p>Otevřete mapu, naklikejte body a trasu si uložte.</p>
              <Link to="/mapa" className="btn btn-accent">Naplánovat první trasu</Link>
            </>
          ) : (
            <>
              <h4>Komunita zatím nic nesdílí</h4>
              <p>Buďte první – při ukládání trasy zaškrtněte „Zveřejnit“.</p>
              <Link to="/mapa" className="btn btn-accent">Vytvořit trasu</Link>
            </>
          )}
        </div>
      ) : (
        <div className="row g-4">
          {visibleRoutes.map((route) => {
            const isPublic = tab === 'community';
            const isMine = isPublic ? route.userId === currentUser?.uid : true;
            return (
              <div className="col-12 col-md-6 col-lg-4" key={route.id}>
                <RouteCard
                  route={route}
                  showAuthor={isPublic}
                  isFavorite={isPublic ? favoritePublicRouteIds.has(route.id) : !!route.isFavorite}
                  onToggleFavorite={() => toggleFavorite(route.id, isPublic)}
                  onShare={() => handleShare(route)}
                  onReviews={isPublic ? () => setReviewRoute(route) : undefined}
                  onDelete={isMine ? () => handleDelete(route, isPublic) : undefined}
                />
              </div>
            );
          })}
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
