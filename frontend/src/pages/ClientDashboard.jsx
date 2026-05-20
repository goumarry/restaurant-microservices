import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder, getMyOrders } from '../api.js'

const MENU = [
  { id: 1, name: 'Burger Maison', price: 12.99 },
  { id: 2, name: 'Pizza Margherita', price: 10.99 },
  { id: 3, name: 'Salade César', price: 8.99 },
  { id: 4, name: 'Spaghetti Bolognaise', price: 11.99 },
  { id: 5, name: 'Entrecôte frites', price: 18.99 },
  { id: 6, name: 'Tiramisu', price: 6.99 },
]

const STATUS_COLORS = {
  PENDING: '#ffa726', PREPARING: '#42a5f5', READY: '#66bb6a',
  DELIVERING: '#ab47bc', DELIVERED: '#78909c', CANCELLED: '#ef5350'
}
const STATUS_LABELS = {
  PENDING: 'En attente', PREPARING: 'En préparation', READY: 'Prêt',
  DELIVERING: 'En livraison', DELIVERED: 'Livré', CANCELLED: 'Annulé'
}

const s = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  nav: { background: '#1a1a2e', color: '#fff', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navTitle: { fontSize: 20, fontWeight: 700 },
  logoutBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '6px 16px', borderRadius: 6, cursor: 'pointer' },
  container: { maxWidth: 1100, margin: '0 auto', padding: 32 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 },
  section: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#1a1a2e' },
  menuItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  itemName: { fontWeight: 500 },
  itemPrice: { color: '#ff6b35', fontWeight: 700 },
  addBtn: { background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 },
  cartItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f5f5f5' },
  removeBtn: { background: '#ef5350', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' },
  total: { textAlign: 'right', fontWeight: 700, fontSize: 18, marginTop: 16, color: '#1a1a2e' },
  orderBtn: { width: '100%', padding: 14, background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 16 },
  orderCard: { border: '1px solid #e0e0e0', borderRadius: 8, padding: 16, marginBottom: 12 },
  badge: (status) => ({ display: 'inline-block', padding: '2px 10px', borderRadius: 12, background: STATUS_COLORS[status] || '#ccc', color: '#fff', fontSize: 12, fontWeight: 700 }),
  empty: { color: '#aaa', textAlign: 'center', padding: 24 }
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
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.navTitle}>🍽 Restaurant — Client</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ opacity: 0.8 }}>{user.email}</span>
          <button style={s.logoutBtn} onClick={logout}>Déconnexion</button>
        </div>
      </nav>

      <div style={s.container}>
        {msg && <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: 12, borderRadius: 8, marginBottom: 20, fontWeight: 600 }}>{msg}</div>}
        <div style={s.grid}>
          {/* Menu */}
          <div>
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Menu</h2>
              {MENU.map(dish => (
                <div key={dish.id} style={s.menuItem}>
                  <span style={s.itemName}>{dish.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={s.itemPrice}>{dish.price.toFixed(2)} €</span>
                    <button style={s.addBtn} onClick={() => addToCart(dish)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Panier */}
            <div style={{ ...s.section, marginTop: 24 }}>
              <h2 style={s.sectionTitle}>Panier {cart.length > 0 && `(${cart.length})`}</h2>
              {cart.length === 0
                ? <p style={s.empty}>Votre panier est vide</p>
                : cart.map(item => (
                  <div key={item.name} style={s.cartItem}>
                    <span>{item.qty}× {item.name}</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontWeight: 700 }}>{(item.price * item.qty).toFixed(2)} €</span>
                      <button style={s.removeBtn} onClick={() => removeFromCart(item.name)}>✕</button>
                    </div>
                  </div>
                ))
              }
              {cart.length > 0 && (
                <>
                  <div style={s.total}>Total : {total.toFixed(2)} €</div>
                  <button style={s.orderBtn} onClick={placeOrder}>Passer la commande</button>
                </>
              )}
            </div>
          </div>

          {/* Mes commandes */}
          <div style={s.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ ...s.sectionTitle, marginBottom: 0 }}>Mes commandes</h2>
              <button onClick={loadOrders} style={{ background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>↻ Actualiser</button>
            </div>
            {orders.length === 0
              ? <p style={s.empty}>Aucune commande</p>
              : orders.map(order => (
                <div key={order.id} style={s.orderCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <strong>Commande #{order.id}</strong>
                    <span style={s.badge(order.status)}>{STATUS_LABELS[order.status] || order.status}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#666' }}>
                    {order.items?.map(i => `${i.quantity}× ${i.dishName}`).join(', ')}
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
                    {new Date(order.createdAt).toLocaleString('fr-FR')}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
