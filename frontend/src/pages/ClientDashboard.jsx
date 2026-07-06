import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder, getMyOrders } from '../api.js'

const C = {
  paper: '#efe6d6', card: '#fffdf7', ink: '#2b211a', sub: '#8c7e6d',
  line: '#e7ddca', terra: '#c2562f', cream: '#f6efe1', espresso: '#2b211a',
}

const STATUS_LABELS = {
  PENDING: 'En attente', PREPARING: 'En préparation', READY: 'Prêt',
  DELIVERING: 'En livraison', DELIVERED: 'Livré', CANCELLED: 'Annulé',
}
const STATUS_COLORS = {
  PENDING:   { fg: '#a9651c', bg: '#f4e3c6' },
  PREPARING: { fg: '#39658f', bg: '#dde8f1' },
  READY:     { fg: '#566f2f', bg: '#e3ead0' },
  DELIVERING:{ fg: '#6c4a7e', bg: '#e9dff0' },
  DELIVERED: { fg: '#8a7c6a', bg: '#ebe2d2' },
  CANCELLED: { fg: '#a83a26', bg: '#f2dcd5' },
}

const MENU = [
  { id: 1, name: 'Burger Maison',        desc: 'Bœuf, cheddar affiné, oignons confits',  price: 12.99 },
  { id: 2, name: 'Pizza Margherita',     desc: 'Mozzarella di bufala, basilic frais',      price: 10.99 },
  { id: 3, name: 'Salade César',         desc: 'Poulet rôti, parmesan, croûtons',          price: 8.99  },
  { id: 4, name: 'Spaghetti Bolognaise', desc: 'Sauce mijotée 6h, parmesan',               price: 11.99 },
  { id: 5, name: 'Entrecôte frites',     desc: "300g, beurre maître d'hôtel",              price: 18.99 },
  { id: 6, name: 'Tiramisu',             desc: 'Mascarpone, café, cacao amer',             price: 6.99  },
]

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

export default function ClientDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [msg, setMsg] = useState('')

  useEffect(() => { loadOrders() }, [])

  const loadOrders = () => getMyOrders().then(setOrders).catch(console.error)

  const addToCart = (dish) => {
    setCart(prev => {
      const existing = prev.find(i => i.name === dish.name)
      if (existing) return prev.map(i => i.name === dish.name ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { name: dish.name, price: dish.price, qty: 1 }]
    })
  }

  const removeFromCart = (name) => setCart(prev => prev.filter(i => i.name !== name))

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)

  const placeOrder = async () => {
    if (cart.length === 0) return
    try {
      await createOrder(cart.map(i => ({ dishName: i.name, quantity: i.qty, price: i.price })))
      setCart([])
      setMsg('Commande passée avec succès !')
      setTimeout(() => setMsg(''), 3000)
      loadOrders()
    } catch (e) { setMsg('Erreur : ' + e.message) }
  }

  const logout = () => { localStorage.clear(); navigate('/login') }

  return (
    <div style={{ minHeight: '100vh', background: C.paper, fontFamily: "'Archivo', system-ui, sans-serif", display: 'flex', flexDirection: 'column' }}>
      {/* nav */}
      <div style={{ height: 74, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: C.espresso, color: C.cream }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: "'Spectral', Georgia, serif", fontSize: 26, fontWeight: 600, letterSpacing: .3 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: C.terra, display: 'inline-block' }} />
          Maison
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 14 }}>
          <span style={{ opacity: .82 }}>{user.email}</span>
          <button onClick={logout} style={{ padding: '9px 18px', borderRadius: 999, border: '1px solid rgba(255,255,255,.28)', background: 'transparent', color: C.cream, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>Déconnexion</button>
        </div>
      </div>

      {msg && (
        <div style={{ background: '#e3ead0', color: '#566f2f', padding: '12px 40px', fontWeight: 600, fontSize: 14 }}>{msg}</div>
      )}

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 26, padding: 28 }}>
        {/* left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <section>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: C.terra, marginBottom: 4 }}>La carte</div>
            <h2 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: 27, fontWeight: 600, margin: '0 0 16px', color: C.ink }}>Notre menu du jour</h2>
            <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, overflow: 'hidden' }}>
              {MENU.map((d, i) => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '13px 18px', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: 17.5, fontWeight: 600 }}>{d.name}</div>
                    <div style={{ fontSize: 12.5, color: C.sub, marginTop: 2 }}>{d.desc}</div>
                  </div>
                  <div style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: 18, fontWeight: 700, color: C.terra, whiteSpace: 'nowrap' }}>{d.price.toFixed(2).replace('.', ',')} €</div>
                  <button onClick={() => addToCart(d)} style={{ width: 38, height: 38, borderRadius: 10, border: `1.5px solid ${C.line}`, background: C.cream, color: C.terra, fontSize: 22, lineHeight: 1, cursor: 'pointer', fontFamily: "'Spectral', serif", flexShrink: 0 }}>+</button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: 20, fontWeight: 600, margin: '0 0 12px', color: C.ink }}>
              Mon panier {cart.length > 0 && `(${cart.length})`}
            </h3>
            <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20 }}>
              {cart.length === 0 ? (
                <p style={{ color: C.sub, textAlign: 'center', padding: '16px 0', fontSize: 14 }}>Votre panier est vide</p>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${C.line}` }}>
                      <div style={{ fontSize: 14.5 }}>
                        <b style={{ color: C.terra }}>{item.qty}×</b>&nbsp;{item.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ fontFamily: "'Spectral', serif", fontWeight: 600 }}>{(item.price * item.qty).toFixed(2).replace('.', ',')} €</span>
                        <span onClick={() => removeFromCart(item.name)} style={{ color: C.sub, cursor: 'pointer', fontSize: 18 }}>×</span>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '15px 0 16px' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.sub }}>Total</span>
                    <span style={{ fontFamily: "'Spectral', serif", fontSize: 25, fontWeight: 700 }}>{total.toFixed(2).replace('.', ',')} €</span>
                  </div>
                  <button onClick={placeOrder} style={{ width: '100%', padding: 14, background: C.espresso, color: C.cream, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Passer la commande
                  </button>
                </>
              )}
            </div>
          </section>
        </div>

        {/* right */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: 20, fontWeight: 600, margin: 0, color: C.ink }}>Mes commandes</h3>
            <button onClick={loadOrders} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 15px', borderRadius: 999, border: `1px solid ${C.line}`, background: C.card, color: C.ink, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>↻ Actualiser</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {orders.length === 0 ? (
              <p style={{ color: C.sub, textAlign: 'center', padding: 32, background: C.card, border: `1px solid ${C.line}`, borderRadius: 16 }}>Aucune commande</p>
            ) : orders.map(order => (
              <div key={order.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
                  <span style={{ fontFamily: "'Spectral', serif", fontSize: 18, fontWeight: 700 }}>Commande #{order.id}</span>
                  <Badge status={order.status} />
                </div>
                <div style={{ fontSize: 13.5, color: C.ink, opacity: .85 }}>
                  {order.items?.map(i => `${i.quantity}× ${i.dishName}`).join(', ')}
                </div>
                <div style={{ fontSize: 12.5, color: C.sub, marginTop: 7 }}>
                  {new Date(order.createdAt).toLocaleString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
