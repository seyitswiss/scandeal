'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
    subCategory?: string | null
  }
  mode?: 'normal' | 'ourDeal'
  isPreviewOpen?: boolean
  onPreviewToggle?: (dealId: string, open: boolean) => void
  isExpandedFromUrl?: boolean
  showDetailsFromUrl?: boolean
  shownDealIds?: string[]
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

function getTextTeaser(text: string | null | undefined, maxLength: number) {
  if (!text) return null

  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized

  return `${normalized.slice(0, maxLength).trimEnd()}…`
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

export default function DealCard({
  deal,
  mode = 'normal',
  isPreviewOpen: isPreviewOpenProp,
  onPreviewToggle,
  isExpandedFromUrl = false,
  showDetailsFromUrl = false,
  shownDealIds,
}: DealCardProps) {
  const [isExpanded, setIsExpanded] = useState(isExpandedFromUrl)
  const [localPreviewOpen, setLocalPreviewOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showDetails, setShowDetails] = useState(showDetailsFromUrl)
  useEffect(() => {
  setShowDetails(showDetailsFromUrl)
}, [showDetailsFromUrl])

  const isOurDeal = mode === 'ourDeal'
  const businessSlug = deal.business?.slug
  const pathname = usePathname()

  const shownDealsQuery = shownDealIds && shownDealIds.length > 0
    ? `&shownDeals=${shownDealIds.join(',')}`
    : ''

  const previewOpen =
    typeof isPreviewOpenProp === 'boolean'
      ? isPreviewOpenProp
      : localPreviewOpen

  const setPreviewOpen = (open: boolean) => {
    if (typeof isPreviewOpenProp === 'boolean') {
      onPreviewToggle?.(deal.id, open)
      return
    }

    setLocalPreviewOpen(open)
  }

  const previewText = deal.previewText ?? deal.description
  const fullDescription = deal.fullDescription ?? deal.description
  const endDateValue = deal.validUntil ?? deal.endDate
  const distanceValue = deal.distanceKm ?? deal.distance
  const formattedEndDate = formatDate(endDateValue)
  const previewTeaser = getTextTeaser(previewText, 180)

  let imageSrc = deal.image || '/deals/scandeal.png'

  if (deal.isPremium && deal.subCategory === 'Restaurant') {
    imageSrc = '/videos/deal1.mp4'
  } else if (!deal.image) {
    if (deal.subCategory === 'Restaurant') imageSrc = '/deals/restaurant.png'
    if (deal.subCategory === 'Cleaning') imageSrc = '/deals/cleaning.png'
    if (deal.subCategory === 'Cafe') imageSrc = '/deals/cafe.png'
  }

  const profileHref = businessSlug ? `/profile/${businessSlug}` : '#'
 const dealHref = businessSlug
  ? `/profile/${businessSlug}?dealId=${deal.id}`
  : '#'

  useEffect(() => {
    const savedDeals = JSON.parse(localStorage.getItem('savedDeals') || '[]')
    setIsSaved(savedDeals.includes(deal.id))
  }, [deal.id])

  useEffect(() => {
    trackDeal({
      dealId: deal.id,
      businessId: deal.businessId,
      type: 'view',
    })

    if (isOurDeal) {
      trackDeal({
        dealId: deal.id,
        businessId: deal.businessId,
        type: 'our_deal_view',
      })
    }
  }, [deal.id, deal.businessId, isOurDeal])

  const openPreview = () => {
    trackDeal({
      dealId: deal.id,
      businessId: deal.businessId,
      type: 'preview_open',
    })

    setPreviewOpen(true)
  }

  const closePreview = () => {
    setPreviewOpen(false)
  }

  const toggleBookmark = () => {
    const savedDeals = JSON.parse(localStorage.getItem('savedDeals') || '[]')

    if (isSaved) {
      const updated = savedDeals.filter((id: string) => id !== deal.id)
      localStorage.setItem('savedDeals', JSON.stringify(updated))
      setIsSaved(false)
      return
    }

    if (!savedDeals.includes(deal.id)) {
      savedDeals.push(deal.id)
      localStorage.setItem('savedDeals', JSON.stringify(savedDeals))
    }

    setIsSaved(true)
  }

  const redeemDeal = () => {
    if (isExpanded) return

    const redeemedKey = `redeemed_${deal.id}`

    if (localStorage.getItem(redeemedKey)) {
      setIsExpanded(true)
      return
    }

    trackDeal({
      dealId: deal.id,
      businessId: deal.businessId,
      type: 'redeem',
    })

    localStorage.setItem(redeemedKey, 'true')
    setIsExpanded(true)
  }

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: previewOpen ? '650px' : '600px',
    margin: '0 auto',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    color: 'inherit',
    borderRadius: '12px',
    background: '#121214',
    border:
      isOurDeal || deal.isPremium
        ? '1.5px solid rgba(134, 239, 172, 0.2)'
        : '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.02)',
    padding: '0.2rem 0.25rem',
  }

  return (
    <article style={cardStyle}>
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


        {isOurDeal ? (
          <Link
            href={profileHref}
            onClick={() =>
              trackDeal({
                dealId: deal.id,
                businessId: deal.businessId,
                type: 'our_deal_close',
              })
            }
            style={{
              color: '#e5e7eb',
              textDecoration: 'none',
              fontSize: '18px',
              lineHeight: 1,
            }}
            aria-label="OUR DEAL schliessen"
          >
            ×
          </Link>
        ) : previewOpen ? (
<Link
  href={shownDealsQuery ? `${pathname}?shownDeals=${shownDealIds?.join(',')}` : pathname}
  style={{
    color: '#e5e7eb',
    textDecoration: 'none',
    fontSize: '18px',
    lineHeight: 1,
    display: 'inline-block',
  }}
  aria-label="Preview schliessen"
>
  ×
</Link>
        ) : null}
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: previewOpen || isOurDeal ? 'flex-start' : 'center' }}>
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
            flex: 1,
            minWidth: 0,
            padding: previewOpen || isOurDeal ? '1rem 4.75rem 1rem 0' : '0.75rem 2rem 0.75rem 0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: previewOpen || isOurDeal ? 'flex-start' : 'center',
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
                fontSize: previewOpen ? '1.1rem' : '0.95rem',
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

          {!isOurDeal && (
            <div
              style={{
                fontSize: '0.72rem',
                color: '#8f9bb3',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
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
                  {deal.business?.name && <span>·</span>}
                </>
              )}

              {deal.business?.name && (
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {deal.business.name}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {!isOurDeal && !previewOpen && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
<Link
  href={`${pathname}?previewDeal=${deal.id}${shownDealsQuery}`}
  style={{
    fontSize: '0.8rem',
    color: '#000',
    fontWeight: 700,
    background: '#4ade80',
    borderRadius: '10px',
    padding: '0.45rem 0.7rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    display: 'inline-block',
  }}
>
  Vorschau öffnen
</Link>
        </div>
      )}

      {!isOurDeal && previewOpen && previewTeaser && (
        <div
          style={{
            fontSize: '0.8rem',
            color: '#cbd5e1',
            lineHeight: 1.45,
            marginTop: '0.75rem',
            padding: '0.65rem 0.75rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '8px',
            border: '1px solid rgba(134, 239, 172, 0.2)',
            borderLeft: '3px solid rgba(134, 239, 172, 0.2)',
          }}
        >
          {previewTeaser}
        </div>
      )}

      {!isOurDeal && previewOpen && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
          <Link
            href={dealHref}
            onClick={() =>
              trackDeal({
                dealId: deal.id,
                businessId: deal.businessId,
                type: 'click',
              })
            }
            style={{
              fontSize: '0.8rem',
              color: '#000',
              fontWeight: 700,
              background: '#4ade80',
              borderRadius: '10px',
              padding: '0.45rem 0.7rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Deal ansehen →
          </Link>
        </div>
      )}

      {isOurDeal && (
        <>
          <div style={{ width: '100%', marginTop: '0.75rem' }}>
            <Link
href={`${pathname}?redeemDeal=${deal.id}${shownDealsQuery}`}  style={{
    width: '100%',
    display: 'block',
    fontSize: '0.75rem',
    color: '#000000',
    fontWeight: '700',
    background: '#4ade80',
    borderRadius: '12px',
    padding: '1rem',
    textAlign: 'center',
    textDecoration: 'none',
    opacity: isExpanded ? 0.65 : 1,
  }}
>
  {isExpanded ? 'BEREITS EINGELÖST' : 'JETZT UNVERBINDLICH EINLÖSEN'}
</Link>
          </div>

          {fullDescription && (
            <div
              style={{
                fontSize: '0.8rem',
                color: '#cbd5e1',
                lineHeight: 1.45,
                marginTop: '0.75rem',
                padding: '0.65rem 0.75rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {fullDescription}
            </div>
          )}

          <Link
  href={`${pathname}?detailsDeal=${deal.id}${shownDealsQuery}`}
  style={{
    width: '100%',
    background: 'none',
    border: 'none',
    fontSize: '0.75rem',
    color: '#9ca3af',
    marginTop: '0.6rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: 0,
    textAlign: 'left',
    textDecoration: 'none',
  }}
>
  <span>ⓘ</span>
  <span>Details & Bedingungen anzeigen</span>
  <span style={{ marginLeft: 'auto' }}>
    {showDetails ? '↑' : '↓'}
  </span>
</Link>

           {showDetails && (
            <div
              style={{
                marginTop: '0.6rem',
                borderRadius: '12px',
                border: '1px solid rgba(134, 239, 172, 0.2)',
                padding: '0.6rem 0.7rem',
                background: 'rgba(0,0,0,0.3)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  color: '#d1d5db',
                  marginBottom: '0.4rem',
                }}
              >
                <span>ℹ️</span>
                <span>Details & Bedingungen</span>
              </div>

              <div style={detailRowStyle}>
                <span>📅 Gültig bis</span>
                <span>{formattedEndDate || 'Nach Angabe'}</span>
              </div>

              <div style={detailRowStyle}>
                <span>🕒 Einlösbar</span>
                <span>Mo – Fr</span>
              </div>

              <div style={detailRowStyle}>
                <span>👤 Einlösbar für</span>
                <span>1 Person</span>
              </div>

              <div style={detailRowStyle}>
                <span>✔️ Voraussetzung</span>
                <span>Termin erforderlich</span>
              </div>

              <div style={detailRowStyle}>
                <span>❌ Nicht kombinierbar</span>
                <span>Mit anderen Angeboten</span>
              </div>
            </div>
           )}
            </>
      )}
    </article>
  )
}

const detailRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '1rem',
  fontSize: '0.75rem',
  padding: '0.35rem 0',
  borderTop: '1px solid rgba(255,255,255,0.05)',
}