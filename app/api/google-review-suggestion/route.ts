import { NextResponse } from 'next/server'

const tones = [
  'natürlich',
  'ehrlich',
  'zufrieden',
  'unkompliziert',
  'angenehm',
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
    'sehr kurz, neutral, höflich, wenig emotional, wie eine einfache normale Google Bewertung'
}

if (intensity === 2) {
  intensityStyle =
    'klar zufrieden, persönlicher, freundlich, leichte Empfehlung, natürlich formuliert'
}

if (intensity === 3) {
  intensityStyle =
    'deutlich begeisterter, starke Empfehlung, natürlicher emotionaler Ton, ein Ausrufezeichen erlaubt'
}
    const prompt = `
Schreibe eine echte, kurze Google-Bewertung aus Sicht eines normalen Kunden.

WICHTIG:
- maximal 2 kurze Sätze
- sehr natürlich, nicht perfekt
- keine Werbesprache
- keine erfundenen Details
- keine Emojis
- maximal 1 Ausrufezeichen erlaubt
- leichte Umgangssprache erlaubt
- darf wie echte Google Bewertungen wirken
- keine Hashtags
- keine Wörter wie Erlebnis, hervorragend, stilvoll, liebevoll, Premium
- nicht schreiben: "in der Schweiz"
- nicht zu poetisch
- nicht wie KI
- einfache Alltagssprache

Business:
${businessName}

Stadt:
${city || ''}

Kategorie:
${category || ''}

Unterkategorie:
${subCategory || ''}

Intensität:
${intensity}/3

Schreibstil:
${intensityStyle}

Ton:
${randomTone}

Fokus:
${randomFocus}

SEO-Regel:
Wenn es natürlich passt, darfst du den Businessnamen oder die Stadt einmal erwähnen.
Nicht beide erzwingen.

Schreibe nur die Bewertung. Kein Titel. Keine Erklärung.
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