import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import ClientDashboard from './pages/ClientDashboard.jsx'
import KitchenDashboard from './pages/KitchenDashboard.jsx'
import DeliveryDashboard from './pages/DeliveryDashboard.jsx'

function RequireAuth({ children, role }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/client" element={
          <RequireAuth role="CLIENT"><ClientDashboard /></RequireAuth>
        } />
        <Route path="/kitchen" element={
          <RequireAuth role="CHEF"><KitchenDashboard /></RequireAuth>
        } />
        <Route path="/delivery" element={
          <RequireAuth role="LIVREUR"><DeliveryDashboard /></RequireAuth>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
