import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const fmt = (n) =>
  Number(n || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

const EMPTY_FORM = { nom: '', adresse: '', siret: '', tva: '' }

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

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nom.trim()) { setError('Le nom est requis.'); return }
    setSaving(true)
    setError('')

    const { error: err } = await supabase.from('clients').insert({
      nom: form.nom.trim(),
      adresse: form.adresse.trim() || null,
      siret: form.siret.trim() || null,
      tva: form.tva.trim() || null,
    })

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

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700'
  const labelCls = 'block text-xs font-medium text-gray-500 mb-1'

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
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Nom / entreprise *</label>
                <input type="text" placeholder="Acme Corp" value={form.nom}
                  onChange={handleChange('nom')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Adresse</label>
                <input type="text" placeholder="12 rue de la Paix, 75001 Paris" value={form.adresse}
                  onChange={handleChange('adresse')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>SIRET</label>
                <input type="text" placeholder="123 456 789 00012" value={form.siret}
                  onChange={handleChange('siret')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>N° TVA intracommunautaire</label>
                <input type="text" placeholder="FR 12 123456789" value={form.tva}
                  onChange={handleChange('tva')} className={inputCls} />
              </div>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving}
                className="px-4 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setError('') }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Annuler
              </button>
            </div>
          </form>
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
                    {c.adresse && <p className="text-xs text-gray-400">{c.adresse}</p>}
                    {c.siret && <p className="text-xs text-gray-400">SIRET {c.siret}</p>}
                    {c.tva && <p className="text-xs text-gray-400">TVA {c.tva}</p>}
                  </div>
                </div>
                <button onClick={() => deleteClient(c.id)}
                  className="text-gray-200 hover:text-red-400 transition-colors text-xl leading-none ml-2"
                  title="Supprimer">
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
