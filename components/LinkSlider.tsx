'use client'

import { useRef } from 'react'
import TrackedLink from './TrackedLink'

interface Link {
  label: string
  icon: string
  href: string
}

interface LinkSliderProps {
  links: Link[]
  businessId: string
}

export default function LinkSlider({ links, businessId }: LinkSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -240, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' })
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={scrollLeft}
        style={{
          position: 'absolute',
          left: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1,
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          fontSize: '16px',
          lineHeight: 1,
        }}
      >
        ‹
      </button>
      <div
        ref={scrollRef}
        style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}
        className="scrollbar-hide"
      >
        <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '1rem', padding: '0.75rem 3rem', minWidth: 'max-content' }}>
          {links.map((link, i) => (
            <TrackedLink
              key={i}
              href={link.href}
              businessId={businessId}
              source={link.label.toLowerCase()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '0.75rem 1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit', flexShrink: 0 }}
            >
              <img src={link.icon} style={{ width: '1.25rem', height: '1.25rem' }} />
              <span style={{ fontSize: '1rem' }}>{link.label}</span>
            </TrackedLink>
          ))}
        </div>
      </div>
      <button
        onClick={scrollRight}
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1,
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          fontSize: '16px',
          lineHeight: 1,
        }}
      >
        ›
      </button>
    </div>
  )
}