// Karta trasy – používá ji "Moje trasy", "Trasy komunity" i "Oblíbené".
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaStar, FaRegStar, FaTrash, FaShareAlt, FaRulerHorizontal, FaClock,
  FaCommentDots, FaGlobeEurope, FaUserCircle,
} from 'react-icons/fa';
import RoutePreview from './RoutePreview';
import { travelModeLabel } from '../../utils/routeUtils';
import './RouteCard.css';

export default function RouteCard({
  route,
  isFavorite = false,
  onToggleFavorite,
  onDelete,
  onShare,
  onReviews,
  showAuthor = false,
}) {
  return (
    <article className="route-card">
      <div className="route-card-media">
        {route.image ? (
          <img src={route.image} alt="" loading="lazy" />
        ) : (
          <RoutePreview points={route.points} polyline={route.polyline} />
        )}

        <div className="route-card-badges">
          {route.mode && <span className="media-badge">{travelModeLabel(route.mode)}</span>}
          {route.isOwn && route.publicId && (
            <span className="media-badge" title="Trasa je zveřejněná"><FaGlobeEurope /> Veřejná</span>
          )}
        </div>

        {onToggleFavorite && (
          <button
            type="button"
            className={`media-fav ${isFavorite ? 'is-active' : ''}`}
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
            title={isFavorite ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
          >
            {isFavorite ? <FaStar /> : <FaRegStar />}
          </button>
        )}
      </div>

      <div className="route-card-body">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <h3 className="route-card-title" title={route.name}>{route.name}</h3>
          {route.isPublic && (
            <button type="button" className="rating-pill" onClick={onReviews} title="Zobrazit recenze">
              <FaStar />
              {route.reviewCount > 0
                ? <>{Number(route.avgRating).toFixed(1).replace('.', ',')}<span>({route.reviewCount})</span></>
                : <span>Ohodnotit</span>}
            </button>
          )}
        </div>

        {showAuthor && route.userName && (
          <div className="route-card-author"><FaUserCircle /> {route.userName}</div>
        )}

        {route.description
          ? <p className="route-card-desc">{route.description}</p>
          : <p className="route-card-desc is-empty">Bez popisu</p>}

        {route.tags?.length > 0 && (
          <div className="route-card-tags">
            {route.tags.slice(0, 4).map((t) => <span key={t} className="chip">{t}</span>)}
            {route.tags.length > 4 && <span className="chip">+{route.tags.length - 4}</span>}
          </div>
        )}

        <div className="route-card-stats">
          <span><FaRulerHorizontal /> {route.distance || '–'}</span>
          <span><FaClock /> {route.duration || '–'}</span>
          {route.savedDate && <span className="ms-auto">{route.savedDate}</span>}
        </div>

        <div className="route-card-actions">
          <Link to={`/mapa?routeId=${route.id}`} className="btn btn-accent flex-grow-1">Zobrazit na mapě</Link>
          {onReviews && (
            <button type="button" className="icon-btn" onClick={onReviews} aria-label="Recenze" title="Recenze">
              <FaCommentDots />
            </button>
          )}
          {onShare && (
            <button type="button" className="icon-btn" onClick={onShare} aria-label="Sdílet odkaz" title="Zkopírovat odkaz">
              <FaShareAlt />
            </button>
          )}
          {onDelete && (
            <button type="button" className="icon-btn danger" onClick={onDelete} aria-label="Smazat trasu" title="Smazat">
              <FaTrash size={14} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function RouteCardSkeleton() {
  return <div className="skeleton" style={{ height: 420 }} />;
}
