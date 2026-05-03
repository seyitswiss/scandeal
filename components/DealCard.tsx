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
  const previewText = deal.previewText ?? deal.description
  const fullDescription = deal.fullDescription ?? deal.description
  const badgeLabel = deal.discountText ?? deal.badge ?? deal.discount ?? deal.type
  const endDateValue = deal.validUntil ?? deal.endDate
  const distanceValue = deal.distanceKm ?? deal.distance
  const formattedEndDate = formatDate(endDateValue)

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
    maxWidth: '760px',
    margin: '0 auto',
    minWidth: 0,
    minHeight: !isOurDeal && !isPreviewOpen ? '150px' : undefined,
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    textDecoration: 'none',
    color: 'inherit',
    borderRadius: isOurDeal || deal.isPremium ? '12px' : '16px',
    background: '#fff',
    border: isOurDeal || deal.isPremium ? '2px solid #f5c842' : undefined,
    boxShadow: isOurDeal ? undefined : '0 4px 10px rgba(0,0,0,0.05)',
    flexDirection: 'column',
    alignSelf: 'stretch',
    padding: '12px',
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
            {isSaved ? '❤️' : '🤍'}
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
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {/* Left: Deal Image or Video for Premium */}
          <div style={{ 
            width: '190px', 
            height: '150px', 
            flexShrink: 0, 
            background: '#f5f5f5', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '14px',
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
          <div style={{ flex: 1, minWidth: 0, padding: '0.75rem 2.5rem 0.75rem 0', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            {/* Top row: Title + Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0, lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: '0.25rem', flex: '1 1 auto', minWidth: 0, overflow: 'hidden' }}>
                {deal.isPremium && <span aria-hidden="true">🔥</span>}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, display: 'block' }}>
                  {deal.title}
                </span>
              </h4>
              {badgeLabel && (
                <span style={{ background: '#2e7d32', color: '#fff', padding: '2px 6px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 'bold', whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                  {badgeLabel}
                </span>
              )}
            </div>

            {deal.highlight && (
              <div style={{
                background: '#e8f5e9',
                color: '#2e7d32',
                padding: '4px 10px',
                borderRadius: '10px',
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                width: 'fit-content',
              }}>
                ✔ {deal.highlight}
              </div>
            )}

            {(isOurDeal || isPreviewOpen) && (isOurDeal ? fullDescription : previewText) && (
              <div style={{
                marginBottom: '0.5rem',
                padding: '0.5rem',
                background: '#f9f9f9',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#555',
                lineHeight: 1.5,
              }}>
                <div style={{ paddingRight: '1rem' }}>
                  {isOurDeal ? fullDescription : previewText}
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
                  borderRadius: '10px',
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Jetzt unverbindlich einlösen
              </button>
            </div>

            {/* Footer: Date · Distance */}
            <div style={{ fontSize: '0.7rem', color: '#999', display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
              {formattedEndDate && <span>📅 {formattedEndDate}</span>}
              {formattedEndDate && distanceValue !== null && distanceValue !== undefined && <span>·</span>}
              {distanceValue !== null && distanceValue !== undefined && (
                <span>📍 {distanceValue.toFixed(1)} km</span>
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
        {isPreviewOpen ? (
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
              <span style={{color: isSaved ? '#2e7d32' : '#bbb'}}>{isSaved ? '❤️' : '🤍'}</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsPreviewOpen(false)
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
            <span style={{color: isSaved ? '#2e7d32' : '#bbb'}}>{isSaved ? '❤️' : '🤍'}</span>
          </button>
        )}
        {/* Card content for normal mode */}
        <div style={{ display: 'flex', gap: '16px', alignItems: isPreviewOpen ? 'flex-start' : 'center' }}>
          {/* Left: Deal Image or Video for Premium */}
          <div style={{ 
            width: '190px', 
            height: '150px', 
            flexShrink: 0, 
            background: '#f5f5f5', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '14px',
            overflow: 'hidden',
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
          <div style={{ flex: 1, minWidth: 0, padding: isPreviewOpen ? '0.75rem 4.75rem 0.75rem 0' : '0.75rem 3rem 0.75rem 0', display: 'flex', flexDirection: 'column', justifyContent: isPreviewOpen ? 'flex-start' : 'center', gap: isPreviewOpen ? '0.25rem' : '6px', position: 'relative', overflow: 'hidden' }}>
            {isPreviewOpen ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0, width: '100%' }}>
                  {/* Top row: Title + Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, paddingRight: '32px', gap: '6px' }}>
                    <div style={{ minWidth: 0, flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {deal.isPremium && <span aria-hidden="true">🔥</span>}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, display: 'block', fontSize: '1.15rem', fontWeight: '600', color: '#111' }}>
                        {deal.title}
                      </span>
                    </div>

                    {badgeLabel && (
                      <span style={{ minWidth: '64px', height: '24px', flexShrink: 0, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#2e7d32', color: '#fff', padding: '5px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '600', marginLeft: 'auto' }}>
                        {badgeLabel}
                      </span>
                    )}
                  </div>

                  {deal.business?.name && (
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#666',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {deal.business.name}
                    </div>
                  )}

                  {(formattedEndDate || distanceValue !== null && distanceValue !== undefined) && (
                    <div style={{ fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {distanceValue !== null && distanceValue !== undefined && (
                        <span><span style={{color: '#888'}}>📍</span> {distanceValue.toFixed(1)} km</span>
                      )}
                      {formattedEndDate && <span><span style={{color: '#2e7d32', opacity: 0.75}}>📅</span> {formattedEndDate}</span>}
                    </div>
                  )}

                  {deal.highlight && (
                    <div style={{
                      background: '#e8f5e9',
                      color: '#1b5e20',
                      padding: '5px 12px',
                      borderRadius: '10px',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      width: 'fit-content',
                    }}>
                      <span style={{
                        width: '16px',
                        height: '16px',
                        background: 'transparent',
                        border: '1.5px solid #2e7d32',
                        color: '#2e7d32',
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        flexShrink: 0,
                      }}>
                        ✔
                      </span>
                      {deal.highlight}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px', minWidth: 0, width: '100%', minHeight: '72px' }}>
                {/* Top row: Title + Badge */}
                <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, paddingRight: '32px', gap: '6px' }}>
                  <div style={{ minWidth: 0, flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {deal.isPremium && <span aria-hidden="true">🔥</span>}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, display: 'block', fontSize: '1.15rem', fontWeight: '600', color: '#111' }}>
                      {deal.title}
                    </span>
                  </div>

                  {badgeLabel && (
                    <span style={{ minWidth: '64px', height: '24px', flexShrink: 0, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#2e7d32', color: '#fff', padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', marginLeft: 'auto' }}>
                      {badgeLabel}
                    </span>
                  )}
                </div>

                {deal.business?.name && (
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#666',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {deal.business.name}
                  </div>
                )}

                {deal.highlight && (
                  <div style={{
                    background: '#ecf6ea',
                    color: '#388e3c',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: 'fit-content',
                  }}>
                    <span style={{
                      width: '14px',
                      height: '14px',
                      background: 'transparent',
                      border: '1.5px solid #388e3c',
                      color: '#388e3c',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.80rem',
                      flexShrink: 0,
                    }}>
                      ✔
                    </span>
                    {deal.highlight}
                  </div>
                )}

                <div style={{
                  fontSize: '0.75rem',
                  color: '#777',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  minHeight: '16px',
                  marginTop: '8px',
                  visibility: (formattedEndDate || distanceValue !== null && distanceValue !== undefined) ? 'visible' : 'hidden',
                }}>
                  {distanceValue !== null && distanceValue !== undefined && (
                    <span><span style={{color: '#2e7d32', opacity: 0.75}}>📍</span> {distanceValue.toFixed(1)} km</span>
                  )}
                  {formattedEndDate && <span><span style={{color: '#2e7d32', opacity: 0.75}}>📅</span> {formattedEndDate}</span>}
                </div>
              </div>
            )}

            {isPreviewOpen && previewText && (
              <div style={{
                marginBottom: '0.5rem',
                padding: '0.5rem',
                background: '#f9f9f9',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#555',
                lineHeight: 1.5,
              }}>
                <div style={{ paddingRight: '1rem' }}>
                  {previewText}
                </div>
              </div>
            )}

            {isPreviewOpen && (
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                <button
                  onClick={handlePreviewNavigate}
                  style={{ 
                    fontSize: '0.8rem', 
                    color: '#fff', 
                    fontWeight: '600',
                    background: '#4caf50',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.5rem 0.75rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Zum Deal →
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
      )}
    </>
  )
}