'use client'

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
  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
      className="scrollbar-hide"
    >
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          padding: '0.75rem 0',
          minWidth: 'max-content',
        }}
      >
        {links.map((link, index) => {
          const isJpeg =
            link.icon.toLowerCase().endsWith('.jpeg') ||
            link.icon.toLowerCase().endsWith('.jpg')

          return isJpeg ? (
            <TrackedLink
              key={index}
              href={link.href}
              businessId={businessId}
              source={link.label.toLowerCase()}
              className="block shrink-0"
            >
              <img
                src={link.icon}
                alt={link.label}
                className="h-16 w-40 rounded-xl border border-neutral-800 object-cover"
                draggable={false}
              />
            </TrackedLink>
          ) : (
            <TrackedLink
              key={index}
              href={link.href}
              businessId={businessId}
              source={link.label.toLowerCase()}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
            >
              <img
                src={link.icon}
                alt={link.label}
                className="h-5 w-5"
                draggable={false}
              />

              <span className="text-sm whitespace-nowrap">
                {link.label}
              </span>
            </TrackedLink>
          )
        })}
      </div>
    </div>
  )
}