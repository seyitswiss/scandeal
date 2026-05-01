// filepath: components/GoogleReviewBox.tsx
'use client'

import { useState } from 'react'

interface GoogleReviewBoxProps {
  businessName: string
  googleReviewUrl: string | null
  whatsappUrl?: string | null
  emailUrl?: string | null
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

export default function GoogleReviewBox({ businessName, googleReviewUrl, whatsappUrl, emailUrl }: GoogleReviewBoxProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const normalizedGoogleUrl = normalizeGoogleReviewUrl(googleReviewUrl)

  if (!googleReviewUrl) return null

  const handleStarClick = (value: number) => {
    setRating(value)
    setIsOpen(true)
    setCopied(false)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    setRating(null)
    setFeedback('')
    setCopied(false)
    setIsOpen(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(feedback)
    setCopied(true)
  }

  const handleGoogleRedirect = () => {
    if (normalizedGoogleUrl) {
      window.open(normalizedGoogleUrl, '_blank')
    }
  }

  const handleFeedbackSend = () => {
    const message = `Hallo, ich möchte Feedback zu ${businessName} geben: ${feedback}`
    const encodedMessage = encodeURIComponent(message)
    
    if (whatsappUrl) {
      window.open(`${whatsappUrl}?text=${encodedMessage}`, '_blank')
    } else if (emailUrl) {
      window.open(`${emailUrl}?subject=Feedback zu ${businessName}&body=${encodedMessage}`, '_blank')
    }
  }

  return (
    <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1rem', marginBottom: '1rem', position: 'relative' }}>
      {/* Close button */}
      {isOpen && (
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/icons/google.svg" alt="Google" style={{ width: '28px', height: '28px' }} />
          <div>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>Hat dir {businessName} gefallen?</p>
            <p style={{ fontSize: '0.8rem', margin: 0, color: '#666' }}>Bewerte uns auf Google</p>
          </div>
        </div>
        
        {/* Stars */}
        <div style={{ display: 'flex', gap: '4px' }}>
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
      </div>

      {/* Rating 1-3: Feedback form */}
      {isOpen && rating !== null && rating <= 3 && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Was können wir besser machen?</p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Dein Feedback..."
            style={{ width: '100%', minHeight: '80px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.85rem', resize: 'vertical' }}
          />
          <button
            onClick={handleFeedbackSend}
            style={{ marginTop: '0.5rem', background: '#4285f4', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Feedback senden
          </button>
        </div>
      )}

      {/* Rating 4-5: Review form */}
      {isOpen && rating !== null && rating >= 4 && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Schreib kurz deine Bewertung</p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Deine Bewertung..."
            style={{ width: '100%', minHeight: '80px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.85rem', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              onClick={handleCopy}
              style={{ background: '#34a853', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              {copied ? 'Kopiert!' : 'Text kopieren'}
            </button>
            <button
              onClick={handleGoogleRedirect}
              style={{ background: '#4285f4', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Zu Google
            </button>
          </div>
        </div>
      )}
    </div>
  )
}