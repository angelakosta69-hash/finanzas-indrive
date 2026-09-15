import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import RegistrarIngreso from './pages/RegistrarIngreso';
import RegistrarGasto from './pages/RegistrarGasto';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const initials = user.nombre?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">
          <span className="nav-brand-icon">🚗</span>
          Finanzas
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</Link>
        <Link to="/ingreso" className={location.pathname === '/ingreso' ? 'active' : ''}>Ingreso</Link>
        <Link to="/gasto" className={location.pathname === '/gasto' ? 'active' : ''}>Gasto</Link>
      </div>
      <div className="nav-user">
        <div className="nav-avatar">{initials}</div>
        <span className="nav-user-name">{user.nombre}</span>
        <button onClick={logout} className="btn-logout">Salir</button>
      </div>
    </nav>
  );
};

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        <Link to="/" className={`bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <span className="bottom-nav-icon">📊</span>
          Dashboard
        </Link>
        <Link to="/ingreso" className={`bottom-nav-item ${location.pathname === '/ingreso' ? 'active' : ''}`}>
          <span className="bottom-nav-icon">💰</span>
          Ingreso
        </Link>
        <Link to="/gasto" className={`bottom-nav-item ${location.pathname === '/gasto' ? 'active' : ''}`}>
          <span className="bottom-nav-icon">💸</span>
          Gasto
        </Link>
      </div>
    </nav>
  );
};

const AppContent = () => {
  const { token } = useAuth();

  return (
    <>
      {token && <Navbar />}
      <div className={`app-container ${token ? 'with-nav' : ''}`}>
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
          <Route path="/registro" element={token ? <Navigate to="/" /> : <Registro />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/ingreso" element={<PrivateRoute><RegistrarIngreso /></PrivateRoute>} />
          <Route path="/gasto" element={<PrivateRoute><RegistrarGasto /></PrivateRoute>} />
        </Routes>
      </div>
      {token && <BottomNav />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
