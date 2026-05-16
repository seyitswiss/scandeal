import { NextResponse } from 'next/server'

const tones = [
  'freundlich',
  'locker',
  'professionell',
  'modern',
  'herzlich',
]

const focuses = [
  'Service',
  'Atmosphäre',
  'Team',
  'Qualität',
  'Beratung',
]

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      businessName,
      city,
      category,
      subCategory,
      intensity,
    } = body

    const randomTone =
      tones[Math.floor(Math.random() * tones.length)]

    const randomFocus =
      focuses[Math.floor(Math.random() * focuses.length)]
let intensityStyle = ''

if (intensity === 1) {
  intensityStyle =
    'kurz, eher zurückhaltend, freundlich, schlicht und natürlich'
}

if (intensity === 2) {
  intensityStyle =
    'wärmer, persönlicher, zufriedener Kunde, angenehm formuliert'
}

if (intensity === 3) {
  intensityStyle =
    'starke Empfehlung, begeistert aber glaubwürdig, emotionaler'
}
    const prompt = `
Schreibe eine kurze natürliche Google-Empfehlung.

WICHTIG:
- maximal 2 Sätze
- natürlich
- menschlich
- keine Emojis
- keine Hashtags
- keine übertriebene Werbung
- keine Wiederholungen
- keine generischen KI-Sätze
- nicht identisch zu typischen Standardbewertungen

Business:
${businessName}

Stadt:
${city || 'Schweiz'}

Kategorie:
${category || ''}

Unterkategorie:
${subCategory || ''}

Intensität:
${intensity}/5

Schreibstil:
${intensityStyle}

Ton:
${randomTone}

Fokus:
${randomFocus}

Die Bewertung soll positiv und glaubwürdig wirken.
Stadt oder Branche dürfen subtil erwähnt werden.
`

    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Du schreibst natürliche kurze Google-Empfehlungen.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 1.1,
        }),
      }
    )

    const data = await response.json()

    const text =
      data.choices?.[0]?.message?.content?.trim() ||
      'Sehr angenehme Erfahrung und freundlicher Service.'

    return NextResponse.json({
      text,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        text: 'Sehr angenehme Erfahrung und freundlicher Service.',
      },
      { status: 200 }
    )
  }
}