import { createContext, useContext, useState, useEffect } from 'react'

const FinanzasContext = createContext()

export const useFinanzas = () => {
  const context = useContext(FinanzasContext)
  if (!context) {
    throw new Error('useFinanzas debe ser usado dentro de un FinanzasProvider')
  }
  return context
}

export const FinanzasProvider = ({ children }) => {
  const [ingresos, setIngresos] = useState(() => {
    const saved = localStorage.getItem('ingresos')
    return saved ? JSON.parse(saved) : []
  })

  const [egresos, setEgresos] = useState(() => {
    const saved = localStorage.getItem('egresos')
    return saved ? JSON.parse(saved) : []
  })

  const [deudas, setDeudas] = useState(() => {
    const saved = localStorage.getItem('deudas')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('ingresos', JSON.stringify(ingresos))
  }, [ingresos])

  useEffect(() => {
    localStorage.setItem('egresos', JSON.stringify(egresos))
  }, [egresos])

  useEffect(() => {
    localStorage.setItem('deudas', JSON.stringify(deudas))
  }, [deudas])

  const categoriasIngresos = [
    'Salario Fijo',
    'Servicios Audiovisuales',
    'Servicios Musicales',
    'Otros Ingresos'
  ]

  const categoriasEgresos = [
    'Vivienda',
    'Alimentación',
    'Transporte',
    'Servicios',
    'Entretenimiento',
    'Salud',
    'Educación',
    'Otros Gastos'
  ]

  const addIngreso = (ingreso) => {
    const nuevoIngreso = {
      id: Date.now(),
      ...ingreso,
      fecha: ingreso.fecha || new Date().toISOString().split('T')[0]
    }
    setIngresos(prev => [...prev, nuevoIngreso])
  }

  const deleteIngreso = (id) => {
    setIngresos(prev => prev.filter(i => i.id !== id))
  }

  const updateIngreso = (id, updatedData) => {
    setIngresos(prev => prev.map(i => 
      i.id === id ? { ...i, ...updatedData } : i
    ))
  }

  const addEgreso = (egreso) => {
    const nuevoEgreso = {
      id: Date.now(),
      ...egreso,
      fecha: egreso.fecha || new Date().toISOString().split('T')[0]
    }
    setEgresos(prev => [...prev, nuevoEgreso])
  }

  const deleteEgreso = (id) => {
    setEgresos(prev => prev.filter(e => e.id !== id))
  }

  const updateEgreso = (id, updatedData) => {
    setEgresos(prev => prev.map(e => 
      e.id === id ? { ...e, ...updatedData } : e
    ))
  }

  const addDeuda = (deuda) => {
    const nuevaDeuda = {
      id: Date.now(),
      ...deuda,
      fecha: deuda.fecha || new Date().toISOString().split('T')[0],
      pagado: false
    }
    setDeudas(prev => [...prev, nuevaDeuda])
  }

  const deleteDeuda = (id) => {
    setDeudas(prev => prev.filter(d => d.id !== id))
  }

  const markDeudaPagada = (id) => {
    setDeudas(prev => prev.map(d => 
      d.id === id ? { ...d, pagado: !d.pagado } : d
    ))
  }

  const totalIngresos = ingresos.reduce((sum, i) => sum + parseFloat(i.monto), 0)
  const totalEgresos = egresos.reduce((sum, e) => sum + parseFloat(e.monto), 0)
  const balance = totalIngresos - totalEgresos
  const totalDeudas = deudas.filter(d => !d.pagado).reduce((sum, d) => sum + parseFloat(d.monto), 0)

  const formatPesos = (valor) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(valor || 0)
  }

  const value = {
    ingresos,
    egresos,
    deudas,
    categoriasIngresos,
    categoriasEgresos,
    addIngreso,
    deleteIngreso,
    updateIngreso,
    addEgreso,
    deleteEgreso,
    updateEgreso,
    addDeuda,
    deleteDeuda,
    markDeudaPagada,
    totalIngresos,
    totalEgresos,
    balance,
    totalDeudas,
    formatPesos
  }

  return (
    <FinanzasContext.Provider value={value}>
      {children}
    </FinanzasContext.Provider>
  )
}
