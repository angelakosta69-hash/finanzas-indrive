import { useState } from 'react';
import { api } from '../services/api';

const formatMonto = (value) => {
  const num = value.replace(/\D/g, '');
  return num ? parseInt(num).toLocaleString('es-CO') : '';
};

const parseMonto = (value) => {
  return value.replace(/\./g, '');
};

const RegistrarIngreso = ({ onSuccess }) => {
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleMontoChange = (e) => {
    const raw = parseMonto(e.target.value);
    setMonto(formatMonto(raw));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await api.ingresos.crear({
        monto: parseFloat(parseMonto(monto)),
        fecha,
        observaciones
      });

      if (result.id) {
        setMessage('Ingreso registrado exitosamente');
        setMonto('');
        setObservaciones('');
        if (onSuccess) onSuccess();
      } else {
        setMessage(result.message || 'Error al registrar ingreso');
      }
    } catch (error) {
      setMessage('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>💰 Registrar Ingreso</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Monto ($)</label>
          <input
            type="text"
            inputMode="numeric"
            value={monto}
            onChange={handleMontoChange}
            placeholder="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Observaciones (opcional)</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Ej: Viaje al centro, carrera larga..."
            rows="3"
          />
        </div>

        {message && <div className={`message ${message.includes('exitosamente') ? 'success' : 'error'}`}>{message}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Registrar Ingreso'}
        </button>
      </form>
    </div>
  );
};

export default RegistrarIngreso;
