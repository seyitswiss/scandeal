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
      logoUrl: body.logoUrl || null,
      address: body.address || null,
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