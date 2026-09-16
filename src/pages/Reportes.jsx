import { useState, useEffect } from 'react';
import { api } from '../services/api';

const BarChart = ({ data, height = 200 }) => {
  if (!data || data.length === 0) return <div className="no-data"><p>No hay datos para mostrar</p></div>;

  const max = Math.max(...data.map(d => Math.max(d.ingresos, d.gastos, 1)));
  const barWidth = Math.min(60, (600 / data.length) - 8);
  const chartWidth = data.length * (barWidth + 12) + 40;

  return (
    <div className="chart-scroll">
      <svg width={chartWidth} height={height + 40} className="bar-chart">
        {data.map((d, i) => {
          const x = i * (barWidth + 12) + 20;
          const hIng = (d.ingresos / max) * height;
          const hGas = (d.gastos / max) * height;
          const hBal = (Math.abs(d.balance) / max) * height;

          return (
            <g key={d.mes}>
              <rect
                x={x}
                y={height - hIng}
                width={barWidth / 3}
                height={hIng}
                fill="#10b981"
                rx="3"
                className="bar-animate"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
              <rect
                x={x + barWidth / 3}
                y={height - hGas}
                width={barWidth / 3}
                height={hGas}
                fill="#ef4444"
                rx="3"
                className="bar-animate"
                style={{ animationDelay: `${i * 0.1 + 0.05}s` }}
              />
              <rect
                x={x + (barWidth / 3) * 2}
                y={height - hBal}
                width={barWidth / 3}
                height={hBal}
                fill="#3b82f6"
                rx="3"
                className="bar-animate"
                style={{ animationDelay: `${i * 0.1 + 0.1}s` }}
              />
              <text
                x={x + barWidth / 2}
                y={height + 18}
                textAnchor="middle"
                fill="#7a7a9a"
                fontSize="11"
                fontWeight="500"
              >
                {d.mesLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const Reportes = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistorial();
  }, []);

  const loadHistorial = async () => {
    try {
      const result = await api.dashboard.getHistorial();
      setData(result);
    } catch (error) {
      console.error('Error loading historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatMes = (mesStr) => {
    const [year, month] = mesStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' });
  };

  const historial = data?.historial?.map(h => ({
    ...h,
    mesLabel: formatMes(h.mes)
  })) || [];

  const totalIngresos = historial.reduce((s, h) => s + h.ingresos, 0);
  const totalGastos = historial.reduce((s, h) => s + h.gastos, 0);
  const totalBalance = totalIngresos - totalGastos;
  const promedioIngresos = historial.length > 0 ? totalIngresos / historial.length : 0;
  const promedioGastos = historial.length > 0 ? totalGastos / historial.length : 0;
  const mejorMes = historial.reduce((best, h) => h.balance > (best?.balance || 0) ? h : best, null);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <span>Cargando reportes...</span>
      </div>
    );
  }

  return (
    <div className="reportes">
      <h2>Reportes</h2>
      <p className="subtitle">Historial mensual de todos tus ingresos y gastos</p>

      <div className="report-summary-cards">
        <div className="report-card green">
          <div className="report-card-icon">💰</div>
          <div>
            <span className="report-card-label">Total Ingresos</span>
            <span className="report-card-value">{formatMoney(totalIngresos)}</span>
          </div>
        </div>
        <div className="report-card red">
          <div className="report-card-icon">💸</div>
          <div>
            <span className="report-card-label">Total Gastos</span>
            <span className="report-card-value">{formatMoney(totalGastos)}</span>
          </div>
        </div>
        <div className="report-card blue">
          <div className="report-card-icon">🏦</div>
          <div>
            <span className="report-card-label">Balance Total</span>
            <span className={`report-card-value ${totalBalance >= 0 ? 'positive' : 'negative'}`}>{formatMoney(totalBalance)}</span>
          </div>
        </div>
      </div>

      <div className="report-averages">
        <div className="report-avg-item">
          <span className="report-avg-label">Promedio mensual ingresos</span>
          <span className="report-avg-value positive">{formatMoney(promedioIngresos)}</span>
        </div>
        <div className="report-avg-item">
          <span className="report-avg-label">Promedio mensual gastos</span>
          <span className="report-avg-value negative">{formatMoney(promedioGastos)}</span>
        </div>
        {mejorMes && (
          <div className="report-avg-item">
            <span className="report-avg-label">Mejor mes</span>
            <span className="report-avg-value neutral">{formatMes(mejorMes.mes)} ({formatMoney(mejorMes.balance)})</span>
          </div>
        )}
      </div>

      <div className="report-chart-section">
        <h3>Comparacion mensual</h3>
        <div className="chart-legend">
          <span className="legend-item"><span className="legend-dot green"></span> Ingresos</span>
          <span className="legend-item"><span className="legend-dot red"></span> Gastos</span>
          <span className="legend-item"><span className="legend-dot blue"></span> Balance</span>
        </div>
        <BarChart data={historial} />
      </div>

      <div className="report-table-section">
        <h3>Detalle por mes</h3>
        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Ingresos</th>
                <th>Gastos</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h) => (
                <tr key={h.mes}>
                  <td className="mes-cell">{h.mesLabel}</td>
                  <td className="positive">{formatMoney(h.ingresos)}</td>
                  <td className="negative">{formatMoney(h.gastos)}</td>
                  <td className={h.balance >= 0 ? 'positive' : 'negative'}>{formatMoney(h.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
