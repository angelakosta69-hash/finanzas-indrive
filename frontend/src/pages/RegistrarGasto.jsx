import { useState, useEffect } from 'react';
import { api } from '../services/api';

const formatMonto = (value) => {
  const num = value.replace(/\D/g, '');
  return num ? parseInt(num).toLocaleString('es-CO') : '';
};

const parseMonto = (value) => {
  return value.replace(/\./g, '');
};

const RegistrarGasto = ({ onSuccess }) => {
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [lastId, setLastId] = useState(null);
  const [lastMonto, setLastMonto] = useState('');
  const [lastCategoria, setLastCategoria] = useState('');

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const result = await api.categorias.listar();
      setCategorias(result);
    } catch (error) {
      console.error('Error loading categorias:', error);
    }
  };

  const getCategoriaNombre = () => {
    const cat = categorias.find(c => c.id == categoriaId);
    return cat ? cat.nombre : '';
  };

  const esMantenimiento = getCategoriaNombre() === 'mantenimiento';

  const handleMontoChange = (e) => {
    const raw = parseMonto(e.target.value);
    setMonto(formatMonto(raw));
  };

  const handleClearMonto = () => setMonto('');
  const handleClearDescripcion = () => setDescripcion('');

  const handleEliminarUltimo = async () => {
    if (!lastId) return;
    if (!confirm('¿Eliminar este gasto?')) return;

    try {
      await api.gastos.eliminar(lastId);
      setMessage('Gasto eliminado');
      setLastId(null);
      setLastMonto('');
      setLastCategoria('');
      if (onSuccess) onSuccess();
    } catch (error) {
      setMessage('Error al eliminar');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await api.gastos.crear({
        categoria_id: parseInt(categoriaId),
        monto: parseFloat(parseMonto(monto)),
        fecha,
        descripcion
      });

      if (result.id) {
        setLastId(result.id);
        setLastMonto(monto);
        setLastCategoria(getCategoriaNombre());
        setMessage('Gasto registrado exitosamente');
        setMonto('');
        setDescripcion('');
        if (onSuccess) onSuccess();
      } else {
        setMessage(result.message || 'Error al registrar gasto');
      }
    } catch (error) {
      setMessage('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const getCategoriaIcon = (nombre) => {
    switch (nombre) {
      case 'gasolina': return '⛽';
      case 'recarga': return '📱';
      case 'mantenimiento': return '🔧';
      default: return '💵';
    }
  };

  return (
    <div className="form-container">
      <h2>💸 Registrar Gasto</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tipo de Gasto</label>
          <div className="categoria-buttons">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`categoria-btn ${categoriaId == cat.id ? 'active' : ''}`}
                onClick={() => {
                  setCategoriaId(cat.id);
                  if (cat.nombre !== 'mantenimiento') setDescripcion('');
                }}
              >
                {getCategoriaIcon(cat.nombre)} {cat.nombre}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Monto ($)</label>
          <div className="input-with-clear">
            <input
              type="text"
              inputMode="numeric"
              value={monto}
              onChange={handleMontoChange}
              placeholder="0"
              required
            />
            {monto && (
              <button type="button" className="btn-clear-input" onClick={handleClearMonto} title="Borrar monto">✕</button>
            )}
          </div>
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

        {esMantenimiento && (
          <div className="form-group">
            <label>Descripción</label>
            <div className="input-with-clear">
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: aceite, filtro, mano de obra..."
                rows="3"
              />
              {descripcion && (
                <button type="button" className="btn-clear-input btn-clear-textarea" onClick={handleClearDescripcion} title="Borrar descripción">✕</button>
              )}
            </div>
          </div>
        )}

        {message && <div className={`message ${message.includes('exitosamente') ? 'success' : 'error'}`}>{message}</div>}

        {lastId && (
          <div className="last-entry">
            <span>Último: ${lastMonto} ({lastCategoria})</span>
            <button type="button" className="btn-undo" onClick={handleEliminarUltimo}>↩ Deshacer</button>
          </div>
        )}

        <button type="submit" className="btn-primary btn-gasto" disabled={loading || !categoriaId}>
          {loading ? <span className="spinner"></span> : 'Registrar Gasto'}
        </button>
      </form>
    </div>
  );
};

export default RegistrarGasto;
