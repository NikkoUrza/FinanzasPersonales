import { useFinanzas } from '../context/FinanzasContext'
import { ArrowUpRight, ArrowDownRight, Wallet, AlertCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function Dashboard() {
  const { 
    totalIngresos, 
    totalEgresos, 
    balance, 
    totalDeudas, 
    ingresos, 
    egresos, 
    formatPesos 
  } = useFinanzas()

  // Combinar ingresos y egresos para las últimas transacciones
  const ultimasTransacciones = [
    ...ingresos.map(i => ({ ...i, tipoTransaccion: 'ingreso' })),
    ...egresos.map(e => ({ ...e, tipoTransaccion: 'egreso' }))
  ]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5)

  // Calcular porcentaje de egresos sobre ingresos
  const porcentajeGastos = totalIngresos > 0 
    ? Math.min(Math.round((totalEgresos / totalIngresos) * 100), 100) 
    : 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ marginBottom: '5px' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Resumen financiero de tus cuentas en pesos.</p>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card-header">
            <h3>Total Ingresos</h3>
            <div className="icon-wrapper" style={{ color: 'var(--accent-success)' }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <p className="amount amount-positive">{formatPesos(totalIngresos)}</p>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <h3>Total Egresos</h3>
            <div className="icon-wrapper" style={{ color: 'var(--accent-danger)' }}>
              <ArrowDownRight size={18} />
            </div>
          </div>
          <p className="amount amount-negative">{formatPesos(totalEgresos)}</p>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <h3>Balance Neto</h3>
            <div className="icon-wrapper" style={{ color: balance >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
              <Wallet size={18} />
            </div>
          </div>
          <p className={`amount ${balance >= 0 ? 'amount-positive' : 'amount-negative'}`}>
            {formatPesos(balance)}
          </p>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <h3>Deudas Pendientes</h3>
            <div className="icon-wrapper" style={{ color: 'var(--accent-warning-text)' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <p className="amount" style={{ color: 'var(--accent-warning-text)' }}>{formatPesos(totalDeudas)}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Panel de Distribución / Salud Financiera */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2>Salud Financiera</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
              Relación entre tus egresos totales y tus ingresos totales en este periodo.
            </p>
            
            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Porcentaje de Egreso</span>
                <span style={{ fontWeight: '600', color: porcentajeGastos > 80 ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                  {porcentajeGastos}%
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#202025', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${porcentajeGastos}%`, 
                    height: '100%', 
                    backgroundColor: porcentajeGastos > 80 ? 'var(--accent-danger)' : 'var(--accent-primary)',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease-in-out'
                  }} 
                />
              </div>
            </div>
          </div>

          <div style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#16161a', border: '1px solid var(--border-color)', fontSize: '13px' }}>
            {porcentajeGastos === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Registra ingresos y egresos para ver tu diagnóstico.</p>
            ) : porcentajeGastos < 50 ? (
              <p style={{ color: 'var(--accent-success-text)' }}>🟢 ¡Excelente! Estás ahorrando más del 50% de tus ingresos.</p>
            ) : porcentajeGastos <= 80 ? (
              <p style={{ color: 'var(--text-primary)' }}>🟡 Tus gastos están controlados, pero intenta reducir egresos hormiga.</p>
            ) : (
              <p style={{ color: 'var(--accent-danger-text)' }}>🔴 Cuidado: Estás gastando más del 80% de lo que ingresas.</p>
            )}
          </div>
        </div>

        {/* Panel de Actividad Reciente */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Actividad Reciente</h2>
            <div style={{ display: 'flex', gap: '15px', fontSize: '13px' }}>
              <Link to="/ingresos" style={{ color: 'var(--accent-success-text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Ingresos <ArrowRight size={14} />
              </Link>
              <Link to="/egresos" style={{ color: 'var(--accent-danger-text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Egresos <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {ultimasTransacciones.length === 0 ? (
            <div className="empty-state">
              <Wallet size={36} />
              <p>No hay transacciones registradas recientemente.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimasTransacciones.map(t => (
                    <tr key={`${t.tipoTransaccion}-${t.id}`}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{t.fecha}</td>
                      <td style={{ fontWeight: '500' }}>{t.descripcion}</td>
                      <td>
                        <span className={`badge ${t.tipoTransaccion === 'ingreso' ? 'badge-ingreso' : 'badge-egreso'}`}>
                          {t.categoria}
                        </span>
                      </td>
                      <td className={t.tipoTransaccion === 'ingreso' ? 'amount-positive' : 'amount-negative'} style={{ fontWeight: '600' }}>
                        {t.tipoTransaccion === 'ingreso' ? '+' : '-'}{formatPesos(t.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
