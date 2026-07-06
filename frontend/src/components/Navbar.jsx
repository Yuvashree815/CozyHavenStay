import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg cozy-navbar">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <span>Cozy</span>Haven<span style={{ color: 'var(--accent)' }}>Stay</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>

            {isAuthenticated && user?.role === 'User' && (
              <li className="nav-item">
                <Link className="nav-link" to="/my-bookings">My Bookings</Link>
              </li>
            )}

            {isAuthenticated && user?.role === 'HotelOwner' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/owner/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/owner/hotels">My Hotels</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/owner/refunds">Refunds</Link>
                </li>
              </>
            )}

            {isAuthenticated && user?.role === 'Admin' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/users">Users</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/hotels">Hotels</Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav ms-auto align-items-center gap-2">
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="btn btn-gold btn-sm px-3 py-2"
                    to="/register"
                  >
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link d-flex align-items-center"
                    to="/profile"
                  >
                    <span className="user-avatar">
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </span>
                    <span className="d-none d-md-inline">
                      {user?.fullName?.split(' ')[0]}
                    </span>
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn-logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;