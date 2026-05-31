import { Route, Routes, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
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
import { useEffect, useState } from 'react'

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const storedTheme = localStorage.getItem('salesify-theme')
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme)
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light')
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('salesify-theme', theme)
  }, [theme])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <div className="text-sm text-slate-400">Loading application...</div>
      </div>
    )
  }

  return (
    <>
      <ToastContainer theme={theme === 'dark' ? 'dark' : 'light'} position="top-right" autoClose={3000} />
      {auth && <Navbar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} theme={theme} toggleTheme={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))} />}
      <div className="flex min-h-screen pt-16" style={{ background: 'var(--bg)' }}>
        {auth && <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            auth
              ? `${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-0'} p-4 sm:p-6 lg:p-8`
              : 'p-0'
          }`}
          style={{ background: 'var(--bg)' }}
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
