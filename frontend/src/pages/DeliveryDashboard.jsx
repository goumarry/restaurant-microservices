import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDeliveries, updateDeliveryStatus } from '../api.js'

const C = {
  card: '#fffdf7', ink: '#2b211a', sub: '#8c7e6d',
  line: '#e7ddca', terra: '#c2562f', cream: '#f6efe1',
  paper: '#efe6d6', aubergine: '#5b3a52',
}

const STATUS_LABELS = { PENDING: 'En attente', IN_TRANSIT: 'En cours', DELIVERED: 'Livré' }
const STATUS_COLORS = {
  PENDING:    { fg: '#a9651c', bg: '#f4e3c6' },
  IN_TRANSIT: { fg: '#39658f', bg: '#dde8f1' },
  DELIVERED:  { fg: '#566f2f', bg: '#e3ead0' },
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

  const ActionBtn = ({ delivery }) => {
    if (delivery.status === 'PENDING') return (
      <button onClick={() => updateStatus(delivery.id, 'IN_TRANSIT')} style={{ background: '#39658f', color: '#fff', padding: '11px 22px', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Prendre en charge</button>
    )
    if (delivery.status === 'IN_TRANSIT') return (
      <button onClick={() => updateStatus(delivery.id, 'DELIVERED')} style={{ background: '#566f2f', color: '#fff', padding: '11px 22px', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Marquer livré ✓</button>
    )
    return <div style={{ color: '#566f2f', fontWeight: 700, fontSize: 14 }}>✓ Livraison terminée</div>
  }

  return (
    <div style={{ minHeight: '100vh', background: C.paper, fontFamily: "'Archivo', system-ui, sans-serif", display: 'flex', flexDirection: 'column' }}>
      {/* nav */}
      <div style={{ height: 74, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: C.aubergine, color: C.cream }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: "'Spectral', Georgia, serif", fontSize: 26, fontWeight: 600, letterSpacing: .3 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: C.terra, display: 'inline-block' }} />
          Maison · Livraison
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 14 }}>
          <span style={{ opacity: .82 }}>{user.email}</span>
          <button onClick={logout} style={{ padding: '9px 18px', borderRadius: 999, border: '1px solid rgba(255,255,255,.28)', background: 'transparent', color: C.cream, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>Déconnexion</button>
        </div>
      </div>

      <div style={{ flex: 1, padding: 28, maxWidth: 900, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: C.aubergine }}>Tournée du jour</div>
            <h2 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: 26, fontWeight: 600, margin: '4px 0 0', color: C.ink }}>Mes livraisons</h2>
          </div>
          <button onClick={load} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 15px', borderRadius: 999, border: `1px solid ${C.line}`, background: C.card, color: C.ink, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>↻ Actualiser</button>
        </div>

        {deliveries.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.sub, padding: 64, background: C.card, border: `1px solid ${C.line}`, borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛵</div>
            <div>Aucune livraison disponible</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {deliveries.map(delivery => (
              <div key={delivery.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 22 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ fontFamily: "'Spectral', serif", fontSize: 20, fontWeight: 700 }}>Livraison #{delivery.id}</span>
                    <span style={{ fontSize: 13.5, color: C.sub }}>Commande #{delivery.orderId}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: C.sub, marginTop: 5 }}>
                    {delivery.livreurId ? `Livreur #${delivery.livreurId} · ` : ''}
                    {new Date(delivery.createdAt).toLocaleString('fr-FR')}
                  </div>
                </div>
                <Badge status={delivery.status} />
                <div style={{ minWidth: 180, textAlign: 'right' }}><ActionBtn delivery={delivery} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
