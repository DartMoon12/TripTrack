import React from 'react';

export default function Terms() {
  return (
    <div className="container py-5" style={{ minHeight: '80vh' }}>
      <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5">
        <h1 className="fw-bold text-dark mb-4">Podmínky použití</h1>
        <p className="text-muted">Poslední aktualizace: 15. března 2026</p>
        
        <h5 className="fw-bold mt-4">1. Úvodní ustanovení</h5>
        <p>Vítejte v aplikaci TripTrack. Používáním této aplikace souhlasíte s následujícími podmínkami...</p>
        

        <h5 className="fw-bold mt-4">2. Uživatelské účty</h5>
        <p>Pro plné využití aplikace je nutná registrace. Uživatel odpovídá za bezpečnost svého hesla a zavazuje se nepoužívat aplikaci k nelegálním účelům.</p>
        
        <h5 className="fw-bold mt-4">3. Obsah tvořený uživateli</h5>
        <p>Veškeré trasy a recenze, které zveřejníte, musí být v souladu s dobrými mravy a nesmí porušovat autorská práva třetích stran.</p>
      </div>
    </div>
  );
}