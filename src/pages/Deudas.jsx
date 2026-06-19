import { useState } from 'react'
import { useFinanzas } from '../context/FinanzasContext'
import { Plus, Trash2, Check, CreditCard, RefreshCw } from 'lucide-react'

function Deudas() {
  const { 
    deudas, 
    addDeuda, 
    deleteDeuda,
    markDeudaPagada,
    formatPesos
  } = useFinanzas()

  const [formData, setFormData] = useState({
    descripcion: '',
    monto: '',
    acreedor: '',
    fecha: new Date().toISOString().split('T')[0],
    fechaVencimiento: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.descripcion || !formData.monto || !formData.acreedor) return
    
    addDeuda({
      ...formData,
      monto: parseFloat(formData.monto)
    })
    setFormData({
      descripcion: '',
      monto: '',
      acreedor: '',
      fecha: new Date().toISOString().split('T')[0],
      fechaVencimiento: ''
    })
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'inline-flex', padding: '8px', borderRadius: '10px', backgroundColor: 'var(--accent-warning-bg)', color: 'var(--accent-warning-text)' }}>
            <CreditCard size={24} />
          </span>
          Deudas
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '-20px', marginLeft: '56px' }}>
          Realiza un seguimiento de tus compromisos de pago y vencimientos pendientes.
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Formulario de deudas */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2>Registrar Nueva Deuda</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Descripción</label>
              <input
                type="text"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                placeholder="Ej: Préstamo personal"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Acreedor</label>
              <input
                type="text"
                value={formData.acreedor}
                onChange={(e) => setFormData({...formData, acreedor: e.target.value})}
                placeholder="Ej: Banco XYZ"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Monto Total (Pesos)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '14px' }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monto}
                  onChange={(e) => setFormData({...formData, monto: e.target.value})}
                  placeholder="0.00"
                  style={{ paddingLeft: '28px' }}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Fecha de Registro</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label>Fecha de Vencimiento</label>
              <input
                type="date"
                value={formData.fechaVencimiento}
                onChange={(e) => setFormData({...formData, fechaVencimiento: e.target.value})}
              />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Plus size={16} /> Agregar Deuda
            </button>
          </form>
        </div>
        
        {/* Listado de deudas */}
        <div className="card">
          <h2>Listado de Deudas</h2>
          {deudas.length === 0 ? (
            <div className="empty-state">
              <CreditCard size={36} />
              <p>No tienes deudas registradas.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Estado</th>
                    <th>Descripción</th>
                    <th>Acreedor</th>
                    <th>Monto</th>
                    <th>Registro</th>
                    <th>Vencimiento</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {deudas.map(deuda => (
                    <tr key={deuda.id} style={{ opacity: deuda.pagado ? 0.45 : 1, transition: 'opacity 0.2s ease' }}>
                      <td>
                        <span className={`badge ${deuda.pagado ? 'badge-ingreso' : 'badge-egreso'}`}>
                          {deuda.pagado ? 'Pagada' : 'Pendiente'}
                        </span>
                      </td>
                      <td style={{ fontWeight: '500', textDecoration: deuda.pagado ? 'line-through' : 'none' }}>
                        {deuda.descripcion}
                      </td>
                      <td>{deuda.acreedor}</td>
                      <td className={deuda.pagado ? '' : 'amount-negative'} style={{ fontWeight: '600' }}>
                        {formatPesos(deuda.monto)}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{deuda.fecha}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {deuda.fechaVencimiento || 'N/A'}
                      </td>
                      <td>
                        <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className={`icon-btn ${deuda.pagado ? 'icon-btn-secondary' : 'icon-btn-success'}`}
                            onClick={() => markDeudaPagada(deuda.id)}
                            title={deuda.pagado ? 'Marcar como pendiente' : 'Marcar como pagada'}
                            style={{ 
                              color: deuda.pagado ? 'var(--text-secondary)' : 'var(--accent-success-text)',
                              backgroundColor: deuda.pagado ? 'rgba(255,255,255,0.03)' : 'var(--accent-success-bg)'
                            }}
                          >
                            {deuda.pagado ? <RefreshCw size={15} /> : <Check size={15} />}
                          </button>
                          <button 
                            className="icon-btn icon-btn-danger"
                            onClick={() => deleteDeuda(deuda.id)}
                            title="Eliminar deuda"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
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

export default Deudas
