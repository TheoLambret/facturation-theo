import jsPDF from 'jspdf'

const EMETTEUR_DEFAULT = {
  nom: 'Théo LAMBRET',
  adresse: '34 route de Laumont',
  ville: '19100 Brive-la-Gaillarde',
  siret: '941 296 998 00011',
  tva: 'FR 40 941 296 998',
}

const TVA_RATE = 0.20

const NAVY = [30, 58, 95]       // #1E3A5F
const GRAY = [100, 100, 100]
const LIGHT_GRAY = [245, 246, 248]
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
  const headerH = 22
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, W, headerH, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURE', ml, 14.5)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`N° ${facture.numero}`, ml + 46, 14.5)

  doc.setFontSize(10)
  doc.text(`Date : ${fmtDate(facture.date_emission)}`, W - mr, 14.5, { align: 'right' })

  // ── EMETTEUR (gauche) ─────────────────────────────────────────
  let y = 32

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
  let cy = 32

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
  y = 80
  doc.setDrawColor(232, 234, 237)
  doc.setLineWidth(0.4)
  doc.line(ml, y, W - mr, y)

  // ── TABLEAU PRESTATIONS ───────────────────────────────────────
  y = 88

  // En-tête tableau — bleu marine
  doc.setFillColor(...NAVY)
  doc.rect(ml, y - 5.5, cw, 9, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text('Description', ml + 3, y)
  doc.text('Jours', ml + 100, y, { align: 'center' })
  doc.text('TJM', ml + 130, y, { align: 'center' })
  doc.text('Montant HT', W - mr - 2, y, { align: 'right' })

  // Ligne de données — gris très clair
  y += 10
  const montantHT = Number(facture.montant_ht || 0)
  const tvaAmount = montantHT * TVA_RATE
  const ttc = montantHT + tvaAmount

  doc.setFillColor(...LIGHT_GRAY)
  doc.rect(ml, y - 5.5, cw, 9, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...BLACK)
  doc.text(facture.description || '—', ml + 3, y)
  doc.text(fmtNum(facture.jours ?? 0), ml + 100, y, { align: 'center' })
  doc.text(`${fmtNum(facture.tjm ?? 0)} €/j`, ml + 130, y, { align: 'center' })
  doc.text(fmt(montantHT), W - mr - 2, y, { align: 'right' })

  // ── TOTAUX (bas droite) ───────────────────────────────────────
  y += 14
  const totalsX = W - mr - 72

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
  doc.rect(totalsX - 3, y - 5.5, W - mr - totalsX + 5, 10, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL TTC', totalsX, y)
  doc.text(fmt(ttc), W - mr - 2, y, { align: 'right' })

  // ── MENTIONS LÉGALES (bas gauche) ─────────────────────────────
  const mentionY = H - 28
  doc.setDrawColor(232, 234, 237)
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

  // ── PIED DE PAGE ─────────────────────────────────────────────
  doc.setFillColor(...NAVY)
  doc.rect(0, H - 12, W, 12, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text(EMETTEUR.nom, ml, H - 5)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(255, 255, 255, 0.6)
  doc.text(`SIRET : ${EMETTEUR.siret}`, W - mr, H - 5, { align: 'right' })

  // ── SAUVEGARDE ───────────────────────────────────────────────
  doc.save(`${facture.numero}.pdf`)
}
