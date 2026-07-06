const BASE = '/api'

const headers = () => ({
  'Content-Type': 'application/json',
  ...(localStorage.getItem('token')
    ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
    : {})
})

const handle = async (res) => {
  if (!res.ok) {
    let message
    try {
      const data = await res.json()
      message = data.message || data.error || res.statusText
    } catch {
      message = res.statusText
    }
    throw new Error(message)
  }
  return res.json()
}

// Auth
export const login = (email, password) =>
  fetch(`${BASE}/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify({ email, password }) }).then(handle)

export const register = (email, password, role) =>
  fetch(`${BASE}/auth/register`, { method: 'POST', headers: headers(), body: JSON.stringify({ email, password, role }) }).then(handle)

// Orders
export const createOrder = (items) =>
  fetch(`${BASE}/orders`, { method: 'POST', headers: headers(), body: JSON.stringify({ items }) }).then(handle)

export const getMyOrders = () =>
  fetch(`${BASE}/orders/my`, { headers: headers() }).then(handle)

export const getAllOrders = () =>
  fetch(`${BASE}/orders`, { headers: headers() }).then(handle)

// Kitchen
export const getKitchenOrders = () =>
  fetch(`${BASE}/kitchen/orders`, { headers: headers() }).then(handle)

export const updateKitchenStatus = (id, status) =>
  fetch(`${BASE}/kitchen/orders/${id}/status`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status }) }).then(handle)

// Delivery
export const getDeliveries = () =>
  fetch(`${BASE}/deliveries`, { headers: headers() }).then(handle)

export const updateDeliveryStatus = (id, status) =>
  fetch(`${BASE}/deliveries/${id}/status`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status }) }).then(handle)
