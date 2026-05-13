import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const body = await request.json()

  const deal = await prisma.deal.create({
    data: {
      title: body.title,
      description: body.description || null,
      discountText: body.discountText || null,
      highlight: body.highlight || null,
      image: body.image || null,
      category: body.category || null,
      subCategory: body.subCategory || null,
      isPremium: body.isPremium || false,
      isActive: body.isActive !== false,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,

      redeemableWhen: body.redeemableWhen || null,
      redeemableFor: body.redeemableFor || null,
      requirements: body.requirements || null,
      combinability: body.combinability || null,
      conditionDetails: body.conditionDetails || null,

      businessId: body.businessId,
    },
  })

  return NextResponse.json(deal)
}