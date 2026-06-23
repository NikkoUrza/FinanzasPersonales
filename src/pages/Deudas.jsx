import { useState } from 'react'
import { useFinanzas } from '../context/FinanzasContext'
import { Plus, Trash2, Check, CreditCard, RefreshCw, Edit2, X, AlertCircle } from 'lucide-react'

function Deudas() {
  const { 
    deudas, 
    addDeuda, 
    deleteDeuda,
    updateDeuda,
    markDeudaPagada,
    registrarPagoManual,
    formatPesos
  } = useFinanzas()

  const [editingId, setEditingId] = useState(null)
  const [esAmortizable, setEsAmortizable] = useState(false)

  const [formData, setFormData] = useState({
    descripcion: '',
    acreedor: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    // Campos de amortización
    montoOriginal: '',
    cuotaMensual: '',
    cuotasTotales: '',
    cuotasPagadas: '0',
    diaPago: '15',
    ultimoPagoRegistrado: new Date().toISOString().split('T')[0].substring(0, 7) // YYYY-MM
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.descripcion || !formData.monto || !formData.acreedor) return

    const data = {
      ...formData,
      esAmortizable: esAmortizable,
      monto: parseFloat(formData.monto || 0),
      montoOriginal: esAmortizable ? parseFloat(formData.montoOriginal || formData.monto || 0) : parseFloat(formData.monto || 0),
      cuotaMensual: esAmortizable ? parseFloat(formData.cuotaMensual || 0) : 0,
      cuotasTotales: esAmortizable ? parseInt(formData.cuotasTotales || 0) : 0,
      cuotasPagadas: esAmortizable ? parseInt(formData.cuotasPagadas || 0) : 0,
      diaPago: esAmortizable ? parseInt(formData.diaPago || 15) : 0
    }

    if (editingId) {
      updateDeuda(editingId, data)
      setEditingId(null)
    } else {
      addDeuda(data)
    }

    // Resetear formulario
    setFormData({
      descripcion: '',
      acreedor: '',
      monto: '',
      fecha: new Date().toISOString().split('T')[0],
      fechaVencimiento: '',
      montoOriginal: '',
      cuotaMensual: '',
      cuotasTotales: '',
      cuotasPagadas: '0',
      diaPago: '15',
      ultimoPagoRegistrado: new Date().toISOString().split('T')[0].substring(0, 7)
    })
    setEsAmortizable(false)
  }

  const handleEdit = (deuda) => {
    setFormData({
      descripcion: deuda.descripcion || '',
      acreedor: deuda.acreedor || '',
      monto: deuda.monto || '',
      fecha: deuda.fecha || new Date().toISOString().split('T')[0],
      fechaVencimiento: deuda.fechaVencimiento || '',
      montoOriginal: deuda.montoOriginal || '',
      cuotaMensual: deuda.cuotaMensual || '',
      cuotasTotales: deuda.cuotasTotales || '',
      cuotasPagadas: deuda.cuotasPagadas || '0',
      diaPago: deuda.diaPago || '15',
      ultimoPagoRegistrado: deuda.ultimoPagoRegistrado || new Date().toISOString().split('T')[0].substring(0, 7)
    })
    setEsAmortizable(!!deuda.esAmortizable)
    setEditingId(deuda.id)
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      descripcion: '',
      acreedor: '',
      monto: '',
      fecha: new Date().toISOString().split('T')[0],
      fechaVencimiento: '',
      montoOriginal: '',
      cuotaMensual: '',
      cuotasTotales: '',
      cuotasPagadas: '0',
      diaPago: '15',
      ultimoPagoRegistrado: new Date().toISOString().split('T')[0].substring(0, 7)
    })
    setEsAmortizable(false)
  }

  const getMesSiguienteText = (ultimoPago) => {
    if (!ultimoPago) return 'N/A'
    const [y, m] = ultimoPago.split('-').map(Number)
    let nextMonth = m + 1
    let nextYear = y
    if (nextMonth > 12) {
      nextMonth = 1
      nextYear += 1
    }
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return `${meses[nextMonth - 1]} ${nextYear}`
  }

  // Dividir deudas en amortizables (cuotas) y simples (estándar)
  const deudasAmortizables = deudas.filter(d => d.esAmortizable)
  const deudasSimples = deudas.filter(d => !d.esAmortizable)

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'inline-flex', padding: '8px', borderRadius: '10px', backgroundColor: 'var(--accent-warning-bg)', color: 'var(--accent-warning-text)' }}>
            <CreditCard size={24} />
          </span>
          Deudas y Créditos
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '-20px', marginLeft: '56px' }}>
          Gestiona tus obligaciones financieras, plazos de créditos y automatiza el cobro de cuotas mensuales.
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Formulario de Registro / Edición */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2>{editingId ? 'Editar Deuda' : 'Registrar Obligación'}</h2>
          <form onSubmit={handleSubmit} style={{ marginTop: '15px' }}>
            <div className="form-group">
              <label>Descripción / Concepto</label>
              <input
                type="text"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                placeholder="Ej: Préstamo hipotecario o personal"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Acreedor / Entidad</label>
              <input
                type="text"
                value={formData.acreedor}
                onChange={(e) => setFormData({...formData, acreedor: e.target.value})}
                placeholder="Ej: Davivienda, Lulo Bank, Familiar"
                required
              />
            </div>
            
            <div className="form-group">
              <label>{esAmortizable ? 'Saldo Restante Actual' : 'Monto Total'}</label>
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

            {/* Checkbox para activar amortización */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              margin: '20px 0', 
              padding: '12px', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(255,255,255,0.02)', 
              border: '1px solid var(--border-color)' 
            }}>
              <input
                type="checkbox"
                id="esAmortizable"
                checked={esAmortizable}
                onChange={(e) => setEsAmortizable(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="esAmortizable" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', cursor: 'pointer' }}>
                Es un crédito amortizable (en cuotas mensuales)
              </label>
            </div>

            {/* Campos adicionales si es amortizable */}
            {esAmortizable && (
              <div style={{ 
                padding: '15px', 
                borderRadius: '8px', 
                borderLeft: '3px solid var(--accent-warning-text)', 
                backgroundColor: 'rgba(245, 158, 11, 0.02)',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Monto Original del Crédito</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '14px' }}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.montoOriginal}
                      onChange={(e) => setFormData({...formData, montoOriginal: e.target.value})}
                      placeholder="Monto prestado inicialmente"
                      style={{ paddingLeft: '28px' }}
                      required={esAmortizable}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Valor de la Cuota Fija Mensual</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '14px' }}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cuotaMensual}
                      onChange={(e) => setFormData({...formData, cuotaMensual: e.target.value})}
                      placeholder="Valor cuota mensual"
                      style={{ paddingLeft: '28px' }}
                      required={esAmortizable}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Total Cuotas</label>
                    <input
                      type="number"
                      value={formData.cuotasTotales}
                      onChange={(e) => setFormData({...formData, cuotasTotales: e.target.value})}
                      placeholder="Ej: 48, 60"
                      required={esAmortizable}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Cuotas Pagadas</label>
                    <input
                      type="number"
                      value={formData.cuotasPagadas}
                      onChange={(e) => setFormData({...formData, cuotasPagadas: e.target.value})}
                      placeholder="Ej: 0, 10"
                      required={esAmortizable}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '15px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Día de Pago (1-31)</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.diaPago}
                      onChange={(e) => setFormData({...formData, diaPago: e.target.value})}
                      placeholder="Día del cobro"
                      required={esAmortizable}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Último Mes Pago (AAAA-MM)</label>
                    <input
                      type="text"
                      pattern="\d{4}-\d{2}"
                      value={formData.ultimoPagoRegistrado}
                      onChange={(e) => setFormData({...formData, ultimoPagoRegistrado: e.target.value})}
                      placeholder="Ej: 2026-06"
                      required={esAmortizable}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Registro / Desembolso</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                />
              </div>
              
              <div className="form-group" style={{ flex: 1 }}>
                <label>Vencimiento Final</label>
                <input
                  type="date"
                  value={formData.fechaVencimiento}
                  onChange={(e) => setFormData({...formData, fechaVencimiento: e.target.value})}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
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
              <button type="submit" className="btn btn-primary" style={{ flex: 2, width: '100%' }}>
                {editingId ? 'Guardar Cambios' : 'Agregar Deuda'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Listado y Visualización */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* SECCIÓN 1: CRÉDITOS AMORTIZABLES (Vista Premium tipo tarjeta de progreso) */}
          <div>
            <h2 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Créditos Activos en Cuotas ({deudasAmortizables.length})
            </h2>

            {deudasAmortizables.length === 0 ? (
              <div className="card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <AlertCircle size={32} style={{ marginBottom: '10px', color: 'var(--border-color)' }} />
                <p>No tienes créditos amortizables registrados.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {deudasAmortizables.map(deuda => {
                  const pct = deuda.cuotasTotales > 0 
                    ? Math.min((deuda.cuotasPagadas / deuda.cuotasTotales) * 100, 100) 
                    : 0
                  
                  return (
                    <div key={deuda.id} className="card" style={{ 
                      marginBottom: 0, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      opacity: deuda.pagado ? 0.5 : 1,
                      borderLeft: '4px solid var(--accent-warning-text)'
                    }}>
                      <div>
                        {/* Cabecera */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                          <div>
                            <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '2px' }}>{deuda.acreedor}</h3>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{deuda.descripcion}</span>
                          </div>
                          <span className={`badge ${deuda.pagado ? 'badge-ingreso' : 'badge-warning'}`}>
                            {deuda.pagado ? 'Finalizado' : `Día de pago: ${deuda.diaPago}`}
                          </span>
                        </div>

                        {/* Progreso de cuotas */}
                        <div style={{ marginBottom: '18px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            <span>Cuotas pagadas</span>
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                              {deuda.cuotasPagadas} / {deuda.cuotasTotales} cuotas
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#202025', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent-warning-text)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                          </div>
                        </div>

                        {/* Detalles Financieros */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '12px', 
                          padding: '12px', 
                          backgroundColor: 'rgba(255,255,255,0.015)',
                          borderRadius: '8px', 
                          border: '1px solid var(--border-color)',
                          fontSize: '13px',
                          marginBottom: '15px'
                        }}>
                          <div>
                            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>Saldo Restante</span>
                            <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--accent-danger-text)' }}>{formatPesos(deuda.monto)}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>Cuota Fija</span>
                            <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)' }}>{formatPesos(deuda.cuotaMensual)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer de Tarjeta con Próximo Pago y Acciones */}
                      <div>
                        {!deuda.pagado && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: 'var(--text-secondary)', 
                            marginBottom: '15px', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            borderTop: '1px solid var(--border-color)',
                            paddingTop: '10px'
                          }}>
                            <span>Siguiente cuota:</span>
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                              {getMesSiguienteText(deuda.ultimoPagoRegistrado)} ({deuda.diaPago})
                            </span>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="actions-cell">
                            <button 
                              className="icon-btn"
                              onClick={() => handleEdit(deuda)}
                              title="Editar crédito"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              className="icon-btn icon-btn-danger"
                              onClick={() => deleteDeuda(deuda.id)}
                              title="Eliminar crédito"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {!deuda.pagado && (
                            <button 
                              className="btn btn-success" 
                              onClick={() => registrarPagoManual(deuda.id)}
                              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
                            >
                              <RefreshCw size={12} /> Pagar Cuota
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* SECCIÓN 2: OTRAS DEUDAS (Tabla estándar) */}
          <div>
            <h2 style={{ marginBottom: '15px' }}>Otras Obligaciones / Deudas Simples ({deudasSimples.length})</h2>
            
            {deudasSimples.length === 0 ? (
              <div className="card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No tienes otras deudas registradas.</p>
              </div>
            ) : (
              <div className="card" style={{ padding: 0 }}>
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Estado</th>
                        <th>Descripción</th>
                        <th>Acreedor</th>
                        <th>Monto</th>
                        <th>Vencimiento</th>
                        <th style={{ textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deudasSimples.map(deuda => (
                        <tr key={deuda.id} style={{ opacity: deuda.pagado ? 0.45 : 1 }}>
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
                                  color: deuda.pagado ? 'var(--text-secondary)' : 'var(--accent-success-text)'
                                }}
                              >
                                {deuda.pagado ? <RefreshCw size={14} /> : <Check size={14} />}
                              </button>
                              <button 
                                className="icon-btn"
                                onClick={() => handleEdit(deuda)}
                                title="Editar deuda"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                className="icon-btn icon-btn-danger"
                                onClick={() => deleteDeuda(deuda.id)}
                                title="Eliminar deuda"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Deudas
