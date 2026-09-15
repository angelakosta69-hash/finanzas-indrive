import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import RegistrarIngreso from './pages/RegistrarIngreso';
import RegistrarGasto from './pages/RegistrarGasto';
import Reportes from './pages/Reportes';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: '📊', label: 'Panel' },
    { path: '/ingreso', icon: '💰', label: 'Ingreso' },
    { path: '/gasto', icon: '💸', label: 'Gasto' },
    { path: '/reportes', icon: '📈', label: 'Reportes' },
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

const MobileHeader = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname === '/ingreso') return '💰 Ingreso';
    if (location.pathname === '/gasto') return '💸 Gasto';
    if (location.pathname === '/reportes') return '📈 Reportes';
    return '📊 Panel';
  };

  return (
    <header className="mobile-header">
      <div className="mobile-header-left">
        <span className="mobile-header-brand">📈</span>
        <span className="mobile-header-title">{getTitle()}</span>
      </div>
      <button onClick={logout} className="mobile-header-logout" title="Cerrar sesión">
        Salir
      </button>
    </header>
  );
};

const TopBar = () => {
  const { user, logout } = useAuth();
  const initials = user?.nombre?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <header className="topbar">
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

const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="mobile-nav">
      <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <span className="mobile-nav-icon">📊</span>
        <span className="mobile-nav-label">Panel</span>
      </Link>
      <Link to="/ingreso" className={`mobile-nav-item ${location.pathname === '/ingreso' ? 'active' : ''}`}>
        <span className="mobile-nav-icon">💰</span>
        <span className="mobile-nav-label">Ingreso</span>
      </Link>
      <Link to="/gasto" className={`mobile-nav-item ${location.pathname === '/gasto' ? 'active' : ''}`}>
        <span className="mobile-nav-icon">💸</span>
        <span className="mobile-nav-label">Gasto</span>
      </Link>
      <Link to="/reportes" className={`mobile-nav-item ${location.pathname === '/reportes' ? 'active' : ''}`}>
        <span className="mobile-nav-icon">📈</span>
        <span className="mobile-nav-label">Reportes</span>
      </Link>
    </nav>
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
        <MobileHeader />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ingreso" element={<RegistrarIngreso />} />
            <Route path="/gasto" element={<RegistrarGasto />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
      <MobileNav />
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
