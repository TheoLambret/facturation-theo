import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const EMPTY = { nom: '', adresse: '', ville: '', siret: '', tva: '' }

export default function Settings() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) setForm({ nom: data.nom || '', adresse: data.adresse || '', ville: data.ville || '', siret: data.siret || '', tva: data.tva || '' })
      setLoading(false)
    })
  }, [])

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nom.trim()) { setError('Le nom est requis.'); return }
    setSaving(true)
    setError('')
    setSuccess(false)

    const { error: err } = await supabase.from('settings').upsert({
      id: 1,
      nom: form.nom.trim(),
      adresse: form.adresse.trim() || null,
      ville: form.ville.trim() || null,
      siret: form.siret.trim() || null,
      tva: form.tva.trim() || null,
    })

    if (err) { setError(err.message); setSaving(false); return }
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700'
  const labelCls = 'block text-xs font-medium text-gray-500 mb-1'

  if (loading) return <div className="text-sm text-gray-400 p-8">Chargement...</div>

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Paramètres</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Informations émetteur</p>

          <div>
            <label className={labelCls}>Nom / raison sociale *</label>
            <input type="text" placeholder="Théo LAMBRET" value={form.nom}
              onChange={handleChange('nom')} className={inputCls} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Adresse</label>
              <input type="text" placeholder="34 route de Laumont" value={form.adresse}
                onChange={handleChange('adresse')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Ville / code postal</label>
              <input type="text" placeholder="63800 Cournon d'Auvergne" value={form.ville}
                onChange={handleChange('ville')} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>SIRET</label>
              <input type="text" placeholder="941 296 998 00011" value={form.siret}
                onChange={handleChange('siret')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>N° TVA intracommunautaire</label>
              <input type="text" placeholder="FR 40 941 296 998" value={form.tva}
                onChange={handleChange('tva')} className={inputCls} />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{error}</p>}
        {success && <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-4 py-2">Paramètres enregistrés.</p>}

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="px-6 py-2 text-sm text-white bg-blue-900 rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors font-medium">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}
