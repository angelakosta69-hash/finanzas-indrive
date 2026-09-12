import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayData, setDayData] = useState(null);
  const [loadingDay, setLoadingDay] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadDayData(selectedDate);
    }
  }, [selectedDate]);

  const loadDashboard = async () => {
    try {
      const result = await api.dashboard.getResumen();
      setData(result);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDayData = async (fecha) => {
    setLoadingDay(true);
    try {
      const result = await api.dashboard.getDia(fecha);
      setDayData(result);
    } catch (error) {
      console.error('Error loading day data:', error);
    } finally {
      setLoadingDay(false);
    }
  };

  const handleEliminar = async (tipo, id) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;

    try {
      if (tipo === 'ingreso') {
        await api.ingresos.eliminar(id);
      } else {
        await api.gastos.eliminar(id);
      }
      loadDashboard();
      if (selectedDate) loadDayData(selectedDate);
    } catch (error) {
      console.error('Error eliminando:', error);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="dashboard">
      <h2>Hola, {user?.nombre}</h2>
      <p className="subtitle">Resumen de tus finanzas</p>

      <div className="cards-grid">
        <div className="card card-ingreso">
          <h3>Hoy</h3>
          <div className="card-content">
            <div className="card-item">
              <span className="label">Ingresos</span>
              <span className="value positive">{formatMoney(data?.hoy?.ingresos || 0)}</span>
            </div>
            <div className="card-item">
              <span className="label">Gastos</span>
              <span className="value negative">{formatMoney(data?.hoy?.gastos || 0)}</span>
            </div>
            <div className="card-item total">
              <span className="label">Balance</span>
              <span className={`value ${(data?.hoy?.balance || 0) >= 0 ? 'positive' : 'negative'}`}>
                {formatMoney(data?.hoy?.balance || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="card card-semana">
          <h3>Esta Semana</h3>
          <div className="card-content">
            <div className="card-item">
              <span className="label">Ingresos</span>
              <span className="value positive">{formatMoney(data?.semana?.ingresos || 0)}</span>
            </div>
            <div className="card-item">
              <span className="label">Gastos</span>
              <span className="value negative">{formatMoney(data?.semana?.gastos || 0)}</span>
            </div>
            <div className="card-item total">
              <span className="label">Balance</span>
              <span className={`value ${(data?.semana?.balance || 0) >= 0 ? 'positive' : 'negative'}`}>
                {formatMoney(data?.semana?.balance || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="card card-mes">
          <h3>Este Mes</h3>
          <div className="card-content">
            <div className="card-item">
              <span className="label">Ingresos</span>
              <span className="value positive">{formatMoney(data?.mes?.ingresos || 0)}</span>
            </div>
            <div className="card-item">
              <span className="label">Gastos</span>
              <span className="value negative">{formatMoney(data?.mes?.gastos || 0)}</span>
            </div>
            <div className="card-item total">
              <span className="label">Balance</span>
              <span className={`value ${(data?.mes?.balance || 0) >= 0 ? 'positive' : 'negative'}`}>
                {formatMoney(data?.mes?.balance || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="calendar-section">
        <div className="calendar-header">
          <h3>Consultar por día</h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-picker"
          />
        </div>

        {loadingDay ? (
          <div className="loading-day">Cargando...</div>
        ) : dayData ? (
          <div className="day-detail">
            <p className="day-label">{formatDateLabel(dayData.fecha)}</p>

            <div className="day-summary">
              <div className="day-item">
                <span className="label">Ingresos</span>
                <span className="value positive">{formatMoney(dayData.ingresos.total)}</span>
              </div>
              <div className="day-item">
                <span className="label">Gastos</span>
                <span className="value negative">{formatMoney(dayData.gastos.total)}</span>
              </div>
              <div className="day-item">
                <span className="label">Balance</span>
                <span className={`value ${dayData.balance >= 0 ? 'positive' : 'negative'}`}>
                  {formatMoney(dayData.balance)}
                </span>
              </div>
            </div>

            {dayData.ingresos.detalle.length > 0 && (
              <div className="day-movements">
                <h4>Ingresos</h4>
                {dayData.ingresos.detalle.map((ing, i) => (
                  <div key={`ing-${i}`} className="movement-item ingreso">
                    <div className="movement-info">
                      <span className="movement-type">+ Ingreso</span>
                      {ing.observaciones && <span className="movement-desc">{ing.observaciones}</span>}
                    </div>
                    <span className="movement-amount positive">{formatMoney(ing.monto)}</span>
                  </div>
                ))}
              </div>
            )}

            {dayData.gastos.detalle.length > 0 && (
              <div className="day-movements">
                <h4>Gastos</h4>
                {dayData.gastos.detalle.map((gast, i) => (
                  <div key={`gast-${i}`} className="movement-item gasto">
                    <div className="movement-info">
                      <span className="movement-type">- {gast.categoria_nombre}</span>
                      {gast.descripcion && <span className="movement-desc">{gast.descripcion}</span>}
                    </div>
                    <span className="movement-amount negative">{formatMoney(gast.monto)}</span>
                  </div>
                ))}
              </div>
            )}

            {dayData.ingresos.detalle.length === 0 && dayData.gastos.detalle.length === 0 && (
              <p className="no-data">No hay movimientos este día</p>
            )}
          </div>
        ) : null}
      </div>

      <div className="gastos-categoria">
        <h3>Gastos del Mes por Categoría</h3>
        <div className="categoria-list">
          {data?.gastosPorCategoria?.map((cat, index) => (
            <div key={index} className="categoria-item">
              <span className="cat-name">
                {cat.nombre === 'gasolina' ? '⛽' : cat.nombre === 'recarga' ? '📱' : '🔧'} {cat.nombre}
              </span>
              <span className="cat-total">{formatMoney(cat.total)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-movements">
        <h3>Últimos Movimientos</h3>
        <div className="movements-list">
          {data?.ultimosIngresos?.map((ing, index) => (
            <div key={`ing-${index}`} className="movement-item ingreso">
              <div className="movement-info">
                <span className="movement-type">+ Ingreso</span>
                <span className="movement-date">{new Date(ing.fecha).toLocaleDateString('es-CO')}</span>
              </div>
              <div className="movement-right">
                <span className="movement-amount positive">{formatMoney(ing.monto)}</span>
                <button className="btn-delete" onClick={() => handleEliminar('ingreso', ing.id)} title="Eliminar">✕</button>
              </div>
            </div>
          ))}
          {data?.ultimosGastos?.map((gast, index) => (
            <div key={`gast-${index}`} className="movement-item gasto">
              <div className="movement-info">
                <span className="movement-type">- {gast.categoria_nombre}</span>
                <span className="movement-date">{new Date(gast.fecha).toLocaleDateString('es-CO')}</span>
              </div>
              <div className="movement-right">
                <span className="movement-amount negative">{formatMoney(gast.monto)}</span>
                <button className="btn-delete" onClick={() => handleEliminar('gasto', gast.id)} title="Eliminar">✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
