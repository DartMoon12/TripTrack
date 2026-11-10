import React from 'react';
import './Legal.css';

export default function Terms() {
  return (
    <div className="container legal-page">
      <article className="surface legal-doc">
        <h1>Podmínky použití</h1>
        <p className="text-muted">Poslední aktualizace: 15. března 2026</p>
        
        <h2>1. Úvodní ustanovení</h2>
        <p>Vítejte v aplikaci TripTrack. Používáním této aplikace souhlasíte s následujícími podmínkami...</p>
        

        <h2>2. Uživatelské účty</h2>
        <p>Pro plné využití aplikace je nutná registrace. Uživatel odpovídá za bezpečnost svého hesla a zavazuje se nepoužívat aplikaci k nelegálním účelům.</p>
        
        <h2>3. Obsah tvořený uživateli</h2>
        <p>Veškeré trasy a recenze, které zveřejníte, musí být v souladu s dobrými mravy a nesmí porušovat autorská práva třetích stran.</p>
      </article>
    </div>
  );
}