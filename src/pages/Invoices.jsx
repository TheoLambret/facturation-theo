import { Link } from 'react-router-dom'

const mockInvoices = [
  { id: 'FAC-001', client: 'Acme Corp', date: '2026-03-15', amount: '1 800 €', status: 'Payée' },
  { id: 'FAC-002', client: 'Beta SAS', date: '2026-03-28', amount: '950 €', status: 'En attente' },
  { id: 'FAC-003', client: 'Gamma Ltd', date: '2026-04-01', amount: '2 400 €', status: 'En attente' },
]

const statusColor = {
  'Payée': 'bg-green-100 text-green-700',
  'En attente': 'bg-amber-100 text-amber-700',
  'Annulée': 'bg-red-100 text-red-700',
}

export default function Invoices() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Factures</h2>
        <Link
          to="/factures/nouvelle"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Nouvelle facture
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">N°</th>
              <th className="px-6 py-3 text-left">Client</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-right">Montant</th>
              <th className="px-6 py-3 text-center">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-indigo-600">{inv.id}</td>
                <td className="px-6 py-4 text-gray-700">{inv.client}</td>
                <td className="px-6 py-4 text-gray-500">{inv.date}</td>
                <td className="px-6 py-4 text-right font-medium text-gray-800">{inv.amount}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[inv.status]}`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
