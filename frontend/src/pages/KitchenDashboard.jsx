import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getKitchenOrders, updateKitchenStatus } from '../api.js'

const STATUS_COLORS = { PENDING: '#ffa726', IN_PROGRESS: '#42a5f5', READY: '#66bb6a' }
const STATUS_LABELS = { PENDING: 'En attente', IN_PROGRESS: 'En préparation', READY: 'Prêt' }

const s = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  nav: { background: '#2e7d32', color: '#fff', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navTitle: { fontSize: 20, fontWeight: 700 },
  logoutBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '6px 16px', borderRadius: 6, cursor: 'pointer' },
  container: { maxWidth: 1100, margin: '0 auto', padding: 32 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 },
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  badge: (status) => ({ padding: '3px 12px', borderRadius: 12, background: STATUS_COLORS[status] || '#ccc', color: '#fff', fontSize: 12, fontWeight: 700 }),
  dishes: { fontSize: 14, color: '#555', margin: '12px 0', lineHeight: 1.6 },
  actions: { display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' },
  actionBtn: (color) => ({ flex: 1, padding: '8px 12px', background: color, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }),
  refreshBtn: { background: '#fff', border: '1px solid #ddd', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', marginBottom: 20 },
  empty: { textAlign: 'center', color: '#aaa', padding: 48, background: '#fff', borderRadius: 12 }
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

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.navTitle}>🍳 Cuisine — Tableau de bord</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ opacity: 0.8 }}>{user.email}</span>
          <button style={s.logoutBtn} onClick={logout}>Déconnexion</button>
        </div>
      </nav>

      <div style={s.container}>
        <button style={s.refreshBtn} onClick={load}>↻ Actualiser</button>

        {orders.length === 0
          ? <div style={s.empty}><p style={{ fontSize: 48 }}>🍽</p><p>Aucune commande en cuisine</p></div>
          : (
            <div style={s.grid}>
              {orders.map(order => (
                <div key={order.id} style={s.card}>
                  <div style={s.header}>
                    <div>
                      <strong style={{ fontSize: 16 }}>Commande #{order.orderId}</strong>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        {new Date(order.receivedAt).toLocaleTimeString('fr-FR')}
                      </div>
                    </div>
                    <span style={s.badge(order.status)}>{STATUS_LABELS[order.status] || order.status}</span>
                  </div>

                  <div style={{ fontSize: 12, color: '#888' }}>Client : {order.clientEmail}</div>
                  <div style={s.dishes}>🍴 {order.dishes}</div>

                  <div style={s.actions}>
                    {order.status === 'PENDING' && (
                      <button style={s.actionBtn('#42a5f5')} onClick={() => updateStatus(order.id, 'IN_PROGRESS')}>
                        Commencer
                      </button>
                    )}
                    {order.status === 'IN_PROGRESS' && (
                      <button style={s.actionBtn('#66bb6a')} onClick={() => updateStatus(order.id, 'READY')}>
                        Marquer prêt ✓
                      </button>
                    )}
                    {order.status === 'READY' && (
                      <span style={{ color: '#66bb6a', fontWeight: 700, fontSize: 14 }}>✓ Plat prêt — livraison en cours</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}
