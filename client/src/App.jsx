import { useState } from 'react'
import Sidebar from './components/Sidebar'
import { Route, Routes } from 'react-router-dom'
import MainDashboard from './pages/MainDashboard'
import AddSubStockist from './pages/AddSubStockist'
import ViewSubStockist from './pages/ViewSubStockist'
import GeneratePayment from './pages/GeneratePayment'
import Footer from './components/Footer'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-blue-50">
        <Routes>
          <Route path="/" element={<MainDashboard />} />
          <Route path="/add-substockist" element={<AddSubStockist />} />
          <Route path="/view-substockist" element={<ViewSubStockist />} />
          <Route path="/generate-payment" element={<GeneratePayment />} />
        </Routes>
        <Footer />
      </div>

    </div>
  )
}

export default App
