import jsPDF from 'jspdf'

const EMETTEUR_DEFAULT = {
  nom: 'Théo LAMBRET',
  adresse: '34 route de Laumont',
  ville: '63800 Cournon d\'Auvergne',
  siret: '941 296 998 00011',
  tva: 'FR 40 941 296 998',
}

const TVA_RATE = 0.20

const NAVY = [15, 40, 80]
const GRAY = [100, 100, 100]
const LIGHT_GRAY = [240, 242, 245]
const BLACK = [30, 30, 30]

// Remplace les espaces insécables (U+202F, U+00A0) par des espaces normaux
// pour éviter l'affichage "3/000,00 €" dans jsPDF
function fmt(n) {
  return Number(n || 0)
    .toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
    .replace(/[\u202f\u00a0]/g, ' ')
}

function fmtNum(n) {
  return Number(n || 0)
    .toLocaleString('fr-FR')
    .replace(/[\u202f\u00a0]/g, ' ')
}

function fmtDate(str) {
  if (!str) return '—'
  const [y, m, d] = str.split('-')
  return `${d}/${m}/${y}`
}

export function generatePdf(facture, emetteur) {
  const EMETTEUR = emetteur || EMETTEUR_DEFAULT
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const W = 210
  const H = 297
  const ml = 20   // margin left
  const mr = 20   // margin right
  const cw = W - ml - mr  // content width

  // ── HEADER BAR ────────────────────────────────────────────────
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, W, 18, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURE', ml, 12)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`N° ${facture.numero}`, ml + 28, 12)

  doc.setFontSize(10)
  doc.text(`Date : ${fmtDate(facture.date_emission)}`, W - mr, 12, { align: 'right' })

  // ── EMETTEUR (gauche) ─────────────────────────────────────────
  let y = 30

  doc.setTextColor(...NAVY)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('ÉMETTEUR', ml, y)

  doc.setDrawColor(...NAVY)
  doc.line(ml, y + 1.5, ml + 38, y + 1.5)

  y += 7
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...BLACK)
  doc.text(EMETTEUR.nom, ml, y)

  y += 5.5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text(EMETTEUR.adresse, ml, y)
  y += 5
  doc.text(EMETTEUR.ville, ml, y)
  y += 5
  doc.text(`SIRET : ${EMETTEUR.siret}`, ml, y)
  y += 5
  doc.text(`N° TVA : ${EMETTEUR.tva}`, ml, y)

  // ── CLIENT (droite) ──────────────────────────────────────────
  const cx = W / 2 + 5
  let cy = 30

  doc.setTextColor(...NAVY)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('CLIENT', cx, cy)
  doc.setDrawColor(...NAVY)
  doc.line(cx, cy + 1.5, cx + 28, cy + 1.5)

  cy += 7
  const client = facture.clients || {}

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...BLACK)
  doc.text(client.nom || '—', cx, cy)

  cy += 5.5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)

  if (client.adresse) { doc.text(client.adresse, cx, cy); cy += 5 }
  if (client.siret)   { doc.text(`SIRET : ${client.siret}`, cx, cy); cy += 5 }
  if (client.tva)     { doc.text(`N° TVA : ${client.tva}`, cx, cy); cy += 5 }

  // ── SÉPARATEUR ───────────────────────────────────────────────
  y = 78
  doc.setDrawColor(...LIGHT_GRAY)
  doc.setLineWidth(0.5)
  doc.line(ml, y, W - mr, y)

  // ── TABLEAU PRESTATIONS ───────────────────────────────────────
  y = 85

  // En-tête tableau
  doc.setFillColor(...LIGHT_GRAY)
  doc.rect(ml, y - 5, cw, 8, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...NAVY)
  doc.text('Description', ml + 2, y)
  doc.text('Jours', ml + 100, y, { align: 'center' })
  doc.text('TJM', ml + 127, y, { align: 'center' })
  doc.text('Montant HT', W - mr - 2, y, { align: 'right' })

  // Ligne de données
  y += 10
  const montantHT = Number(facture.montant_ht || 0)
  const tvaAmount = montantHT * TVA_RATE
  const ttc = montantHT + tvaAmount

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...BLACK)
  doc.text(facture.description || '—', ml + 2, y)
  doc.text(fmtNum(facture.jours ?? 0), ml + 100, y, { align: 'center' })
  doc.text(`${fmtNum(facture.tjm ?? 0)} €/j`, ml + 127, y, { align: 'center' })
  doc.text(fmt(montantHT), W - mr - 2, y, { align: 'right' })

  // Ligne séparatrice sous la ligne
  y += 4
  doc.setDrawColor(...LIGHT_GRAY)
  doc.line(ml, y, W - mr, y)

  // ── TOTAUX ───────────────────────────────────────────────────
  y += 10
  const totalsX = W - mr - 70

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text('Montant HT', totalsX, y)
  doc.text(fmt(montantHT), W - mr - 2, y, { align: 'right' })

  y += 7
  doc.text('TVA 20 %', totalsX, y)
  doc.text(fmt(tvaAmount), W - mr - 2, y, { align: 'right' })

  // Ligne avant TTC
  y += 3
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.3)
  doc.line(totalsX, y, W - mr, y)

  y += 6
  doc.setFillColor(...NAVY)
  doc.rect(totalsX - 3, y - 5, W - mr - totalsX + 5, 9, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL TTC', totalsX, y)
  doc.text(fmt(ttc), W - mr - 2, y, { align: 'right' })

  // ── MENTIONS LÉGALES ─────────────────────────────────────────
  const mentionY = H - 30
  doc.setDrawColor(...LIGHT_GRAY)
  doc.setLineWidth(0.3)
  doc.line(ml, mentionY - 4, W - mr, mentionY - 4)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)

  const mention1 =
    'En application de la loi N° 92-1442 du 31-12-92, cette facture est payable à réception sans escompte pour règlement anticipé.'
  const mention2 = `TVA : 20 % — N° TVA intracommunautaire : ${EMETTEUR.tva}`
  const mention3 = `SIRET : ${EMETTEUR.siret} — Micro-entrepreneur dispensé d'immatriculation au RCS et au RM.`

  const lines1 = doc.splitTextToSize(mention1, cw)
  doc.text(lines1, ml, mentionY)
  doc.text(mention2, ml, mentionY + lines1.length * 4 + 1)
  doc.text(mention3, ml, mentionY + lines1.length * 4 + 5)

  // ── SAUVEGARDE ───────────────────────────────────────────────
  doc.save(`${facture.numero}.pdf`)
}
