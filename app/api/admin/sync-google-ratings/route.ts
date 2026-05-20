import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST() {
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: 'GOOGLE_PLACES_API_KEY fehlt' },
      { status: 500 }
    )
  }

  const businesses = await prisma.business.findMany({
    where: {
      googlePlaceId: {
        not: null,
      },
    },
    select: {
      id: true,
      name: true,
      googlePlaceId: true,
    },
  })

  let updated = 0
  let failed = 0

  for (const business of businesses) {
    try {
      const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')

      url.searchParams.set('place_id', business.googlePlaceId!)
      url.searchParams.set('language', 'de')
      url.searchParams.set('fields', 'rating,user_ratings_total')
      url.searchParams.set('key', process.env.GOOGLE_PLACES_API_KEY)

      const response = await fetch(url.toString(), {
        cache: 'no-store',
      })

      const data = await response.json()

      const rating = data.result?.rating ?? null
      const reviews = data.result?.user_ratings_total ?? null

      await prisma.business.update({
        where: {
          id: business.id,
        },
        data: {
          googleRating: rating,
          googleReviews: reviews,
        },
      })

      updated++
    } catch {
      failed++
    }
  }

  return NextResponse.json({
    success: true,
    total: businesses.length,
    updated,
    failed,
  })
}