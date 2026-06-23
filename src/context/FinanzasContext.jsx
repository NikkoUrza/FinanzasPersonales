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

  // --- MODO LOCAL (Fallback si Firebase no está configurado) ---
  const loadLocalData = () => {
    const savedIngresos = localStorage.getItem('ingresos')
    const savedEgresos = localStorage.getItem('egresos')
    const savedDeudas = localStorage.getItem('deudas')
    
    setIngresos(savedIngresos ? JSON.parse(savedIngresos) : [])
    setEgresos(savedEgresos ? JSON.parse(savedEgresos) : [])
    setDeudas(savedDeudas ? JSON.parse(savedDeudas) : [])
  }

  // --- ESCUCHA DE AUTENTICACIÓN Y SINCRONIZACIÓN ---
  useEffect(() => {
    if (!hasFirebaseConfig) {
      // Si no hay Firebase, cargar datos de localStorage y apagar loading
      loadLocalData()
      setLoading(false)
      return
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      
      if (!currentUser) {
        // Si no hay sesión, limpiar estados y apagar loading
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

    // Consultas ordenadas por fecha (o más reciente primero)
    const qIngresos = query(collection(db, 'users', user.uid, 'ingresos'), orderBy('fecha', 'desc'))
    const qEgresos = query(collection(db, 'users', user.uid, 'egresos'), orderBy('fecha', 'desc'))
    const qDeudas = query(collection(db, 'users', user.uid, 'deudas'), orderBy('fecha', 'desc'))

    const unsubIngresos = onSnapshot(qIngresos, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setIngresos(items)
    }, (err) => console.error("Error en Snapshot de Ingresos:", err))

    const unsubEgresos = onSnapshot(qEgresos, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setEgresos(items)
    }, (err) => console.error("Error en Snapshot de Egresos:", err))

    const unsubDeudas = onSnapshot(qDeudas, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setDeudas(items)
      setLoading(false) // Desactivar carga una vez que las deudas (el último snap) respondan
    }, (err) => {
      console.error("Error en Snapshot de Deudas:", err)
      setLoading(false)
    })

    return () => {
      unsubIngresos()
      unsubEgresos()
      unsubDeudas()
    }
  }, [user])

  // --- EFECTO PARA PERSISTENCIA LOCAL (Solo si Firebase NO está configurado) ---
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
      // Modo local
      setIngresos(prev => [{ id: Date.now(), ...nuevoIngreso }, ...prev])
    }
  }

  const deleteIngreso = async (id) => {
    if (hasFirebaseConfig && user) {
      await deleteDoc(doc(db, 'users', user.uid, 'ingresos', id))
    } else {
      // Modo local
      setIngresos(prev => prev.filter(i => i.id !== id))
    }
  }

  const updateIngreso = async (id, updatedData) => {
    if (hasFirebaseConfig && user) {
      await updateDoc(doc(db, 'users', user.uid, 'ingresos', id), updatedData)
    } else {
      // Modo local
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
      // Modo local
      setEgresos(prev => [{ id: Date.now(), ...nuevoEgreso }, ...prev])
    }
  }

  const deleteEgreso = async (id) => {
    if (hasFirebaseConfig && user) {
      await deleteDoc(doc(db, 'users', user.uid, 'egresos', id))
    } else {
      // Modo local
      setEgresos(prev => prev.filter(e => e.id !== id))
    }
  }

  const updateEgreso = async (id, updatedData) => {
    if (hasFirebaseConfig && user) {
      await updateDoc(doc(db, 'users', user.uid, 'egresos', id), updatedData)
    } else {
      // Modo local
      setEgresos(prev => prev.map(e => e.id === id ? { ...e, ...updatedData } : e))
    }
  }

  // --- OPERACIONES: DEUDAS ---
  const addDeuda = async (deuda) => {
    const nuevaDeuda = {
      ...deuda,
      fecha: deuda.fecha || new Date().toISOString().split('T')[0],
      pagado: false
    }

    if (hasFirebaseConfig && user) {
      await addDoc(collection(db, 'users', user.uid, 'deudas'), nuevaDeuda)
    } else {
      // Modo local
      setDeudas(prev => [{ id: Date.now(), ...nuevaDeuda }, ...prev])
    }
  }

  const deleteDeuda = async (id) => {
    if (hasFirebaseConfig && user) {
      await deleteDoc(doc(db, 'users', user.uid, 'deudas', id))
    } else {
      // Modo local
      setDeudas(prev => prev.filter(d => d.id !== id))
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
      // Modo local
      setDeudas(prev => prev.map(d => d.id === id ? { ...d, pagado: !d.pagado } : d))
    }
  }

  // --- OPERACIONES: AUTENTICACIÓN ---
  const logout = async () => {
    if (hasFirebaseConfig) {
      await signOut(auth)
    }
  }

  // --- VALORES CALCULADOS ---
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
