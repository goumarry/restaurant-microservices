import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../api.js'

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e' },
  card: { background: '#fff', borderRadius: 12, padding: 40, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  title: { textAlign: 'center', marginBottom: 24, fontSize: 24, fontWeight: 700, color: '#1a1a2e' },
  tabs: { display: 'flex', marginBottom: 24, borderRadius: 8, overflow: 'hidden', border: '1px solid #e0e0e0' },
  tab: (active) => ({ flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer', fontWeight: 600, background: active ? '#ff6b35' : '#fff', color: active ? '#fff' : '#666' }),
  field: { marginBottom: 16 },
  label: { display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14, color: '#555' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none' },
  select: { width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff' },
  btn: { width: '100%', padding: '12px', background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  error: { color: '#e53935', fontSize: 13, marginTop: 12, textAlign: 'center' }
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
      let data
      if (mode === 'login') {
        data = await login(email, password)
      } else {
        data = await register(email, password, role)
      }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({ id: data.id, email: data.email, role: data.role }))
      if (data.role === 'CLIENT') navigate('/client')
      else if (data.role === 'CHEF') navigate('/kitchen')
      else navigate('/delivery')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>🍽 Restaurant</h1>
        <div style={s.tabs}>
          <button style={s.tab(mode === 'login')} onClick={() => setMode('login')}>Connexion</button>
          <button style={s.tab(mode === 'register')} onClick={() => setMode('register')}>Inscription</button>
        </div>
        <form onSubmit={submit}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Mot de passe</label>
            <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {mode === 'register' && (
            <div style={s.field}>
              <label style={s.label}>Rôle</label>
              <select style={s.select} value={role} onChange={e => setRole(e.target.value)}>
                <option value="CLIENT">Client</option>
                <option value="CHEF">Chef cuisinier</option>
                <option value="LIVREUR">Livreur</option>
              </select>
            </div>
          )}
          <button style={s.btn} type="submit">{mode === 'login' ? 'Se connecter' : "S'inscrire"}</button>
          {error && <p style={s.error}>{error}</p>}
        </form>
      </div>
    </div>
  )
}
