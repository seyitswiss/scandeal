'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface DealCardProps {
  deal: {
    id: string
    title: string
    description: string | null
    discountText: string | null
    isPremium: boolean
    businessId: string
    business?: {
  name: string
  slug: string
  logoUrl?: string | null
googleOpeningText?: string | null
googleOpeningNow?: boolean | null
} | null
    validUntil?: string | Date | null
    endDate?: string | Date | null
    distance?: number | null
    distanceKm?: number | null
    previewText?: string | null
    fullDescription?: string | null
    badge?: string | null
    discount?: string | null
    type?: string | null
    highlight?: string | null
    logo?: string | null
    image?: string | null
    video?: string | null
    mp4?: string | null
    category?: string | null
    subCategory?: string | null

    redeemableWhen?: string | null
    redeemableFor?: string | null
    requirements?: string | null
    combinability?: string | null
    conditionDetails?: string | null
  }


}

function formatDate(date: string | Date | null | undefined) {
  if (!date) return null

  try {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  } catch {
    return null
  }
}


function getUiCategoryLabel(category: string | null | undefined) {
  const labels: Record<string, string> = {
    Shopping: '🛍️ Shopping',
    Gastronomie: '🍴 Food & Drinks',
    'Beauty & Gesundheit': '💚 Care',
    'Haus & Handwerk': '🏠 Home',
    'Bau & Immobilien': '🏢 Immobilien',
    'Auto & Mobilität': '🚗 Mobilität',
    Dienstleistungen: '💼 Services',
    'Sofortbedarf & Unterwegs': '⚡ Unterwegs',
    'Freizeit & Unterhaltung': '🎉 Freizeit',
    'Reisen & Hotels': '✈️ Travel',
    'Bildung & Community': '👥 Community',
    'Haustiere & Tiere': '🐾🤎 Pets',
  }

  return labels[category || ''] || category || 'Deal'
}
function trackDeal(data: {
  dealId: string
  businessId: string
  type: string
}) {
  try {
    const body = JSON.stringify(data)

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/deal-stats', body)
      return
    }

    fetch('/api/deal-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  } catch {}
}

export default function DealCard({ deal }: DealCardProps) {
  
  

  const businessSlug = deal.business?.slug




  const fullDescription = deal.fullDescription ?? deal.description
  const endDateValue = deal.validUntil ?? deal.endDate
  const distanceValue = deal.distanceKm ?? deal.distance
  const formattedEndDate = formatDate(endDateValue)
  const uiCategoryLabel = getUiCategoryLabel(deal.category)

  let imageSrc = deal.image || '/deals/scandeal.png'

  if (deal.isPremium && deal.subCategory === 'Restaurant') {
    imageSrc = '/videos/deal1.mp4'
  } else if (!deal.image) {
    if (deal.subCategory === 'Restaurant') imageSrc = '/deals/restaurant.png'
    if (deal.subCategory === 'Cleaning') imageSrc = '/deals/cleaning.png'
    if (deal.subCategory === 'Cafe') imageSrc = '/deals/cafe.png'
  }

  const profileHref = businessSlug ? `/profile/${businessSlug}` : '#'



  useEffect(() => {
    trackDeal({
      dealId: deal.id,
      businessId: deal.businessId,
      type: 'view',
    })


  }, [deal.id, deal.businessId])





  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '640px',
    margin: '0 auto',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    color: 'inherit',
    borderRadius: '12px',
    background: '#121214',
   border:
  deal.isPremium
    ? '1px solid rgba(134, 239, 172, 0.10)'
    : '1px solid rgba(255, 255, 255, 0.03)',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.02)',
    padding: 0,
    height: '160px',
  }

  return (
<Link
  href={profileHref}
  onClick={() =>
    trackDeal({
      dealId: deal.id,
      businessId: deal.businessId,
      type: 'promo_click',
    })
  }
  style={{
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  }}
>
<article id={`deal-${deal.id}`} style={cardStyle}>      
  <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 2,
        }}
      >


        
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'stretch',
          height: '100%',
        
        }}
      >
        <div
          style={{
            width: '180px',
            height: '100%',
            flexShrink: 0,
            alignSelf: 'stretch',
            background: '#111',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',

          }}
        >
          {deal.isPremium && imageSrc.endsWith('.mp4') ? (
            <video
              src={imageSrc}
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: '100%',
                height: '100%',
                                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
              }}
            />
          ) : (
            <img
              src={imageSrc}
              alt={deal.title ?? 'Deal image'}
              style={{
                width: '100%',
                height: '100%',
                                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
              }}
              onError={(event) => {
                const target = event.target as HTMLImageElement
                target.src = '/deals/scandeal.png'
              }}
                        />
                        
          )}

          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: '-0.75rem',
               padding: '0.15rem 0 0.7rem',
              zIndex: 3,
              display: 'flex',
              justifyContent: 'center',
              background:
                'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.72) 38%, rgba(0,0,0,0.22) 72%, rgba(0,0,0,0) 100%)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
            }}
          >
            <span
              style={{
                fontSize: '0.68rem',
                color: '#ffffff',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '999px',
                padding: '0.22rem 0.55rem',
                whiteSpace: 'nowrap',
                                width: '116px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            >
              {uiCategoryLabel}
            </span>
          </div>
        </div>

        <div
          style={{
            
            minWidth: 0,
            padding: '0.75rem 0.75rem 3.2rem 0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '0.5rem',
            overflow: 'hidden',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h4
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'pre-line',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
fontSize: '1.14rem',
                fontWeight: 700,
                lineHeight: 1.2,
                color: '#fff',
                margin: 0,
              }}
            >
              {deal.title}
            </h4>
          </div>

          {deal.highlight && (
  <div
    style={{
      color: '#d1d5db',
      fontSize: '0.72rem',
      fontWeight: 400,
      opacity: 0.82,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      marginTop: '2px',
    }}
  >
    {deal.highlight}
  </div>
)}
          {true && (
            <div
              style={{
                fontSize: '0.72rem',
                color: '#8f9bb3',
                display: 'flex',
alignItems: 'center',
gap: '10px',
flexWrap: 'wrap',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                marginTop: '4px',
              }}
            >
              {distanceValue !== null && distanceValue !== undefined && (
                <>
                  <span>
                    <span style={{ color: '#86efac', opacity: 0.75 }}>📍</span>{' '}
                    {distanceValue.toFixed(1)} km
                  </span>
                
                </>
              )}

              
              {deal.business?.googleOpeningText && (
  <div
    style={{
      fontSize: '0.72rem',
      color: deal.business.googleOpeningNow ? '#86efac' : '#60a5fa',
      
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    }}
  >
    {deal.business.googleOpeningNow ? '🟢 ' : '🕒 '}
    {deal.business.googleOpeningText
  ?.replace('Rund um die Uhr geöffnet', '24/7 offen')
  ?.replace('Rund um die Uhr', '24/7')

  ?.replace('Öffnet Donnerstag um ', 'öffnet Do ')
  ?.replace('Öffnet Freitag um ', 'öffnet Fr ')
  ?.replace('Öffnet Samstag um ', 'öffnet Sa ')
  ?.replace('Öffnet Sonntag um ', 'öffnet So ')
  ?.replace('Öffnet Montag um ', 'öffnet Mo ')
  ?.replace('Öffnet Dienstag um ', 'öffnet Di ')
  ?.replace('Öffnet Mittwoch um ', 'öffnet Mi ')

  ?.replace('Geöffnet bis ', 'offen bis ')
}
  </div>
)}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '-1.55rem',
          height: '54px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'grid',
          gridTemplateColumns: '180px minmax(0,1fr) 18px',
          alignItems: 'center',
          padding: '0 0.8rem',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <div />

        <span
          style={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.84rem',
            color: '#ffffff',
            textAlign: 'center',
            padding: '0 0.5rem',
            transform: 'translateY(-14px)',
          }}
        >
          {deal.business?.name}
        </span>

        <span
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.9rem',
            lineHeight: 1,
            transform: 'translateY(-14px)',
          }}
        >
          →
        </span>
      </div>
    </article>
  </Link>
  )
}