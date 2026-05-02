// filepath: components/DealCard.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Premium hover styles (injected into page)
const premiumHoverStyles = `
  .premium-deal-card {
    transition: transform 0.24s ease, box-shadow 0.24s ease;
    will-change: transform, box-shadow;
  }
  .premium-deal-card:hover {
    transform: scale(1.03);
    box-shadow: 0 6px 24px rgba(245, 200, 66, 0.22);
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
    distance?: number | null
  }
  mode?: 'normal' | 'ourDeal'
}

export default function DealCard({ deal, mode = 'normal' }: DealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const router = useRouter()
  const businessSlug = deal.business?.slug

  const isOurDeal = mode === 'ourDeal'

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
    maxWidth: '640px',
    boxSizing: 'border-box',
    margin: '0 auto',
    position: 'relative',
    overflow: 'hidden',
    textDecoration: 'none',
    color: 'inherit',
    marginBottom: '0.75rem',
    borderRadius: isOurDeal || deal.isPremium ? '12px' : '8px',
    background: isOurDeal ? '#fff9e6' : '#fff',
    border: isOurDeal || deal.isPremium ? '2px solid #f5c842' : undefined,
    boxShadow: isOurDeal ? undefined : deal.isPremium ? '0 2px 8px rgba(245, 200, 66, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
    flexDirection: isOurDeal ? 'column' : 'row',
  }

  // Add premium class for hover effects
  const cardClass = deal.isPremium && !isOurDeal ? 'premium-deal-card' : ''

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

    const redeemedKey = `redeemed_${deal.id}`

    // Check if already redeemed
    if (localStorage.getItem(redeemedKey)) {
      alert("Deal bereits eingelöst")
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

    setIsExpanded(!isExpanded)
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

    setIsPreviewOpen(true)
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

    // Track preview_open only on first open
    if (!isPreviewOpen && deal.id && deal.businessId) {
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

    setIsPreviewOpen(!isPreviewOpen)
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
  const formatDate = (date: string | Date | null | undefined) => {
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

  return (
    <>
      {/* Inject premium styles */}
      {deal.isPremium && !isOurDeal && (
        <style dangerouslySetInnerHTML={{ __html: premiumHoverStyles }} />
      )}
      
      {/* For normal mode: div instead of Link, for OUR DEAL: Link */}
      {isOurDeal ? (
        <div style={cardStyle} className={cardClass} onClick={handleDealClick}>
        {/* Close button for OUR DEAL */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            width: '24px',
            height: '24px',
            border: 'none',
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            lineHeight: 1,
            zIndex: 10,
          }}
        >
          ×
        </button>

        {/* Card content */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {/* Left: Deal Image or Video for Premium */}
          <div style={{ 
            width: '100px', 
            height: '100px', 
            flexShrink: 0, 
            background: '#f5f5f5', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {deal.isPremium ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                src="/videos/deal1.mp4"
                onError={(e) => {
                  const target = e.target as HTMLVideoElement
                  target.style.display = 'none'
                }}
              />
            ) : (
              <span style={{ fontSize: '0.7rem', color: '#999' }}>Deal</span>
            )}
          </div>

          {/* Right: Content */}
          <div style={{ flex: 1, padding: '0.75rem 2.5rem 0.75rem 0', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Top row: Title + Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem', gap: '0.5rem' }}>
              {/* Title */}
              <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0, lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
                {deal.isPremium && <span aria-hidden="true">🔥</span>}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {deal.title}
                </span>
              </h4>

              {/* Badge (top right) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                {deal.discountText && (
                  <span style={{ background: '#ff6b6b', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    {deal.discountText}
                  </span>
                )}
              </div>
            </div>

            {/* Bookmark icon (absolutely positioned) */}
            <button
              onClick={handleBookmarkClick}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
              title={isSaved ? 'Aus gespeicherten Deals entfernen' : 'Zu gespeicherten Deals hinzufügen'}
            >
              {isSaved ? '❤️' : '🤍'}
            </button>

            {/* Description (max 2 lines) */}
            {deal.description && (
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#666', 
                margin: '0 0 0.5rem 0', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                display: '-webkit-box', 
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', 
                lineHeight: 1.4,
              }}>
                {deal.description}
              </p>
            )}

            {/* Preview box (expanded) */}
            {isPreviewOpen && deal.description && (
              <div style={{
                marginBottom: '0.5rem',
                padding: '0.5rem',
                background: '#f9f9f9',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#555',
                lineHeight: 1.5,
                position: 'relative',
              }}>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsPreviewOpen(false)
                  }}
                  style={{
                    position: 'absolute',
                    top: '0.25rem',
                    right: '0.25rem',
                    width: '16px',
                    height: '16px',
                    border: 'none',
                    background: 'rgba(0,0,0,0.1)',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    lineHeight: 1,
                    color: '#666',
                    padding: '0',
                  }}
                >
                  ×
                </button>
                <div style={{ paddingRight: '1rem' }}>
                  {deal.description}
                </div>
              </div>
            )}

            {/* Button row */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button
                onClick={handleRedeem}
                style={{ 
                  fontSize: '0.8rem', 
                  color: '#fff', 
                  fontWeight: '600',
                  background: '#f5c842',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Deal einlösen
              </button>
            </div>

            {/* Footer: Business · Date · Distance */}
            <div style={{ fontSize: '0.7rem', color: '#999', display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
              {deal.business?.name && (
                <>
                  <span>{deal.business.name}</span>
                  {(deal.validUntil || (deal.distance !== null && deal.distance !== undefined)) && <span>·</span>}
                </>
              )}
              {deal.validUntil && (
                <>
                  <span>📅 {formatDate(deal.validUntil)}</span>
                  {deal.distance !== null && deal.distance !== undefined && <span>·</span>}
                </>
              )}
              {deal.distance !== null && deal.distance !== undefined && (
                <span>📍 {deal.distance.toFixed(1)} km</span>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Redeem UI */}
        {isExpanded && (
          <div style={{ padding: '0.75rem', borderTop: '1px solid #f5c842', background: '#fff9e6' }}>
            <div style={{ background: '#4caf50', color: '#fff', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>Deal aktiviert!</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>Code: SD-0001</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', opacity: 0.9 }}>Zeige diesen Code vor Ort</p>
            </div>
          </div>
        )}
      </div>
      ) : (
        <div 
          style={cardStyle} 
          className={cardClass}
          onClick={handleCardTap}
        >
        {/* Card content for normal mode */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {/* Left: Deal Image or Video for Premium */}
          <div style={{ 
            width: '100px', 
            height: '100px', 
            flexShrink: 0, 
            background: '#f5f5f5', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {deal.isPremium ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                src="/videos/deal1.mp4"
                onError={(e) => {
                  const target = e.target as HTMLVideoElement
                  target.style.display = 'none'
                }}
              />
            ) : (
              <span style={{ fontSize: '0.7rem', color: '#999' }}>Deal</span>
            )}
          </div>

          {/* Right: Content */}
          <div style={{ flex: 1, padding: '0.75rem 2.5rem 0.75rem 0', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Top row: Title + Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem', gap: '0.5rem' }}>
              {/* Title */}
              <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0, lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
                {deal.isPremium && <span aria-hidden="true">🔥</span>}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {deal.title}
                </span>
              </h4>

              {/* Badge (top right) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                {deal.discountText && (
                  <span style={{ background: '#ff6b6b', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    {deal.discountText}
                  </span>
                )}
              </div>
            </div>

            {/* Bookmark icon (absolutely positioned) */}
            <button
              onClick={handleBookmarkClick}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
              title={isSaved ? 'Aus gespeicherten Deals entfernen' : 'Zu gespeicherten Deals hinzufügen'}
            >
              {isSaved ? '❤️' : '🤍'}
            </button>

            {/* Description (max 2 lines) */}
            {deal.description && (
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#666', 
                margin: '0 0 0.5rem 0', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                display: '-webkit-box', 
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', 
                lineHeight: 1.4,
              }}>
                {deal.description}
              </p>
            )}

            {/* Preview box (expanded) */}
            {isPreviewOpen && deal.description && (
              <div style={{
                marginBottom: '0.5rem',
                padding: '0.5rem',
                background: '#f9f9f9',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#555',
                lineHeight: 1.5,
                position: 'relative',
              }}>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsPreviewOpen(false)
                  }}
                  style={{
                    position: 'absolute',
                    top: '0.25rem',
                    right: '0.25rem',
                    width: '16px',
                    height: '16px',
                    border: 'none',
                    background: 'rgba(0,0,0,0.1)',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    lineHeight: 1,
                    color: '#666',
                    padding: '0',
                  }}
                >
                  ×
                </button>
                <div style={{ paddingRight: '1rem' }}>
                  {deal.description}
                </div>
              </div>
            )}

            {/* Button row */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button
                onClick={isPreviewOpen ? handlePreviewNavigate : handleCardTap}
                style={{ 
                  fontSize: '0.8rem', 
                  color: '#fff', 
                  fontWeight: '600',
                  background: isPreviewOpen ? '#4caf50' : '#4285f4',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {isPreviewOpen ? 'Zum Deal →' : 'Mehr'}
              </button>
            </div>

            {/* Footer: Business · Distance (NO date in normal mode) */}
            <div style={{ fontSize: '0.7rem', color: '#999', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {deal.business?.name && (
                <>
                  <span>{deal.business.name}</span>
                  {deal.distance !== null && deal.distance !== undefined && <span>·</span>}
                </>
              )}
              {deal.distance !== null && deal.distance !== undefined && (
                <span>📍 {deal.distance.toFixed(1)} km</span>
              )}
            </div>
          </div>
        </div>
        </div>
      )}
    </>
  )
}