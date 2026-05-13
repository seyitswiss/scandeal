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

  const data: Record<string, unknown> = {}

  if ('name' in body) data.name = body.name
  if ('slug' in body) data.slug = body.slug
  if ('description' in body) data.description = body.description || null
  if ('phone' in body) data.phone = body.phone || null
  if ('website' in body) data.website = body.website || null
  if ('category' in body) data.category = body.category || null
  if ('subCategory' in body) data.subCategory = body.subCategory || null
  if ('logoUrl' in body) data.logoUrl = body.logoUrl || null
  if ('address' in body) data.address = body.address || null
  if ('postalCode' in body) data.postalCode = body.postalCode || null
  if ('googleMapsUrl' in body) data.googleMapsUrl = body.googleMapsUrl || null
  if ('googleReviewUrl' in body) data.googleReviewUrl = body.googleReviewUrl || null
  if ('instagram' in body) data.instagram = body.instagram || null
  if ('linkedin' in body) data.linkedin = body.linkedin || null
  if ('tripadvisor' in body) data.tripadvisor = body.tripadvisor || null
  if ('whatsapp' in body) data.whatsapp = body.whatsapp || null
  if ('email' in body) data.email = body.email || null
  if ('tiktok' in body) data.tiktok = body.tiktok || null
  if ('facebook' in body) data.facebook = body.facebook || null
  if ('customLinks' in body) data.customLinks = body.customLinks || null
  if ('isActive' in body) data.isActive = Boolean(body.isActive)

  const business = await prisma.business.update({
    where: { id },
    data,
  })

  return NextResponse.json(business)
}