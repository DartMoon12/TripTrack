import React, { useEffect, useState } from 'react';
import { FaStar, FaUserCircle } from 'react-icons/fa';
import Modal from '../UI/Modal';
import { useRoutesStorage } from '../../Hooks/RouteStorageContext';
import { useAuth } from '../Auth/AuthContext';

const RATING_LABELS = ['', 'Nic moc', 'Ujde to', 'Dobrá', 'Moc pěkná', 'Skvělá!'];

export default function ReviewModal({ route, onClose }) {
  const { getReviews, addReview } = useRoutesStorage();
  const { currentUser } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let alive = true;
    getReviews(route.id).then((list) => {
      if (alive) { setReviews(list); setLoading(false); }
    });
    return () => { alive = false; };
  }, [route.id, getReviews]);

  const alreadyReviewed = reviews.some((r) => r.userId === currentUser?.uid);
  const isAuthor = route.userId === currentUser?.uid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSending(true);
    const created = await addReview(route.id, rating, comment);
    setSending(false);
    if (created) {
      setReviews((prev) => [created, ...prev]);
      setComment('');
      setRating(5);
    }
  };

  const shown = hover || rating;

  return (
    <Modal title={`Recenze · ${route.name}`} onClose={onClose}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="review-score">{route.reviewCount > 0 ? Number(route.avgRating).toFixed(1).replace('.', ',') : '–'}</div>
        <div>
          <div className="review-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <FaStar key={n} className={n <= Math.round(route.avgRating || 0) ? 'on' : ''} />
            ))}
          </div>
          <div className="small text-muted">{route.reviewCount || 0} hodnocení</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4"><span className="spinner" /></div>
      ) : reviews.length === 0 ? (
        <div className="review-empty">Zatím žádné recenze. Buďte první!</div>
      ) : (
        <ul className="review-list">
          {reviews.map((rev) => (
            <li key={rev.id} className="review-item">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-bold d-flex align-items-center gap-2">
                  <FaUserCircle className="text-muted" size={18} /> {rev.userName}
                </span>
                <span className="review-stars small">
                  {[1, 2, 3, 4, 5].map((n) => <FaStar key={n} className={n <= rev.rating ? 'on' : ''} />)}
                </span>
              </div>
              <p className="mb-1">{rev.comment}</p>
              <small className="text-muted">
                {rev.createdAt instanceof Date ? rev.createdAt.toLocaleDateString('cs-CZ') : ''}
              </small>
            </li>
          ))}
        </ul>
      )}

      {isAuthor ? (
        <p className="small text-muted text-center mt-4 mb-0">Vlastní trasu hodnotit nemůžete.</p>
      ) : alreadyReviewed ? (
        <p className="small text-muted text-center mt-4 mb-0">Tuto trasu jste už ohodnotili. Děkujeme!</p>
      ) : (
        <form onSubmit={handleSubmit} className="review-form">
          <h6 className="fw-bold mb-2">Přidat hodnocení</h6>
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="review-picker" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  className={n <= shown ? 'on' : ''}
                  aria-label={`${n} z 5`}
                >
                  <FaStar />
                </button>
              ))}
            </div>
            <span className="small fw-semibold text-muted">{RATING_LABELS[shown]}</span>
          </div>
          <textarea
            className="form-control mb-3"
            rows="3"
            placeholder="Jak se vám trasa líbila?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            required
          />
          <button type="submit" className="btn btn-accent w-100" disabled={sending || !comment.trim()}>
            {sending ? 'Odesílám…' : 'Odeslat recenzi'}
          </button>
        </form>
      )}
    </Modal>
  );
}
