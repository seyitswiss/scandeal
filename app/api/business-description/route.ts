import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()

   const {
  businessName,
  city,
  category,
  subCategory,
  addSubCategories,
} = body

    const prompt = `
Erstelle einen sehr kurzen modernen Business-Slogan.

WICHTIG:
- maximal 6 Wörter
- Business-Name NICHT wiederholen
- Stadt NICHT erwähnen
- kurz wie eine moderne Brand-Line
- modern, klar, hochwertig
- leicht merkbar
- kreativ aber nicht poetisch
- eher wie:
  Nike, Uber, Apple, Zara
und NICHT wie:
  klassische Firmenwebseite

- SubCategory ist wichtiger als MainCategory
- AdditionalSubCategories sind ebenfalls sehr wichtig
- wenn AdditionalSubCategories vorhanden sind, kombiniere deren Stimmung kreativ
- nutze NICHT nur die MainCategory

- der Slogan soll mobile-tauglich sein
- kurz genug für schnelle Erfassung
- möglichst konkret zur Branche bleiben

- keine Emojis
- keine Hashtags
- kein Punkt am Ende
- keine langen Sätze
- keine Webseiten-Werbung
- keine abstrakten Metaphern
- keine poetischen Luxus-Sätze
- keine emotionalen KI-Phrasen

- vermeide künstlich kreative Wörter wie:
  "Farbklang"
  "Magie"
  "Vision"
  "perfekt"
  "Leidenschaft"

- vermeide Phrasen wie:
  "die begeistert"
  "die bleibt"
  "mit Leidenschaft"
  "höchste Qualität"
  "bester Service"
  "Geschichten erzählt"

- keine direkten Verkaufswörter wie:
  "kaufe"
  "bestelle"
  "reserviere"
  "entdecke jetzt"
  "erlebe jetzt"
  "komme vorbei"

- vermeide generische Wörter wie:
  "Lifestyle"
  "modern"
  "Eleganz"
wenn sie ohne kreative Kombination verwendet werden

KATEGORIE RICHTUNGEN:

Gastronomie:
frisch, grill, würzig, serviert, kaffee, genuss

Shopping:
stil, glanz, look, design, fashion

Beauty & Gesundheit:
pflege, glow, ausstrahlung, style

Haus & Handwerk:
präzise, sauber, renoviert, handwerk

Bau & Immobilien:
immobilien, verwaltet, betreut, überblick

Auto & Mobilität:
mobil, schnell, unterwegs, zuverlässig

Dienstleistungen:
klar, digital, lösung, system

Freizeit & Unterhaltung:
erlebnis, spass, momente

Reisen & Hotels:
ankommen, komfort, entspannen

Bildung & Community:
lernen, wachsen, gemeinsam

Business:
${businessName}

MainCategory:
${category || ''}

SubCategory:
${subCategory || ''}

AdditionalSubCategories:
${addSubCategories?.join(', ') || ''}
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
                'Du schreibst kurze moderne Business-Slogans für OnePager.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 1.0,
        }),
      }
    )

    const data = await response.json()

    const text =
      data.choices?.[0]?.message?.content?.trim() ||
      'Kurz. Klar. Lokal'

    return NextResponse.json({ text })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { text: 'Kurz. Klar. Lokal' },
      { status: 200 }
    )
  }
}