import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../api.js'

const C = {
  card: '#fffdf7', ink: '#2b211a', sub: '#8c7e6d',
  line: '#e7ddca', terra: '#c2562f', terraDk: '#9c3f1f', cream: '#f6efe1',
  espresso: '#2b211a',
}

const inputStyle = {
  width: '100%', padding: '13px 15px', borderRadius: 11, border: `1.5px solid ${C.line}`,
  background: C.cream, fontSize: 15, color: C.ink, outline: 'none',
  fontFamily: "'Archivo', system-ui, sans-serif", boxSizing: 'border-box',
}

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('CLIENT')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = mode === 'login'
        ? await login(email, password)
        : await register(email, password, role)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({ id: data.id, email: data.email, role: data.role }))
      if (data.role === 'CLIENT') navigate('/client')
      else if (data.role === 'CHEF') navigate('/kitchen')
      else navigate('/delivery')
    } catch (err) {
      setError(err.message)
    }
  }

  const roles = [['CLIENT', 'Client'], ['CHEF', 'Chef cuisinier'], ['LIVREUR', 'Livreur']]

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Archivo', system-ui, sans-serif",
      background: `radial-gradient(circle at 30% 20%, #3a2c22, ${C.espresso} 70%)`,
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: .5,
        backgroundImage: 'repeating-linear-gradient(135deg,rgba(255,255,255,.012) 0 2px,transparent 2px 7px)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', width: 452 }}>
        <div style={{ textAlign: 'center', marginBottom: 26, color: C.cream }}>
          <div style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: 40, fontWeight: 600, letterSpacing: .5 }}>
            <span style={{ color: C.terra }}>·</span> Maison
          </div>
          <div style={{ fontSize: 13.5, letterSpacing: 3, textTransform: 'uppercase', opacity: .6, marginTop: 4 }}>
            Commande & Cuisine
          </div>
        </div>

        <div style={{
          background: C.card, border: `1px solid ${C.line}`, borderRadius: 22,
          padding: '34px 36px 38px', boxShadow: '0 30px 70px rgba(0,0,0,.4)',
        }}>
          <div style={{ display: 'flex', gap: 26, borderBottom: `1px solid ${C.line}`, marginBottom: 26 }}>
            {[['login', 'Connexion'], ['register', 'Inscription']].map(([m, label]) => (
              <div key={m} onClick={() => setMode(m)} style={{
                fontFamily: "'Spectral', Georgia, serif", fontSize: 21, fontWeight: 600,
                paddingBottom: 13, cursor: 'pointer',
                color: mode === m ? C.ink : C.sub,
                borderBottom: mode === m ? `2.5px solid ${C.terra}` : '2.5px solid transparent',
                marginBottom: -1,
              }}>{label}</div>
            ))}
          </div>

          <form onSubmit={submit}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 8 }}>Adresse e-mail</div>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: mode === 'register' ? 18 : 22 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 8 }}>Mot de passe</div>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
            </div>

            {mode === 'register' && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 10 }}>Je suis…</div>
                <div style={{ display: 'flex', gap: 9 }}>
                  {roles.map(([value, label]) => (
                    <div key={value} onClick={() => setRole(value)} style={{
                      flex: 1, textAlign: 'center', padding: '12px 6px', borderRadius: 11, cursor: 'pointer',
                      fontSize: 13.5, fontWeight: 600,
                      border: role === value ? `1.5px solid ${C.terra}` : `1.5px solid ${C.line}`,
                      background: role === value ? '#fbeee6' : C.cream,
                      color: role === value ? C.terraDk : C.sub,
                    }}>{label}</div>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" style={{
              width: '100%', padding: 15, background: C.terra, color: '#fff', border: 'none',
              borderRadius: 10, fontWeight: 600, fontSize: 15, letterSpacing: .2,
              fontFamily: "'Archivo', system-ui, sans-serif", cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(194,86,47,.28)',
            }}>
              {mode === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>

            {error && (
              <div style={{ marginTop: 14, fontSize: 13, color: '#a83a26', textAlign: 'center', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <div style={{ marginTop: 16, fontSize: 13, color: C.sub, textAlign: 'center' }}>
              {mode === 'login' ? (
                <>Pas encore de compte ?{' '}
                  <span onClick={() => setMode('register')} style={{ color: C.terra, fontWeight: 600, cursor: 'pointer' }}>S'inscrire</span>
                </>
              ) : (
                <>Un compte vous attend ?{' '}
                  <span onClick={() => setMode('login')} style={{ color: C.terra, fontWeight: 600, cursor: 'pointer' }}>Connexion</span>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
