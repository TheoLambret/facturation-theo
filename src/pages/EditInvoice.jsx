import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const TVA_RATE = 0.20

export default function EditInvoice() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null)

  useEffect(() => {
    Promise.all([
      supabase.from('clients').select('id, nom').order('nom'),
      supabase.from('factures').select('*').eq('id', id).single(),
    ]).then(([{ data: clientsData }, { data: facture, error: err }]) => {
      if (err || !facture) { setError('Facture introuvable.'); setLoading(false); return }
      setClients(clientsData || [])
      setForm({
        client_id: facture.client_id || '',
        description: facture.description || '',
        jours: String(facture.jours ?? '1'),
        tjm: String(facture.tjm ?? '500'),
        date_emission: facture.date_emission || new Date().toISOString().split('T')[0],
        statut: facture.statut || 'en attente',
        numero: facture.numero,
      })
      setLoading(false)
    })
  }, [id])

  const jours = parseFloat(form?.jours) || 0
  const tjm = parseFloat(form?.tjm) || 0
  const montantHT = jours * tjm
  const tvaAmount = montantHT * TVA_RATE
  const montantTTC = montantHT + tvaAmount

  const fmt = (n) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.client_id) { setError('Veuillez sélectionner un client.'); return }
    if (!form.description.trim()) { setError('La description est requise.'); return }
    if (jours <= 0) { setError('Le nombre de jours doit être supérieur à 0.'); return }
    if (tjm <= 0) { setError('Le TJM doit être supérieur à 0.'); return }

    setSaving(true)
    setError('')

    const { error: err } = await supabase.from('factures').update({
      client_id: form.client_id,
      description: form.description.trim(),
      jours,
      tjm,
      montant_ht: montantHT,
      date_emission: form.date_emission,
      statut: form.statut,
    }).eq('id', id)

    if (err) { setError(err.message); setSaving(false); return }
    navigate('/factures')
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700'
  const labelCls = 'block text-xs font-medium text-gray-500 mb-1'

  if (loading) return <div className="text-sm text-gray-400 p-8">Chargement...</div>
  if (!form) return <div className="text-sm text-red-500 p-8">{error}</div>

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Modifier la facture <span className="text-blue-900">{form.numero}</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>N° facture</label>
              <input type="text" value={form.numero} readOnly
                className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed`} />
            </div>
            <div>
              <label className={labelCls}>Date d'émission</label>
              <input type="date" value={form.date_emission} onChange={handleChange('date_emission')} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Client *</label>
            <select value={form.client_id} onChange={handleChange('client_id')} className={inputCls}>
              <option value="">— Sélectionner un client —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Description *</label>
            <input type="text" value={form.description} onChange={handleChange('description')} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nombre de jours *</label>
              <input type="number" min="0.5" step="0.5" value={form.jours} onChange={handleChange('jours')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>TJM (€) *</label>
              <input type="number" min="1" step="10" value={form.tjm} onChange={handleChange('tjm')} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Statut</label>
            <select value={form.statut} onChange={handleChange('statut')} className={inputCls}>
              <option value="en attente">En attente</option>
              <option value="payée">Payée</option>
              <option value="en retard">En retard</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Récapitulatif</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>{jours} jour{jours !== 1 ? 's' : ''} × {fmt(tjm)}/j</span>
              <span className="font-medium text-gray-800">{fmt(montantHT)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>TVA 20 %</span>
              <span>{fmt(tvaAmount)}</span>
            </div>
            <div className="flex justify-between text-blue-950 font-bold text-base border-t border-gray-100 pt-3 mt-3">
              <span>Total TTC</span>
              <span>{fmt(montantTTC)}</span>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{error}</p>
        )}

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/factures')}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button type="submit" disabled={saving}
            className="px-6 py-2 text-sm text-white bg-blue-900 rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors font-medium">
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}
