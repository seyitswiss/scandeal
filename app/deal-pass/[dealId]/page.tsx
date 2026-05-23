import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ dealId: string }>
}

function formatDate(value: Date | string | null) {
  if (!value) return 'Nach Angabe'
  return new Date(value).toLocaleDateString('de-CH')
}

export default async function DealPassPage({ params }: Props) {
  const { dealId } = await params

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { business: true },
  })

  if (!deal) notFound()

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-[520px]">
        <div className="rounded-3xl border border-[#222] bg-[#0b0b0b] p-5">
          {/* TOP */}
          <div className="flex items-center justify-center gap-3">
            <img
              src="/icons/scandeal.logo.svg"
              alt="Scandeal"
              style={{ width: '70px', height: 'auto' }}
            />

            <div className="h-6 w-[2px] rounded-full bg-green-500" />

            <p className="text-xs tracking-[0.3em] text-green-400">
              DEALPASS
            </p>
          </div>

          {/* BUSINESS */}
          <div className="mt-5 flex items-center gap-4">
            <img
              src={deal.business.logoUrl || '/icons/default.svg'}
              alt={deal.business.name}
              className="h-20 w-20 rounded-2xl bg-white object-contain p-2"
            />

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-bold">
                {deal.business.name}
              </h1>

              <p className="mt-1 text-sm text-gray-400">
                {deal.business.address || 'Adresse folgt'}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                scandeal.ch/profile/{deal.business.slug}
              </p>
            </div>
          </div>

          {/* DEAL */}
          <div className="mt-5 border-t border-[#222] pt-5">
            <div className="inline-flex rounded-full bg-green-500 px-4 py-1 text-sm font-semibold text-black">
              OUR DEAL
            </div>

            <h2 className="mt-4 text-2xl font-bold">
              {deal.title}
            </h2>

            {deal.highlight && (
              <p className="mt-2 text-base text-green-400">
                {deal.highlight}
              </p>
            )}
          </div>

          {/* BEDINGUNGEN */}
          <div className="mt-5 border-t border-[#222] pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-green-400">
              Bedingungen
            </h3>

            <div className="mt-3 space-y-3 text-sm">
              {[
                ['Einlösbar', deal.redeemableWhen || '-'],
                ['Einlösbar für', deal.redeemableFor || '-'],
                ['Voraussetzung', deal.requirements || '-'],
                ['Kombinierbarkeit', deal.combinability || '-'],
                ['Zusätzlich', deal.conditionDetails || '-'],
                [
                  'Zeitraum',
                  `${formatDate(deal.startDate)} - ${formatDate(deal.endDate)}`,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '145px 1fr',
                    columnGap: '12px',
                    alignItems: 'start',
                  }}
                >
                  <span className="text-gray-500">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CODE */}
          <div className="mt-5 rounded-2xl border border-green-500 bg-black px-4 py-2 text-center">
            <p className="text-xs tracking-[0.3em] text-green-400">
              DEAL CODE
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              SCAN-{deal.id.slice(0, 4).toUpperCase()}
            </h3>

            <p className="mt-2 text-sm text-gray-400">
              Beim Besuch vorzeigen
            </p>
          </div>
        </div>

        {/* ABSCHNITT 2 */}
        <div className="mt-5 rounded-3xl border border-[#222] bg-[#0b0b0b] p-5">
          <h3 className="text-lg font-semibold text-green-400">
            Über den Deal
          </h3>

          {deal.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-300">
              {deal.description}
            </p>
          )}

          <a
            href={`/profile/${deal.business.slug}`}
            className="mt-5 block rounded-2xl border border-green-500 px-4 py-3 text-center font-semibold text-green-400"
          >
            Scandeal Business Profil besuchen
          </a>

          <div className="mt-5 border-t border-[#222] pt-5">
            <h3 className="text-lg font-semibold text-green-400">
              <p className="text-xs text-gray-500">
  * Hinweis von Scandeal
</p>
            </h3>

            <p className="mt-3 text-xs leading-5 text-gray-600">
              Alle publizierten Deals sind unverbindlich. Die Einlösung und
              Durchführung erfolgt direkt durch den jeweiligen Dealgeber.
            </p>

            <p className="mt-3 text-xs leading-5 text-gray-600">
              Scandeal übernimmt keine Garantie für die Verfügbarkeit, Annahme
              oder Durchführung eines Deals.
            </p>

           <p className="mt-3 text-xs leading-5 text-gray-600">
              Falls ein Deal nicht funktioniert oder abgelehnt wird, freuen wir
              uns über Ihre Rückmeldung.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}