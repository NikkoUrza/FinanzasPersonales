import { useState } from 'react'
import { auth, hasFirebaseConfig } from '../firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { Coins, LogIn, UserPlus, AlertTriangle } from 'lucide-react'

function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!hasFirebaseConfig) {
      setError('Firebase no está configurado. Por favor completa el archivo .env')
      return
    }

    if (!email || !password) {
      setError('Por favor completa todos los campos.')
      return
    }

    if (isRegister && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err) {
      console.error(err)
      let cleanMessage = ''
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        cleanMessage = 'Correo o contraseña incorrectos.'
      } else if (err.code === 'auth/email-already-in-use') {
        cleanMessage = 'El correo electrónico ya está registrado.'
      } else if (err.code === 'auth/weak-password') {
        cleanMessage = 'La contraseña debe tener al menos 6 caracteres.'
      } else if (err.code === 'auth/invalid-email') {
        cleanMessage = 'El correo electrónico no es válido.'
      } else if (err.code === 'auth/operation-not-allowed') {
        cleanMessage = 'El método de inicio de sesión con Correo y Contraseña está deshabilitado en tu consola de Firebase. Debes habilitarlo en Authentication > Sign-in method.'
      } else {
        cleanMessage = `Error de Firebase: ${err.message} (${err.code})`
      }
      setError(cleanMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '20px'
    }}>
      <div className="card" style={{
        maxWidth: '400px',
        width: '100%',
        padding: '35px 30px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-card)'
      }}>
        {/* Logo de la aplicación */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: 'var(--accent-primary)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <Coins size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: '700' }}>Mis Finanzas</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Control de gastos en tiempo real</p>
          </div>
        </div>

        {/* Advertencia de configuración de Firebase si falta */}
        {!hasFirebaseConfig ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'var(--accent-warning-bg)',
            border: '1px solid var(--accent-warning-border)',
            borderRadius: '8px',
            color: 'var(--accent-warning-text)',
            fontSize: '13px',
            lineHeight: '1.4',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
              <AlertTriangle size={16} /> Configuración Pendiente
            </div>
            <p>
              Por favor completa las credenciales de Firebase en el archivo <strong>.env</strong> en la raíz del proyecto y reinicia tu servidor de desarrollo.
            </p>
          </div>
        ) : null}

        {/* Mensaje de error general */}
        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--accent-danger-bg)',
            border: '1px solid var(--accent-danger-border)',
            borderRadius: '8px',
            color: 'var(--accent-danger-text)',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              disabled={loading || !hasFirebaseConfig}
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading || !hasFirebaseConfig}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label>Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading || !hasFirebaseConfig}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={loading || !hasFirebaseConfig}
          >
            {loading ? (
              'Cargando...'
            ) : isRegister ? (
              <>
                <UserPlus size={16} /> Registrarse
              </>
            ) : (
              <>
                <LogIn size={16} /> Ingresar
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '25px',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--text-secondary)'
        }}>
          {isRegister ? (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => { setError(''); setIsRegister(false); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Inicia sesión aquí
              </button>
            </p>
          ) : (
            <p>
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => { setError(''); setIsRegister(true); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Regístrate aquí
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
