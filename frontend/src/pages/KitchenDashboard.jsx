import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getKitchenOrders, updateKitchenStatus } from '../api.js'

const C = {
  card: '#fffdf7', ink: '#2b211a', sub: '#8c7e6d',
  line: '#e7ddca', terra: '#c2562f', cream: '#f6efe1',
  paper: '#efe6d6', olive: '#5f6b3e',
}

const STATUS_LABELS = { PENDING: 'En attente', IN_PROGRESS: 'En préparation', READY: 'Prêt' }
const STATUS_COLORS = {
  PENDING:     { fg: '#a9651c', bg: '#f4e3c6' },
  IN_PROGRESS: { fg: '#39658f', bg: '#dde8f1' },
  READY:       { fg: '#566f2f', bg: '#e3ead0' },
}

const Badge = ({ status }) => {
  const col = STATUS_COLORS[status] || { fg: '#8a7c6a', bg: '#ebe2d2' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px',
      borderRadius: 999, fontSize: 12.5, fontWeight: 600, letterSpacing: .2, whiteSpace: 'nowrap',
      color: col.fg, background: col.bg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', opacity: .85, flexShrink: 0 }} />
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export default function KitchenDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [orders, setOrders] = useState([])

  useEffect(() => { load() }, [])

  const load = () => getKitchenOrders().then(setOrders).catch(console.error)

  const updateStatus = async (id, status) => {
    await updateKitchenStatus(id, status)
    load()
  }

  const logout = () => { localStorage.clear(); navigate('/login') }

  const ActionBtn = ({ order }) => {
    if (order.status === 'PENDING') return (
      <button onClick={() => updateStatus(order.id, 'IN_PROGRESS')} style={{ background: '#39658f', color: '#fff', width: '100%', padding: 12, border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Commencer</button>
    )
    if (order.status === 'IN_PROGRESS') return (
      <button onClick={() => updateStatus(order.id, 'READY')} style={{ background: '#566f2f', color: '#fff', width: '100%', padding: 12, border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Marquer prêt ✓</button>
    )
    return <div style={{ textAlign: 'center', color: '#566f2f', fontWeight: 700, fontSize: 14, padding: '11px 0' }}>✓ Plat prêt — livraison en cours</div>
  }

  return (
    <div style={{ minHeight: '100vh', background: C.paper, fontFamily: "'Archivo', system-ui, sans-serif", display: 'flex', flexDirection: 'column' }}>
      {/* nav */}
      <div style={{ height: 74, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: C.olive, color: C.cream }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: "'Spectral', Georgia, serif", fontSize: 26, fontWeight: 600, letterSpacing: .3 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: C.terra, display: 'inline-block' }} />
          Maison · Cuisine
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 14 }}>
          <span style={{ opacity: .82 }}>{user.email}</span>
          <button onClick={logout} style={{ padding: '9px 18px', borderRadius: 999, border: '1px solid rgba(255,255,255,.28)', background: 'transparent', color: C.cream, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>Déconnexion</button>
        </div>
      </div>

      <div style={{ flex: 1, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: C.olive }}>Service en cours</div>
            <h2 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: 26, fontWeight: 600, margin: '4px 0 0', color: C.ink }}>Commandes à préparer</h2>
          </div>
          <button onClick={load} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 15px', borderRadius: 999, border: `1px solid ${C.line}`, background: C.card, color: C.ink, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>↻ Actualiser</button>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.sub, padding: 64, background: C.card, border: `1px solid ${C.line}`, borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍽</div>
            <div>Aucune commande en cuisine</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {orders.map(order => (
              <div key={order.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: "'Spectral', serif", fontSize: 19, fontWeight: 700 }}>#{order.orderId}</div>
                    <div style={{ fontSize: 12, color: C.sub }}>reçue {new Date(order.receivedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <Badge status={order.status} />
                </div>
                <div style={{ fontSize: 12, color: C.sub, margin: '12px 0 6px' }}>{order.clientEmail}</div>
                <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 18, lineHeight: 1.45 }}>🍴 {order.dishes}</div>
                <div style={{ marginTop: 'auto' }}><ActionBtn order={order} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
