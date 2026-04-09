const mockClients = [
  { id: 1, name: 'Acme Corp', email: 'contact@acme.com', invoices: 4, total: '7 200 €' },
  { id: 2, name: 'Beta SAS', email: 'billing@beta.fr', invoices: 2, total: '1 900 €' },
  { id: 3, name: 'Gamma Ltd', email: 'admin@gamma.io', invoices: 1, total: '2 400 €' },
]

export default function Clients() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Clients</h2>
        <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          + Nouveau client
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockClients.map((c) => (
          <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                {c.name[0]}
              </div>
              <div>
                <p className="font-medium text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-400">{c.email}</p>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
              <span>{c.invoices} facture(s)</span>
              <span className="font-medium text-gray-800">{c.total}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
