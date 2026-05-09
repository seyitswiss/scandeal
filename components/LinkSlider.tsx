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
          background: '#111',
          border: '1px solid #333',
          color: '#fff',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '16px',
          lineHeight: 1,
          touchAction: 'auto',
        }}
      >
        ‹
      </button>
      <div
        ref={scrollRef}
        style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', touchAction: 'manipulation' }}
        className="scrollbar-hide"
      >
        <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '0.75rem', padding: '0.75rem 3rem', minWidth: 'max-content' }}>
          {links.map((link, i) => {
            const isJpeg = link.icon.toLowerCase().endsWith('.jpeg') || link.icon.toLowerCase().endsWith('.jpg')
            return isJpeg ? (
              <TrackedLink
                key={i}
                href={link.href}
                businessId={businessId}
                source={link.label.toLowerCase()}
                className="block"
              >
                <img
                  src={link.icon}
                  alt={link.label}
                  className="h-16 w-40 rounded-xl object-cover border border-neutral-800"
                />
              </TrackedLink>
            ) : (
              <TrackedLink
                key={i}
                href={link.href}
                businessId={businessId}
                source={link.label.toLowerCase()}
                className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2"
              >
                <img src={link.icon} className="w-5 h-5" alt={link.label} />
                <span className="text-sm">{link.label}</span>
              </TrackedLink>
            )
          })}
        </div>
      </div>
      <button
        onClick={scrollRight}
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 9999,
          background: '#111',
          border: '1px solid #333',
          color: '#fff',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '16px',
          lineHeight: 1,
          touchAction: 'auto',
        }}
      >
        ›
      </button>
    </div>
  )
}