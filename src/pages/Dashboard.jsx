import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const fmt = (n) =>
  Number(n || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

const STATUS_COLOR = {
  'payée': 'bg-green-100 text-green-700',
  'en attente': 'bg-amber-100 text-amber-700',
  'en retard': 'bg-red-100 text-red-700',
}

export default function Dashboard() {
  const [factures, setFactures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('factures')
      .select('*, clients(nom)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setFactures(data || [])
        setLoading(false)
      })
  }, [])

  const caTotal = factures.reduce((s, f) => s + Number(f.montant_ht || 0), 0)
  const caEncaisse = factures.filter(f => f.statut === 'payée').reduce((s, f) => s + Number(f.montant_ht || 0), 0)
  const caEnAttente = factures.filter(f => f.statut !== 'payée').reduce((s, f) => s + Number(f.montant_ht || 0), 0)
  const enAttente = factures.filter(f => f.statut !== 'payée')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Tableau de bord</h2>
        <Link
          to="/factures/nouvelle"
          className="px-4 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
        >
          + Nouvelle facture
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">CA total</p>
          <p className="text-3xl font-bold mt-2 text-blue-950">{fmt(caTotal)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Encaissé</p>
          <p className="text-3xl font-bold mt-2 text-green-600">{fmt(caEncaisse)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">En attente</p>
          <p className="text-3xl font-bold mt-2 text-amber-500">{fmt(caEnAttente)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Factures en attente
          </h3>
          <Link to="/factures" className="text-xs text-blue-700 hover:underline font-medium">
            Voir toutes →
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 py-4">Chargement...</p>
        ) : enAttente.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">Aucune facture en attente.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-2 text-left font-medium">N°</th>
                <th className="pb-2 text-left font-medium">Client</th>
                <th className="pb-2 text-left font-medium">Date</th>
                <th className="pb-2 text-right font-medium">Montant HT</th>
                <th className="pb-2 text-center font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {enAttente.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-semibold text-blue-900">{f.numero}</td>
                  <td className="py-3 text-gray-700">{f.clients?.nom ?? '—'}</td>
                  <td className="py-3 text-gray-400">{f.date_emission}</td>
                  <td className="py-3 text-right font-medium text-gray-800">{fmt(f.montant_ht)}</td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[f.statut] ?? 'bg-gray-100 text-gray-600'}`}>
                      {f.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
