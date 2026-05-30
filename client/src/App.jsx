import { Route, Routes, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import MainDashboard from './pages/MainDashboard'
import AddSubStockist from './pages/AddSubStockist'
import ViewSubStockist from './pages/ViewSubStockist'
import SubstockistProfile from './pages/SubstockistProfile'
import GeneratePayment from './pages/GeneratePayment'
import Login from './pages/Login'
import Footer from './components/Footer'
import { useAuth } from './context/AuthContext'

function RequireAuth({ children }) {
  const { auth, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-sm text-slate-500">Checking authentication...</div>
      </div>
    )
  }

  return auth ? children : <Navigate to="/login" replace />
}

function App() {
  const { auth, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-sm text-slate-500">Loading application...</div>
      </div>
    )
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {auth && <Sidebar />}
      <div className={`flex-1 p-8 ${auth ? 'bg-blue-50' : 'bg-slate-100'}`}>
        <Routes>
          <Route path="/login" element={auth ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/" element={<RequireAuth><MainDashboard /></RequireAuth>} />
          <Route path="/add-substockist" element={<RequireAuth><AddSubStockist /></RequireAuth>} />
          <Route path="/view-substockist" element={<RequireAuth><ViewSubStockist /></RequireAuth>} />
          <Route path="/view-substockist/:id" element={<RequireAuth><SubstockistProfile /></RequireAuth>} />
          <Route path="/generate-payment" element={<RequireAuth><GeneratePayment /></RequireAuth>} />
          <Route path="*" element={<Navigate to={auth ? '/' : '/login'} replace />} />
        </Routes>
        {auth && <Footer />}
      </div>
    </div>
  )
}

export default App
