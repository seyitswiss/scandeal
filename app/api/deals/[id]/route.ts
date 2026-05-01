// filepath: app/api/deals/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      business: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
  }

  return NextResponse.json(deal)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const deal = await prisma.deal.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description || null,
        discountText: body.discountText || null,
        category: body.category || null,
        subCategory: body.subCategory || null,
        isPremium: Boolean(body.isPremium),
        isActive: Boolean(body.isActive),
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    })

    return NextResponse.json(deal)
  } catch (error) {
    console.error('Error updating deal:', error)
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await prisma.deal.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}