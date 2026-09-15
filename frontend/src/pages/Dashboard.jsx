import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Sparkline = ({ data, color }) => {
  const [animated, setAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 120;
  const height = 40;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const pathLength = width * 2;

  return (
    <svg ref={ref} width={width} height={height} className="sparkline">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={`url(#grad-${color.replace('#', '')})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: animated ? 0 : pathLength,
          transition: 'stroke-dashoffset 1.5s ease-out'
        }}
      />
    </svg>
  );
};

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
    if (selectedDate) loadDayData(selectedDate);
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
      if (tipo === 'ingreso') await api.ingresos.eliminar(id);
      else await api.gastos.eliminar(id);
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
    return date.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDateShort = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return `${d.getDate()} / ${String(d.getMonth() + 1).padStart(2, '0')} / ${d.getFullYear()}`;
  };

  const ingresos = data?.mes?.ingresos || 0;
  const gastos = data?.mes?.gastos || 0;
  const balance = data?.mes?.balance || 0;
  const total = ingresos + gastos || 1;

  const ingresosPct = Math.round((ingresos / total) * 100);
  const gastosPct = Math.round((gastos / total) * 100);
  const balancePct = 100 - ingresosPct - gastosPct;

  const sparkIngresos = data?.ultimosIngresos?.slice().reverse().map(i => parseFloat(i.monto)) || [];
  const sparkGastos = data?.ultimosGastos?.slice().reverse().map(g => parseFloat(g.monto)) || [];

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <span>Cargando tus finanzas...</span>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1 className="welcome-title">👋 Hola, <span className="welcome-name">{user?.nombre}</span></h1>
          <p className="welcome-subtitle">Aquí tienes un resumen de tus finanzas</p>
        </div>
        <div className="welcome-quote">
          <p>Tu esfuerzo</p>
          <p>también cuenta</p>
        </div>
        <div className="welcome-wave"></div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card summary-card-ingresos">
          <div className="summary-card-header">
            <div className="summary-card-icon green">💰</div>
            <div className="summary-card-info">
              <span className="summary-card-title">Ingresos</span>
              <span className="summary-card-change positive">↑ Total del mes</span>
            </div>
            <button className="summary-card-arrow">›</button>
          </div>
          <div className="summary-card-amount">{formatMoney(ingresos)}</div>
          <div className="summary-card-footer">
            <Sparkline data={sparkIngresos} color="#10b981" />
            <span className="summary-card-label">📅 Total del mes</span>
          </div>
        </div>

        <div className="summary-card summary-card-gastos">
          <div className="summary-card-header">
            <div className="summary-card-icon red">💸</div>
            <div className="summary-card-info">
              <span className="summary-card-title">Gastos</span>
              <span className="summary-card-change negative">↑ Total del mes</span>
            </div>
            <button className="summary-card-arrow">›</button>
          </div>
          <div className="summary-card-amount">{formatMoney(gastos)}</div>
          <div className="summary-card-footer">
            <Sparkline data={sparkGastos} color="#ef4444" />
            <span className="summary-card-label">📅 Total del mes</span>
          </div>
        </div>

        <div className="summary-card summary-card-balance">
          <div className="summary-card-header">
            <div className="summary-card-icon blue">🏦</div>
            <div className="summary-card-info">
              <span className="summary-card-title">Balance</span>
              <span className="summary-card-change neutral">↑ Disponible</span>
            </div>
            <button className="summary-card-arrow">›</button>
          </div>
          <div className="summary-card-amount">{formatMoney(balance)}</div>
          <div className="summary-card-footer">
            <Sparkline data={[...sparkIngresos].map((v, i) => v - (sparkGastos[i] || 0))} color="#3b82f6" />
            <span className="summary-card-label">🏦 Disponible</span>
          </div>
        </div>
      </div>

      {/* Calendar + Day Detail */}
      <div className="dashboard-grid">
        <div className="calendar-section">
          <div className="calendar-header">
            <div>
              <h3>📅 Consultar por día</h3>
              <p className="calendar-subtitle">Selecciona una fecha para ver el detalle de tus movimientos</p>
            </div>
            <div className="date-picker-wrapper">
              <span className="date-picker-icon">📅</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-picker"
              />
            </div>
          </div>

          {dayData && (
            <>
              <div className="day-summary-cards">
                <div className="day-summary-card green">
                  <div className="day-summary-icon">↓</div>
                  <div>
                    <span className="day-summary-label">Ingresos</span>
                    <span className="day-summary-value">{formatMoney(dayData.ingresos.total)}</span>
                  </div>
                  <span className="day-summary-arrow">›</span>
                </div>
                <div className="day-summary-card red">
                  <div className="day-summary-icon">↑</div>
                  <div>
                    <span className="day-summary-label">Gastos</span>
                    <span className="day-summary-value">{formatMoney(dayData.gastos.total)}</span>
                  </div>
                  <span className="day-summary-arrow">›</span>
                </div>
                <div className="day-summary-card blue">
                  <div className="day-summary-icon">🏦</div>
                  <div>
                    <span className="day-summary-label">Balance</span>
                    <span className="day-summary-value">{formatMoney(dayData.balance)}</span>
                  </div>
                  <span className="day-summary-arrow">›</span>
                </div>
              </div>

              <div className="day-progress-section">
                <h4>📊 Resumen del día</h4>
                <div className="day-progress-bar">
                  <div className="day-progress-segment green" style={{ width: `${ingresosPct}%` }}></div>
                  <div className="day-progress-segment red" style={{ width: `${gastosPct}%` }}></div>
                  <div className="day-progress-segment blue" style={{ width: `${balancePct}%` }}></div>
                </div>
                <div className="day-progress-legend">
                  <div className="legend-item">
                    <span className="legend-dot green"></span>
                    <span className="legend-label">Ingresos</span>
                    <span className="legend-value">{formatMoney(dayData.ingresos.total)}</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot red"></span>
                    <span className="legend-label">Gastos</span>
                    <span className="legend-value">{formatMoney(dayData.gastos.total)}</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot blue"></span>
                    <span className="legend-label">Balance</span>
                    <span className="legend-value">{formatMoney(dayData.balance)}</span>
                  </div>
                </div>
              </div>

              {/* Day Movements */}
              {dayData.ingresos.detalle.length > 0 && (
                <div className="day-movements">
                  <h4>Ingresos del día</h4>
                  {dayData.ingresos.detalle.map((ing, i) => (
                    <div key={`ing-${i}`} className="movement-item">
                      <div className="movement-left">
                        <div className="movement-icon ingreso">💰</div>
                        <div className="movement-info">
                          <span className="movement-type">Ingreso</span>
                          {ing.observaciones && <span className="movement-desc">{ing.observaciones}</span>}
                        </div>
                      </div>
                      <div className="movement-right">
                        <span className="movement-amount positive">+{formatMoney(ing.monto)}</span>
                        <button className="btn-delete" onClick={() => handleEliminar('ingreso', ing.id)} title="Eliminar" aria-label={`Eliminar ingreso de ${formatMoney(ing.monto)}`}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {dayData.gastos.detalle.length > 0 && (
                <div className="day-movements">
                  <h4>Gastos del día</h4>
                  {dayData.gastos.detalle.map((gast, i) => (
                    <div key={`gast-${i}`} className="movement-item">
                      <div className="movement-left">
                        <div className="movement-icon gasto">
                          {gast.categoria_nombre === 'gasolina' ? '⛽' : gast.categoria_nombre === 'recarga' ? '📱' : '🔧'}
                        </div>
                        <div className="movement-info">
                          <span className="movement-type">{gast.categoria_nombre}</span>
                          {gast.descripcion && <span className="movement-desc">{gast.descripcion}</span>}
                        </div>
                      </div>
                      <div className="movement-right">
                        <span className="movement-amount negative">-{formatMoney(gast.monto)}</span>
                        <button className="btn-delete" onClick={() => handleEliminar('gasto', gast.id)} title="Eliminar" aria-label={`Eliminar gasto de ${gast.categoria_nombre}: ${formatMoney(gast.monto)}`}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {dayData.ingresos.detalle.length === 0 && dayData.gastos.detalle.length === 0 && (
                <div className="no-data">
                  <div className="no-data-icon">📭</div>
                  <p>No hay movimientos este día</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Side Card */}
        <div className="status-card">
          <div className="status-card-illustration">
            <div className="status-calendar-icon">📅</div>
            <div className="status-check">✓</div>
          </div>
          <h3 className="status-title">Todo en orden</h3>
          <p className="status-text">Tus finanzas se mantienen bajo control.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
