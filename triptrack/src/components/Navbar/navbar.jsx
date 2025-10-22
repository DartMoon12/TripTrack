import { Link, useNavigate } from 'react-router-dom'; // 💥 PŘIDÁNÍ useNavigate
import { useAuth } from '../Auth/AuthContext';

function Navbar() {
  // Destructuring s fallbackem
  const { currentUser, logout } = useAuth?.() ?? { currentUser: null, logout: async () => {} };
  
  // 💥 Využití hooku pro navigaci
  const navigate = useNavigate();

  // 💥 Helper funkce pro odhlášení a přesměrování
  const handleLogout = async () => {
    await logout();
    // Po odhlášení přesměrujeme uživatele na domovskou stránku
    navigate('/'); 
  };


  // Helper funkce pro NavLink
  const NavLink = ({ to, children }) => (
    <li className="nav-item">
      <Link className="nav-link text-primary-dark" to={to}>{children}</Link>
    </li>
  );
  
  // URL adresy z tvého návrhu
  const navigationLinks = [
    { name: 'Domů', to: '/' },
    { name: 'Mapa', to: '/mapa' },
    { name: 'Trasa', to: '/trasa' },
    { name: 'Oblíbené', to: '/oblibene' },
  ];

  return (
    <nav className="navbar navbar-expand-lg border-bottom py-3">
      <div className="container d-flex justify-content-between align-items-center">
        
        {/* Logo vlevo */}
        <Link className="navbar-brand h1 mb-0 text-primary-dark fw-bold" to="/">
          TripTrack
        </Link>
        
        {/* Toggle tlačítko pro mobil */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          
          {/* Odkazy uprostřed */}
          <ul className="navbar-nav mx-auto gap-4">
            {navigationLinks.map((link) => (
              <NavLink key={link.name} to={link.to}>{link.name}</NavLink>
            ))}
          </ul>

          {/* Uživatelský blok vpravo */}
          <div className="d-flex align-items-center ms-auto ms-lg-0">
            {!currentUser ? (
              <div className="d-flex gap-2">
                <Link className="btn btn-outline-primary" to="/login">Přihlášení</Link>
                <Link className="btn btn-dark" to="/register">Registrace</Link>
              </div>
            ) : (
              // Přihlášený uživatel s Dropdownem
              <div className="dropdown">
                <button 
                  className="btn btn-link text-decoration-none dropdown-toggle text-primary-dark" 
                  type="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  {currentUser.email}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" to="/profile">Můj profil</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    {/* 💥 ZMĚNA: Navázání handleLogout funkce na tlačítko */}
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