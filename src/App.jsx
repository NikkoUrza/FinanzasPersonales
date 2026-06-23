import { Routes, Route, NavLink, Link } from 'react-router-dom'
import { Coins, LogOut, ShieldAlert, LayoutDashboard, ArrowUpCircle, ArrowDownCircle, CreditCard } from 'lucide-react'
import { useFinanzas } from './context/FinanzasContext'
import Dashboard from './pages/Dashboard'
import Ingresos from './pages/Ingresos'
import Egresos from './pages/Egresos'
import Deudas from './pages/Deudas'
import Login from './pages/Login'

function App() {
  const { user, loading, logout, hasFirebaseConfig } = useFinanzas()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#0b0b0d',
        color: '#f3f4f6',
        gap: '15px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid #202025',
          borderTopColor: 'var(--accent-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', letterSpacing: '0.01em' }}>Iniciando sesión segura...</span>
      </div>
    )
  }

  // Si Firebase está configurado y no hay sesión activa, obligar a iniciar sesión
  if (hasFirebaseConfig && !user) {
    return <Login />
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <Coins size={22} style={{ color: 'var(--accent-primary)' }} /> 
            <span>Mis Finanzas</span>
          </Link>
          
          <div className="nav-links">
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/ingresos">Ingresos</NavLink>
            <NavLink to="/egresos">Egresos</NavLink>
            <NavLink to="/deudas">Deudas</NavLink>
          </div>

          <div className="nav-actions">
            {user ? (
              <button 
                onClick={logout} 
                className="btn btn-secondary nav-action-btn"
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '13px', 
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Cerrar sesión"
              >
                <LogOut size={14} />
                <span className="nav-action-text">Salir</span>
              </button>
            ) : !hasFirebaseConfig ? (
              <span className="nav-action-badge" style={{ 
                fontSize: '11px', 
                color: 'var(--accent-warning-text)', 
                backgroundColor: 'var(--accent-warning-bg)', 
                border: '1px solid var(--accent-warning-border)',
                padding: '5px 10px', 
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                height: '34px',
                fontWeight: '500'
              }} title="Firebase no configurado. Cambios guardados en este navegador.">
                <ShieldAlert size={13} /> <span className="nav-action-text">Modo Local</span>
              </span>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation for Mobile Devices */}
      <div className="bottom-nav">
        <NavLink to="/" className="bottom-nav-item" end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/ingresos" className="bottom-nav-item">
          <ArrowUpCircle size={20} />
          <span>Ingresos</span>
        </NavLink>
        <NavLink to="/egresos" className="bottom-nav-item">
          <ArrowDownCircle size={20} />
          <span>Egresos</span>
        </NavLink>
        <NavLink to="/deudas" className="bottom-nav-item">
          <CreditCard size={20} />
          <span>Deudas</span>
        </NavLink>
      </div>
      
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ingresos" element={<Ingresos />} />
          <Route path="/egresos" element={<Egresos />} />
          <Route path="/deudas" element={<Deudas />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
