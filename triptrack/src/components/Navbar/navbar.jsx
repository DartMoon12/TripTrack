import React from 'react';
// Importujeme Link (pro klikací odkazy) a useNavigate (pro přesměrování v kódu)
import { Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../Auth/AuthContext';
import ThemeToggle from '../Theme/ThemeToggle';
import './navbar.css';

function Navbar() {
  // --- 1. NAČTENÍ DAT O UŽIVATELI ---
  // Tady je takový "bezpečnostní pás". Zkoušíme načíst currentUser a logout.
  // Ty otazníky a ?? znamenají: "Kdyby náhodou useAuth nefungovalo, 
  // tak mi místo chyby vrať prázdného uživatele (null) a prázdnou funkci."
  // Díky tomu aplikace nespadne, i když se něco pokazí v Contextu.
  const { currentUser, logout } = useAuth?.() ?? { currentUser: null, logout: async () => {} };
  
  // --- 2. NAVIGACE ---
  // useNavigate je jako "teleport". Můžeme ho zavolat kdekoliv v kódu (nejen po kliknutí na odkaz).
  const navigate = useNavigate();

  // --- 3. LOGIKA ODHLÁŠENÍ ---
  const handleLogout = async () => {
    // Nejdřív počkáme, až Firebase uživatele skutečně odhlásí
    await logout();
    // A teprve POTOM ho přesměrujeme na úvodní stránku (aby nezůstal viset třeba na profilu)
    navigate('/'); 
  };

  // --- 4. ČISTÝ KÓD (DRY - Don't Repeat Yourself) ---
  // Místo abychom dole v HTML psali 4x <li className="...">,
  // vytvoříme si malou pomocnou komponentu jen pro tenhle soubor.
  const NavLink = ({ to, children }) => (
    <li className="nav-item">
      <Link className="nav-link text-primary-dark" to={to}>{children}</Link>
    </li>
  );
  
  // A tady si připravíme data. Když budeme chtít přidat novou stránku,
  // jen ji dopíšeme do tohoto pole a nemusíme sahat do složitého HTML dole.
  const navigationLinks = [
    { name: 'Domů', to: '/' },
    { name: 'Mapa', to: '/mapa' },
    { name: 'Trasa', to: '/trasa' },
    { name: 'Oblíbené', to: '/oblibene' },
  ];

  // --- 5. VYKRESLENÍ (UI) ---
  return (
    // Bootstrap třídy pro hezký vzhled (navbar-expand-lg dělá to menu pro mobily)
    <nav className="navbar navbar-expand-lg border-bottom py-3">
      <div className="container d-flex justify-content-between align-items-center">
        
        {/* Logo vlevo */}
        <Link className="navbar-brand h1 mb-0 text-primary-dark fw-bold" to="/">
          TripTrack
        </Link>
        
        {/* Hamburger menu (tlačítko, které se ukáže jen na mobilu) */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          
          {/* Odkazy uprostřed */}
          <ul className="navbar-nav mx-auto gap-4">
            {/* Tady je to kouzlo: Vezmeme pole 'navigationLinks' a pro každou položku
                vyrobíme <NavLink>. Je to mnohem kratší a přehlednější. */}
            {navigationLinks.map((link) => (
              <NavLink key={link.name} to={link.to}>{link.name}</NavLink>
            ))}
          </ul>

          {/* Uživatelský blok vpravo */}
          <div className="d-flex align-items-center ms-auto ms-lg-0">
            <ThemeToggle />
            
            {/* PODMÍNĚNÉ VYKRESLOVÁNÍ (Ternární operátor) */}
            {/* Ptáme se: Je uživatel nepřihlášený (!currentUser)? */}
            {!currentUser ? (
              
              // MOŽNOST A: Uživatel NENÍ přihlášený -> Ukaž tlačítka
              <div className="d-flex gap-2">
                <Link className="btn btn-outline-primary" to="/login">Přihlášení</Link>
                <Link className="btn btn-dark" to="/register">Registrace</Link>
              </div>


            ) : (
              
              // MOŽNOST B: Uživatel JE přihlášený -> Ukaž jeho email a menu
              <div className="dropdown">
                <button 
                  className="btn btn-link text-decoration-none dropdown-toggle text-primary-dark" 
                  type="button" 
                  data-bs-toggle="dropdown" 
                >
                  {currentUser.email}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    {/* Tlačítko pro odhlášení volá naši funkci nahoře */}
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                        Odhlásit se
                    </button>
                  </li>
                </ul>
              </div>

            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;