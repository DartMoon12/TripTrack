import React from 'react';
import './Legal.css';

export default function Privacy() {
  return (
    <div className="container legal-page">
      <article className="surface legal-doc">
        <h1>Ochrana soukromí (GDPR)</h1>
        <p className="text-muted">Poslední aktualizace: 15. března 2026</p>
        
        <h2>1. Jaké údaje sbíráme</h2>
        <p>Při registraci shromažďujeme vaši e-mailovou adresu a heslo (bezpečně zašifrované pomocí služby Firebase Authentication). Při použití přihlášení přes Google získáme i vaše křestní jméno a profilový obrázek.</p>
        

        <h2>2. Jak údaje využíváme</h2>
        <p>Vaše údaje slouží výhradně pro zajištění funkčnosti aplikace TripTrack (ukládání oblíbených tras, hodnocení a zabezpečení vašeho účtu). Vaše data neprodáváme žádným třetím stranám.</p>
        <p>U veřejně sdílených tras a u recenzí se ostatním uživatelům zobrazuje vaše jméno z Google účtu, případně část e-mailu před zavináčem.</p>

        <h2>3. Vaše práva</h2>
        <p>Podle nařízení GDPR máte právo požádat o výpis vašich dat, jejich úpravu, nebo kompletní smazání vašeho účtu z naší databáze.</p>
      </article>
    </div>
  );
}