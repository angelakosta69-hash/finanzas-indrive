import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Configuracion = () => {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [msgNombre, setMsgNombre] = useState('');
  const [msgTelefono, setMsgTelefono] = useState('');
  const [msgPassword, setMsgPassword] = useState('');
  const [savingNombre, setSavingNombre] = useState(false);
  const [savingTelefono, setSavingTelefono] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    loadPerfil();
  }, []);

  const loadPerfil = async () => {
    try {
      const result = await api.config.getPerfil();
      setPerfil(result);
      setNombre(result.nombre || '');
      setTelefono(result.telefono || '');
    } catch (error) {
      console.error('Error loading perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarNombre = async () => {
    setMsgNombre('');
    setSavingNombre(true);
    try {
      const result = await api.config.actualizarNombre(nombre);
      setMsgNombre(result.message);
    } catch (err) {
      setMsgNombre(err.message || 'Error al guardar');
    } finally {
      setSavingNombre(false);
    }
  };

  const handleGuardarTelefono = async () => {
    setMsgTelefono('');
    setSavingTelefono(true);
    try {
      const result = await api.config.actualizarTelefono(telefono);
      setMsgTelefono(result.message);
    } catch (err) {
      setMsgTelefono(err.message || 'Error al guardar');
    } finally {
      setSavingTelefono(false);
    }
  };

  const handleCambiarPassword = async () => {
    setMsgPassword('');
    if (passwordNueva !== passwordConfirm) {
      setMsgPassword('Las contraseñas no coinciden');
      return;
    }
    if (passwordNueva.length < 6) {
      setMsgPassword('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setSavingPassword(true);
    try {
      const result = await api.config.cambiarPassword(passwordActual, passwordNueva);
      setMsgPassword(result.message);
      setPasswordActual('');
      setPasswordNueva('');
      setPasswordConfirm('');
    } catch (err) {
      setMsgPassword(err.message || 'Error al cambiar contraseña');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <span>Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="configuracion">
      <h2>⚙️ Configuración</h2>
      <p className="subtitle">Administra tu perfil y seguridad</p>

      {/* Cambiar Nombre */}
      <div className="config-section">
        <div className="config-section-header">
          <span className="config-section-icon">👤</span>
          <div>
            <h3>Cambiar nombre</h3>
            <p className="config-section-desc">Actualiza tu nombre de perfil</p>
          </div>
        </div>
        <div className="config-section-body">
          <div className="config-field">
            <label>Nombre actual</label>
            <div className="input-with-btn">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
              />
              <button
                className="btn-config-save"
                onClick={handleGuardarNombre}
                disabled={savingNombre || !nombre.trim()}
              >
                {savingNombre ? <span className="spinner"></span> : 'Guardar'}
              </button>
            </div>
          </div>
          {msgNombre && <div className={`config-msg ${msgNombre.includes('exitosamente') ? 'success' : 'error'}`}>{msgNombre}</div>}
        </div>
      </div>

      {/* Teléfono */}
      <div className="config-section">
        <div className="config-section-header">
          <span className="config-section-icon">📱</span>
          <div>
            <h3>Teléfono</h3>
            <p className="config-section-desc">Número de contacto</p>
          </div>
        </div>
        <div className="config-section-body">
          <div className="config-field">
            <label>Número de teléfono</label>
            <div className="input-with-btn">
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: 300 123 4567"
              />
              <button
                className="btn-config-save"
                onClick={handleGuardarTelefono}
                disabled={savingTelefono || !telefono.trim()}
              >
                {savingTelefono ? <span className="spinner"></span> : 'Guardar'}
              </button>
            </div>
          </div>
          {msgTelefono && <div className={`config-msg ${msgTelefono.includes('exitosamente') ? 'success' : 'error'}`}>{msgTelefono}</div>}
        </div>
      </div>

      {/* Cambiar Contraseña */}
      <div className="config-section">
        <div className="config-section-header">
          <span className="config-section-icon">🔒</span>
          <div>
            <h3>Cambiar contraseña</h3>
            <p className="config-section-desc">Mantén tu cuenta segura</p>
          </div>
        </div>
        <div className="config-section-body">
          <div className="config-field">
            <label>Contraseña actual</label>
            <input
              type="password"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="config-field">
            <label>Nueva contraseña</label>
            <input
              type="password"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="config-field">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Repite tu contraseña"
            />
          </div>
          {msgPassword && <div className={`config-msg ${msgPassword.includes('exitosamente') ? 'success' : 'error'}`}>{msgPassword}</div>}
          <button
            className="btn-config-password"
            onClick={handleCambiarPassword}
            disabled={savingPassword || !passwordActual || !passwordNueva || !passwordConfirm}
          >
            {savingPassword ? <span className="spinner"></span> : 'Cambiar contraseña'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;
