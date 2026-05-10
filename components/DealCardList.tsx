'use client'

import { useState } from 'react'
import type { ComponentProps } from 'react'
import DealCard from '@/components/DealCard'

type Deal = ComponentProps<typeof DealCard>['deal']

interface DealCardListProps {
  ourDeal?: Deal | null
  selectedDeals: Deal[]
  previewDealId?: string
  redeemDealId?: string
}

export default function DealCardList({
  ourDeal,
  selectedDeals,
  previewDealId,
  redeemDealId,
}: DealCardListProps) {




  return (
    <>
      {ourDeal && (
  <DealCard
    deal={ourDeal}
    mode="ourDeal"
    isExpandedFromUrl={redeemDealId === ourDeal.id}
  />
)}

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
isPreviewOpen={previewDealId === deal.id}
isExpandedFromUrl={redeemDealId === deal.id}

/>
            ))}
          </div>
        </>
      )}
    </>
  )
}
