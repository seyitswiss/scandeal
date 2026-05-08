'use client'

import { useEffect } from 'react'

interface ProfileTrackerProps {
  businessId: string
  children: React.ReactNode
}

export default function ProfileTracker({ businessId, children }: ProfileTrackerProps) {
  useEffect(() => {
    // Track profile view on page load
    async function trackProfileView() {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const src = urlParams.get('src') || 'direct'
        const validSources = ['qr', 'instagram', 'google', 'direct']
        const source = validSources.includes(src) ? src : 'direct'

        await fetch('/api/business-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId,
            type: `profile_view_${source}`,
          }),
        })
      } catch (error) {
        console.error('Failed to track profile view:', error)
      }
    }

    trackProfileView()
  }, [businessId])

  const trackLinkClick = async (source: string, url: string) => {
    try {
      await fetch('/api/business-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          type: 'link_click',
          source,
        }),
      })
    } catch (error) {
      console.error('Failed to track link click:', error)
    }
    // Open the link
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Inject global tracking function for links
  useEffect(() => {
    ;(window as any).__trackLinkClick = trackLinkClick
  }, [trackLinkClick])

  return <>{children}</>
}
