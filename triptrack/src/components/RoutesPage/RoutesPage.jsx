// src/components/Routes/RoutesPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaMapMarkedAlt, FaClock, FaRulerHorizontal } from 'react-icons/fa';
import { useRoutesStorage } from '../../Hooks/RouteStorageContext'; // 💥 Import pro načítání
import './RoutesPage.css'; // Měl by se jmenovat RoutesPage.css, ne Routes.css

export default function RoutesPage() {
  // Načtení dat a funkcí z Contextu
  const { routes, deleteRoute } = useRoutesStorage();

  const handleDelete = (routeId) => {
    if (window.confirm('Opravdu chcete tuto trasu smazat? Tato akce je nevratná.')) {
        deleteRoute(routeId); // Volání funkce z Contextu
    }
  };

  return (
    <div className="routes-page container py-5">
      <h1 className="text-primary-dark fw-bold mb-4">Uložené trasy</h1>
      <p className="lead text-muted mb-5">
        Zde najdete všechny trasy, které jste si uložili z Mapy.
      </p>

      {/* Zobrazení, pokud nejsou žádné trasy */}
      {routes.length === 0 ? (
        <div className="alert alert-info">
            Zatím nemáte žádné uložené trasy. Přejděte na <Link to="/mapa">Mapu</Link> a nějakou trasu si uložte!
        </div>
      ) : (
        /* Grid pro zobrazení karet tras */
        <div className="row g-4">
          {routes.map((route) => (
            <div className="col-12 col-md-6 col-lg-4" key={route.id}>
              
              <div className="route-card card h-100 shadow-sm border-0">
                <div className="card-body p-4 d-flex flex-column">
                  
                  {/* Záhlaví karty */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title fw-bold text-dark mb-0">{route.name}</h5> 
                    <FaMapMarkedAlt className="text-accent" size={24} /> 
                  </div>

                  {/* Detaily trasy */}
                  <div className="route-details mb-3">
                    <div className="d-flex align-items-center text-muted small mb-1">
                      <FaRulerHorizontal className="me-2 text-accent" />
                      <span>Vzdálenost: **{route.distance}**</span>
                    </div>
                    <div className="d-flex align-items-center text-muted small">
                      <FaClock className="me-2 text-accent" />
                      <span>Čas: **{route.duration}**</span>
                    </div>
                  </div>

                  {/* Paticka karty */}
                  <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                    <span className="text-secondary small">
                      Uloženo: {route.savedDate}
                    </span>
                    
                    {/* Tlačítka akcí */}
                    <div className="d-flex gap-2">
                      <Link to={`/mapa?routeId=${route.id}`} className="btn btn-sm btn-outline-dark">
                          Zobrazit
                      </Link>
                      <button 
                        onClick={() => handleDelete(route.id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}