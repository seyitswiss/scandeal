import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const businesses = await prisma.business.findMany({
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(businesses)
}

export async function POST(request: Request) {
  const body = await request.json()

  const business = await prisma.business.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      phone: body.phone || null,
      website: body.website || null,
      category: body.category || null,
      subCategory: body.subCategory || null,
      logoUrl: body.logoUrl || null,
      postalCode: body.postalCode || null,
      googleMapsUrl: body.googleMapsUrl || null,
      googleReviewUrl: body.googleReviewUrl || null,
      instagram: body.instagram || null,
      linkedin: body.linkedin || null,
      tripadvisor: body.tripadvisor || null,
      whatsapp: body.whatsapp || null,
      email: body.email || null,
      tiktok: body.tiktok || null,
      facebook: body.facebook || null,
      customLinks: body.customLinks || null,
    },
  })

  return NextResponse.json(business)
}