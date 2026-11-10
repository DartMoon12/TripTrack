import React, { useState } from 'react';
import { FaCamera, FaGlobeEurope, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Modal from '../UI/Modal';
import { AVAILABLE_TAGS, compressImage } from '../../utils/routeUtils';

export default function SaveRouteModal({ defaultName, routeInfo, onSave, onClose }) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [image, setImage] = useState(null);
  const [makePublic, setMakePublic] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggleTag = (tag) => setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { toast.error('Fotka je moc velká (max. 15 MB).'); return; }
    try {
      setImage(await compressImage(file));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    const ok = await onSave({ name: name.trim(), description: description.trim(), tags, image, makePublic });
    if (!ok) setBusy(false);
  };

  return (
    <Modal title="Uložit trasu" onClose={onClose}>
      <p className="text-muted small mb-4">
        {routeInfo.distance} · {routeInfo.duration}
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" htmlFor="route-name">Název</label>
          <input id="route-name" className="form-control" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required autoFocus />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="route-desc">Popis <span className="text-muted fw-normal">(volitelný)</span></label>
          <textarea id="route-desc" className="form-control" rows="2" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={400} placeholder="Co na trase uvidíte, na co si dát pozor…" />
        </div>

        <div className="mb-3">
          <span className="form-label d-block">Štítky</span>
          <div className="d-flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => (
              <button key={tag} type="button" className={`chip ${tags.includes(tag) ? 'is-selected' : ''}`} onClick={() => toggleTag(tag)} aria-pressed={tags.includes(tag)}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <span className="form-label d-block">Fotka <span className="text-muted fw-normal">(volitelná)</span></span>
          {image ? (
            <div className="photo-preview">
              <img src={image} alt="Náhled fotky" />
              <button type="button" className="icon-btn" onClick={() => setImage(null)} aria-label="Odebrat fotku"><FaTimes /></button>
            </div>
          ) : (
            <label className="photo-drop">
              <FaCamera /> Vybrat fotku
              <input type="file" accept="image/*" onChange={handleImage} hidden />
            </label>
          )}
        </div>

        <label className="public-toggle">
          <input type="checkbox" className="form-check-input mt-0" checked={makePublic} onChange={(e) => setMakePublic(e.target.checked)} />
          <span>
            <strong><FaGlobeEurope className="me-1" /> Zveřejnit v komunitě</strong>
            <small className="d-block text-muted">Ostatní uživatelé ji uvidí, ohodnotí a můžete ji sdílet odkazem.</small>
          </span>
        </label>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Zrušit</button>
          <button type="submit" className="btn btn-accent" disabled={busy || !name.trim()}>
            {busy ? 'Ukládám…' : 'Uložit trasu'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
