'use client'

import { useState } from 'react'
import type { ComponentProps } from 'react'
import DealCard from '@/components/DealCard'

type Deal = ComponentProps<typeof DealCard>['deal']

interface DealCardListProps {
  ourDeal?: Deal | null
  selectedDeals: Deal[]
  previewDealId?: string
}

export default function DealCardList({ ourDeal, selectedDeals, previewDealId }: DealCardListProps) {
  const [activePreviewDealId, setActivePreviewDealId] = useState<string | null>(null)

  const handlePreviewToggle = (dealId: string, open: boolean) => {
    setActivePreviewDealId(open ? dealId : null)
  }

  return (
    <>
      {ourDeal && <DealCard deal={ourDeal} mode="ourDeal" />}

      {selectedDeals.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', textAlign: 'center', color: '#f8fafc' }}>
            Deals für Dich
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {selectedDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
isPreviewOpen={previewDealId === deal.id || activePreviewDealId === deal.id}
onPreviewToggle={handlePreviewToggle}
/>
            ))}
          </div>
        </>
      )}
    </>
  )
}
