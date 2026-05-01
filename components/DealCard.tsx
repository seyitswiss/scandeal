// filepath: components/DealCard.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  }
  mode?: 'normal' | 'ourDeal'
}

export default function DealCard({ deal, mode = 'normal' }: DealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()
  const businessSlug = deal.business?.slug

  const isOurDeal = mode === 'ourDeal'

  // Build link with dealId for normal mode
  const linkHref = isOurDeal 
    ? (businessSlug ? `/profile/${businessSlug}` : '#')
    : (businessSlug ? `/profile/${businessSlug}?dealId=${deal.id}` : '#')

  const cardStyle: React.CSSProperties = isOurDeal
    ? {
        display: 'flex',
        flexDirection: 'column',
        background: '#fff9e6',
        border: '2px solid #f5c842',
        borderRadius: '12px',
        marginBottom: '0.75rem',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        position: 'relative',
      }
    : {
        display: 'flex',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '0.75rem',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
      }

  // Handle close button click
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Remove dealId from URL and stay on same page
    const currentPath = window.location.pathname
    router.push(currentPath)
  }

  // Handle redeem button click (toggle)
  const handleRedeem = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <Link href={linkHref} style={cardStyle}>
      {/* Close button for OUR DEAL */}
      {isOurDeal && (
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
            zIndex: 1,
          }}
        >
          ×
        </button>
      )}

      {/* Card content */}
      <div style={{ display: 'flex' }}>
        {/* Left: Deal Image */}
        <div style={{ 
          width: isOurDeal ? '90px' : '100px', 
          height: isOurDeal ? '90px' : '100px', 
          flexShrink: 0, 
          background: '#f5f5f5', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderRadius: isOurDeal ? '8px 0 0 8px' : '0'
        }}>
          <span style={{ fontSize: '0.7rem', color: '#999' }}>Deal</span>
        </div>

        {/* Right: Content */}
        <div style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column' }}>
          {/* Top: Business name + Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem', paddingRight: '1.5rem' }}>
            {deal.business?.name && (
              <span style={{ fontSize: '0.7rem', color: '#666' }}>{deal.business.name}</span>
            )}
            {deal.discountText && (
              <span style={{ background: '#ff6b6b', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                {deal.discountText}
              </span>
            )}
          </div>

          {/* Middle: Title + Description */}
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: '0 0 0.25rem 0', lineHeight: 1.3 }}>{deal.title}</h4>
            {deal.description && (
              <p style={{ fontSize: '0.75rem', color: '#666', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4 }}>
                {deal.description}
              </p>
            )}
          </div>

          {/* Bottom: Button or Redeem UI */}
          <div style={{ marginTop: '0.5rem' }}>
            {isOurDeal ? (
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
                  width: '100%'
                }}
              >
                Deal einlösen
              </button>
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#4285f4', fontWeight: '500' }}>Mehr zum Deal →</span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Redeem UI */}
      {isOurDeal && isExpanded && (
        <div style={{ padding: '0.75rem', borderTop: '1px solid #f5c842', background: '#fff9e6' }}>
          <div style={{ background: '#4caf50', color: '#fff', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>Deal aktiviert!</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>Code: SD-0001</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', opacity: 0.9 }}>Zeige diesen Code vor Ort</p>
          </div>
        </div>
      )}
    </Link>
  )
}