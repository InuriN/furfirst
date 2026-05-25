import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <img
            src={logo}
            alt="FurFirst Logo"
            style={{ height: '55px', width: 'auto', borderRadius: '50%' }}
          />
        </Link>
      </div>
      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/pets">My Pets</Link>
            <Link to="/appointments">Appointments</Link>
            {user.role === 'admin' && (
              <Link to="/admin">Admin</Link>
            )}
            <span style={{ color: '#666' }}>Hello, {user.name}</span>
            <button className="btn btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;