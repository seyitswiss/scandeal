import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const placeId = body.placeId

    if (!placeId) {
      return NextResponse.json(
        { error: 'Missing placeId' },
        { status: 400 }
      )
    }

    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY || '',
          'X-Goog-FieldMask':
  'displayName,rating,userRatingCount,location,formattedAddress,currentOpeningHours.openNow,currentOpeningHours.nextOpenTime,currentOpeningHours.nextCloseTime,currentOpeningHours.weekdayDescriptions',
        },
      }
    )

    if (!res.ok) {
      const errorText = await res.text()

      return NextResponse.json(
        {
          error: 'Google API error',
          details: errorText,
        },
        { status: 500 }
      )
    }

    const data = await res.json()
    console.log('GOOGLE PLACE DATA:', JSON.stringify(data, null, 2))

const address = data.formattedAddress || ''
const openingHours = data.currentOpeningHours || null
const openNow = openingHours?.openNow ?? null
const nextOpenTime = openingHours?.nextOpenTime || null
const nextCloseTime = openingHours?.nextCloseTime || null

let openingText = ''

if (openNow) {
  if (nextCloseTime) {
    const closeDate = new Date(nextCloseTime)

    openingText = `Offen bis ${closeDate.toLocaleTimeString('de-CH', {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  } else {
    openingText = 'Offen'
  }
} else {
  if (nextOpenTime) {
    const openDate = new Date(nextOpenTime)

    openingText = `Öffnet um ${openDate.toLocaleTimeString('de-CH', {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  } else {
    openingText = 'Geschlossen'
  }
}
const weekdayDescriptions = openingHours?.weekdayDescriptions || []
const addressParts = address.split(',').map((part: string) => part.trim())
const cityPart = addressParts.find((part: string) => /\d{4}/.test(part))
const city = cityPart ? cityPart.replace(/\d{4}/, '').trim() : ''

return NextResponse.json({
  name: data.displayName?.text || '',
  rating: data.rating || null,
  reviews: data.userRatingCount || null,
  latitude: data.location?.latitude || null,
  longitude: data.location?.longitude || null,
  address,
  city,
  openNow,
  openingText,
weekdayDescriptions,
})
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Failed to fetch Google place data' },
      { status: 500 }
    )
  }
}