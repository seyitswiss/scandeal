'use client'

import type { ComponentProps } from 'react'
import DealCard from '@/components/DealCard'

type Deal = ComponentProps<typeof DealCard>['deal']

interface DealCardListProps {
  selectedDeals: Deal[]
}

export default function DealCardList({

  selectedDeals,

}: DealCardListProps) {


  return (
    <div id="deals-section" style={{ scrollMarginTop: '72px' }}>

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
            Entdecken
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
/>
            ))}
          </div>
        </>
      )}
    </div>
  )
}