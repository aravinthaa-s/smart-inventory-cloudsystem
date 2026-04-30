import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Login({ setUser }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    localStorage.removeItem('user');
    setUser(null);
  }, [setUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/users/login', { username, password });
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        navigate('/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') { setUsername('admin'); setPassword('admin123'); }
    else { setUsername('staff'); setPassword('staff123'); }
  };

  return (
    <div style={styles.page}>
      {/* Animated blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="14" fill="#0078D4" />
            <path d="M12 30 Q16 18 24 24 Q32 30 36 18" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <circle cx="24" cy="24" r="4" fill="white" opacity="0.9"/>
          </svg>
        </div>

        <h1 style={styles.title}>Smart Inventory</h1>
        <p style={styles.subtitle}>Cloud-based AI Management System</p>

        {/* Demo credential buttons */}
        <div style={styles.demoRow}>
          <span style={styles.demoLabel}>Quick login:</span>
          <button type="button" style={styles.demoBtn} onClick={() => fillDemo('admin')}>Admin</button>
          <button type="button" style={styles.demoBtn} onClick={() => fillDemo('staff')}>Staff</button>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span style={{marginRight: 8}}>⚠️</span>{error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{width: '100%'}}>
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="username">Username</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>👤</span>
              <input
                id="username"
                type="text"
                style={styles.input}
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="password">Password</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                style={{...styles.input, paddingRight: '44px'}}
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{...styles.loginBtn, opacity: loading ? 0.75 : 1}}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.spinner} />
            ) : ''}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={styles.hint}>
          Default credentials: <strong>admin / admin123</strong>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a1628 0%, #0d2a4a 50%, #0a1628 100%)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  blob1: {
    position: 'absolute', width: '420px', height: '420px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,120,212,0.25) 0%, transparent 70%)',
    top: '-100px', left: '-100px', pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', width: '350px', height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,120,212,0.15) 0%, transparent 70%)',
    bottom: '-80px', right: '-80px', pointerEvents: 'none',
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '20px',
    padding: '48px 40px 36px',
    width: '420px',
    maxWidth: '95vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
    position: 'relative',
    zIndex: 1,
  },
  logoWrap: {
    marginBottom: '20px',
    filter: 'drop-shadow(0 4px 16px rgba(0,120,212,0.5))',
  },
  title: {
    fontSize: '1.7rem',
    fontWeight: 700,
    color: '#ffffff',
    margin: '0 0 6px',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '24px',
  },
  demoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
    background: 'rgba(0,120,212,0.12)',
    border: '1px solid rgba(0,120,212,0.3)',
    borderRadius: '8px',
    padding: '8px 14px',
    width: '100%',
  },
  demoLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.55)',
    flex: 1,
  },
  demoBtn: {
    background: 'rgba(0,120,212,0.35)',
    border: '1px solid rgba(0,120,212,0.5)',
    borderRadius: '6px',
    color: '#7ec8f5',
    fontSize: '12px',
    padding: '4px 12px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'background 0.2s',
  },
  errorBox: {
    width: '100%',
    background: 'rgba(209,52,56,0.15)',
    border: '1px solid rgba(209,52,56,0.4)',
    borderRadius: '8px',
    color: '#ff8a8a',
    fontSize: '13px',
    padding: '10px 14px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
  },
  fieldGroup: {
    marginBottom: '18px',
    width: '100%',
  },
  label: {
    display: 'block',
    marginBottom: '7px',
    fontSize: '13px',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: '0.2px',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '13px',
    fontSize: '15px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 40px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: 1,
    padding: '4px',
  },
  loginBtn: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #0078D4, #005A9E)',
    border: 'none',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.3px',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 20px rgba(0,120,212,0.4)',
    transition: 'opacity 0.2s, transform 0.1s',
  },
  spinner: {
    width: '16px', height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  hint: {
    marginTop: '20px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
  },
};

export default Login;
