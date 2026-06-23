import { createContext, useContext, useState, useEffect } from 'react'
import { auth, db, hasFirebaseConfig } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore'

const FinanzasContext = createContext()

export const useFinanzas = () => {
  const context = useContext(FinanzasContext)
  if (!context) {
    throw new Error('useFinanzas debe ser usado dentro de un FinanzasProvider')
  }
  return context
}

export const FinanzasProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ingresos, setIngresos] = useState([])
  const [egresos, setEgresos] = useState([])
  const [deudas, setDeudas] = useState([])

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

  // --- PRECARGA DE CRÉDITOS PREDETERMINADOS (Davivienda y Lulo Bank) ---
  const precargarDeudasPreestablecidas = async (uid) => {
    const lulo = {
      descripcion: 'Crédito de Consumo Lulo',
      acreedor: 'Lulo Bank',
      esAmortizable: true,
      montoOriginal: 15000000,
      monto: 15000000,
      cuotaMensual: 465079.79,
      cuotasTotales: 48,
      cuotasPagadas: 0,
      diaPago: 5,
      fecha: '2026-06-13',
      fechaVencimiento: '2030-06-05',
      ultimoPagoRegistrado: '2026-06', // Siguiente cuota en Julio 2026
      pagado: false
    }

    const davivienda = {
      descripcion: 'Crédito Davivienda',
      acreedor: 'Davivienda',
      esAmortizable: true,
      montoOriginal: 17220042,
      monto: 17220042,
      cuotaMensual: 452203,
      cuotasTotales: 60,
      cuotasPagadas: 0,
      diaPago: 10,
      fecha: '2025-09-14',
      fechaVencimiento: '2030-09-10',
      ultimoPagoRegistrado: '2026-05', // Cuota de Junio 10 ya venció, se procesará automático
      pagado: false
    }

    if (hasFirebaseConfig && uid) {
      await addDoc(collection(db, 'users', uid, 'deudas'), lulo)
      await addDoc(collection(db, 'users', uid, 'deudas'), davivienda)
    } else {
      setDeudas([
        { id: 'lulo-mock', ...lulo },
        { id: 'davivienda-mock', ...davivienda }
      ])
    }
  }

  // --- MODO LOCAL (Fallback si Firebase no está configurado) ---
  const loadLocalData = () => {
    const savedIngresos = localStorage.getItem('ingresos')
    const savedEgresos = localStorage.getItem('egresos')
    const savedDeudas = localStorage.getItem('deudas')
    
    setIngresos(savedIngresos ? JSON.parse(savedIngresos) : [])
    setEgresos(savedEgresos ? JSON.parse(savedEgresos) : [])
    
    const parsedDeudas = savedDeudas ? JSON.parse(savedDeudas) : []
    if (parsedDeudas.length === 0) {
      precargarDeudasPreestablecidas(null)
    } else {
      setDeudas(parsedDeudas)
    }
  }

  // --- ESCUCHA DE AUTENTICACIÓN ---
  useEffect(() => {
    if (!hasFirebaseConfig) {
      loadLocalData()
      setLoading(false)
      return
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      
      if (!currentUser) {
        setIngresos([])
        setEgresos([])
        setDeudas([])
        setLoading(false)
      }
    })

    return () => unsubscribeAuth()
  }, [])

  // --- SINCRONIZACIÓN EN TIEMPO REAL CON FIRESTORE ---
  useEffect(() => {
    if (!hasFirebaseConfig || !user) return

    setLoading(true)

    const qIngresos = query(collection(db, 'users', user.uid, 'ingresos'), orderBy('fecha', 'desc'))
    const qEgresos = query(collection(db, 'users', user.uid, 'egresos'), orderBy('fecha', 'desc'))
    const qDeudas = query(collection(db, 'users', user.uid, 'deudas'), orderBy('fecha', 'desc'))

    const unsubIngresos = onSnapshot(qIngresos, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setIngresos(items)
    })

    const unsubEgresos = onSnapshot(qEgresos, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setEgresos(items)
    })

    const unsubDeudas = onSnapshot(qDeudas, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      if (items.length === 0) {
        precargarDeudasPreestablecidas(user.uid)
      } else {
        setDeudas(items)
      }
      setLoading(false)
    }, (err) => {
      console.error(err)
      setLoading(false)
    })

    return () => {
      unsubIngresos()
      unsubEgresos()
      unsubDeudas()
    }
  }, [user])

  // --- SCHEDULER: REGISTRO DE CUOTAS AUTOMÁTICAS ---
  useEffect(() => {
    if (loading) return

    const registrarPagoAutomatico = async () => {
      for (const d of deudas) {
        if (d.esAmortizable && !d.pagado && d.ultimoPagoRegistrado) {
          let [year, month] = d.ultimoPagoRegistrado.split('-').map(Number)
          
          let nextMonth = month + 1
          let nextYear = year
          if (nextMonth > 12) {
            nextMonth = 1
            nextYear += 1
          }

          const nextMonthStr = nextMonth.toString().padStart(2, '0')
          const nextPagoStr = `${nextYear}-${nextMonthStr}`
          const nextPagoDate = new Date(`${nextPagoStr}-${d.diaPago.toString().padStart(2, '0')}T12:00:00`)
          const hoy = new Date()

          if (hoy >= nextPagoDate) {
            console.log(`[Scheduler] Procesando cuota automática para ${d.acreedor} (${nextPagoStr})`)
            
            const nuevaCuotaPagada = d.cuotasPagadas + 1
            const esUltima = nuevaCuotaPagada >= d.cuotasTotales

            // 1. Agregar Egreso
            const nuevoEgreso = {
              descripcion: `Cuota ${nuevaCuotaPagada}/${d.cuotasTotales} - ${d.acreedor}`,
              monto: parseFloat(d.cuotaMensual),
              categoria: 'Otros Gastos',
              tipo: 'Fijo',
              fecha: `${nextPagoStr}-${d.diaPago.toString().padStart(2, '0')}`
            }

            // 2. Actualizar Deuda
            const updatedDeuda = {
              ...d,
              cuotasPagadas: nuevaCuotaPagada,
              monto: Math.max(parseFloat(d.monto) - parseFloat(d.cuotaMensual), 0),
              ultimoPagoRegistrado: nextPagoStr,
              pagado: esUltima
            }

            const { id: _, ...dataToSave } = updatedDeuda

            if (hasFirebaseConfig && user) {
              await addDoc(collection(db, 'users', user.uid, 'egresos'), nuevoEgreso)
              await updateDoc(doc(db, 'users', user.uid, 'deudas', d.id), dataToSave)
            } else {
              setEgresos(prev => [{ id: Date.now(), ...nuevoEgreso }, ...prev])
              setDeudas(prev => prev.map(item => item.id === d.id ? updatedDeuda : item))
            }
            break // Detener iteración para procesar una por una en ciclos de render secuenciales
          }
        }
      }
    }

    registrarPagoAutomatico()
  }, [deudas, loading, user])

  // --- EFECTO PARA PERSISTENCIA LOCAL (Solo modo fallback) ---
  useEffect(() => {
    if (hasFirebaseConfig) return
    localStorage.setItem('ingresos', JSON.stringify(ingresos))
  }, [ingresos])

  useEffect(() => {
    if (hasFirebaseConfig) return
    localStorage.setItem('egresos', JSON.stringify(egresos))
  }, [egresos])

  useEffect(() => {
    if (hasFirebaseConfig) return
    localStorage.setItem('deudas', JSON.stringify(deudas))
  }, [deudas])

  // --- OPERACIONES: INGRESOS ---
  const addIngreso = async (ingreso) => {
    const nuevoIngreso = {
      ...ingreso,
      fecha: ingreso.fecha || new Date().toISOString().split('T')[0]
    }
    if (hasFirebaseConfig && user) {
      await addDoc(collection(db, 'users', user.uid, 'ingresos'), nuevoIngreso)
    } else {
      setIngresos(prev => [{ id: Date.now(), ...nuevoIngreso }, ...prev])
    }
  }

  const deleteIngreso = async (id) => {
    if (hasFirebaseConfig && user) {
      await deleteDoc(doc(db, 'users', user.uid, 'ingresos', id))
    } else {
      setIngresos(prev => prev.filter(i => i.id !== id))
    }
  }

  const updateIngreso = async (id, updatedData) => {
    if (hasFirebaseConfig && user) {
      await updateDoc(doc(db, 'users', user.uid, 'ingresos', id), updatedData)
    } else {
      setIngresos(prev => prev.map(i => i.id === id ? { ...i, ...updatedData } : i))
    }
  }

  // --- OPERACIONES: EGRESOS ---
  const addEgreso = async (egreso) => {
    const nuevoEgreso = {
      ...egreso,
      fecha: egreso.fecha || new Date().toISOString().split('T')[0]
    }
    if (hasFirebaseConfig && user) {
      await addDoc(collection(db, 'users', user.uid, 'egresos'), nuevoEgreso)
    } else {
      setEgresos(prev => [{ id: Date.now(), ...nuevoEgreso }, ...prev])
    }
  }

  const deleteEgreso = async (id) => {
    if (hasFirebaseConfig && user) {
      await deleteDoc(doc(db, 'users', user.uid, 'egresos', id))
    } else {
      setEgresos(prev => prev.filter(e => e.id !== id))
    }
  }

  const updateEgreso = async (id, updatedData) => {
    if (hasFirebaseConfig && user) {
      await updateDoc(doc(db, 'users', user.uid, 'egresos', id), updatedData)
    } else {
      setEgresos(prev => prev.map(e => e.id === id ? { ...e, ...updatedData } : e))
    }
  }

  // --- OPERACIONES: DEUDAS ---
  const addDeuda = async (deuda) => {
    const nuevaDeuda = {
      ...deuda,
      esAmortizable: !!deuda.esAmortizable,
      montoOriginal: parseFloat(deuda.montoOriginal || deuda.monto || 0),
      cuotaMensual: parseFloat(deuda.cuotaMensual || 0),
      cuotasTotales: parseInt(deuda.cuotasTotales || 0),
      cuotasPagadas: parseInt(deuda.cuotasPagadas || 0),
      diaPago: parseInt(deuda.diaPago || 1),
      ultimoPagoRegistrado: deuda.ultimoPagoRegistrado || new Date().toISOString().split('T')[0].substring(0, 7),
      fecha: deuda.fecha || new Date().toISOString().split('T')[0],
      pagado: false
    }

    if (hasFirebaseConfig && user) {
      await addDoc(collection(db, 'users', user.uid, 'deudas'), nuevaDeuda)
    } else {
      setDeudas(prev => [{ id: Date.now(), ...nuevaDeuda }, ...prev])
    }
  }

  const deleteDeuda = async (id) => {
    if (hasFirebaseConfig && user) {
      await deleteDoc(doc(db, 'users', user.uid, 'deudas', id))
    } else {
      setDeudas(prev => prev.filter(d => d.id !== id))
    }
  }

  const updateDeuda = async (id, updatedData) => {
    const cleanedData = {
      ...updatedData,
      monto: parseFloat(updatedData.monto || 0),
      montoOriginal: parseFloat(updatedData.montoOriginal || updatedData.monto || 0),
      cuotaMensual: parseFloat(updatedData.cuotaMensual || 0),
      cuotasTotales: parseInt(updatedData.cuotasTotales || 0),
      cuotasPagadas: parseInt(updatedData.cuotasPagadas || 0),
      diaPago: parseInt(updatedData.diaPago || 1),
      ultimoPagoRegistrado: updatedData.ultimoPagoRegistrado || new Date().toISOString().split('T')[0].substring(0, 7)
    }

    if (hasFirebaseConfig && user) {
      const { id: _, ...dataToSave } = cleanedData
      await updateDoc(doc(db, 'users', user.uid, 'deudas', id), dataToSave)
    } else {
      setDeudas(prev => prev.map(d => d.id === id ? { ...d, ...cleanedData } : d))
    }
  }

  const markDeudaPagada = async (id) => {
    const currentDeuda = deudas.find(d => d.id === id)
    if (!currentDeuda) return

    if (hasFirebaseConfig && user) {
      await updateDoc(doc(db, 'users', user.uid, 'deudas', id), {
        pagado: !currentDeuda.pagado
      })
    } else {
      setDeudas(prev => prev.map(d => d.id === id ? { ...d, pagado: !d.pagado } : d))
    }
  }

  // --- REGISTRO MANUAL DE CUOTA ---
  const registrarPagoManual = async (id) => {
    const d = deudas.find(item => item.id === id)
    if (!d) return

    let [year, month] = d.ultimoPagoRegistrado.split('-').map(Number)
    let nextMonth = month + 1
    let nextYear = year
    if (nextMonth > 12) {
      nextMonth = 1
      nextYear += 1
    }

    const nextMonthStr = nextMonth.toString().padStart(2, '0')
    const nextPagoStr = `${nextYear}-${nextMonthStr}`

    const nuevaCuotaPagada = d.cuotasPagadas + 1
    const esUltima = nuevaCuotaPagada >= d.cuotasTotales

    // 1. Agregar Egreso
    const nuevoEgreso = {
      descripcion: `Cuota ${nuevaCuotaPagada}/${d.cuotasTotales} - ${d.acreedor} (Manual)`,
      monto: parseFloat(d.cuotaMensual),
      categoria: 'Otros Gastos',
      tipo: 'Fijo',
      fecha: new Date().toISOString().split('T')[0]
    }

    // 2. Modificar la Deuda
    const updatedDeuda = {
      ...d,
      cuotasPagadas: nuevaCuotaPagada,
      monto: Math.max(parseFloat(d.monto) - parseFloat(d.cuotaMensual), 0),
      ultimoPagoRegistrado: nextPagoStr,
      pagado: esUltima
    }

    const { id: _, ...dataToSave } = updatedDeuda

    if (hasFirebaseConfig && user) {
      await addDoc(collection(db, 'users', user.uid, 'egresos'), nuevoEgreso)
      await updateDoc(doc(db, 'users', user.uid, 'deudas', id), dataToSave)
    } else {
      setEgresos(prev => [{ id: Date.now(), ...nuevoEgreso }, ...prev])
      setDeudas(prev => prev.map(item => item.id === id ? updatedDeuda : item))
    }
  }

  const logout = async () => {
    if (hasFirebaseConfig) {
      await signOut(auth)
    }
  }

  const totalIngresos = ingresos.reduce((sum, i) => sum + parseFloat(i.monto || 0), 0)
  const totalEgresos = egresos.reduce((sum, e) => sum + parseFloat(e.monto || 0), 0)
  const balance = totalIngresos - totalEgresos
  const totalDeudas = deudas.filter(d => !d.pagado).reduce((sum, d) => sum + parseFloat(d.monto || 0), 0)

  const formatPesos = (valor) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(valor || 0)
  }

  const value = {
    user,
    loading,
    logout,
    hasFirebaseConfig,
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
    updateDeuda,
    markDeudaPagada,
    registrarPagoManual,
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
