// filepath: app/api/businesses/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const business = await prisma.business.findUnique({
    where: { id },
  })

  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  return NextResponse.json(business)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const business = await prisma.business.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      phone: body.phone || null,
      website: body.website || null,
      category: body.category || null,
      subCategory: body.subCategory || null,
      subCategories: body.subCategories || null,
      logoUrl: body.logoUrl || null,
      address: body.address || null,
      postalCode: body.postalCode || null,
      googleMapsUrl: body.googleMapsUrl || null,
      googleReviewUrl: body.googleReviewUrl || null,

      googlePlaceId: body.googlePlaceId || null,
      latitude: body.latitude ? Number(body.latitude) : null,
      longitude: body.longitude ? Number(body.longitude) : null,
      googleRating: body.googleRating ? Number(body.googleRating) : null,
  googleReviews: body.googleReviews ? Number(body.googleReviews) : null,
googleCity: body.googleCity || null,

googleOpeningNow:
  typeof body.googleOpeningNow === 'boolean'
    ? body.googleOpeningNow
    : null,
googleOpeningHours: body.googleOpeningHours || null,
googleOpeningText: body.googleOpeningText || null,

instagram: body.instagram || null,
      linkedin: body.linkedin || null,
      tripadvisor: body.tripadvisor || null,
      whatsapp: body.whatsapp || null,
      email: body.email || null,
      tiktok: body.tiktok || null,
youtube: body.youtube || null,
facebook: body.facebook || null,
menuLink: body.menuLink || null,
bookingLink: body.bookingLink || null,
shopLink: body.shopLink || null,
uberEatsLink: body.uberEatsLink || null,
justEatLink: body.justEatLink || null,
directOrderLink: body.directOrderLink || null,
priorityLinks: body.priorityLinks || null,
      customLinks: body.customLinks || null,
relatedBusinesses: body.relatedBusinesses || null,
      
    },
  })
  await prisma.deal.updateMany({
    where: {
      businessId: id,
    },
    data: {
      category: body.category || null,
      subCategory: body.subCategory || null,
      subCategories: body.subCategories || null,
    },
  })

  if (body.relatedBusinesses) {
    try {
      const relatedItems = JSON.parse(body.relatedBusinesses)

      for (const item of relatedItems) {
        if (!item.businessId || item.businessId === id) continue

        const relatedBusiness = await prisma.business.findUnique({
          where: { id: item.businessId },
        })

        if (!relatedBusiness) continue

        let existingRelated: any[] = []

        if (relatedBusiness.relatedBusinesses) {
          try {
            existingRelated = JSON.parse(relatedBusiness.relatedBusinesses)
          } catch {
            existingRelated = []
          }
        }

        const alreadyLinked = existingRelated.some(
          (related) => related.businessId === id
        )

        if (!alreadyLinked) {
          existingRelated.push({
            businessId: id,
            title: body.name,
            subtitle: body.googleCity || '',
          })

          await prisma.business.update({
            where: { id: item.businessId },
            data: {
              relatedBusinesses: JSON.stringify(existingRelated),
            },
          })
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  return NextResponse.json(business)
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await prisma.business.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}