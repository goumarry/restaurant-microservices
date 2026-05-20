import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDeliveries, updateDeliveryStatus } from '../api.js'

const STATUS_COLORS = { PENDING: '#ffa726', IN_TRANSIT: '#42a5f5', DELIVERED: '#66bb6a' }
const STATUS_LABELS = { PENDING: 'En attente', IN_TRANSIT: 'En transit', DELIVERED: 'Livré' }

const s = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  nav: { background: '#4a148c', color: '#fff', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navTitle: { fontSize: 20, fontWeight: 700 },
  logoutBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '6px 16px', borderRadius: 6, cursor: 'pointer' },
  container: { maxWidth: 900, margin: '0 auto', padding: 32 },
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: (status) => ({ padding: '3px 12px', borderRadius: 12, background: STATUS_COLORS[status] || '#ccc', color: '#fff', fontSize: 12, fontWeight: 700 }),
  actions: { display: 'flex', gap: 8, marginTop: 14 },
  actionBtn: (color) => ({ padding: '8px 20px', background: color, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }),
  refreshBtn: { background: '#fff', border: '1px solid #ddd', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', marginBottom: 20 },
  empty: { textAlign: 'center', color: '#aaa', padding: 48, background: '#fff', borderRadius: 12 }
}

export default function DeliveryDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [deliveries, setDeliveries] = useState([])

  useEffect(() => { load() }, [])

  const load = () => getDeliveries().then(setDeliveries).catch(console.error)

  const updateStatus = async (id, status) => {
    await updateDeliveryStatus(id, status)
    load()
  }

  const logout = () => { localStorage.clear(); navigate('/login') }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.navTitle}>🛵 Livraisons — Tableau de bord</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ opacity: 0.8 }}>{user.email}</span>
          <button style={s.logoutBtn} onClick={logout}>Déconnexion</button>
        </div>
      </nav>

      <div style={s.container}>
        <button style={s.refreshBtn} onClick={load}>↻ Actualiser</button>

        {deliveries.length === 0
          ? <div style={s.empty}><p style={{ fontSize: 48 }}>🛵</p><p>Aucune livraison disponible</p></div>
          : deliveries.map(delivery => (
            <div key={delivery.id} style={s.card}>
              <div style={s.header}>
                <div>
                  <strong style={{ fontSize: 16 }}>Livraison #{delivery.id}</strong>
                  <span style={{ marginLeft: 12, fontSize: 14, color: '#666' }}>Commande #{delivery.orderId}</span>
                </div>
                <span style={s.badge(delivery.status)}>{STATUS_LABELS[delivery.status] || delivery.status}</span>
              </div>

              {delivery.livreurId && (
                <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
                  Livreur assigné : #{delivery.livreurId}
                </div>
              )}

              <div style={{ fontSize: 12, color: '#999' }}>
                Créée le : {new Date(delivery.createdAt).toLocaleString('fr-FR')}
              </div>

              <div style={s.actions}>
                {delivery.status === 'PENDING' && (
                  <button style={s.actionBtn('#42a5f5')} onClick={() => updateStatus(delivery.id, 'IN_TRANSIT')}>
                    Prendre en charge
                  </button>
                )}
                {delivery.status === 'IN_TRANSIT' && (
                  <button style={s.actionBtn('#66bb6a')} onClick={() => updateStatus(delivery.id, 'DELIVERED')}>
                    Marquer livré ✓
                  </button>
                )}
                {delivery.status === 'DELIVERED' && (
                  <span style={{ color: '#66bb6a', fontWeight: 700 }}>✓ Livraison terminée</span>
                )}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
