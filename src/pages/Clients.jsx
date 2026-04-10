import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const fmt = (n) =>
  Number(n || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

const EMPTY_FORM = { nom: '', email: '' }

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchClients = async () => {
    const { data: clientsData } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    const { data: facturesData } = await supabase.from('factures').select('client_id, montant_ht')

    const enriched = (clientsData || []).map((c) => {
      const clientFactures = (facturesData || []).filter((f) => f.client_id === c.id)
      const ca = clientFactures.reduce((s, f) => s + Number(f.montant_ht || 0), 0)
      return { ...c, nbFactures: clientFactures.length, ca }
    })

    setClients(enriched)
    setLoading(false)
  }

  useEffect(() => { fetchClients() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nom.trim()) { setError('Le nom est requis.'); return }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('clients').insert({ nom: form.nom.trim(), email: form.email.trim() || null })
    if (err) { setError(err.message); setSaving(false); return }
    setForm(EMPTY_FORM)
    setShowForm(false)
    setSaving(false)
    await fetchClients()
  }

  const deleteClient = async (id) => {
    if (!confirm('Supprimer ce client ? Ses factures ne seront pas supprimées.')) return
    await supabase.from('clients').delete().eq('id', id)
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Clients</h2>
        <button
          onClick={() => { setShowForm(true); setError('') }}
          className="px-4 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
        >
          + Nouveau client
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Nouveau client</h3>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Nom / entreprise *"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
            <input
              type="email"
              placeholder="Email (optionnel)"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setError('') }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Chargement...</p>
      ) : clients.length === 0 ? (
        <p className="text-sm text-gray-400">Aucun client. Ajoutez votre premier client.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {c.nom[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{c.nom}</p>
                    <p className="text-xs text-gray-400">{c.email || 'Pas d\'email'}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteClient(c.id)}
                  className="text-gray-200 hover:text-red-400 transition-colors text-xl leading-none ml-2"
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
              <div className="flex justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
                <span>{c.nbFactures} facture{c.nbFactures !== 1 ? 's' : ''}</span>
                <span className="font-semibold text-blue-900">{fmt(c.ca)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
