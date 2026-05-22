'use client'

import Link from 'next/link'

interface BranchItem {
  businessId: string
  title: string
  subtitle: string
  slug?: string
  logoUrl?: string | null
}

interface Props {
  items: BranchItem[]
}

export default function BranchSlider({ items }: Props) {
  if (!items.length) return null

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginBottom: '0.75rem' }}>
        📍 Weitere Standorte & Partner
      </div>

      <div style={{ display: 'flex', gap: '0.40rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.slug ? `/profile/${item.slug}` : '#'}
            style={{
              minWidth: '120px',
              width: '120px',
              height: '150px',
              boxSizing: 'border-box',
              textDecoration: 'none',
              background: '#0a4b18',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: '16px',
              padding: '0.75rem 0.55rem',
              display: 'grid',
              gridTemplateRows: '75px 39px 10px',
              justifyItems: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '92px',
                height: '82px',
                borderRadius: '14px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {item.logoUrl && (
                <img
                  src={item.logoUrl}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
transform: 'scale(1.12)',
                  }}
                />
              )}
            </div>

            <div
              style={{
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 700,
                textAlign: 'center',
                lineHeight: 1.15,
                overflow: 'hidden',
              }}
            >
              {item.title}
            </div>

            <div
              style={{
                color: '#9ca3af',
                fontSize: '0.68rem',
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}
            >
              {item.subtitle}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}