// filepath: components/TrackedLink.tsx
'use client'

interface TrackedLinkProps {
  href: string
  children: React.ReactNode
  businessId: string
  source: string
  className?: string
  style?: React.CSSProperties
  target?: string
  rel?: string
}

export default function TrackedLink({
  href,
  children,
  businessId,
  source,
  className,
  style,
  target = "_blank",
  rel = "noopener noreferrer"
}: TrackedLinkProps) {
  const handleClick = async (e: React.MouseEvent) => {
    // Don't block navigation
    try {
      await fetch('/api/business-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          type: 'link_click',
          source,
        }),
      })
    } catch (error) {
      // Silently fail - don't block navigation
      console.error('Tracking failed:', error)
    }
  }

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      style={style}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}