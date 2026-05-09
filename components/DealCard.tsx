// filepath: components/DealCard.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Premium hover styles (injected into page)
const premiumHoverStyles = `
  .premium-deal-card {
    transition: transform 0.24s ease;
    will-change: transform;
  }
  .premium-deal-card:hover {
    transform: scale(1.03);
  }
`

const dealCardBaseStyles = `
  .deal-card {
    transition: background 150ms ease, transform 150ms ease, border-color 150ms ease;
  }
  .deal-card:hover {
    background: #27272a;
  }
  .deal-card:active {
    transform: scale(0.98);
  }
`
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
}

export default function DealCard({ deal, mode = 'normal', isPreviewOpen: isPreviewOpenProp, onPreviewToggle }: DealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localPreviewOpen, setLocalPreviewOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const router = useRouter()
  const businessSlug = deal.business?.slug

  const previewOpen = typeof isPreviewOpenProp === 'boolean' ? isPreviewOpenProp : localPreviewOpen
  const setPreviewOpen = (open: boolean) => {
    if (typeof isPreviewOpenProp === 'boolean') {
      onPreviewToggle?.(deal.id, open)
    } else {
      setLocalPreviewOpen(open)
    }
  }

  const isOurDeal = mode === 'ourDeal'
  const previewText = deal.previewText ?? deal.description
  const fullDescription = deal.fullDescription ?? deal.description
  const badgeLabel = deal.discountText ?? deal.badge ?? deal.discount ?? deal.type
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

  // Load bookmark state from localStorage on mount
  useEffect(() => {
    const savedDeals = JSON.parse(localStorage.getItem('savedDeals') || '[]')
    setIsSaved(savedDeals.includes(deal.id))
  }, [deal.id])

  // Track deal view on mount
  useEffect(() => {
    async function trackDealView() {
      try {
        await fetch('/api/deal-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dealId: deal.id,
            businessId: deal.businessId,
            type: 'view',
          }),
        })

        if (isOurDeal) {
          await fetch('/api/deal-stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dealId: deal.id,
              businessId: deal.businessId,
              type: 'our_deal_view',
            }),
          })
        }
      } catch (error) {
        console.error('Failed to track deal view:', error)
      }
    }

    trackDealView()
  }, [deal.id, deal.businessId, isOurDeal])

  // Track deal click
  const handleDealClick = async () => {
    try {
      await fetch('/api/deal-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: deal.id,
          businessId: deal.businessId,
          type: 'click',
        }),
      })

      if (isOurDeal) {
        await fetch('/api/deal-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dealId: deal.id,
            businessId: deal.businessId,
            type: 'our_deal_click',
          }),
        })
      }
    } catch (error) {
      console.error('Failed to track deal click:', error)
    }
  }

  // Build link with dealId for normal mode
  const linkHref = isOurDeal 
    ? (businessSlug ? `/profile/${businessSlug}` : '#')
    : (businessSlug ? `/profile/${businessSlug}?dealId=${deal.id}` : '#')

  const cardStyle: React.CSSProperties = {
    display: 'flex',
    width: '100%',
    maxWidth: previewOpen ? '650px' : '600px',
    margin: '0 auto',
    minWidth: 0,
    minHeight: !isOurDeal && !previewOpen ? '108px' : undefined,
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    textDecoration: 'none',
    color: 'inherit',
    borderRadius: isOurDeal || deal.isPremium ? '12px' : '12px',
    background: isHovered ? '#252529' : '#121214',
    border: isOurDeal
  ? '1.5px solid rgba(134, 239, 172, 0.2)'
  : deal.isPremium
  ? '1.5px solid rgba(134, 239, 172, 0.2)'
  : '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.02)',
    transform: previewOpen ? 'translateY(-4px) scale(1.025)' : undefined,
    zIndex: previewOpen ? 30 : undefined,
    transition: 'background 150ms ease, transform 150ms ease, border-color 150ms ease',
    flexDirection: 'column',
    alignSelf: 'stretch',
    marginTop: 0,
    marginBottom: 0,
    padding: '0.20rem 0.25rem 0.20rem 0.2rem',
    cursor: 'pointer',
    touchAction: 'manipulation',
  }

  // Add premium class for hover effects
  const cardClass = deal.isPremium && !isOurDeal ? 'premium-deal-card deal-card' : 'deal-card'

  // Handle close button click
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Track Our Deal close
    if (deal.id && deal.businessId) {
      fetch('/api/deal-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: deal.id,
          businessId: deal.businessId,
          type: 'our_deal_close',
        }),
        keepalive: true,
      }).catch((error) => {
        console.error('Failed to track our_deal_close:', error)
      })
    }

    // Remove dealId from URL and stay on same page
    const currentPath = window.location.pathname
    router.push(currentPath)
  }

  // Handle redeem button click (toggle)
  const handleRedeem = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isExpanded) return

    const redeemedKey = `redeemed_${deal.id}`

    // Check if already redeemed
    if (localStorage.getItem(redeemedKey)) {
      setIsExpanded(true)
      return
    }

    if (deal.id && deal.businessId) {
      fetch('/api/deal-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: deal.id,
          businessId: deal.businessId,
          type: 'redeem',
        }),
        keepalive: true,
      }).catch((error) => {
        console.error('Failed to track redeem action:', error)
      })

      // Mark as redeemed in localStorage
      localStorage.setItem(redeemedKey, "true")
    }

    setIsExpanded(true)
  }

  // Handle preview expand for normal mode
  const handlePreviewExpand = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (deal.id && deal.businessId) {
      fetch('/api/deal-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: deal.id,
          businessId: deal.businessId,
          type: 'preview_open',
        }),
        keepalive: true,
      }).catch((error) => {
        console.error('Failed to track preview_open:', error)
      })
    }

    setPreviewOpen(true)
  }

  // Handle navigation to deal for normal mode
  const handlePreviewNavigate = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Send click tracking
    if (deal.id && deal.businessId) {
      fetch('/api/deal-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: deal.id,
          businessId: deal.businessId,
          type: 'click',
        }),
        keepalive: true,
      }).catch((error) => {
        console.error('Failed to track click:', error)
      })
    }

    // Navigate to deal
    if (businessSlug) {
      router.push(`/profile/${businessSlug}?dealId=${deal.id}`)
    }
  }

  // Handle card tap toggle preview (for normal mode only)
  const handleCardTap = (e: React.MouseEvent) => {
    if (isOurDeal) return

    e.preventDefault()
    e.stopPropagation()
    

    if (previewOpen) {
      // Navigate to deal
      if (deal.id && deal.businessId) {
        fetch('/api/deal-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dealId: deal.id,
            businessId: deal.businessId,
            type: 'click',
          }),
          keepalive: true,
        }).catch((error) => {
          console.error('Failed to track click:', error)
        })
      }

      if (businessSlug) {
        router.push(`/profile/${businessSlug}?dealId=${deal.id}`)
      }
    } else {
      // Track preview_open only on first open
      if (deal.id && deal.businessId) {
        fetch('/api/deal-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dealId: deal.id,
            businessId: deal.businessId,
            type: 'preview_open',
          }),
          keepalive: true,
        }).catch((error) => {
          console.error('Failed to track preview_open:', error)
        })
      }

      setPreviewOpen(true)
    }
  }

  // Handle bookmark toggle
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const savedDeals = JSON.parse(localStorage.getItem('savedDeals') || '[]')
    
    if (isSaved) {
      // Remove from saved
      const updated = savedDeals.filter((id: string) => id !== deal.id)
      localStorage.setItem('savedDeals', JSON.stringify(updated))
      setIsSaved(false)
    } else {
      // Add to saved
      if (!savedDeals.includes(deal.id)) {
        savedDeals.push(deal.id)
        localStorage.setItem('savedDeals', JSON.stringify(savedDeals))
      }
      setIsSaved(true)
    }
  }

  // Format date if it exists
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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dealCardBaseStyles }} />
      {/* Inject premium styles */}
      {deal.isPremium && !isOurDeal && (
        <style dangerouslySetInnerHTML={{ __html: premiumHoverStyles }} />
      )}
      
      {/* For normal mode: div instead of Link, for OUR DEAL: Link */}
      {isOurDeal ? (
        <div
          style={cardStyle}
          className={cardClass}
          onClick={handleDealClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
        {/* Close button for OUR DEAL */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 20,
        }}>
          <button
            onClick={handleBookmarkClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={isSaved ? 'Aus gespeicherten Deals entfernen' : 'Zu gespeicherten Deals hinzufügen'}
          >
            <span style={{
              color: isSaved ? '#4ade80' : '#b5b5b5',
              opacity: isSaved ? 1 : 0.55,
              fontSize: '1.35rem',
              fontWeight: isSaved ? '700' : 'normal',
              transform: isSaved ? 'scale(1.08)' : 'scale(1)',
              transition: 'all 0.15s ease'
            }}>🔖</span>
          </button>
          <button
            onClick={handleClose}
            style={{
              width: '24px',
              height: '24px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              lineHeight: 1,
              padding: '0',
            }}
          >
            ×
          </button>
        </div>

        {/* Card content */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          {/* Left: Deal Image or Video for Premium */}
          <div style={{ 
            width: '130px', 
            height: '110px', 
            flexShrink: 0, 
            background: '#transparen', 
            borderTopLeftRadius: '12px',
            borderBottomLeftRadius: '12px',
            borderTopRightRadius: '12px',
            borderBottomRightRadius: '12px',
            overflow: 'hidden'
          }}>
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
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/deals/scandeal.png'
                }}
              />
            )}
          </div>

          {/* Right: Content */}
          <div style={{ flex: 1, minWidth: 0, padding: '1rem 4.75rem 1rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '0.5rem', position: 'relative', overflow: 'hidden', background: 'transparent' }}>
            {/* Top row: Title + Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0, lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, minWidth: 0, overflow: 'hidden' }}>

                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, display: 'block' }}>
                  {deal.title}
                </span>
              </h4>
              
            </div>

            {deal.highlight && (
  <div style={{
    color: '#86efac',
    fontSize: '0.70rem',
    fontWeight: '400',
    opacity: 0.7,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    width: 'fit-content',
    marginTop: '4px',
  }}>
                <span style={{
                  width: '14px',
                  height: '14px',
                  border: '1.5px solid rgba(134, 239, 172, 0.2)',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  color: '#86efac',
                  background: 'transparent',
                  flexShrink: 0,
                }}>
                  ✔
                </span>
                <span>{deal.highlight}</span>
              </div>
            )}

            

            
            


        
          </div>
        </div>
        {/* Button row */}
<div style={{ width: '100%', marginTop: '0.75rem' }}>
  <button
    onClick={handleRedeem}
    disabled={isExpanded}
    style={{
      width: '100%',
      display: 'block',
      fontSize: '0.75rem',
      color: '#000000',
      fontWeight: '700',
      background: '#4ade80',
      border: 'none',
      borderRadius: '12px',
      padding: '1rem',
      cursor: isExpanded ? 'not-allowed' : 'pointer',
      opacity: isExpanded ? 0.65 : 1,
    }}
  >
    {isExpanded ? 'BEREITS EINGELÖST' : 'JETZT UNVERBINDLICH EINLÖSEN'}
  </button>
</div>

{fullDescription && (
  <div style={{
    fontSize: '0.8rem',
    color: '#cbd5e1',
    lineHeight: 1.45,
    marginTop: '0.75rem',
    padding: '0.65rem 0.75rem',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.05)',
  }}>
    {fullDescription}
  </div>
)}
<div
  onClick={() => setShowDetails(!showDetails)}
  style={{
    fontSize: '0.75rem',
    color: '#9ca3af',
    marginTop: '0.6rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }}
>
  <span>ⓘ</span>
  <span>Details & Bedingungen anzeigen</span>
  <span style={{ marginLeft: 'auto' }}>
    {showDetails ? '↑' : '↓'}
  </span>
</div>
{/* Details section */}

{showDetails && (
  <div style={{
    marginTop: '0.6rem',
    borderRadius: '12px',
    border: '1px solid rgba(134, 239, 172, 0.2)',
    padding: '0.6rem 0.7rem',
    background: 'rgba(0,0,0,0.3)'
  }}>

    {/* Header */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '0.8rem',
      color: '#d1d5db',
      marginBottom: '0.4rem'
    }}>
      <span>ℹ️</span>
      <span>Details & Bedingungen</span>
    </div>

    {/* Row */}
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.35rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <span>📅 Gültig von</span>
      <span>01.05.2025 – 31.07.2025</span>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.35rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <span>🕒 Einlösbar</span>
      <span>Mo – Fr</span>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.35rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <span>👤 Einlösbar für</span>
      <span>1 Person</span>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.35rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <span>✔️ Voraussetzung</span>
      <span>Termin erforderlich</span>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.35rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <span>❌ Nicht kombinierbar</span>
      <span>Mit anderen Angeboten</span>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.35rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <span>ℹ️ Hinweis</span>
      <span>Nicht gültig für Produkte</span>
    </div>

  </div>
)}
            {/* Footer: Date · Business */}
            <div style={{ fontSize: '0.7rem', color: '#8f9bb3', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              
            </div>
      </div>
      ) : (
        <div 
          style={cardStyle} 
          className={cardClass}
          onClick={handleCardTap}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
        {previewOpen ? (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 20,
          }}>
            <button
              onClick={handleBookmarkClick}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={isSaved ? 'Aus gespeicherten Deals entfernen' : 'Zu gespeicherten Deals hinzufügen'}
            >
              <span style={{
                color: isSaved ? '#4ade80' : '#b5b5b5',
                opacity: isSaved ? 1 : 0.55,
                fontSize: '1.35rem',
                fontWeight: isSaved ? '700' : 'normal',
                transform: isSaved ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.15s ease'
              }}>🔖</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setPreviewOpen(false)
              }}
              style={{
                width: '24px',
                height: '24px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                lineHeight: 1,
                padding: '0',
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={handleBookmarkClick}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20,
            }}
            title={isSaved ? 'Aus gespeicherten Deals entfernen' : 'Zu gespeicherten Deals hinzufügen'}
          >
            <span style={{
              color: '#4ade80',
              opacity: isSaved ? 1 : 0.4,
              fontSize: '1.35rem',
              fontWeight: isSaved ? '700' : '400',
              transform: isSaved ? 'scale(1.08)' : 'scale(1)',
              transition: 'all 0.15s ease'
            }}>🔖</span>
          </button>
        )}
        {/* Card content for normal mode */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: previewOpen ? 'flex-start' : 'center' }}>
          {/* Left: Deal Image or Video for Premium */}
          <div style={{ 
            width: '130px', 
            height: '110px', 
            flexShrink: 0, 
            background: '#777777', 
            borderTopLeftRadius: '12px',
            borderBottomLeftRadius: '12px',
            borderTopRightRadius: '12px',
            borderBottomRightRadius: '12px',
            overflow: 'hidden',
          }}>
            {deal.isPremium && imageSrc.endsWith('.mp4') ? (
              <video
                src={imageSrc}
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: '130%',
                  height: '110%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <img
                src={imageSrc}
                alt={deal.title ?? 'Deal image'}
                style={{
                  width: '110%',
                  height: '110%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/deals/scandeal.png'
                }}
              />
            )}
          </div>

          {/* Right: Content */}
          <div style={{ flex: 1, minWidth: 0, padding: previewOpen ? '1rem 4.75rem 1rem 0' : '0.75rem 2rem 0.75rem 0', display: 'flex', flexDirection: 'column', justifyContent: previewOpen ? 'flex-start' : 'center', gap: previewOpen ? '0.5rem' : '0.75rem', position: 'relative', overflow: 'hidden', maxWidth: '100%' }}>
            {previewOpen ? (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px', minWidth: 0, width: '100%', minHeight: '64px' }}>
                {/* Top row: Title only (Preview uses same History structure) */}
                <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, paddingRight: '0px', gap: '6px', marginBottom: '0.2rem' }}>
                  <div style={{ minWidth: 0, flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ 
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, display: 'block', fontSize: '1.10rem', fontWeight: '700', lineHeight: '1.2', color: '#ffffff' }}>
                      {deal.title}
                    </span>
                  </div>
                </div>

                {deal.highlight && (
                  <div style={{
                    color: '#86efac',
                    fontSize: '0.70rem',
                    fontWeight: '400',
                    opacity: 0.7,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    width: 'fit-content',
                    marginTop: '4px',
                  }}>
                    <span style={{
                      width: '12px',
                      height: '12px',
                      background: 'transparent',
                      border: '1px solid rgba(134, 239, 172, 0.2)',
                      color: 'rgba(134, 239, 172, 0.2)',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.6rem',
                      flexShrink: 0,
                    }}>
                      ✔
                    </span>
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                    }}>{deal.highlight}</span>
                  </div>
                )}

                <div style={{
                  fontSize: '0.72rem',
                  lineHeight: '1.3',
                  color: '#8f9bb3',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  minHeight: '16px',
                  marginTop: '10px',
                  visibility: (distanceValue !== null && distanceValue !== undefined || deal.business?.name) ? 'visible' : 'hidden',
                  flexWrap: 'nowrap',
                  minWidth: 0,
                }}>
                  {distanceValue !== null && distanceValue !== undefined && (
                    <>
                      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><span style={{color: '#86efac', opacity: 0.75}}>📍</span> {distanceValue.toFixed(1)} km</span>
                      {deal.business?.name && <span style={{ flexShrink: 0 }}>·</span>}
                    </>
                  )}
                  {deal.business?.name && <span style={{ color: '#94a3b8', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deal.business.name}</span>}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px', minWidth: 0, width: '100%', minHeight: '64px' }}>
                {/* Top row: Title only (no badge in History) */}
                <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, paddingRight: '32px', gap: '6px', marginBottom: '0.2rem' }}>
                  <div style={{ minWidth: 0, flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>

                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, display: 'block', fontSize: '1.10rem', fontWeight: '700', lineHeight: '1', color: '#ffffff' }}>
                      {deal.title}
                    </span>
                  </div>
                </div>

                {deal.highlight && (
                  <div style={{
                    color: '#86efac',
                    fontSize: '0.70rem',
                    fontWeight: '400',
                    opacity: 0.7,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    width: 'fit-content',
                    marginTop: '4px',
                  }}>
                    <span style={{
                      width: '12px',
                      height: '12px',
                      background: 'transparent',
                      border: '1px solid rgba(134, 239, 172, 0.2)',
                      color: 'rgba(134, 239, 172, 0.2)',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.6rem',
                      flexShrink: 0,
                    }}>
                      ✔
                    </span>
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                    }}>{deal.highlight}</span>
                  </div>
                )}

                <div style={{
                  fontSize: '0.72rem',
                  lineHeight: '1.3',
                  color: '#8f9bb3',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  minHeight: '16px',
                  marginTop: '10px',
                  visibility: (distanceValue !== null && distanceValue !== undefined || deal.business?.name) ? 'visible' : 'hidden',
                  flexWrap: 'nowrap',
                  minWidth: 0,
                }}>
                  {distanceValue !== null && distanceValue !== undefined && (
                    <>
                      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><span style={{color: '#86efac', opacity: 0.75}}>📍</span> {distanceValue.toFixed(1)} km</span>
                      {deal.business?.name && <span style={{ flexShrink: 0 }}>·</span>}
                    </>
                  )}
                  
                  {deal.business?.name && <span style={{ color: '#94a3b8', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deal.business.name}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
        {previewOpen && previewTeaser && (
                      
         <div style={{
  fontSize: '0.8rem',
  color: '#cbd5e1',
  lineHeight: 1.45,
  marginTop: '0.75rem',
  padding: '0.65rem 0.75rem',
  background: 'rgba(255,255,255,0.02)',
  borderRadius: '8px',
  border: '1px solid rgba(134, 239, 172, 0.2)',
borderLeft: '3px solid rgba(134, 239, 172, 0.2)',
}}>
            {previewTeaser}
          </div>
        )}
        {previewOpen && (
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
    <button
      onClick={handlePreviewNavigate}
      style={{
        fontSize: '0.8rem',
        color: '#fff',
        fontWeight: '600',
        background: '#4ade80',
        border: 'none',
        borderRadius: '10px',
        padding: '0.45rem 0.7rem',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      Deal ansehen →
    </button>
  </div>
)}
      
        </div>
      )}
    </>
  )
}