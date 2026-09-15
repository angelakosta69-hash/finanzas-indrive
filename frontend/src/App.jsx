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

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: '📊', label: 'Panel' },
    { path: '/ingreso', icon: '💰', label: 'Ingreso' },
    { path: '/gasto', icon: '💸', label: 'Gasto' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">📈</span>
          <span className="sidebar-brand-text">Finanzas</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-motivation">
          <div className="sidebar-motivation-icon">📈</div>
          <p className="sidebar-motivation-text">Pequeños hábitos, grandes resultados</p>
          <div className="sidebar-motivation-bar"></div>
        </div>
      </div>
    </aside>
  );
};

const TopBar = () => {
  const { user, logout } = useAuth();
  const initials = user?.nombre?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <header className="topbar">
      <div className="topbar-search">
        <span className="topbar-search-icon">🔍</span>
        <input type="text" placeholder="Buscar..." className="topbar-search-input" />
      </div>
      <div className="topbar-right">
        <button className="topbar-notification" aria-label="Notificaciones">
          🔔
          <span className="topbar-notification-badge"></span>
        </button>
        <div className="topbar-user">
          <div className="topbar-avatar">{initials}</div>
          <span className="topbar-user-name">{user?.nombre}</span>
          <button onClick={logout} className="topbar-logout" title="Cerrar sesión">⏷</button>
        </div>
      </div>
    </header>
  );
};

const AppContent = () => {
  const { token } = useAuth();

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <TopBar />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ingreso" element={<RegistrarIngreso />} />
            <Route path="/gasto" element={<RegistrarGasto />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
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
