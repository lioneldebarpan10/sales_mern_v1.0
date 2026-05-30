import { Route, Routes, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import MainDashboard from './pages/MainDashboard'
import AddSubStockist from './pages/AddSubStockist'
import ViewSubStockist from './pages/ViewSubStockist'
import SubstockistProfile from './pages/SubstockistProfile'
import GeneratePayment from './pages/GeneratePayment'
import PaymentHistory from './pages/PaymentHistory'
import Login from './pages/Login'
import { useAuth } from './context/AuthContext'
import { SidebarProvider, useSidebar } from './context/SidebarContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function RequireAuth({ children }) {
  const { auth, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <div className="text-sm text-slate-400">Checking authentication...</div>
      </div>
    )
  }

  return auth ? children : <Navigate to="/login" replace />
}

function AppLayout() {
  const { auth, loading } = useAuth()
  const { isSidebarOpen } = useSidebar()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <div className="text-sm text-slate-400">Loading application...</div>
      </div>
    )
  }

  return (
    <>
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />
      <div className="flex bg-[#0b0f19] min-h-screen">
        {auth && <Sidebar />}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            auth
              ? `${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-0'} bg-[#161f30] p-4 sm:p-6 lg:p-8`
              : 'bg-[#0b0f19] p-0'
          }`}
        >
          <Routes>
            <Route path="/login" element={auth ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/" element={<RequireAuth><MainDashboard /></RequireAuth>} />
            <Route path="/add-substockist" element={<RequireAuth><AddSubStockist /></RequireAuth>} />
            <Route path="/view-substockist" element={<RequireAuth><ViewSubStockist /></RequireAuth>} />
            <Route path="/view-substockist/:id" element={<RequireAuth><SubstockistProfile /></RequireAuth>} />
            <Route path="/generate-payment" element={<RequireAuth><GeneratePayment /></RequireAuth>} />
            <Route path="/payment-history" element={<RequireAuth><PaymentHistory /></RequireAuth>} />
            <Route path="*" element={<Navigate to={auth ? '/' : '/login'} replace />} />
          </Routes>
        </div>
      </div>
    </>
  )
}

function App() {
  return (
    <SidebarProvider>
      <AppLayout />
    </SidebarProvider>
  )
}

export default App
