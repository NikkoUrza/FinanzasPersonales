import { Routes, Route, NavLink, Link } from 'react-router-dom'
import { Coins } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Ingresos from './pages/Ingresos'
import Egresos from './pages/Egresos'
import Deudas from './pages/Deudas'

function App() {
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
        </div>
      </nav>
      
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
