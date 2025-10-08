import { Link } from 'react-router-dom'
import { useAuth } from '../Auth/AuthContext'

function Navbar() {
  const { currentUser, logout } = useAuth?.() ?? { currentUser: null, logout: async () => {} }
  return (
    <nav className="navbar navbar-expand-lg bg-light fixed-top">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        
        {/* Logo vlevo */}
        <Link className="navbar-brand" to="/">TripTrack</Link>

        {/* Odkazy uprostřed */}
        <div className="d-none d-lg-flex mx-auto">
          <ul className="navbar-nav flex-row gap-4">
            <li className="nav-item">
              <Link className="nav-link" to="/">Domů</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/mapa">Mapa</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Trasa</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Oblíbené</a>
            </li>
          </ul>
        </div>

        {/* Uživatelský blok vpravo */}
        <div className="d-flex align-items-center">
          {!currentUser ? (
            <div className="d-flex gap-2">
              <Link className="btn btn-outline-primary" to="/login">Přihlášení</Link>
              <Link className="btn btn-primary" to="/register">Registrace</Link>
            </div>
          ) : (
            <div className="dropdown">
              <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                {currentUser.email}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><Link className="dropdown-item" to="/home">Domů</Link></li>
                <li><Link className="dropdown-item" to="/mapa">Mapa</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item" onClick={logout}>Odhlásit se</button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
