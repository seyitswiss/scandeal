'use client'

import type { ComponentProps } from 'react'
import DealCard from '@/components/DealCard'

type Deal = ComponentProps<typeof DealCard>['deal']

interface DealCardListProps {
  ourDeal?: Deal | null
  selectedDeals: Deal[]
  previewDealId?: string
  redeemDealId?: string
  detailsDealId?: string
  shownDealIds?: string[]
}

export default function DealCardList({
  ourDeal,
  selectedDeals,
  previewDealId,
  redeemDealId,
  detailsDealId,
  shownDealIds,
}: DealCardListProps) {
  const currentShownDealIds =
    shownDealIds && shownDealIds.length > 0
      ? shownDealIds
      : selectedDeals.map((deal) => deal.id)

  return (
    <div id="deals-section" style={{ scrollMarginTop: '72px' }}>
      {ourDeal && (
  <div id="our-deal" style={{ scrollMarginTop: '120px' }}>
    <DealCard
          deal={ourDeal}
          mode="ourDeal"
          isExpandedFromUrl={redeemDealId === ourDeal.id}
          showDetailsFromUrl={detailsDealId === ourDeal.id}
        shownDealIds={currentShownDealIds}
/>
  </div>
)}

      {selectedDeals.length > 0 && (
        <>
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              textAlign: 'center',
              color: '#f8fafc',
            }}
          >
            Deals für Dich
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {selectedDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                isPreviewOpen={previewDealId === deal.id}
                isExpandedFromUrl={redeemDealId === deal.id}
                showDetailsFromUrl={detailsDealId === deal.id}
                shownDealIds={currentShownDealIds}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}