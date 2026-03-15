import React from 'react';

export default function Privacy() {
  return (
    <div className="container py-5" style={{ minHeight: '80vh' }}>
      <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5">
        <h1 className="fw-bold text-dark mb-4">Ochrana soukromí (GDPR)</h1>
        <p className="text-muted">Poslední aktualizace: 15. března 2026</p>
        
        <h5 className="fw-bold mt-4">1. Jaké údaje sbíráme</h5>
        <p>Při registraci shromažďujeme vaši e-mailovou adresu a heslo (bezpečně zašifrované pomocí služby Firebase Authentication). Při použití přihlášení přes Google získáme i vaše křestní jméno a profilový obrázek.</p>
        

        <h5 className="fw-bold mt-4">2. Jak údaje využíváme</h5>
        <p>Vaše údaje slouží výhradně pro zajištění funkčnosti aplikace TripTrack (ukládání oblíbených tras, hodnocení a zabezpečení vašeho účtu). Vaše data neprodáváme žádným třetím stranám.</p>

        <h5 className="fw-bold mt-4">3. Vaše práva</h5>
        <p>Podle nařízení GDPR máte právo požádat o výpis vašich dat, jejich úpravu, nebo kompletní smazání vašeho účtu z naší databáze.</p>
      </div>
    </div>
  );
}