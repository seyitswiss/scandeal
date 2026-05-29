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
    borderRadius: '18px',
    background: '#121214',
   border:
  deal.isPremium
    ? '1px solid rgba(134, 239, 172, 0.10)'
    : '1px solid rgba(255, 255, 255, 0.015)',
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
          gap: '0.45rem',
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
            borderRadius: '18px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 4px 12px rgba(61, 60, 60, 0.18)',

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
              top: 0,
              right: 0,
              width: '40px',
              height: '100%',
              background:
                'linear-gradient(to left, rgba(0,0,0,0.35), rgba(0,0,0,0))',
              pointerEvents: 'none',
            }}
          />
        </div>

        <div
          style={{
            
            minWidth: 0,
            padding: '0.65rem 0.75rem 0.65rem 0',
          gap: '0.8rem',
            overflow: 'hidden',
          }}
        >
                    <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: 0,
            }}
          >
            {deal.business?.logoUrl && (
              <img
                src={deal.business.logoUrl}
                alt={deal.business.name || 'Logo'}
                style={{
  width: '36px',
  height: '36px',
  objectFit: 'contain',
  borderRadius: '6px',
  background: '#fff',
  padding: '1px',
  flexShrink: 0,
}}
              />
            )}

            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '0.86rem',
                color: '#ffffff',
                fontWeight: 500,
                minWidth: 0,
              }}
            >
              {deal.business?.name}
            </span>
          </div>
          <div
  style={{
    minWidth: 0,
    paddingTop: '0px',
    paddingBottom: '4px',
  }}
>
            <h4
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'pre-line',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                fontSize: '1.35rem',
                fontWeight: 800,
                lineHeight: 1.15,
                color: '#fff',
                margin: '0.7rem 0',
              }}
            >
              {deal.title}
            </h4>
          </div>

          
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


    </article>
  </Link>
  )
}