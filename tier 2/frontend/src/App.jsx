import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import { LogOut } from 'lucide-react';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [farmerId, setFarmerId] = useState(null);
  const [farmerName, setFarmerName] = useState('');

  const handleLogin = (id, name) => {
    setFarmerId(id);
    setFarmerName(name);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setFarmerId(null);
    setFarmerName('');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="app-container">

        {/* Only show the header/nav if the user is authenticated */}
        {isAuthenticated && (
          <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Smart Farm Intelligence</h1>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/dashboard" className="btn" style={{ background: 'var(--accent-blue)', textDecoration: 'none' }}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </nav>
          </header>
        )}

        <main style={{ marginTop: isAuthenticated ? '2rem' : '0' }}>
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth onLogin={handleLogin} />
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? <Dashboard farmerId={farmerId} farmerName={farmerName} /> : <Navigate to="/" replace />
              }
            />
            {/* Catch-all route to prevent 404s */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
