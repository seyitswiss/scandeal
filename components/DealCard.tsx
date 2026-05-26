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
    maxWidth: '600px',
    margin: '0 auto',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    color: 'inherit',
    borderRadius: '12px',
    background: '#121214',
    border:
      deal.isPremium
        ? '1.5px solid rgba(134, 239, 172, 0.2)'
        : '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.02)',
    padding: '0.2rem 0.25rem',
  }

  return (
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

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div
          style={{
            width: '130px',
            height: '110px',
            flexShrink: 0,
            background: '#777',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
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
                display: 'block',
              }}
              onError={(event) => {
                const target = event.target as HTMLImageElement
                target.src = '/deals/scandeal.png'
              }}
                        />
          )}

          {deal.business?.logoUrl && (
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                width: '42px',
                height: '42px',
                borderRadius: '10px',
background: '#fff',
padding: '1px',
overflow: 'hidden',
                
              }}
            >
              <img
                src={deal.business.logoUrl}
                alt={deal.business.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '10px',
                }}
              />
            </div>
          )}
        </div>

        <div
          style={{
            
            minWidth: 0,
            padding: '0.75rem 2rem 0.75rem 0',
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
                whiteSpace: 'nowrap',
                fontSize: '0.95rem',
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
                color: '#86efac',
                fontSize: '0.7rem',
                fontWeight: 400,
                opacity: 0.7,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                width: 'fit-content',
              }}
            >
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  border: '1px solid rgba(134, 239, 172, 0.2)',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6rem',
                  flexShrink: 0,
                }}
              >
                ✔
              </span>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                }}
              >
                {deal.highlight}
              </span>
            </div>
          )}

          {true && (
            <div
              style={{
                fontSize: '0.72rem',
                color: '#8f9bb3',
                display: 'flex',
flexDirection: 'column',
alignItems: 'flex-start',
gap: '2px',
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
      color: deal.business.googleOpeningNow ? '#86efac' : '#8f9bb3',
      marginTop: '2px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    }}
  >
    {deal.business.googleOpeningNow ? '🟢 ' : '🕒 '}
    {deal.business.googleOpeningText}
  </div>
)}
            </div>
          )}
        </div>
      </div>

      {true && (
        <div
          style={{
            width: '100%',
            marginTop: '0.45rem',
            paddingTop: '0.55rem',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'grid',
            gridTemplateColumns: '130px minmax(0,1fr) max-content',
            alignItems: 'center',
            fontSize: '0.72rem',
            color: '#8f9bb3',
          }}
        >
          <div
            style={{
              minWidth: 0,
              display: 'flex',
              justifyContent: 'flex-start',
              paddingLeft: '0.15rem',
            }}
          >
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#9ca3af',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '10px',
                padding: '0.28rem 0.55rem',
                width: '130px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.68rem',
              }}
            >
              {uiCategoryLabel}
            </span>
          </div>

          <div
            style={{
              minWidth: 0,
              textAlign: 'center',
              borderRight: '1px solid rgba(255,255,255,0.12)',
              padding: '0 0.5rem',
            }}
          >
            <span
              style={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '0.76rem',
                color: '#ffffff',
              }}
            >
              {deal.business?.name}
            </span>
          </div>

          <div
            style={{
              minWidth: 0,
              display: 'flex',
              justifyContent: 'flex-start',
              paddingLeft: '0.35rem',
            }}
          >
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
                color: '#86efac',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                fontWeight: 500,
                fontSize: '0.72rem',
                borderBottom: '1px dashed rgba(134,239,172,0.5)',
                paddingBottom: '2px',
              }}
            >
              Zum Business
            </Link>
          </div>
        </div>
      )}
    </article>
  )
}