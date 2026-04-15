import { generatePdf } from '../lib/generatePdf'

const EMETTEUR_DEFAULT = {
  nom: 'Théo LAMBRET',
  adresse: '34 route de Laumont',
  ville: '19100 Brive-la-Gaillarde',
  siret: '941 296 998 00011',
  tva: 'FR 40 941 296 998',
}

const TVA_RATE = 0.20

function fmt(n) {
  return Number(n || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString('fr-FR')
}

function fmtDate(str) {
  if (!str) return '—'
  const [y, m, d] = str.split('-')
  return `${d}/${m}/${y}`
}

export default function InvoicePreviewModal({ facture, emetteur, onClose }) {
  const em = emetteur || EMETTEUR_DEFAULT
  const client = facture.clients || {}
  const montantHT = Number(facture.montant_ht || (facture.jours * facture.tjm) || 0)
  const tvaAmount = montantHT * TVA_RATE
  const ttc = montantHT + tvaAmount

  const mention1 =
    "En application de la loi N° 92-1442 du 31-12-92, cette facture est payable à réception sans escompte pour règlement anticipé."
  const mention2 = `TVA : 20 % — N° TVA intracommunautaire : ${em.tva}`
  const mention3 = `SIRET : ${em.siret} — Micro-entrepreneur dispensé d'immatriculation au RCS et au RM.`

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
    >
      {/* Barre d'outils */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0">
        <span className="font-semibold text-gray-800 text-sm">
          Prévisualisation — {facture.numero}
        </span>
        <div className="flex gap-3">
          <button
            onClick={() => generatePdf(facture, emetteur)}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#1E3A5F' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#162d4d')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1E3A5F')}
          >
            Télécharger PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Zone de défilement */}
      <div className="flex-1 overflow-auto py-8 px-4" style={{ backgroundColor: '#e5e7eb' }}>
        {/* Page A4 */}
        <div
          className="mx-auto bg-white shadow-xl"
          style={{
            width: '210mm',
            minHeight: '297mm',
            fontFamily: 'Helvetica, Arial, sans-serif',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Bandeau en-tête */}
          <div
            style={{
              backgroundColor: '#1E3A5F',
              padding: '20px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px' }}>
              <span
                style={{
                  color: '#fff',
                  fontSize: '26px',
                  fontWeight: 'bold',
                  letterSpacing: '3px',
                }}
              >
                FACTURE
              </span>
              <span style={{ color: '#fff', fontSize: '15px', fontWeight: 'normal' }}>
                N° {facture.numero}
              </span>
            </div>
            <span style={{ color: '#fff', fontSize: '13px' }}>
              Date : {fmtDate(facture.date_emission)}
            </span>
          </div>

          {/* Corps */}
          <div style={{ padding: '30px 28px 0', flex: 1 }}>
            {/* Deux colonnes ÉMETTEUR / CLIENT */}
            <div style={{ display: 'flex', gap: '32px', marginBottom: '28px' }}>
              {/* ÉMETTEUR */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: '#1E3A5F',
                    fontWeight: 'bold',
                    fontSize: '10px',
                    letterSpacing: '1px',
                    paddingBottom: '4px',
                    borderBottom: '1.5px solid #1E3A5F',
                    display: 'inline-block',
                    marginBottom: '8px',
                  }}
                >
                  ÉMETTEUR
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e1e1e', marginBottom: '4px' }}>
                  {em.nom}
                </div>
                <div style={{ fontSize: '11px', color: '#646464', lineHeight: '1.7' }}>
                  {em.adresse}<br />
                  {em.ville}<br />
                  SIRET : {em.siret}<br />
                  N° TVA : {em.tva}
                </div>
              </div>

              {/* CLIENT */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: '#1E3A5F',
                    fontWeight: 'bold',
                    fontSize: '10px',
                    letterSpacing: '1px',
                    paddingBottom: '4px',
                    borderBottom: '1.5px solid #1E3A5F',
                    display: 'inline-block',
                    marginBottom: '8px',
                  }}
                >
                  CLIENT
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e1e1e', marginBottom: '4px' }}>
                  {client.nom || '—'}
                </div>
                <div style={{ fontSize: '11px', color: '#646464', lineHeight: '1.7' }}>
                  {client.adresse && <>{client.adresse}<br /></>}
                  {client.siret && <>SIRET : {client.siret}<br /></>}
                  {client.tva && <>N° TVA : {client.tva}</>}
                </div>
              </div>
            </div>

            {/* Ligne séparatrice */}
            <div style={{ borderTop: '1px solid #e8eaed', marginBottom: '22px' }} />

            {/* Tableau des prestations */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px',
                marginBottom: '24px',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#1E3A5F' }}>
                  <th
                    style={{
                      padding: '10px 12px',
                      color: '#fff',
                      fontWeight: '600',
                      textAlign: 'left',
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      padding: '10px 12px',
                      color: '#fff',
                      fontWeight: '600',
                      textAlign: 'center',
                      width: '80px',
                    }}
                  >
                    Jours
                  </th>
                  <th
                    style={{
                      padding: '10px 12px',
                      color: '#fff',
                      fontWeight: '600',
                      textAlign: 'center',
                      width: '110px',
                    }}
                  >
                    TJM
                  </th>
                  <th
                    style={{
                      padding: '10px 12px',
                      color: '#fff',
                      fontWeight: '600',
                      textAlign: 'right',
                      width: '130px',
                    }}
                  >
                    Montant HT
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: '#f5f6f8' }}>
                  <td style={{ padding: '11px 12px', color: '#1e1e1e' }}>
                    {facture.description || '—'}
                  </td>
                  <td style={{ padding: '11px 12px', color: '#1e1e1e', textAlign: 'center' }}>
                    {fmtNum(facture.jours ?? 0)}
                  </td>
                  <td style={{ padding: '11px 12px', color: '#1e1e1e', textAlign: 'center' }}>
                    {fmtNum(facture.tjm ?? 0)} €/j
                  </td>
                  <td style={{ padding: '11px 12px', color: '#1e1e1e', textAlign: 'right' }}>
                    {fmt(montantHT)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Récapitulatif (aligné à droite) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '48px' }}>
              <div style={{ width: '250px', fontSize: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    color: '#646464',
                  }}
                >
                  <span>Montant HT</span>
                  <span>{fmt(montantHT)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    color: '#646464',
                    borderBottom: '1px solid #1E3A5F',
                    marginBottom: '4px',
                  }}
                >
                  <span>TVA 20 %</span>
                  <span>{fmt(tvaAmount)}</span>
                </div>
                <div
                  style={{
                    backgroundColor: '#1E3A5F',
                    color: '#fff',
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    fontSize: '13px',
                  }}
                >
                  <span>TOTAL TTC</span>
                  <span>{fmt(ttc)}</span>
                </div>
              </div>
            </div>

            {/* Mentions légales */}
            <div style={{ borderTop: '1px solid #e8eaed', paddingTop: '12px' }}>
              <p style={{ fontSize: '8.5px', color: '#888', lineHeight: '1.6', margin: '0 0 3px' }}>
                {mention1}
              </p>
              <p style={{ fontSize: '8.5px', color: '#888', margin: '0 0 3px' }}>{mention2}</p>
              <p style={{ fontSize: '8.5px', color: '#888', margin: '0' }}>{mention3}</p>
            </div>
          </div>

          {/* Pied de page bleu marine */}
          <div
            style={{
              backgroundColor: '#1E3A5F',
              padding: '11px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '24px',
            }}
          >
            <span style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>
              {em.nom}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>
              SIRET : {em.siret}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
