import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { generatePdf } from '../lib/generatePdf'

const fmt = (n) =>
  Number(n || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

const STATUS_COLOR = {
  'payée': 'bg-green-100 text-green-700',
  'en attente': 'bg-amber-100 text-amber-700',
  'en retard': 'bg-red-100 text-red-700',
}

const STATUTS = ['en attente', 'payée', 'en retard']

export default function Invoices() {
  const [factures, setFactures] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [emetteur, setEmetteur] = useState(null)

  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) setEmetteur(data)
    })
  }, [])

  const fetchFactures = () => {
    supabase
      .from('factures')
      .select('*, clients(nom, adresse, siret, tva)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setFactures(data || [])
        setLoading(false)
      })
  }

  useEffect(() => { fetchFactures() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatut = async (id, statut) => {
    setUpdatingId(id)
    await supabase.from('factures').update({ statut }).eq('id', id)
    await fetchFactures()
    setUpdatingId(null)
  }

  const deleteFacture = async (id) => {
    if (!confirm('Supprimer cette facture ?')) return
    await supabase.from('factures').delete().eq('id', id)
    setFactures((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Factures</h2>
        <Link to="/factures/nouvelle"
          className="px-4 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors">
          + Nouvelle facture
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-8 text-sm text-gray-400">Chargement...</p>
        ) : factures.length === 0 ? (
          <p className="p-8 text-sm text-gray-400">Aucune facture. Créez votre première facture.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">N°</th>
                <th className="px-5 py-3 text-left">Client</th>
                <th className="px-5 py-3 text-left">Description</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-right">Montant HT</th>
                <th className="px-5 py-3 text-center">Statut</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {factures.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-blue-900">{f.numero}</td>
                  <td className="px-5 py-4 text-gray-700">{f.clients?.nom ?? '—'}</td>
                  <td className="px-5 py-4 text-gray-500 max-w-[180px] truncate">{f.description || '—'}</td>
                  <td className="px-5 py-4 text-gray-500">{f.date_emission}</td>
                  <td className="px-5 py-4 text-right font-medium text-gray-800">{fmt(f.montant_ht)}</td>
                  <td className="px-5 py-4 text-center">
                    <select
                      value={f.statut}
                      disabled={updatingId === f.id}
                      onChange={(e) => updateStatut(f.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 ${STATUS_COLOR[f.statut] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Modifier */}
                      <Link
                        to={`/factures/${f.id}/modifier`}
                        className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        Modifier
                      </Link>
                      {/* Télécharger PDF */}
                      <button
                        onClick={() => generatePdf(f, emetteur)}
                        className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        title="Télécharger le PDF"
                      >
                        PDF
                      </button>
                      {/* Supprimer */}
                      <button
                        onClick={() => deleteFacture(f.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none px-1"
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </div>
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
