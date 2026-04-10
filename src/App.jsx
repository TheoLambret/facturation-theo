import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import Clients from './pages/Clients'
import NewInvoice from './pages/NewInvoice'
import EditInvoice from './pages/EditInvoice'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/factures" element={<Invoices />} />
            <Route path="/factures/nouvelle" element={<NewInvoice />} />
            <Route path="/factures/:id/modifier" element={<EditInvoice />} />
            <Route path="/clients" element={<Clients />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
