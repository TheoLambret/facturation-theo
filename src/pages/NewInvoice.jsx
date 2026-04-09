import { useState } from 'react'

export default function NewInvoice() {
  const [lines, setLines] = useState([{ description: '', qty: 1, price: '' }])

  const addLine = () => setLines([...lines, { description: '', qty: 1, price: '' }])

  const removeLine = (i) => setLines(lines.filter((_, idx) => idx !== i))

  const updateLine = (i, field, value) => {
    const updated = [...lines]
    updated[i] = { ...updated[i], [field]: value }
    setLines(updated)
  }

  const total = lines.reduce((sum, l) => sum + (parseFloat(l.price) || 0) * (parseInt(l.qty) || 0), 0)

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Nouvelle facture</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* En-tête */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Client</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Sélectionner un client</option>
              <option>Acme Corp</option>
              <option>Beta SAS</option>
              <option>Gamma Ltd</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date d'émission</label>
            <input
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date d'échéance</label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">N° facture</label>
            <input
              type="text"
              placeholder="FAC-004"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Lignes */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Prestations</p>
          <div className="space-y-2">
            {lines.map((line, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Description"
                  value={line.description}
                  onChange={(e) => updateLine(i, 'description', e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  min="1"
                  value={line.qty}
                  onChange={(e) => updateLine(i, 'qty', e.target.value)}
                  className="w-16 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                />
                <input
                  type="number"
                  placeholder="Prix €"
                  value={line.price}
                  onChange={(e) => updateLine(i, 'price', e.target.value)}
                  className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => removeLine(i)}
                  disabled={lines.length === 1}
                  className="text-gray-300 hover:text-red-400 disabled:opacity-0 transition-colors text-lg leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addLine}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            + Ajouter une ligne
          </button>
        </div>

        {/* Total */}
        <div className="flex justify-end border-t border-gray-100 pt-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total HT</p>
            <p className="text-2xl font-bold text-gray-800">{total.toFixed(2)} €</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
            Créer la facture
          </button>
        </div>
      </div>
    </div>
  )
}
