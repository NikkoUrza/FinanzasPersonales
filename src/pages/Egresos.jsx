import { useState } from 'react'
import { useFinanzas } from '../context/FinanzasContext'
import { Plus, Edit2, Trash2, X, Check, TrendingDown } from 'lucide-react'

function Egresos() {
  const { 
    egresos, 
    categoriasEgresos, 
    addEgreso, 
    deleteEgreso,
    updateEgreso,
    formatPesos
  } = useFinanzas()

  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    descripcion: '',
    monto: '',
    categoria: categoriasEgresos[0],
    tipo: 'Fijo',
    fecha: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.descripcion || !formData.monto) return
    
    const parsedData = {
      ...formData,
      monto: parseFloat(formData.monto)
    }

    if (editingId) {
      updateEgreso(editingId, parsedData)
      setEditingId(null)
    } else {
      addEgreso(parsedData)
    }
    
    setFormData({
      descripcion: '',
      monto: '',
      categoria: categoriasEgresos[0],
      tipo: 'Fijo',
      fecha: new Date().toISOString().split('T')[0]
    })
  }

  const handleEdit = (egreso) => {
    setFormData({
      descripcion: egreso.descripcion,
      monto: egreso.monto,
      categoria: egreso.categoria,
      tipo: egreso.tipo,
      fecha: egreso.fecha
    })
    setEditingId(egreso.id)
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      descripcion: '',
      monto: '',
      categoria: categoriasEgresos[0],
      tipo: 'Fijo',
      fecha: new Date().toISOString().split('T')[0]
    })
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'inline-flex', padding: '8px', borderRadius: '10px', backgroundColor: 'var(--accent-danger-bg)', color: 'var(--accent-danger)' }}>
            <TrendingDown size={24} />
          </span>
          Egresos
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '-20px', marginLeft: '56px' }}>
          Registra y categoriza tus salidas de dinero para analizar tus hábitos de gasto.
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Formulario de registro */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2>{editingId ? 'Editar Egreso' : 'Registrar Nuevo Egreso'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Descripción</label>
              <input
                type="text"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                placeholder="Ej: Alquiler de estudio"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Monto (Pesos)</label>
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
              <label>Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
              >
                {categoriasEgresos.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Tipo</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              >
                <option value="Fijo">Fijo</option>
                <option value="Variable">Variable</option>
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label>Fecha</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              {editingId && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCancel}
                  style={{ flex: 1 }}
                >
                  <X size={16} /> Cancelar
                </button>
              )}
              <button type="submit" className="btn btn-danger" style={{ flex: 2, width: '100%' }}>
                {editingId ? (
                  <>
                    <Check size={16} /> Actualizar
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Agregar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Historial de egresos */}
        <div className="card">
          <h2>Historial de Egresos</h2>
          {egresos.length === 0 ? (
            <div className="empty-state">
              <TrendingDown size={36} />
              <p>No hay egresos registrados en esta cuenta.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th className="hide-mobile">Tipo</th>
                    <th>Monto</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {egresos.map(egreso => (
                    <tr key={egreso.id} style={{ backgroundColor: editingId === egreso.id ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{egreso.fecha}</td>
                      <td style={{ fontWeight: '500' }}>{egreso.descripcion}</td>
                      <td>
                        <span className="badge badge-egreso">{egreso.categoria}</span>
                      </td>
                      <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{egreso.tipo}</td>
                      <td className="amount-negative" style={{ fontWeight: '600' }}>
                        {formatPesos(egreso.monto)}
                      </td>
                      <td>
                        <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className="icon-btn icon-btn-success"
                            onClick={() => handleEdit(egreso)}
                            title="Editar egreso"
                            disabled={editingId === egreso.id}
                            style={{ opacity: editingId === egreso.id ? 0.3 : 1 }}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button 
                            className="icon-btn icon-btn-danger"
                            onClick={() => deleteEgreso(egreso.id)}
                            title="Eliminar egreso"
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

export default Egresos
