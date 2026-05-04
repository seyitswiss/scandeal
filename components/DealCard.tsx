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
  isPreviewOpen?: boolean
  onPreviewToggle?: (dealId: string, open: boolean) => void
}

export default function DealCard({ deal, mode = 'normal', isPreviewOpen: isPreviewOpenProp, onPreviewToggle }: DealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localPreviewOpen, setLocalPreviewOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
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

  const previewTeaser = getTextTeaser(previewText, 160)

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
    maxWidth: previewOpen ? '820px' : '760px',
    margin: '0 auto',
    minWidth: 0,
    minHeight: !isOurDeal && !previewOpen ? '150px' : undefined,
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    textDecoration: 'none',
    color: 'inherit',
    borderRadius: isOurDeal || deal.isPremium ? '12px' : '16px',
    background: '#fff',
    border: deal.isPremium ? '1.5px solid rgba(245, 200, 66, 0.35)' : isOurDeal ? '1px solid #e5e5e5' : undefined,
    boxShadow: previewOpen ? '0 20px 60px rgba(0,0,0,0.18)' : (deal.isPremium ? '0 8px 22px rgba(0,0,0,0.10)' : (isOurDeal ? undefined : '0 4px 10px rgba(0,0,0,0.05)')),
    transform: previewOpen ? 'translateY(-4px) scale(1.025)' : undefined,
    zIndex: previewOpen ? 30 : undefined,
    transition: previewOpen ? 'all 0.18s ease' : undefined,
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

    // Track preview_open only on first open
    if (!previewOpen && deal.id && deal.businessId) {
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

    setPreviewOpen(!previewOpen)
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
            <span style={{
              color: isSaved ? '#2e7d32' : '#b5b5b5',
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
          <div style={{ flex: 1, minWidth: 0, padding: '0.75rem 2.5rem 0.75rem 0', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', background: '#fff' }}>
            {/* Top row: Title + Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0, lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                {deal.isPremium && <span aria-hidden="true">🔥</span>}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, display: 'block' }}>
                  {deal.title}
                </span>
              </h4>
              {badgeLabel && (
                <span style={{ marginLeft: 'auto', background: '#2e7d32', color: '#fff', padding: '2px 6px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 'bold', whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                  {badgeLabel}
                </span>
              )}
            </div>

            {deal.highlight && (
              <div style={{
                background: 'rgba(46, 125, 50, 0.10)',
                color: '#2e7d32',
                fontSize: '0.82rem',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '8px',
                margin: '0.45rem 0 0 0',
              }}>
                <span style={{
                  width: '14px',
                  height: '14px',
                  border: '1.5px solid #388e3c',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  color: '#388e3c',
                  background: 'transparent',
                  flexShrink: 0,
                }}>
                  ✔
                </span>
                <span>{deal.highlight}</span>
              </div>
            )}

            {fullDescription && (
              <div style={{
                fontSize: '0.88rem',
                color: '#444',
                lineHeight: 1.55,
                margin: '0.5rem 0 0 0',
              }}>
                {fullDescription}
              </div>
            )}

            {/* Button row */}
            <div style={{ display: 'flex', gap: '0.5rem', margin: '0.65rem 0 0 0' }}>
              <button
                onClick={handleRedeem}
                disabled={isExpanded}
                style={{ 
                  fontSize: '0.95rem', 
                  color: '#fff', 
                  fontWeight: '700',
                  background: '#2e7d32',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.95rem 1.1rem',
                  cursor: isExpanded ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  
                  opacity: isExpanded ? 0.65 : 1,
                }}
              >
                {isExpanded ? 'BEREITS EINGELÖST' : 'JETZT EINLÖSEN'}
              </button>
            </div>

            {/* Footer: Date · Business */}
            <div style={{ fontSize: '0.72rem', color: '#777', display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {formattedEndDate && <span>📅 {formattedEndDate}</span>}
              {formattedEndDate && deal.business?.name && <span>·</span>}
              {deal.business?.name && <span style={{ color: '#555' }}>{deal.business.name}</span>}
            </div>
          </div>
        </div>

        {/* Expanded Redeem UI */}
        {isExpanded && (
          <div style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ background: '#4caf50', color: '#fff', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>Deal aktiviert ✔️</p>
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
                color: isSaved ? '#2e7d32' : '#b5b5b5',
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
              color: isSaved ? '#2e7d32' : '#b5b5b5',
              opacity: isSaved ? 1 : 0.55,
              fontSize: '1.35rem',
              fontWeight: isSaved ? '700' : 'normal',
              transform: isSaved ? 'scale(1.08)' : 'scale(1)',
              transition: 'all 0.15s ease'
            }}>🔖</span>
          </button>
        )}
        {/* Card content for normal mode */}
        <div style={{ display: 'flex', gap: '16px', alignItems: previewOpen ? 'flex-start' : 'center' }}>
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
          <div style={{ flex: 1, minWidth: 0, padding: previewOpen ? '0.75rem 4.75rem 0.75rem 0' : '0.75rem 3rem 0.75rem 0', display: 'flex', flexDirection: 'column', justifyContent: previewOpen ? 'flex-start' : 'center', gap: previewOpen ? '0.25rem' : '6px', position: 'relative', overflow: 'hidden' }}>
            {previewOpen ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0, width: '100%' }}>
                {/* Top row: Title + Badge */}
                <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, paddingRight: '32px', gap: '6px' }}>
                  <div style={{ minWidth: 0, flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {deal.isPremium && <span aria-hidden="true">🔥</span>}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, display: 'block', fontSize: '1.15rem', fontWeight: '600', color: '#111' }}>
                      {deal.title}
                    </span>
                  </div>
                </div>

                {deal.highlight && (
                  <div style={{
                    background: 'rgba(46, 125, 50, 0.10)',
                    color: '#2e7d32',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                  }}>
                    <span style={{
                      width: '14px',
                      height: '14px',
                      border: '1.5px solid #388e3c',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      color: '#388e3c',
                      background: 'transparent',
                      flexShrink: 0,
                    }}>
                      ✔
                    </span>
                    <span>{deal.highlight}</span>
                  </div>
                )}

                {previewTeaser && (
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#444',
                    lineHeight: 1.45,
                    maxWidth: '100%',
                    overflow: 'hidden',
                    padding: 0,
                    margin: 0,
                  }}>
                    {previewTeaser}
                  </div>
                )}

                <div style={{
                  fontSize: '0.75rem',
                  color: '#777',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  minHeight: '16px',
                  marginTop: 0,
                  flexWrap: 'wrap',
                  visibility: (formattedEndDate || distanceValue !== null && distanceValue !== undefined || deal.business?.name) ? 'visible' : 'hidden',
                }}>
                  {distanceValue !== null && distanceValue !== undefined && (
                    <>
                      <span><span style={{color: '#2e7d32', opacity: 0.75}}>📍</span> {distanceValue.toFixed(1)} km</span>
                      {(formattedEndDate || deal.business?.name) && <span>·</span>}
                    </>
                  )}
                  {formattedEndDate && (
                    <>
                      <span><span style={{color: '#2e7d32', opacity: 0.75}}>📅</span> {formattedEndDate}</span>
                      {deal.business?.name && <span>·</span>}
                    </>
                  )}
                  {deal.business?.name && <span style={{ color: '#666' }}>{deal.business.name}</span>}
                </div>

                <div style={{ display: 'flex', gap: '0.25rem', marginTop: 0 }}>
                  <button
                    onClick={handlePreviewNavigate}
                    style={{ 
                      fontSize: '0.8rem', 
                      color: '#fff', 
                      fontWeight: '600',
                      background: '#4caf50',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.4rem 0.6rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Zum Deal →
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px', minWidth: 0, width: '100%', minHeight: '72px' }}>
                {/* Top row: Title only (no badge in History) */}
                <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, paddingRight: '32px', gap: '6px' }}>
                  <div style={{ minWidth: 0, flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {deal.isPremium && <span aria-hidden="true">🔥</span>}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, display: 'block', fontSize: '1.15rem', fontWeight: '600', color: '#111' }}>
                      {deal.title}
                    </span>
                  </div>
                </div>

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
                  gap: '6px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  minHeight: '16px',
                  marginTop: '10px',
                  visibility: (formattedEndDate || distanceValue !== null && distanceValue !== undefined || deal.business?.name) ? 'visible' : 'hidden',
                  flexWrap: 'wrap',
                }}>
                  {distanceValue !== null && distanceValue !== undefined && (
                    <>
                      <span><span style={{color: '#2e7d32', opacity: 0.75}}>📍</span> {distanceValue.toFixed(1)} km</span>
                      {(formattedEndDate || deal.business?.name) && <span>·</span>}
                    </>
                  )}
                  {formattedEndDate && (
                    <>
                      <span><span style={{color: '#2e7d32', opacity: 0.75}}>📅</span> {formattedEndDate}</span>
                      {deal.business?.name && <span>·</span>}
                    </>
                  )}
                  {deal.business?.name && <span style={{ color: '#666' }}>{deal.business.name}</span>}
                </div>
              </div>
            )}

          </div>
        </div>
        </div>
      )}
    </>
  )
}