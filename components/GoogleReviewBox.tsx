// filepath: components/GoogleReviewBox.tsx
'use client'

import { useState, useEffect, useRef } from 'react'

interface GoogleReviewBoxProps {
  businessName: string
  googleReviewUrl: string | null
  whatsappUrl?: string | null
  emailUrl?: string | null
  businessId?: string
}

// Normalize Google Review URL
function normalizeGoogleReviewUrl(url: string | null): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  
  // If starts with ChIJ (Place ID), convert to Google review link
  if (trimmed.startsWith('ChIJ')) {
    return `https://search.google.com/local/writereview?placeid=${trimmed}`
  }
  
  // If already a proper Google review link, use as is
  if (trimmed.startsWith('https://search.google.com') || trimmed.startsWith('https://g.page')) {
    return trimmed
  }
  
  // Otherwise return as is (might be full URL)
  return trimmed
}

export default function GoogleReviewBox({ businessName, googleReviewUrl, whatsappUrl, emailUrl, businessId }: GoogleReviewBoxProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [copied, setCopied] = useState(false)
  const [isReviewBoxOpen, setIsReviewBoxOpen] = useState(false)
  const [showKiText, setShowKiText] = useState(false)
  const [showThankYouMessage, setShowThankYouMessage] = useState(false)
  const boxRef = useRef<HTMLDivElement | null>(null)

  const normalizedGoogleUrl = normalizeGoogleReviewUrl(googleReviewUrl)

  if (!googleReviewUrl) return null

  const handleStarClick = (value: number) => {
    const shouldTrackOpen = !isReviewBoxOpen && businessId

    setRating(value)
    setFeedback('')
    setIsReviewBoxOpen(true)
    setShowKiText(false)
    setShowThankYouMessage(false)
    setCopied(false)

    if (shouldTrackOpen) {
      try {
        fetch('/api/business-stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessId,
            type: 'google_box_open',
          }),
          keepalive: true,
        }).catch((error) => {
          console.error('Tracking failed:', error)
        })
      } catch (error) {
        console.error('Tracking failed:', error)
      }
    }
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    setRating(null)
    setFeedback('')
    setCopied(false)
    setShowKiText(false)
    setShowThankYouMessage(false)
    setIsReviewBoxOpen(false)
  }

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!boxRef.current) return
      const target = event.target as Node
      if (boxRef.current.contains(target)) return
      if (isReviewBoxOpen) {
        setRating(null)
        setFeedback('')
        setCopied(false)
        setShowKiText(false)
        setShowThankYouMessage(false)
        setIsReviewBoxOpen(false)
      }
    }

    document.addEventListener('click', handleDocumentClick, true)
    return () => {
      document.removeEventListener('click', handleDocumentClick, true)
    }
  }, [isReviewBoxOpen])

  const openGoogleUrl = async () => {
    if (!normalizedGoogleUrl) return

    if (businessId) {
      try {
        const data = JSON.stringify({
          businessId,
          type: 'link_click',
          source: 'google',
        })

        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/business-stats', data)
        } else {
          await fetch('/api/business-stats', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: data,
            keepalive: true,
          })
        }
      } catch (error) {
        console.error('Tracking failed:', error)
      }
    }

    window.open(normalizedGoogleUrl, '_blank')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(feedback)
    setCopied(true)
  }

  const handleGenerateKiText = () => {
    const dummyText = 'Sehr freundlicher Service und angenehme Erfahrung.'
    setFeedback(dummyText)
    setShowKiText(true)
    setCopied(false)
  }

  const handleDirectGoogle = () => {
    setShowThankYouMessage(true)
    setIsReviewBoxOpen(false)
    setShowKiText(false)
    setRating(null)

    setTimeout(() => {
      openGoogleUrl()
      setShowThankYouMessage(false)
    }, 1000)
  }

  const handleCopyAndGoogle = () => {
    if (feedback) {
      navigator.clipboard.writeText(feedback)
      setCopied(true)
    }

    setShowThankYouMessage(true)
    setIsReviewBoxOpen(false)
    setShowKiText(false)
    setRating(null)

    setTimeout(() => {
      openGoogleUrl()
      setShowThankYouMessage(false)
    }, 1000)
  }

  const handleFeedbackSend = async () => {
    const message = `Hallo, ich möchte Feedback zu ${businessName} geben: ${feedback}`
    const encodedMessage = encodeURIComponent(message)
    
    // Track internal feedback
    if (businessId) {
      try {
        fetch('/api/business-stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessId,
            type: 'internal_feedback',
          }),
          keepalive: true,
        }).catch((error) => {
          console.error('Tracking failed:', error)
        })
      } catch (error) {
        console.error('Tracking failed:', error)
      }
    }
    
    if (whatsappUrl) {
      window.open(`${whatsappUrl}?text=${encodedMessage}`, '_blank')
    } else if (emailUrl) {
      window.open(`${emailUrl}?subject=Feedback zu ${businessName}&body=${encodedMessage}`, '_blank')
    }
  }

  return (
    <div ref={boxRef} onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '0.75rem', marginBottom: '1rem', position: 'relative', minHeight: '8rem' }}>
      {/* Close button */}
      {isReviewBoxOpen && (
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

      {/* Default View */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <img
          src="/icons/google.svg"
          alt="Google"
          style={{ width: '20px', height: '20px', flexShrink: 0 }}
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
        <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600 }}>Hat dir {businessName} gefallen?</p>
      </div>

      {!isReviewBoxOpen && !showThankYouMessage && (
        <div style={{ display: 'flex', gap: '2px', marginTop: '0.5rem' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleStarClick(star)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.5rem',
                color: rating && star <= rating ? '#f5c842' : '#ddd',
                padding: '0',
                lineHeight: 1,
              }}
            >
              ★
            </button>
          ))}
        </div>
      )}

      {showThankYouMessage && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #eee', minHeight: '8rem' }}>
          <p style={{ fontSize: '0.9rem', margin: 0 }}>🙏 Vielen Dank – so hilfst du uns sehr! 🙌</p>
        </div>
      )}

      {isReviewBoxOpen && rating !== null && rating <= 3 && !showThankYouMessage && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #eee', minHeight: '8rem' }}>
          <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>😕 Danke für dein Feedback</p>
          <textarea
            className="h-16 resize-none text-sm"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Dein Feedback..."
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
          />
          <button
            onClick={handleFeedbackSend}
            style={{ marginTop: '0.5rem', background: '#4285f4', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.375rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Feedback senden
          </button>
        </div>
      )}

      {isReviewBoxOpen && rating !== null && rating >= 4 && !showThankYouMessage && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #eee', minHeight: '8rem' }}>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.4rem' }}>🙏 Vielen Dank 🙌</p>
          <p style={{ fontSize: '0.85rem', margin: 0, color: '#555' }}>Du kannst deinen Bewertungstext auch mit KI generieren lassen</p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            <button
              onClick={handleGenerateKiText}
              style={{ background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              KI Text generieren
            </button>
            <button
              onClick={handleDirectGoogle}
              style={{ background: '#4285f4', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Direkt zu Google
            </button>
          </div>

          {showKiText && (
            <div style={{ marginTop: '0.75rem' }}>
              <textarea
                className="h-20 resize-none text-sm"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="KI-generierter Text erscheint hier..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
              />

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <button
                  onClick={handleCopyAndGoogle}
                  style={{ background: '#34a853', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 0.85rem', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Kopieren & Zu Google
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}