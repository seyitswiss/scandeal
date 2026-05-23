'use client'

type DealPassDownloadButtonProps = {
  deal: {
    id: string
    title: string
    highlight?: string | null
    description: string | null
    endDate?: Date | string | null
    redeemableWhen?: string | null
redeemableFor?: string | null
requirements?: string | null
combinability?: string | null
conditionDetails?: string | null
    business?: {
      name: string
      logoUrl?: string | null
    } | null
  }
}

function formatDate(value: Date | string | null) {
  if (!value) return 'Nach Angabe'
  return new Date(value).toLocaleDateString('de-CH')
}

function makeCode(dealId: string) {
  return `SCAN-${dealId.slice(0, 4).toUpperCase()}`
}

export default function DealPassDownloadButton({ deal }: DealPassDownloadButtonProps) {
  function downloadDealPass() {
    const canvas = document.createElement('canvas')
    canvas.width = 900
    canvas.height = 1300

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#16a34a'
    ctx.fillRect(0, 0, canvas.width, 18)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 42px Arial'
    ctx.fillText(deal.business?.name || 'Scandeal Partner', 60, 90)

    ctx.fillStyle = '#22c55e'
    ctx.font = 'bold 28px Arial'
    ctx.fillText('OUR DEAL', 60, 145)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 56px Arial'
    ctx.fillText(deal.title, 60, 240)

    ctx.fillStyle = '#d1d5db'
    ctx.font = '34px Arial'
    ctx.fillText(deal.highlight || '', 60, 300)

    ctx.fillStyle = '#ffffff'
    ctx.font = '28px Arial'

    const description = deal.description || ''
    const shortDescription = description.slice(0, 180)
    ctx.fillText(shortDescription, 60, 390)

    ctx.fillStyle = '#111827'
    ctx.fillRect(60, 470, 780, 150)

    ctx.fillStyle = '#22c55e'
    ctx.font = 'bold 34px Arial'
    ctx.fillText('CODE', 100, 525)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 52px Arial'
    ctx.fillText(makeCode(deal.id), 100, 590)

    const rows = [
      ['Gültig bis', formatDate(deal.endDate ?? null)],
      ['Einlösbar', deal.redeemableWhen || '-'],
      ['Einlösbar für', deal.redeemableFor || '-'],
      ['Voraussetzung', deal.requirements || '-'],
      ['Kombinierbarkeit', deal.combinability || '-'],
      ['Zusätzlich', deal.conditionDetails || '-'],
    ]

    let y = 700
    ctx.font = '26px Arial'

    rows.forEach(([label, value]) => {
      ctx.fillStyle = '#9ca3af'
      ctx.fillText(label, 60, y)

      ctx.fillStyle = '#ffffff'
      ctx.fillText(value, 330, y)

      y += 58
    })

    ctx.fillStyle = '#22c55e'
    ctx.font = 'bold 34px Arial'
    ctx.fillText('SCANDEAL', 60, 1210)

    ctx.fillStyle = '#9ca3af'
    ctx.font = '24px Arial'
    ctx.fillText('Deal speichern und beim Besuch vorzeigen.', 60, 1250)

    const link = document.createElement('a')
    link.download = `${deal.title}-scandeal.jpg`
    link.href = canvas.toDataURL('image/jpeg', 0.92)
    link.click()
  }

  return (
    <button
      type="button"
      onClick={(event) => {
  event.preventDefault()
  event.stopPropagation()
  downloadDealPass()
}}
      className="mt-3 w-full rounded-xl bg-green-500 px-4 py-3 font-semibold text-black"
    >
      Dealpass als Bild speichern
    </button>
  )
}