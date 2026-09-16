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

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">🚗 Finanzas</Link>
      </div>
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</Link>
        <Link to="/ingreso" className={location.pathname === '/ingreso' ? 'active' : ''}>Ingreso</Link>
        <Link to="/gasto" className={location.pathname === '/gasto' ? 'active' : ''}>Gasto</Link>
        <Link to="/reportes" className={location.pathname === '/reportes' ? 'active' : ''}>Reportes</Link>
      </div>
      <div className="nav-user">
        <span>{user.nombre}</span>
        <button onClick={logout} className="btn-logout">Salir</button>
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
          <Route path="/reportes" element={<PrivateRoute><Reportes /></PrivateRoute>} />
        </Routes>
      </div>
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
