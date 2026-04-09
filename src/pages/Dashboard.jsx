const stats = [
  { label: 'Chiffre d\'affaires (mois)', value: '4 200 €', color: 'text-indigo-600' },
  { label: 'Factures en attente', value: '3', color: 'text-amber-500' },
  { label: 'Factures payées', value: '12', color: 'text-green-600' },
  { label: 'Clients actifs', value: '5', color: 'text-blue-600' },
]

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Tableau de bord</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-medium text-gray-700 mb-4">Activité récente</h3>
        <p className="text-sm text-gray-400">Aucune activité récente.</p>
      </div>
    </div>
  )
}
