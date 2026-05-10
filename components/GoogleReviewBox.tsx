'use client'

import { useState } from 'react'

interface GoogleReviewBoxProps {
  businessName: string
  googleReviewUrl: string | null
  whatsappUrl?: string | null
  emailUrl?: string | null
  businessId?: string
}

function normalizeGoogleReviewUrl(url: string | null): string | null {
  if (!url) return null

  const trimmed = url.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('ChIJ')) {
    return `https://search.google.com/local/writereview?placeid=${trimmed}`
  }

  return trimmed
}

function buildFeedbackUrl({
  businessName,
  feedback,
  whatsappUrl,
  emailUrl,
}: {
  businessName: string
  feedback: string
  whatsappUrl?: string | null
  emailUrl?: string | null
}) {
  const message = `Hallo, ich möchte Feedback zu ${businessName} geben: ${feedback}`
  const encodedMessage = encodeURIComponent(message)

  if (whatsappUrl) {
    return `${whatsappUrl}?text=${encodedMessage}`
  }

  if (emailUrl) {
    return `${emailUrl}?subject=${encodeURIComponent(
      `Feedback zu ${businessName}`
    )}&body=${encodedMessage}`
  }

  return null
}

export default function GoogleReviewBox({
  businessName,
  googleReviewUrl,
  whatsappUrl,
  emailUrl,
  businessId,
}: GoogleReviewBoxProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [showKiText, setShowKiText] = useState(false)
  const [copied, setCopied] = useState(false)

  const normalizedGoogleUrl = normalizeGoogleReviewUrl(googleReviewUrl)

  if (!normalizedGoogleUrl) return null

  const track = (type: string, source?: string) => {
    if (!businessId) return

    try {
      const body = JSON.stringify({
        businessId,
        type,
        source,
      })

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/business-stats', body)
        return
      }

      fetch('/api/business-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
    } catch {}
  }

  const selectRating = (value: number) => {
    setRating(value)
    setFeedback('')
    setShowKiText(false)
    setCopied(false)
    track('google_box_open')
  }

  const resetRating = () => {
    setRating(null)
    setFeedback('')
    setShowKiText(false)
    setCopied(false)
  }

  const generateKiText = () => {
    setFeedback('Sehr freundlicher Service und angenehme Erfahrung.')
    setShowKiText(true)
    setCopied(false)
  }

  const copyFeedback = async () => {
    if (!feedback) return

    try {
      await navigator.clipboard.writeText(feedback)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const feedbackUrl = buildFeedbackUrl({
    businessName,
    feedback,
    whatsappUrl,
    emailUrl,
  })

  return (
    <div
      style={{
        background: 'transparent',
        color: '#e5e7eb',
        padding: '0.5rem',
        marginBottom: '0.75rem',
        position: 'relative',
      }}
    >
      {rating !== null && (
        <button
          type="button"
          onClick={resetRating}
          aria-label="Bewertung schliessen"
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            width: '24px',
            height: '24px',
            border: 'none',
            background: 'rgba(255,255,255,0.05)',
            color: '#e5e7eb',
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

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <img
          src="/icons/google.svg"
          alt="Google"
          style={{
            width: '20px',
            height: '20px',
            flexShrink: 0,
          }}
        />

        <div>
          <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600 }}>
            Hat dir {businessName} gefallen?
          </p>
          <p style={{ fontSize: '0.8rem', margin: 0, color: '#aaa' }}>
            Bewerte uns auf Google
          </p>
        </div>
      </div>

      {rating === null && (
        <div
          style={{
            display: 'flex',
            gap: '0.6rem',
            marginTop: '0.1rem',
            paddingLeft: '26px',
          }}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => selectRating(star)}
              aria-label={`${star} Sterne`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '2rem',
                color: '#444',
                padding: '0',
                lineHeight: 1,
              }}
            >
              ☆
            </button>
          ))}
        </div>
      )}

      {rating !== null && rating <= 3 && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', minHeight: '8rem' }}>
          <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            😕 Danke für dein Feedback
          </p>

          <textarea
            className="h-16 resize-none text-sm"
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            placeholder="Dein Feedback..."
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
            }}
          />

          {feedbackUrl ? (
            <a
              href={feedbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('internal_feedback')}
              style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                background: '#4285f4',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.375rem 0.75rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              Feedback senden
            </a>
          ) : (
            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#aaa' }}>
              Kein Feedback-Kanal hinterlegt.
            </p>
          )}
        </div>
      )}

      {rating !== null && rating >= 4 && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', minHeight: '8rem' }}>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            🙏 Vielen Dank 🙌
          </p>

          <p style={{ fontSize: '0.85rem', margin: 0, color: '#9b9494' }}>
            Du kannst deinen Bewertungstext auch mit KI generieren lassen
          </p>

          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginTop: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={generateKiText}
              style={{
                background: '#1a73e8',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 0.75rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              KI Text generieren
            </button>

            <a
              href={normalizedGoogleUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('link_click', 'google')}
              style={{
                background: '#4285f4',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 0.75rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Direkt zu Google
            </a>
          </div>

          {showKiText && (
            <div style={{ marginTop: '0.75rem' }}>
              <textarea
                className="h-20 resize-none text-sm"
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="KI-generierter Text erscheint hier..."
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #706b6b',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  marginTop: '0.5rem',
                }}
              >
                <button
                  type="button"
                  onClick={copyFeedback}
                  style={{
                    background: '#34a853',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem 0.85rem',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {copied ? 'Kopiert' : 'Text kopieren'}
                </button>

                <a
                  href={normalizedGoogleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('link_click', 'google')}
                  style={{
                    background: '#4285f4',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem 0.85rem',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  Zu Google
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}