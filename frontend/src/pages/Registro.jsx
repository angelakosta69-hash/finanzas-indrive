import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const Registro = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [placa, setPlaca] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const result = await api.auth.register({
        nombre,
        email,
        password,
        placa_vehiculo: placa
      });

      if (result.token) {
        login(result.usuario, result.token);
      } else {
        setError(result.message || 'Error al registrar');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Crear Cuenta</h1>
          <p>Regístrate para empezar a controlar tus finanzas</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength="6"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              minLength="6"
              required
            />
          </div>

          <div className="form-group">
            <label>Placa del vehículo (opcional)</label>
            <input
              type="text"
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              placeholder="ABC 123"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Registrarse'}
          </button>
        </form>

        <div className="login-toggle">
          <p>
            ¿Ya tienes cuenta?
            <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;
