import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AI from './pages/AI';
import Reports from './pages/Reports';
import Sidebar from './components/Sidebar';

function Layout({ children, user, onLogout }) {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #0078D4, #005A9E)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '14px'
            }}>
              {user && user.Username ? user.Username[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{user ? user.Username : 'User'}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{user ? user.Role : ''}</div>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              style={{
                marginLeft: '8px',
                padding: '6px 14px',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.target.style.borderColor = '#D13438'; e.target.style.color = '#D13438'; }}
              onMouseOut={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.color = 'var(--text-secondary)'; }}
            >
              ⏻ Logout
            </button>
          </div>
        </header>
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.Username) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('user');
        }
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#F3F2F1', color: '#605E5C', fontSize: '16px'
    }}>
      Loading…
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />

        {/* Protected Routes */}
        <Route path="/dashboard"    element={user ? <Layout user={user} onLogout={handleLogout}><Dashboard /></Layout>   : <Navigate to="/login" />} />
        <Route path="/products"     element={user ? <Layout user={user} onLogout={handleLogout}><Products /></Layout>    : <Navigate to="/login" />} />
        <Route path="/ai-assistant" element={user ? <Layout user={user} onLogout={handleLogout}><AI /></Layout>          : <Navigate to="/login" />} />
        <Route path="/reports"      element={user ? <Layout user={user} onLogout={handleLogout}><Reports /></Layout>     : <Navigate to="/login" />} />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
