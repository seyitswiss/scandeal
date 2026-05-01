// filepath: components/IconRow.tsx
'use client'

import { useState } from 'react'

interface IconItem {
  url: string | null
  icon: string
  label: string
}

interface Props {
  icons: IconItem[]
}

export default function IconRow({ icons }: Props) {
  const [expanded, setExpanded] = useState(false)

  // Filter to only icons with URLs
  const availableIcons = icons.filter((icon) => icon.url)

  if (availableIcons.length === 0) return null

  // First row: always first 3 icons
  const firstRowIcons = availableIcons.slice(0, 3)
  // Second row: remaining icons (indices 3+)
  const secondRowIcons = availableIcons.slice(3)
  const remainingCount = secondRowIcons.length

  return (
    <div>
      {/* First Row - always shows first 3 icons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
        {firstRowIcons.map((icon, index) => (
          <a
            key={index}
            href={icon.url || undefined}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem', textDecoration: 'none', color: '#333' }}
          >
            <img src={icon.icon} alt={icon.label} style={{ width: '28px', height: '28px', marginBottom: '0.25rem' }} />
            <span style={{ fontSize: '0.7rem' }}>{icon.label}</span>
          </a>
        ))}

        {/* Expand Button - replaces 4th slot when collapsed */}
        {!expanded && remainingCount > 0 && (
          <button
            onClick={() => setExpanded(true)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
              +{remainingCount}
            </div>
            <span style={{ fontSize: '0.7rem' }}>Mehr</span>
          </button>
        )}
      </div>

      {/* Second Row - only shows when expanded and has remaining icons */}
      {expanded && secondRowIcons.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
          {secondRowIcons.map((icon, index) => (
            <a
              key={index}
              href={icon.url || undefined}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem', textDecoration: 'none', color: '#333' }}
            >
              <img src={icon.icon} alt={icon.label} style={{ width: '28px', height: '28px', marginBottom: '0.25rem' }} />
              <span style={{ fontSize: '0.7rem' }}>{icon.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}